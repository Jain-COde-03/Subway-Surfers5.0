from __future__ import annotations

import argparse
import os
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

import pandas as pd
from ortools.sat.python import cp_model


@dataclass
class OptimizerConfig:
    # Solver settings
    time_limit_seconds: float = 60.0
    num_search_workers: int = max(1, min(8, os.cpu_count() or 1))
    random_seed: int = 42
    log_search_progress: bool = False

    # Railway scheduling assumptions
    enforce_section_no_overlap: bool = True
    high_priority_threshold: float = 80.0

    # Objective weights. CP-SAT maximizes one integer-valued score.
    priority_weight: int = 100
    urgency_weight: int = 18
    risk_tiebreak_weight: int = 5

    block_open_penalty: int = 500
    unused_capacity_penalty_per_minute: int = 1
    internal_idle_penalty_per_minute: int = 1

    bundle_extra_department_bonus: int = 350
    multi_department_block_bonus: int = 250

    medium_traffic_penalty_per_minute: int = 1
    high_traffic_penalty_per_minute: int = 4
    lateness_penalty_per_day: int = 40
    max_lateness_penalty_days: int = 60

    # Only used for the summary metric "estimated block hours saved".
    # It represents avoided block setup/coordination overhead, not maintenance time.
    assumed_block_setup_overhead_hours: float = 0.25


class RailwayBlockOptimizer:
    def __init__(self, config: Optional[OptimizerConfig] = None) -> None:
        self.config = config or OptimizerConfig()

        self.coa: pd.DataFrame = pd.DataFrame()
        self.tasks_all: pd.DataFrame = pd.DataFrame()
        self.tasks: pd.DataFrame = pd.DataFrame()
        self.invalid_tasks: pd.DataFrame = pd.DataFrame()

        self.model: Optional[cp_model.CpModel] = None
        self.solver: Optional[cp_model.CpSolver] = None
        self.status = None
        self.origin: Optional[pd.Timestamp] = None

        self.assignment: Dict[Tuple[int, int], cp_model.IntVar] = {}
        self.start_vars: Dict[Tuple[int, int], cp_model.IntVar] = {}
        self.end_vars: Dict[Tuple[int, int], cp_model.IntVar] = {}
        self.interval_vars: Dict[Tuple[int, int], cp_model.IntervalVar] = {}
        self.scheduled_vars: Dict[int, cp_model.IntVar] = {}
        self.block_used_vars: Dict[int, cp_model.IntVar] = {}
        self.block_used_minutes_vars: Dict[int, cp_model.IntVar] = {}
        self.block_unused_minutes_vars: Dict[int, cp_model.IntVar] = {}
        self.block_idle_minutes_vars: Dict[int, cp_model.IntVar] = {}
        self.block_department_count_vars: Dict[int, cp_model.IntVar] = {}
        self.block_multi_department_vars: Dict[int, cp_model.IntVar] = {}
        self.block_extra_department_vars: Dict[int, cp_model.IntVar] = {}

        self.assignments_by_task: Dict[int, List[int]] = defaultdict(list)
        self.assignments_by_window: Dict[int, List[int]] = defaultdict(list)
        self.matching_windows_by_task: Dict[int, List[int]] = defaultdict(list)
        self.feasible_windows_by_task: Dict[int, List[int]] = defaultdict(list)
        self.assignment_lateness_days: Dict[Tuple[int, int], int] = {}

    @staticmethod
    def _normalize_key(value: object) -> str:
        if pd.isna(value):
            return ""
        return str(value).strip().casefold()

    @staticmethod
    def _boolish(value: object) -> bool:
        if pd.isna(value):
            return False
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return float(value) != 0.0
        return str(value).strip().casefold() in {
            "1", "true", "yes", "y", "high", "critical", "flagged"
        }

    @staticmethod
    def _criticality_component(value: object) -> int:
        if pd.isna(value):
            return 0
        v = str(value).strip().casefold()
        if v in {"a", "class a", "critical", "very high", "high"}:
            return 25
        if v in {"b", "class b", "medium", "moderate"}:
            return 12
        if v in {"c", "class c", "low"}:
            return 4
        return 0

    @staticmethod
    def _require_columns(df: pd.DataFrame, columns: Iterable[str], filename: str) -> None:
        missing = [c for c in columns if c not in df.columns]
        if missing:
            raise ValueError(f"{filename} is missing required columns: {missing}")

    def _prepare_coa(self, coa_path: str | Path) -> pd.DataFrame:
        coa = pd.read_csv(coa_path)
        required = [
            "section_id",
            "division",
            "window_date",
            "window_start_hour",
            "available_duration_hours",
            "surrounding_traffic_load",
        ]
        self._require_columns(coa, required, str(coa_path))

        coa = coa.copy()
        coa["_source_row"] = range(len(coa))
        coa["_section_key"] = coa["section_id"].map(self._normalize_key)
        coa["_division_key"] = coa["division"].map(self._normalize_key)

        coa["_window_date"] = pd.to_datetime(
            coa["window_date"], errors="coerce", dayfirst=True
        ).dt.normalize()
        coa["_start_hour"] = pd.to_numeric(coa["window_start_hour"], errors="coerce")
        coa["_duration_hours"] = pd.to_numeric(
            coa["available_duration_hours"], errors="coerce"
        )

        invalid = (
            coa["_section_key"].eq("")
            | coa["_division_key"].eq("")
            | coa["_window_date"].isna()
            | coa["_start_hour"].isna()
            | coa["_duration_hours"].isna()
            | (coa["_start_hour"] < 0)
            | (coa["_start_hour"] >= 24)
            | (coa["_duration_hours"] <= 0)
        )

        if invalid.any():
            bad_rows = coa.loc[invalid, "_source_row"].tolist()
            print(f"Warning: ignoring {len(bad_rows)} invalid COA rows: {bad_rows[:20]}")

        coa = coa.loc[~invalid].copy().reset_index(drop=True)
        if coa.empty:
            raise ValueError("No valid COA availability windows remain after validation.")

        coa["_start_minute_of_day"] = (
            coa["_start_hour"].mul(60).round().astype(int).clip(lower=0, upper=1439)
        )
        coa["_duration_minutes"] = (
            coa["_duration_hours"].mul(60).round().astype(int).clip(lower=1)
        )

        coa["_window_start"] = coa["_window_date"] + pd.to_timedelta(
            coa["_start_minute_of_day"], unit="m"
        )
        # This naturally handles windows crossing midnight.
        coa["_window_end"] = coa["_window_start"] + pd.to_timedelta(
            coa["_duration_minutes"], unit="m"
        )

        traffic = (
            coa["surrounding_traffic_load"]
            .fillna("Medium")
            .astype(str)
            .str.strip()
            .str.title()
        )
        traffic = traffic.where(traffic.isin(["Low", "Medium", "High"]), "Medium")
        coa["_traffic_load"] = traffic

        # Stable unique ID per candidate COA window.
        coa["block_id"] = [
            f"COA-{str(row.section_id).strip()}-{row._window_start:%Y%m%d-%H%M}-{i:04d}"
            for i, row in coa.iterrows()
        ]
        return coa

    def _prepare_tasks(
        self, maintenance_path: str | Path, planning_date: pd.Timestamp
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        raw = pd.read_csv(maintenance_path)
        required = [
            "asset_id",
            "department",
            "section_id",
            "division",
            "due_date",
            "estimated_block_duration_hours",
            "priority_score",
        ]
        self._require_columns(raw, required, str(maintenance_path))

        tasks = raw.copy()
        tasks["_original_row"] = range(len(tasks))
        tasks["_task_uid"] = [f"TASK-{i:06d}" for i in range(len(tasks))]

        missing_asset = tasks["asset_id"].isna() | tasks["asset_id"].astype(str).str.strip().eq("")
        tasks.loc[missing_asset, "asset_id"] = tasks.loc[missing_asset, "_task_uid"]
        tasks["department"] = tasks["department"].fillna("UNKNOWN").astype(str).str.strip()
        tasks.loc[tasks["department"].eq(""), "department"] = "UNKNOWN"

        tasks["_section_key"] = tasks["section_id"].map(self._normalize_key)
        tasks["_division_key"] = tasks["division"].map(self._normalize_key)
        tasks["_duration_hours"] = pd.to_numeric(
            tasks["estimated_block_duration_hours"], errors="coerce"
        )
        tasks["_duration_minutes"] = (
            tasks["_duration_hours"].fillna(0).mul(60).round().astype(int)
        )

        tasks["_due_date"] = pd.to_datetime(
            tasks["due_date"], errors="coerce", dayfirst=True
        ).dt.normalize()

        priority = pd.to_numeric(tasks["priority_score"], errors="coerce")
        valid_priority = priority.dropna()
        default_priority = float(valid_priority.median()) if not valid_priority.empty else 50.0
        missing_priority_count = int(priority.isna().sum())
        if missing_priority_count:
            print(
                f"Warning: {missing_priority_count} tasks have missing/invalid priority_score; "
                f"filling with dataset median {default_priority:.1f}."
            )
        tasks["_priority"] = priority.fillna(default_priority).clip(lower=0, upper=100)
        tasks["priority_score"] = tasks["_priority"]

        if "days_overdue" in tasks.columns:
            tasks["_provided_days_overdue"] = pd.to_numeric(
                tasks["days_overdue"], errors="coerce"
            ).fillna(0).clip(lower=0)
        else:
            tasks["_provided_days_overdue"] = 0.0

        def urgency_score(row: pd.Series) -> int:
            due = row["_due_date"]
            provided_overdue = int(round(float(row["_provided_days_overdue"])))
            if pd.isna(due):
                overdue = provided_overdue
                return min(100, 70 + min(30, overdue)) if overdue > 0 else 0

            days_to_due = int((due - planning_date.normalize()).days)
            overdue = max(provided_overdue, max(0, -days_to_due))
            if overdue > 0:
                return min(100, 70 + min(30, overdue))
            if days_to_due <= 3:
                return 60
            if days_to_due <= 7:
                return 45
            if days_to_due <= 14:
                return 30
            if days_to_due <= 30:
                return 15
            return 0

        tasks["_urgency_score"] = tasks.apply(urgency_score, axis=1).astype(int)

        def risk_score(row: pd.Series) -> int:
            score = 0
            if "safety_risk_flag" in tasks.columns and self._boolish(row.get("safety_risk_flag")):
                score += 50
            if "sla_flag" in tasks.columns and self._boolish(row.get("sla_flag")):
                score += 25
            if "asset_criticality_class" in tasks.columns:
                score += self._criticality_component(row.get("asset_criticality_class"))
            return min(100, score)

        tasks["_risk_tiebreak_score"] = tasks.apply(risk_score, axis=1).astype(int)

        invalid_reason = pd.Series("", index=tasks.index, dtype="object")
        invalid_reason = invalid_reason.mask(tasks["_section_key"].eq(""), "Missing section_id")
        invalid_reason = invalid_reason.mask(
            invalid_reason.eq("") & tasks["_division_key"].eq(""), "Missing division"
        )
        invalid_reason = invalid_reason.mask(
            invalid_reason.eq("") & (tasks["_duration_minutes"] <= 0),
            "Missing, zero, or invalid estimated_block_duration_hours",
        )

        tasks["unscheduled_reason"] = invalid_reason
        invalid_tasks = tasks.loc[~invalid_reason.eq("")].copy()
        valid_tasks = tasks.loc[invalid_reason.eq("")].copy().reset_index(drop=True)

        # Re-index internal valid tasks to compact integer IDs used by CP-SAT.
        valid_tasks["_task_index"] = range(len(valid_tasks))
        return raw, valid_tasks, invalid_tasks

    def load_data(self, maintenance_path: str | Path, coa_path: str | Path) -> None:
        self.coa = self._prepare_coa(coa_path)
        planning_date = self.coa["_window_start"].min().normalize()
        self.tasks_all, self.tasks, self.invalid_tasks = self._prepare_tasks(
            maintenance_path, planning_date
        )
        self.origin = self.coa["_window_start"].min().normalize()

        self.coa["_start_rel"] = (
            (self.coa["_window_start"] - self.origin).dt.total_seconds() / 60
        ).round().astype(int)
        self.coa["_end_rel"] = (
            (self.coa["_window_end"] - self.origin).dt.total_seconds() / 60
        ).round().astype(int)

    def _traffic_penalty_per_minute(self, traffic_load: str) -> int:
        if traffic_load == "High":
            return self.config.high_traffic_penalty_per_minute
        if traffic_load == "Medium":
            return self.config.medium_traffic_penalty_per_minute
        return 0

    def build_model(self) -> None:
        if self.coa.empty or self.origin is None:
            raise RuntimeError("Call load_data() before build_model().")

        model = cp_model.CpModel()
        self.model = model

        windows_by_key: Dict[Tuple[str, str], List[int]] = defaultdict(list)
        for w, row in self.coa.iterrows():
            windows_by_key[(row["_section_key"], row["_division_key"])].append(w)

        intervals_by_window: Dict[int, List[cp_model.IntervalVar]] = defaultdict(list)
        intervals_by_section: Dict[Tuple[str, str], List[cp_model.IntervalVar]] = defaultdict(list)

        # 1) Optional task-window interval variables.
        for t, task in self.tasks.iterrows():
            key = (task["_section_key"], task["_division_key"])
            matching_windows = windows_by_key.get(key, [])
            self.matching_windows_by_task[t] = list(matching_windows)

            duration = int(task["_duration_minutes"])
            for w in matching_windows:
                window = self.coa.loc[w]
                capacity = int(window["_duration_minutes"])
                if duration > capacity:
                    continue

                self.feasible_windows_by_task[t].append(w)
                ws = int(window["_start_rel"])
                we = int(window["_end_rel"])

                presence = model.new_bool_var(f"assign_t{t}_w{w}")
                start = model.new_int_var(ws, we - duration, f"start_t{t}_w{w}")
                end = model.new_int_var(ws, we, f"end_t{t}_w{w}")
                interval = model.new_optional_interval_var(
                    start=start,
                    size=duration,
                    end=end,
                    is_present=presence,
                    name=f"interval_t{t}_w{w}",
                )

                self.assignment[(t, w)] = presence
                self.start_vars[(t, w)] = start
                self.end_vars[(t, w)] = end
                self.interval_vars[(t, w)] = interval
                self.assignments_by_task[t].append(w)
                self.assignments_by_window[w].append(t)
                intervals_by_window[w].append(interval)
                intervals_by_section[key].append(interval)

                due = task["_due_date"]
                if pd.isna(due):
                    late_days = 0
                else:
                    completion_date = window["_window_end"].normalize()
                    late_days = max(0, int((completion_date - due).days))
                self.assignment_lateness_days[(t, w)] = min(
                    self.config.max_lateness_penalty_days, late_days
                )

        # 2) Each maintenance task can be scheduled in at most one COA window.
        # scheduled[t] == sum(assign[t,w]) because scheduled[t] itself is Boolean.
        for t in self.tasks.index:
            scheduled = model.new_bool_var(f"scheduled_t{t}")
            self.scheduled_vars[t] = scheduled
            xs = [self.assignment[(t, w)] for w in self.assignments_by_task.get(t, [])]
            if xs:
                model.add(sum(xs) == scheduled)
            else:
                model.add(scheduled == 0)

        # 3) Tasks sharing a COA window cannot overlap.
        for w, intervals in intervals_by_window.items():
            if intervals:
                model.add_no_overlap(intervals)

        # 4) Physical section protection across overlapping COA records.
        # This prevents two overlapping candidate windows for the same section/division
        # from being exploited as if they were independent track capacity.
        if self.config.enforce_section_no_overlap:
            for _, intervals in intervals_by_section.items():
                if len(intervals) > 1:
                    model.add_no_overlap(intervals)

        objective_terms = []

        # 5) Reward scheduling priority/urgency/risk.
        for t, task in self.tasks.iterrows():
            priority = int(round(float(task["_priority"])))
            urgency = int(task["_urgency_score"])
            risk = int(task["_risk_tiebreak_score"])
            task_value = (
                self.config.priority_weight * priority
                + self.config.urgency_weight * urgency
                + self.config.risk_tiebreak_weight * risk
            )
            objective_terms.append(task_value * self.scheduled_vars[t])

        # 6) Assignment-specific penalties: traffic impact and due-date lateness.
        for (t, w), x in self.assignment.items():
            task = self.tasks.loc[t]
            window = self.coa.loc[w]
            duration = int(task["_duration_minutes"])
            traffic_cost = self._traffic_penalty_per_minute(window["_traffic_load"]) * duration
            late_cost = (
                self.config.lateness_penalty_per_day
                * self.assignment_lateness_days[(t, w)]
            )
            if traffic_cost:
                objective_terms.append(-traffic_cost * x)
            if late_cost:
                objective_terms.append(-late_cost * x)

        # 7) Window/block variables: block opening, utilization, compactness, bundling.
        for w, window in self.coa.iterrows():
            capacity = int(window["_duration_minutes"])
            tasks_in_window = self.assignments_by_window.get(w, [])
            xs = [self.assignment[(t, w)] for t in tasks_in_window]

            block_used = model.new_bool_var(f"block_used_w{w}")
            self.block_used_vars[w] = block_used

            used_minutes = model.new_int_var(0, capacity, f"used_minutes_w{w}")
            unused_minutes = model.new_int_var(0, capacity, f"unused_minutes_w{w}")
            self.block_used_minutes_vars[w] = used_minutes
            self.block_unused_minutes_vars[w] = unused_minutes

            if xs:
                for x in xs:
                    model.add(x <= block_used)
                model.add(block_used <= sum(xs))
                model.add(
                    used_minutes
                    == sum(
                        int(self.tasks.loc[t, "_duration_minutes"]) * self.assignment[(t, w)]
                        for t in tasks_in_window
                    )
                )
            else:
                model.add(block_used == 0)
                model.add(used_minutes == 0)

            # If unused: 0. If used: capacity - assigned maintenance minutes.
            model.add(unused_minutes == capacity * block_used - used_minutes)

            # Compactness: finish_offset is the latest task end relative to window start.
            # idle_minutes = finish_offset - used_minutes, so leading/internal gaps are penalized.
            finish_offset = model.new_int_var(0, capacity, f"finish_offset_w{w}")
            idle_minutes = model.new_int_var(0, capacity, f"idle_minutes_w{w}")
            self.block_idle_minutes_vars[w] = idle_minutes
            model.add(finish_offset <= capacity * block_used)
            model.add(finish_offset >= used_minutes)
            for t in tasks_in_window:
                x = self.assignment[(t, w)]
                end = self.end_vars[(t, w)]
                ws = int(window["_start_rel"])
                model.add(finish_offset >= end - ws).only_enforce_if(x)
            model.add(idle_minutes == finish_offset - used_minutes)

            # Department bundling variables.
            dept_vars = []
            departments = sorted({str(self.tasks.loc[t, "department"]) for t in tasks_in_window})
            for d_idx, dept in enumerate(departments):
                dept_tasks = [t for t in tasks_in_window if str(self.tasks.loc[t, "department"]) == dept]
                dept_xs = [self.assignment[(t, w)] for t in dept_tasks]
                dv = model.new_bool_var(f"dept_used_w{w}_d{d_idx}")
                for x in dept_xs:
                    model.add(x <= dv)
                model.add(dv <= sum(dept_xs))
                dept_vars.append(dv)

            dept_count = model.new_int_var(0, len(dept_vars), f"dept_count_w{w}")
            self.block_department_count_vars[w] = dept_count
            if dept_vars:
                model.add(dept_count == sum(dept_vars))
            else:
                model.add(dept_count == 0)

            max_extra = max(0, len(dept_vars) - 1)
            extra_depts = model.new_int_var(0, max_extra, f"extra_depts_w{w}")
            self.block_extra_department_vars[w] = extra_depts
            model.add(extra_depts == dept_count - block_used)

            multi_dept = model.new_bool_var(f"multi_dept_w{w}")
            self.block_multi_department_vars[w] = multi_dept
            if len(dept_vars) >= 2:
                model.add(dept_count >= 2).only_enforce_if(multi_dept)
                model.add(dept_count <= 1).only_enforce_if(multi_dept.Not())
            else:
                model.add(multi_dept == 0)

            objective_terms.extend(
                [
                    -self.config.block_open_penalty * block_used,
                    -self.config.unused_capacity_penalty_per_minute * unused_minutes,
                    -self.config.internal_idle_penalty_per_minute * idle_minutes,
                    self.config.bundle_extra_department_bonus * extra_depts,
                    self.config.multi_department_block_bonus * multi_dept,
                ]
            )

        model.maximize(sum(objective_terms))

        validation_error = model.validate()
        if validation_error:
            raise ValueError(f"CP-SAT model validation failed: {validation_error}")

    def solve(self) -> None:
        if self.model is None:
            raise RuntimeError("Call build_model() before solve().")

        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = float(self.config.time_limit_seconds)
        solver.parameters.num_search_workers = int(self.config.num_search_workers)
        solver.parameters.random_seed = int(self.config.random_seed)
        solver.parameters.log_search_progress = bool(self.config.log_search_progress)

        self.status = solver.solve(self.model)
        self.solver = solver

        if self.status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            raise RuntimeError(
                f"No feasible schedule found. Solver status: {solver.status_name(self.status)}"
            )

    def _rel_to_timestamp(self, value: int) -> pd.Timestamp:
        assert self.origin is not None
        return self.origin + pd.to_timedelta(int(value), unit="m")

    def extract_results(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        if self.solver is None or self.status is None:
            raise RuntimeError("Call solve() before extract_results().")

        solver = self.solver
        scheduled_rows: List[dict] = []
        block_records: List[dict] = []

        # First extract exact task placements.
        placements_by_window: Dict[int, List[dict]] = defaultdict(list)
        for (t, w), x in self.assignment.items():
            if solver.value(x) != 1:
                continue
            task = self.tasks.loc[t]
            window = self.coa.loc[w]
            start_dt = self._rel_to_timestamp(solver.value(self.start_vars[(t, w)]))
            end_dt = self._rel_to_timestamp(solver.value(self.end_vars[(t, w)]))
            placement = {
                "_task_index": t,
                "_window_index": w,
                "asset_id": task["asset_id"],
                "department": task["department"],
                "section_id": task["section_id"],
                "division": task["division"],
                "due_date": task["_due_date"],
                "duration_hours": round(int(task["_duration_minutes"]) / 60.0, 3),
                "duration_minutes": int(task["_duration_minutes"]),
                "priority_score": float(task["_priority"]),
                "task_start_time": start_dt,
                "task_end_time": end_dt,
                "lateness_days": self.assignment_lateness_days.get((t, w), 0),
                "source_system": task.get("source_system", ""),
                "traffic_load": window["_traffic_load"],
                "block_id": window["block_id"],
                "window_date": window["_window_date"].date(),
                "coa_window_start": window["_window_start"],
                "coa_window_end": window["_window_end"],
                "coa_available_duration_hours": round(
                    int(window["_duration_minutes"]) / 60.0, 3
                ),
            }
            placements_by_window[w].append(placement)

        # Then calculate block-level fields once and repeat them on task rows.
        for w, placements in placements_by_window.items():
            window = self.coa.loc[w]
            placements.sort(key=lambda p: p["task_start_time"])
            actual_start = min(p["task_start_time"] for p in placements)
            actual_end = max(p["task_end_time"] for p in placements)
            used_minutes = sum(p["duration_minutes"] for p in placements)
            capacity = int(window["_duration_minutes"])
            utilization = used_minutes / capacity if capacity else 0.0
            departments = sorted({str(p["department"]) for p in placements})

            block_record = {
                "block_id": window["block_id"],
                "section_id": window["section_id"],
                "division": window["division"],
                "window_date": window["_window_date"].date(),
                "coa_window_start": window["_window_start"],
                "coa_window_end": window["_window_end"],
                "block_start_time": actual_start,
                "block_end_time": actual_end,
                "traffic_load": window["_traffic_load"],
                "available_minutes": capacity,
                "scheduled_minutes": used_minutes,
                "block_utilization": round(utilization, 4),
                "task_count": len(placements),
                "bundled_departments": "|".join(departments),
                "bundled_department_count": len(departments),
                "internal_idle_minutes": int(
                    solver.value(self.block_idle_minutes_vars[w])
                ),
            }
            block_records.append(block_record)

            for p in placements:
                p.update(
                    {
                        "block_start_time": actual_start,
                        "block_end_time": actual_end,
                        "block_utilization": round(utilization, 4),
                        "bundled_departments": "|".join(departments),
                        "bundled_department_count": len(departments),
                    }
                )
                scheduled_rows.append(p)

        schedule_columns = [
            "block_id",
            "section_id",
            "division",
            "window_date",
            "coa_window_start",
            "coa_window_end",
            "block_start_time",
            "block_end_time",
            "task_start_time",
            "task_end_time",
            "asset_id",
            "department",
            "duration_hours",
            "priority_score",
            "due_date",
            "lateness_days",
            "traffic_load",
            "block_utilization",
            "bundled_departments",
            "bundled_department_count",
            "source_system",
        ]
        schedule = pd.DataFrame(scheduled_rows)
        if schedule.empty:
            schedule = pd.DataFrame(columns=schedule_columns)
        else:
            schedule = schedule[schedule_columns].sort_values(
                ["window_date", "section_id", "task_start_time", "priority_score"],
                ascending=[True, True, True, False],
            ).reset_index(drop=True)

        block_summary = pd.DataFrame(block_records)
        if not block_summary.empty:
            block_summary = block_summary.sort_values(
                ["window_date", "section_id", "block_start_time"]
            ).reset_index(drop=True)

        # Build unscheduled/deferred report.
        unscheduled_records: List[dict] = []

        for _, row in self.invalid_tasks.iterrows():
            unscheduled_records.append(
                {
                    "asset_id": row["asset_id"],
                    "department": row["department"],
                    "section_id": row["section_id"],
                    "division": row["division"],
                    "due_date": row["_due_date"],
                    "duration_hours": row["_duration_hours"],
                    "priority_score": row["_priority"],
                    "unscheduled_reason": row["unscheduled_reason"],
                }
            )

        for t, task in self.tasks.iterrows():
            if solver.value(self.scheduled_vars[t]) == 1:
                continue
            matching = self.matching_windows_by_task.get(t, [])
            feasible = self.feasible_windows_by_task.get(t, [])
            if not matching:
                reason = "No COA window matches section_id + division"
            elif not feasible:
                reason = "Matching COA windows exist, but all are shorter than task duration"
            else:
                status_name = solver.status_name(self.status)
                if self.status == cp_model.OPTIMAL:
                    reason = "Deferred by optimizer because of competing capacity/objective trade-offs"
                else:
                    reason = (
                        "Not selected in best feasible solution found within time limit; "
                        f"solver_status={status_name}"
                    )
            unscheduled_records.append(
                {
                    "asset_id": task["asset_id"],
                    "department": task["department"],
                    "section_id": task["section_id"],
                    "division": task["division"],
                    "due_date": task["_due_date"],
                    "duration_hours": round(int(task["_duration_minutes"]) / 60.0, 3),
                    "priority_score": float(task["_priority"]),
                    "unscheduled_reason": reason,
                }
            )

        unscheduled = pd.DataFrame(unscheduled_records)

        total_tasks = len(self.tasks_all)
        scheduled_count = len(schedule)
        unscheduled_count = total_tasks - scheduled_count
        total_blocks_used = len(block_summary)
        total_duration_hours = (
            float(schedule["duration_hours"].sum()) if not schedule.empty else 0.0
        )
        avg_util = (
            float(block_summary["block_utilization"].mean()) if not block_summary.empty else 0.0
        )
        weighted_util = 0.0
        if not block_summary.empty and block_summary["available_minutes"].sum() > 0:
            weighted_util = float(
                block_summary["scheduled_minutes"].sum()
                / block_summary["available_minutes"].sum()
            )

        high_priority_total = int(
            (pd.to_numeric(self.tasks_all["priority_score"], errors="coerce") >= self.config.high_priority_threshold).sum()
        )
        high_priority_scheduled = 0
        if not schedule.empty:
            high_priority_scheduled = int(
                (schedule["priority_score"] >= self.config.high_priority_threshold).sum()
            )
        high_priority_pct = (
            100.0 * high_priority_scheduled / high_priority_total
            if high_priority_total > 0
            else 0.0
        )

        multi_dept_blocks = 0
        if not block_summary.empty:
            multi_dept_blocks = int((block_summary["bundled_department_count"] >= 2).sum())

        # Baseline proxy: each scheduled task would have required its own independent block opening.
        # The optimizer uses one opening per used coordinated COA window.
        block_openings_saved = max(0, scheduled_count - total_blocks_used)
        estimated_block_hours_saved = (
            block_openings_saved * self.config.assumed_block_setup_overhead_hours
        )

        metrics_dict = {
            "total_maintenance_tasks": total_tasks,
            "scheduled_tasks": scheduled_count,
            "unscheduled_tasks": unscheduled_count,
            "total_blocks_used": total_blocks_used,
            "total_maintenance_duration_hours": round(total_duration_hours, 3),
            "average_block_utilization_pct": round(avg_util * 100, 2),
            "capacity_weighted_block_utilization_pct": round(weighted_util * 100, 2),
            "high_priority_threshold": self.config.high_priority_threshold,
            "high_priority_tasks_total": high_priority_total,
            "high_priority_tasks_scheduled": high_priority_scheduled,
            "high_priority_tasks_scheduled_pct": round(high_priority_pct, 2),
            "multi_department_bundled_blocks": multi_dept_blocks,
            "block_openings_saved_vs_one_task_per_block": block_openings_saved,
            "estimated_block_hours_saved": round(estimated_block_hours_saved, 3),
            "estimated_block_hours_saved_assumption": (
                f"{self.config.assumed_block_setup_overhead_hours} h coordination/setup overhead "
                "per avoided independent block opening"
            ),
            "solver_status": solver.status_name(self.status),
            "solver_objective_value": round(float(solver.objective_value), 3),
            "solver_best_objective_bound": round(float(solver.best_objective_bound), 3),
            "solver_wall_time_seconds": round(float(solver.wall_time), 3),
        }
        metrics = pd.DataFrame(
            [{"metric": key, "value": value} for key, value in metrics_dict.items()]
        )

        return schedule, unscheduled, block_summary, metrics

    def run(
        self,
        maintenance_path: str | Path,
        coa_path: str | Path,
        output_dir: str | Path,
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        self.load_data(maintenance_path, coa_path)
        self.build_model()
        self.solve()
        schedule, unscheduled, block_summary, metrics = self.extract_results()

        schedule.to_csv(output_dir / "optimized_schedule.csv", index=False)
        unscheduled.to_csv(output_dir / "unscheduled_tasks.csv", index=False)
        block_summary.to_csv(output_dir / "block_summary.csv", index=False)
        metrics.to_csv(output_dir / "summary_metrics.csv", index=False)

        return schedule, unscheduled, block_summary, metrics


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="CP-SAT optimizer for coordinated Indian Railways maintenance blocks."
    )
    parser.add_argument(
        "--maintenance",
        default="data/unified_maintenance_dataset.csv",
        help="Path to unified maintenance CSV.",
    )
    parser.add_argument(
        "--coa",
        default="data/coa_corridor_availability.csv",
        help="Path to COA corridor availability CSV.",
    )
    parser.add_argument(
        "--output-dir",
        default="output",
        help="Directory for CSV outputs.",
    )
    parser.add_argument(
        "--time-limit",
        type=float,
        default=60.0,
        help="CP-SAT time limit in seconds.",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=max(1, min(8, os.cpu_count() or 1)),
        help="CP-SAT parallel search workers.",
    )
    parser.add_argument(
        "--solver-log",
        action="store_true",
        help="Print CP-SAT search progress.",
    )
    parser.add_argument(
        "--allow-section-concurrency",
        action="store_true",
        help=(
            "Disable the extra section-level no-overlap constraint. Use only if your "
            "domain model proves simultaneous work in the same section is safe."
        ),
    )
    return parser


def main() -> None:
    args = build_arg_parser().parse_args()
    config = OptimizerConfig(
        time_limit_seconds=args.time_limit,
        num_search_workers=max(1, args.workers),
        log_search_progress=args.solver_log,
        enforce_section_no_overlap=not args.allow_section_concurrency,
    )
    optimizer = RailwayBlockOptimizer(config)
    schedule, unscheduled, block_summary, metrics = optimizer.run(
        maintenance_path=args.maintenance,
        coa_path=args.coa,
        output_dir=args.output_dir,
    )

    print("\n=== Solver summary ===")
    print(metrics.to_string(index=False))
    print("\n=== First scheduled rows ===")
    if schedule.empty:
        print("No tasks scheduled.")
    else:
        print(schedule.head(20).to_string(index=False))
    print(f"\nDeferred/unscheduled tasks: {len(unscheduled)}")
    print(f"Coordinated blocks used: {len(block_summary)}")
    print(f"Outputs written to: {Path(args.output_dir).resolve()}")


if __name__ == "__main__":
    main()

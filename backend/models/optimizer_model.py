import pandas as pd
import os
import json

BLOCK_OVERHEAD_HOURS = 0.75 

def load_availability(df_coa):
    availability = {}
    for _, row in df_coa.iterrows():
        sec_id = row['section_id']
        if sec_id not in availability:
            availability[sec_id] = []
        availability[sec_id].append({
            'date': row['window_date'],
            'start_hour': row['window_start_hour'],
            'remaining_hours': float(row['available_duration_hours']),
            'scheduled_tasks': [], 
            'departments': set(),  
            'is_bundled': False
        })
    return availability

def generate_plan(tasks_df, availability_dict):
    scheduled_plan = []
    unscheduled_tasks = []
    total_hours_saved = 0.0
    total_bundled_tasks = 0
    
    for _, task in tasks_df.iterrows():
        sec_id = task['section_id']
        dept = task['department']
        duration = float(task['estimated_block_duration_hours'])
        task_id = task['asset_id']
        
        best_window = None
        if sec_id in availability_dict:
            for window in availability_dict[sec_id]:
                if window['remaining_hours'] >= duration:
                    if best_window is None or window['remaining_hours'] < best_window['remaining_hours']:
                        best_window = window
                        
        if best_window:
            if len(best_window['departments']) > 0 and dept not in best_window['departments']:
                best_window['is_bundled'] = True
                total_hours_saved += BLOCK_OVERHEAD_HOURS 
                total_bundled_tasks += 1
                
            best_window['scheduled_tasks'].append(task_id)
            best_window['departments'].add(dept)
            best_window['remaining_hours'] -= duration 
            
            scheduled_plan.append({
                'section_id': sec_id,
                'date': best_window['date'],
                'start_hour': best_window['start_hour'],
                'department': dept,
                'asset_id': task_id,
                'duration': duration,
                'priority': task.get('priority_score', 0),
                'is_bundled': best_window['is_bundled']
            })
        else:
            unscheduled_tasks.append(task_id)
            
    metrics = {
        'total_hours_saved': total_hours_saved,
        'bundled_tasks_count': total_bundled_tasks,
        'unscheduled_count': len(unscheduled_tasks)
    }
    return scheduled_plan, availability_dict, metrics

def filter_coa_by_days(df_coa, days):
    df_coa['window_date'] = pd.to_datetime(df_coa['window_date'])
    min_date = df_coa['window_date'].min()
    max_date = min_date + pd.Timedelta(days=days)
    filtered_df = df_coa[df_coa['window_date'] <= max_date].copy()
    filtered_df['window_date'] = filtered_df['window_date'].dt.strftime('%Y-%m-%d')
    return filtered_df


# CLI Testing & Export Block
if __name__ == "__main__":
    # Dynamically map the paths to the new data/ folders
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    COA_CSV = os.path.join(BASE_DIR, "data", "input", "coa.csv")
    UNI_CSV = os.path.join(BASE_DIR, "data", "input", "uni.csv")
    PLAN_WEEKLY = os.path.join(BASE_DIR, "data", "output", "plan_weekly.json")
    PLAN_MONTHLY = os.path.join(BASE_DIR, "data", "output", "plan_monthly.json")

    try:
        df_coa_full = pd.read_csv(COA_CSV)
        tasks_df = pd.read_csv(UNI_CSV).sort_values(by='priority_score', ascending=False)
        
        print("=== GENERATING MASTER PLAN ===")
        
        # 1. Generate the MONTHLY plan (Master)
        df_coa_monthly = filter_coa_by_days(df_coa_full, 30)
        avail_monthly = load_availability(df_coa_monthly)
        plan_monthly, _, metrics_monthly = generate_plan(tasks_df, avail_monthly)
        plan_df = pd.DataFrame(plan_monthly)
        
        # 2. Derive the WEEKLY plan cleanly
        plan_df['date_obj'] = pd.to_datetime(plan_df['date'])
        min_date = plan_df['date_obj'].min()
        weekly_cutoff = min_date + pd.Timedelta(days=7)
        plan_weekly_df = plan_df[plan_df['date_obj'] <= weekly_cutoff].copy()
        
        plan_df = plan_df.drop(columns=['date_obj'])
        plan_weekly_df = plan_weekly_df.drop(columns=['date_obj'])

        # 3. Print Metrics Narrative
        scheduled_this_week = len(plan_weekly_df)
        scheduled_later = len(plan_df) - scheduled_this_week
        awaiting_capacity = metrics_monthly['unscheduled_count']
        
        print(f"\n📊 DISTRIBUTION NARRATIVE:")
        print(f"Scheduled this week: {scheduled_this_week} | Scheduled later this month: {scheduled_later} | Still awaiting capacity: {awaiting_capacity}")
        
        # 4. Save Output Files safely
        os.makedirs(os.path.dirname(PLAN_MONTHLY), exist_ok=True) # Ensure output folder exists
        plan_df.to_json(PLAN_MONTHLY, orient="records", indent=4)
        plan_weekly_df.to_json(PLAN_WEEKLY, orient="records", indent=4)
        print("\n✅ Saved 'plan_monthly.json' and 'plan_weekly.json' to backend/data/output/!")

    except Exception as e:
        print(f"Error during execution: {e}")
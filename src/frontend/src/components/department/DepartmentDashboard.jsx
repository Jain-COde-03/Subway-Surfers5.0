import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DepartmentProvider, useDepartment } from '../../context/DepartmentContext';
import DashboardHeader from './DashboardHeader';
import DepartmentSidebar from './DepartmentSidebar';
import DepartmentKPIs from './DepartmentKPIs';
import LogDepartmentDefect from './LogDepartmentDefect';
import DepartmentTaskQueue from './DepartmentTaskQueue';
import ConfirmedBlockCalendar from './ConfirmedBlockCalendar';
import SmartActivityFeed from './SmartActivityFeed';
import ResourceUtilizationTracker from './ResourceUtilizationTracker';

import {
  getDepartmentTasks,
  getConfirmedBlocks,
  getDepartmentNotifications,
  getDepartmentResources,
  getDepartmentKpis,
  postDefect,
} from '../../services/mockApi';

/**
 * Inner Department Dashboard view
 * Automatically consumes department context and manages data-fetching lifecycle.
 */
function DepartmentDashboardContent({ user, onLogout, onSelectDepartment }) {
  const { department, division, departmentKey, departmentCode } = useDepartment();

  // Dynamic Theme State (default to light mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Component Data States
  const [kpis, setKpis] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [resources, setResources] = useState([]);

  // Loading States
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingResources, setLoadingResources] = useState(true);

  // Error States
  const [kpisError, setKpisError] = useState(null);
  const [tasksError, setTasksError] = useState(null);
  const [blocksError, setBlocksError] = useState(null);
  const [notificationsError, setNotificationsError] = useState(null);
  const [resourcesError, setResourcesError] = useState(null);

  // Form Prefill State for Rejected Task Resubmission
  const [prefillTask, setPrefillTask] = useState(null);

  // Ref to form for smooth scrolling when "Edit & Resubmit" is clicked
  const formRef = useRef(null);
  const feedRef = useRef(null);

  // -------------------------------------------------------------
  // Data Fetch Handlers (Constructed with resolved department)
  // -------------------------------------------------------------
  const loadKpis = useCallback(async () => {
    setLoadingKpis(true);
    setKpisError(null);
    try {
      const data = await getDepartmentKpis(departmentKey);
      setKpis(data);
    } catch (err) {
      setKpisError(err.message || 'Error loading KPIs');
    } finally {
      setLoadingKpis(false);
    }
  }, [departmentKey]);

  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    setTasksError(null);
    try {
      const data = await getDepartmentTasks(departmentKey);
      setTasks(data);
    } catch (err) {
      setTasksError(err.message || 'Error loading task queue');
    } finally {
      setLoadingTasks(false);
    }
  }, [departmentKey]);

  const loadBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    setBlocksError(null);
    try {
      const data = await getConfirmedBlocks(departmentKey);
      setBlocks(data);
    } catch (err) {
      setBlocksError(err.message || 'Error loading confirmed blocks');
    } finally {
      setLoadingBlocks(false);
    }
  }, [departmentKey]);

  const loadNotifications = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoadingNotifications(true);
    setNotificationsError(null);
    try {
      const data = await getDepartmentNotifications(departmentKey);
      setNotifications(data);
    } catch (err) {
      if (!isPolling) setNotificationsError(err.message || 'Error loading activity feed');
    } finally {
      if (!isPolling) setLoadingNotifications(false);
    }
  }, [departmentKey]);

  const loadResources = useCallback(async () => {
    setLoadingResources(true);
    setResourcesError(null);
    try {
      const data = await getDepartmentResources(departmentKey);
      setResources(data);
    } catch (err) {
      setResourcesError(err.message || 'Error loading resource metrics');
    } finally {
      setLoadingResources(false);
    }
  }, [departmentKey]);

  // Initial Data Load
  useEffect(() => {
    loadKpis();
    loadTasks();
    loadBlocks();
    loadNotifications(false);
    loadResources();
  }, [loadKpis, loadTasks, loadBlocks, loadNotifications, loadResources]);

  // Real-Time Polling for Notifications, Blocks, and Tasks (every 8 seconds + live sync)
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadNotifications(true);
      loadBlocks();
      loadTasks();
    }, 8000);

    const handleSync = () => {
      loadNotifications(true);
      loadBlocks();
      loadTasks();
      loadKpis();
    };
    window.addEventListener('samay_schedule_updated', handleSync);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('samay_schedule_updated', handleSync);
    };
  }, [loadNotifications, loadBlocks, loadTasks, loadKpis]);

  // Handler for Defect Submission (New or Resubmission)
  const handleDefectSubmit = async (defectPayload) => {
    const createdOrUpdatedTask = await postDefect(defectPayload);

    // Update local tasks queue immediately
    setTasks((prev) => {
      const existingIdx = prev.findIndex((t) => t.id === createdOrUpdatedTask.id);
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = createdOrUpdatedTask;
        return next;
      }
      return [createdOrUpdatedTask, ...prev];
    });

    // Refresh KPIs, tasks from database, and activity feed
    await loadTasks();
    await loadKpis();
    await loadNotifications(true);
    setPrefillTask(null);
    window.dispatchEvent(new Event('samay_schedule_updated'));
    return createdOrUpdatedTask;
  };

  // Handler for "Edit & Resubmit" on Rejected Tasks
  const handleEditResubmit = (task) => {
    setPrefillTask(task);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll to Form when empty-state "Log First Defect" is clicked
  const handleOpenNewDefect = () => {
    setPrefillTask(null);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Focus activity feed when header bell is clicked
  const handleBellClick = () => {
    if (feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Parameterize slider label based on department
  const getSliderLabel = () => {
    if (departmentKey === 'Signal') {
      return 'Signal Stalling Risk / Operating Margin (0 - 100)';
    }
    if (departmentKey === 'Electrical') {
      return '25kV Catenary Wire Wear / Tension Variance (0 - 100)';
    }
    return 'Track Geometry Index (TGI) / Severity Score (0 - 100)';
  };

  return (
    <div
      className={`h-screen min-h-screen w-full overflow-hidden flex flex-row font-sans antialiased selection:bg-amber-700 selection:text-white transition-colors duration-300 ${
        isDarkMode ? 'dark' : ''
      }`}
    >
      {/* Component: Heavy, Dark Gunmetal Left Navigation Sidebar */}
      <DepartmentSidebar
        department={department}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        onLogout={onLogout}
        onSelectDashboard={() => {
          const mainEl = document.querySelector('main');
          if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Workspace Column: Dynamic Light / Dark Mode Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 bg-slate-50 dark:bg-slate-950 bg-[radial-gradient(rgba(30,58,138,0.1)_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(rgba(255,255,255,0.06)_1.5px,transparent_1.5px)] bg-[size:24px_24px] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Component 0: Minimal Dashboard Header */}
        <DashboardHeader
          user={user}
          department={department}
          division={division}
          unreadCount={notifications.length}
          onBellClick={handleBellClick}
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((prev) => !prev)}
        />

        {/* Main Content Body: Bounded flex-1 with min-h-0 enables smooth scrolling */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-y-auto min-h-0 scroll-smooth">
          {/* Component 1: 4 KPI Cards */}
          <section id="kpis" aria-label="Department KPIs">
            <DepartmentKPIs
              data={kpis}
              isLoading={loadingKpis}
              error={kpisError}
              onRetry={loadKpis}
            />
          </section>

          {/* Top Operational Grid: Defect Logging Form & Live Activity Feeds / Resource Tracking */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Operational Area: Log Department Defect Form (8 cols on xl) */}
            <div className="xl:col-span-8 space-y-6">
              <div id="defect-form" ref={formRef}>
                <LogDepartmentDefect
                  onSubmit={handleDefectSubmit}
                  prefill={prefillTask}
                  onCancelPrefill={() => setPrefillTask(null)}
                  department={departmentKey}
                />
              </div>
            </div>

            {/* Right Sidebar Area: Feeds & Capacity (4 cols on xl) */}
            <div className="xl:col-span-4 space-y-6">
              {/* Component 5: Smart Activity Feed (Real-Time Polling) */}
              <div id="activity-feed" ref={feedRef}>
                <SmartActivityFeed
                  notifications={notifications}
                  isLoading={loadingNotifications}
                  error={notificationsError}
                  onRetry={() => loadNotifications(false)}
                  isPolling={true}
                />
              </div>

              {/* Component 6: Resource Utilization Tracker */}
              <div id="resources">
                <ResourceUtilizationTracker
                  utilization={resources}
                  isLoading={loadingResources}
                  error={resourcesError}
                  onRetry={loadResources}
                />
              </div>
            </div>
          </div>

          {/* Full-Width Section 1: Department Task Queue Table */}
          <section id="task-queue" aria-label="Department Task Queue" className="w-full">
            <DepartmentTaskQueue
              tasks={tasks}
              isLoading={loadingTasks}
              error={tasksError}
              onRetry={loadTasks}
              onEditResubmit={handleEditResubmit}
              onOpenNewDefect={handleOpenNewDefect}
            />
          </section>

          {/* Full-Width Section 2: Confirmed Corridor Block Calendar (Full Google Calendar) */}
          <section id="calendar" aria-label="Confirmed Corridor Block Calendar" className="w-full">
            <ConfirmedBlockCalendar
              blocks={blocks}
              tasks={tasks}
              departmentKey={departmentKey}
              isLoading={loadingBlocks}
              error={blocksError}
              onRetry={loadBlocks}
              onBlockCancelled={() => {
                loadBlocks();
                loadKpis();
                loadTasks();
                loadNotifications(true);
              }}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

/**
 * Top-Level Department Dashboard Container
 * Wraps content in DepartmentProvider to structurally enforce department scoping.
 *
 * @param {Object} props
 * @param {string} [props.department='Civil'] - Department name or user object
 * @param {string} [props.division] - Division name
 * @param {Object} [props.user] - Optional user object passed from auth layer
 */
export default function DepartmentDashboard({
  department = 'Civil',
  division,
  user,
  onLogout,
}) {
  // If a user object from auth is passed, derive department from user
  const effectiveDept = user?.department || user?.deptShort || user?.id || department;
  const [activeDept, setActiveDept] = useState(effectiveDept);

  return (
    <DepartmentProvider department={activeDept} division={division}>
      <DepartmentDashboardContent
        user={user}
        onLogout={onLogout}
        onSelectDepartment={(dept) => setActiveDept(dept)}
      />
    </DepartmentProvider>
  );
}

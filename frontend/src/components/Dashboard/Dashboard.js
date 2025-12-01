import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardOverview } from '../../store/actions/dashboardActions';
import { fetchEntries } from '../../store/actions/timesheetActions';
import StatCard from './StatCard';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { overview, loading, error } = useSelector(state => state.dashboard);
  const timesheetEntriesRaw = useSelector(state => state.timesheet.entries);
  // Accept either an array or an object with an `entries` array (defensive)
  let timesheetEntries = [];
  if (Array.isArray(timesheetEntriesRaw)) {
    timesheetEntries = timesheetEntriesRaw;
  } else if (timesheetEntriesRaw && Array.isArray(timesheetEntriesRaw.entries)) {
    timesheetEntries = timesheetEntriesRaw.entries;
  } else {
    timesheetEntries = [];
  }

  useEffect(() => {
    dispatch(fetchDashboardOverview());
    dispatch(fetchEntries());
  }, [dispatch]);

  // Projected Week/Month: sum pay for entries in current week/month
  const projectedWeekly = () => {
    const now = new Date();
    // Week starts Sunday (0)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    let pay = 0, hours = 0;
    timesheetEntries.forEach(entry => {
      // Support multiple field names for start/end
      const startVal = entry.startTime || entry.start || entry.startDate || entry.start_time;
      const endVal = entry.endTime || entry.end || entry.endDate || entry.end_time;
      const entryDate = startVal ? new Date(startVal) : null;
      if (!entryDate) return;
      if (entryDate >= weekStart && entryDate <= weekEnd) {
        // Determine hours: prefer explicit hoursWorked/hours, otherwise compute from start/end
        let entryHours = 0;
        if (typeof entry.hoursWorked === 'number') entryHours = entry.hoursWorked;
        else if (typeof entry.hours === 'number') entryHours = entry.hours;
        else if (startVal && endVal) {
          const s = new Date(startVal);
          const e = new Date(endVal);
          if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e > s) {
            entryHours = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
          }
        }

        // Determine pay: prefer calculatedPay or pay fields
        const entryPay = (typeof entry.calculatedPay === 'number') ? entry.calculatedPay : (entry.pay || entry.amount || 0);

        pay += entryPay || 0;
        hours += entryHours || 0;
      }
    });
    return {
      pay: Math.round(pay * 100) / 100,
      hours: Math.round(hours * 10) / 10
    };
  };

  const projectedMonthly = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let pay = 0, hours = 0;
    timesheetEntries.forEach(entry => {
      const startVal = entry.startTime || entry.start || entry.startDate || entry.start_time;
      const endVal = entry.endTime || entry.end || entry.endDate || entry.end_time;
      const entryDate = startVal ? new Date(startVal) : null;
      if (!entryDate) return;
      if (entryDate >= monthStart && entryDate <= monthEnd) {
        let entryHours = 0;
        if (typeof entry.hoursWorked === 'number') entryHours = entry.hoursWorked;
        else if (typeof entry.hours === 'number') entryHours = entry.hours;
        else if (startVal && endVal) {
          const s = new Date(startVal);
          const e = new Date(endVal);
          if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && e > s) {
            entryHours = (e.getTime() - s.getTime()) / (1000 * 60 * 60);
          }
        }
        const entryPay = (typeof entry.calculatedPay === 'number') ? entry.calculatedPay : (entry.pay || entry.amount || 0);
        pay += entryPay || 0;
        hours += entryHours || 0;
      }
    });
    return {
      pay: Math.round(pay * 100) / 100,
      hours: Math.round(hours * 10) / 10
    };
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Track your work hours and earnings</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Today"
          hours={overview?.todayHours || 0}
          pay={overview?.todayPay || 0}
          icon="📅"
          color="#007bff"
        />
        <StatCard
          title="This Week"
          hours={overview?.weekHours || 0}
          pay={overview?.weekPay || 0}
          icon="📊"
          color="#28a745"
        />
        <StatCard
          title="This Month"
          hours={overview?.monthHours || 0}
          pay={overview?.monthPay || 0}
          icon="💰"
          color="#ffc107"
        />
        {/* Projected income based on current pace */}
        <StatCard
          title="Projected Week"
          hours={projectedWeekly().hours}
          pay={projectedWeekly().pay}
          icon="📈"
          color="#17a2b8"
        />
        <StatCard
          title="Projected Month"
          hours={projectedMonthly().hours}
          pay={projectedMonthly().pay}
          icon="🔮"
          color="#6f42c1"
        />
      </div>
    </div>
  );
};

export default Dashboard;

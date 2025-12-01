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
      // Only include entries that fall within the current week
      if (entryDate >= weekStart && entryDate <= weekEnd) {
        // Include both 'approved' and 'draft' statuses for projections
        const entryStatus = entry.status || entry.state || 'draft';
        if (!(entryStatus === 'approved' || entryStatus === 'draft')) return;
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
      // Only include entries that fall within the current month
      if (entryDate >= monthStart && entryDate <= monthEnd) {
        // Include both 'approved' and 'draft' statuses for projections
        const entryStatus = entry.status || entry.state || 'draft';
        if (!(entryStatus === 'approved' || entryStatus === 'draft')) return;
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

  // Helper: sum entries within an inclusive date range where the entry has completed (end <= now)
  const sumCompletedInRange = (rangeStart, rangeEnd) => {
    const now = new Date();
    let totalPay = 0;
    let totalHours = 0;
    timesheetEntries.forEach(entry => {
      const startVal = entry.startTime || entry.start || entry.startDate || entry.start_time;
      const endVal = entry.endTime || entry.end || entry.endDate || entry.end_time;
      if (!endVal) return; // can't consider incomplete entries without an end
      const endDate = new Date(endVal);
      if (isNaN(endDate.getTime())) return;
      // Only include entries that have finished (end <= now)
      if (endDate > now) return;

      // Only include entries that are approved
      const entryStatus = entry.status || entry.state || 'draft';
      if (entryStatus !== 'approved') return;

      // Ensure entry falls within the requested range (use end date as the completion date)
      if (endDate >= rangeStart && endDate <= rangeEnd) {
        // hours
        let entryHours = 0;
        if (typeof entry.hoursWorked === 'number') entryHours = entry.hoursWorked;
        else if (typeof entry.hours === 'number') entryHours = entry.hours;
        else {
          const s = startVal ? new Date(startVal) : null;
          if (s && !isNaN(s.getTime()) && endDate > s) {
            entryHours = (endDate.getTime() - s.getTime()) / (1000 * 60 * 60);
          }
        }

        const entryPay = (typeof entry.calculatedPay === 'number') ? entry.calculatedPay : (entry.pay || entry.amount || 0);
        totalPay += entryPay || 0;
        totalHours += entryHours || 0;
      }
    });
    return {
      hours: Math.round(totalHours * 10) / 10,
      pay: Math.round(totalPay * 100) / 100
    };
  };

  // Compute Today / This Week / This Month from completed entries
  const computeTodayTotals = () => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return sumCompletedInRange(start, end);
  };

  const computeWeekTotals = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return sumCompletedInRange(weekStart, weekEnd);
  };

  const computeMonthTotals = () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return sumCompletedInRange(monthStart, monthEnd);
  };

  if (loading) {
    return <div className="loading-spinner">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Derived totals from completed entries
  const todayTotals = computeTodayTotals();
  const weekTotals = computeWeekTotals();
  const monthTotals = computeMonthTotals();

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
          hours={todayTotals.hours}
          pay={todayTotals.pay}
          icon="📅"
          color="#007bff"
        />
        <StatCard
          title="This Week"
          hours={weekTotals.hours}
          pay={weekTotals.pay}
          icon="📊"
          color="#28a745"
        />
        <StatCard
          title="This Month"
          hours={monthTotals.hours}
          pay={monthTotals.pay}
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

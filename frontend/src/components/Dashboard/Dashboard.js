import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardOverview } from '../../store/actions/dashboardActions';
import StatCard from './StatCard';
import './Dashboard.css';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { overview, loading, error } = useSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardOverview());
  }, [dispatch]);

  // Helpers to compute projected income based on pace so far
  const getDaysElapsedInWeek = () => {
    const today = new Date();
    // JS getDay(): 0 (Sun) - 6 (Sat). Treat week as starting Sunday.
    return Math.max(1, today.getDay() + 1);
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const projectedWeekly = () => {
    const weekPay = overview?.weekPay || 0;
    const weekHours = overview?.weekHours || 0;
    const daysElapsed = getDaysElapsedInWeek();
    const projPay = (weekPay / daysElapsed) * 7;
    const projHours = (weekHours / daysElapsed) * 7;
    return {
      pay: Number.isFinite(projPay) ? Math.round(projPay * 100) / 100 : 0,
      hours: Number.isFinite(projHours) ? Math.round(projHours * 10) / 10 : 0
    };
  };

  const projectedMonthly = () => {
    const monthPay = overview?.monthPay || 0;
    const monthHours = overview?.monthHours || 0;
    const today = new Date();
    const daysElapsed = Math.max(1, today.getDate());
    const daysInMonth = getDaysInMonth(today);
    const projPay = (monthPay / daysElapsed) * daysInMonth;
    const projHours = (monthHours / daysElapsed) * daysInMonth;
    return {
      pay: Number.isFinite(projPay) ? Math.round(projPay * 100) / 100 : 0,
      hours: Number.isFinite(projHours) ? Math.round(projHours * 10) / 10 : 0
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

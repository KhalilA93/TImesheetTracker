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
        <StatCard
          title="Weekly Average"
          hours={(overview?.weekHours || 0) / 7}
          pay={(overview?.weekPay || 0) / 7}
          icon="⚡"
          color="#17a2b8"
        />
      </div>
    </div>
  );
};

export default Dashboard;

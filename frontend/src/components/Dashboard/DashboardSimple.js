import React from 'react';

const DashboardSimple = () => {
  return (
    <div style={{padding: '20px'}}>
      <h1>Simple Dashboard Test</h1>
      <p>If you can see this, React is working!</p>
      <div style={{border: '1px solid #ccc', padding: '10px', margin: '10px 0'}}>
        <h3>Test Values</h3>
        <p>Today: 0.0h - $0.00</p>
        <p>This Week: 6.0h - $54.00</p>
        <p>This Month: 13.5h - $121.50</p>
      </div>
    </div>
  );
};

export default DashboardSimple;

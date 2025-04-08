import React from 'react';
import DashboardCard from '../../../components/Cards/DashboardCard/DashboardCard'; // Adjust path as needed
import './Dashboard.css';

const AnsattDashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Ansatt Dashboard</h1>
      <div className="dashboard-cards">
        <DashboardCard
          icon="💼"
          title="Mine vakter"
          description="Se oversikt over dine kommende og tidligere vakter"
          statValue="4"
          statText="Planlagte vakter"
          linkText="Utforsk mine vakter"
          linkTo="/dashboard/butikkansatt/minevakter"
        />
        <DashboardCard
          icon="🏪"
          title="Butikker"
          description="Se tilgjengelige butikker i ditt område og relevant info"
          statValue="12"
          statText="Butikker tilgjengelig"
          linkText="Utforsk butikker"
          linkTo="/dashboard/butikkansatt/butikker"
        />
      </div>
    </div>
  );
};

export default AnsattDashboard;

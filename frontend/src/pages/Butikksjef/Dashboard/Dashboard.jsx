import React from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import "./Dashboard.css";

const ButikksjefDashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Butikksjef Dashboard</h1>
      <div className="dashboard-cards">
        <DashboardCard
          icon="💼"
          title="Dine vakter"
          description="Se statusen på alle dine publiserte vakter & utlys en ny vakt"
          statValue="3/5"
          statText="Vakter har blitt fylt"
          linkText="Utforsk dine vakter"
          linkTo="/dashboard/butikksjef/minevakter"
        />
        <DashboardCard
          icon="👤"
          title="Mine ansatte"
          description="Få en oversikt over dine ansatte, deres arbeidsstatus og kompetanse"
          statValue="8/15"
          statText="Er åpen for å ta vakter"
          linkText="Utforsk dine ansatte"
          linkTo="/dashboard/butikksjef/mineansatte"
        />
        <DashboardCard
          icon="🧑‍💼"
          title="Ledige ansatte"
          description="Se en oversikt over alle tilgjengelige ansatte i området"
          statValue="36"
          statText="Tilgjengelige i ditt område"
          linkText="Utforsk ansatte i området"
          linkTo="/dashboard/butikksjef/LedigeAnsatte"
        />
        <DashboardCard
          icon="🏪"
          title="Butikker"
          description="Se en oversikt over butikkene i Coop Øst og nyttig informasjon om dem"
          statValue="4"
          statText="Butikker i området trenger hjelp"
          linkText="Utforsk andre butikker"
          linkTo="/dashboard/butikksjef/butikker"
        />
      </div>
    </div>
  );
};

export default ButikksjefDashboard;

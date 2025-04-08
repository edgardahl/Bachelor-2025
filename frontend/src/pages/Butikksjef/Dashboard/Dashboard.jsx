import React, { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import "./Dashboard.css";

const ButikksjefDashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [storeStats, setStoreStats] = useState({ total: 0, needsHelp: 0 });
  const [shiftCount, setShiftCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Get logged-in manager's ID
        const authRes = await axios.get("/auth/me");
        const managerId = authRes.data.user.id;

        // Fetch employees
        const empRes = await axios.get("/users/myemployees");
        const employeeList = empRes.data;
        setEmployees(employeeList);
        const available = employeeList.filter(
          (emp) => emp.availability === "Fleksibel"
        ).length;
        setAvailableCount(available);

        // Fetch all stores at once with municipality info (used for dashboard stats)
        const storeRes = await axios.get(
          "/stores/stores-with-municipality?page=1&pageSize=1000"
        );
        const stores = storeRes.data.stores || [];

        // Fetch shift data for all stores in parallel
        const shiftResults = await Promise.all(
          stores.map((store) =>
            axios
              .get(`/shifts/store/${store.store_id}`)
              .then((res) => res.data.length > 0)
              .catch(() => false)
          )
        );

        const needsHelp = shiftResults.filter(Boolean).length;
        setStoreStats({ total: stores.length, needsHelp });

        // Fetch shifts posted by the manager (just total count for now)
        const shiftsRes = await axios.get(`/shifts/posted_by/${managerId}`);
        setShiftCount(shiftsRes.data.length || 0);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Butikksjef Dashboard</h1>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="dashboard-cards">
          <DashboardCard
            icon="💼"
            title="Mine vakter"
            description="Se statusen på alle dine publiserte vakter & utlys en ny vakt"
            statValue={shiftCount.toString()}
            statText="Publiserte vakter"
            linkText="Utforsk dine vakter"
            linkTo="/dashboard/butikksjef/minevakter"
          />
          <DashboardCard
            icon="👤"
            title="Mine ansatte"
            description="Få en oversikt over dine ansatte, deres arbeidsstatus og kompetanse"
            statValue={`${availableCount}/${employees.length}`}
            statText="Er åpen for å ta vakter"
            linkText="Utforsk dine ansatte"
            linkTo="/dashboard/butikksjef/mineansatte"
          />
          <DashboardCard
            icon="💼"
            title="Ledige ansatte"
            description="Se en oversikt over alle tilgjengelige ansatte i området"
            statValue="36"
            statText="Tilgjengelige i ditt område"
            linkText="Utforsk ansatte i området"
            linkTo="/dashboard/butikksjef/LedigeAnsatte"
          />
          <DashboardCard
            icon="👤"
            title="Butikker"
            description="Se en oversikt over butikkene i Coop Øst og nyttig informasjon om dem"
            statValue={`${storeStats.needsHelp}/${storeStats.total}`}
            statText="Butikker trenger hjelp"
            linkText="Utforsk andre butikker"
            linkTo="/dashboard/butikksjef/butikker"
          />
        </div>
      )}
    </div>
  );
};

export default ButikksjefDashboard;

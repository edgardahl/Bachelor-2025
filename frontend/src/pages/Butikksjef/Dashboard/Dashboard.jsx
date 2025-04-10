import React, { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import "./Dashboard.css";
import useAuth from "../../../context/UseAuth";

const ButikksjefDashboard = () => {
  const { user } = useAuth(); // Get the user from context
  const [employees, setEmployees] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [storeStats, setStoreStats] = useState({ total: 0, needsHelp: 0 });
  const [shiftCount, setShiftCount] = useState({ claimed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [availableInArea, setAvailableInArea] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const managerId = user.id;
        const [availableRes, empRes, storeRes, shiftsRes] = await Promise.all([
          axios.get("/users/available-employees"),
          axios.get("/users/myemployees"),
          axios.get("/stores/stores-with-municipality?page=1&pageSize=1000"),
          axios.get(`/shifts/posted_by/${managerId}`),
        ]);

        // Available in manager's area
        setAvailableInArea(availableRes.data.length);

        // Employees
        const employeeList = empRes.data;
        setEmployees(employeeList);
        const available = employeeList.filter(
          (emp) => emp.availability === "Fleksibel"
        ).length;
        setAvailableCount(available);

        // Stores that need help
        const stores = storeRes.data.stores || [];
        const needsHelpCount = (
          await Promise.all(
            stores.map((store) =>
              axios
                .get(`/shifts/store/${store.store_id}`)
                .then((res) => res.data.length > 0)
                .catch(() => false)
            )
          )
        ).filter(Boolean).length;
        setStoreStats({ total: stores.length, needsHelp: needsHelpCount });

        // Shifts posted by manager
        const allShifts = shiftsRes.data || [];
        const claimed = allShifts.filter((shift) => !!shift.claimed_by_id);
        setShiftCount({ total: allShifts.length, claimed: claimed.length });
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
      <h1 className="dashboard-title">Velkommen {user.name}</h1>

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="dashboard-cards">
          <DashboardCard
            icon="/icons/vakter.svg"
            title="Vakter"
            description="Se statusen på alle dine publiserte vakter & utlys en ny vakt"
            statValue={`${shiftCount.claimed}/${shiftCount.total}`}
            statText="Vakter er tatt"
            linkText="Utforsk dine vakter"
            linkTo="/bs/vakter"
          />
          <DashboardCard
            icon="/icons/mine_ansatte.svg"
            title="Mine ansatte"
            description="Få en oversikt over dine ansatte, deres arbeidsstatus og kompetanse"
            statValue={`${availableCount}/${employees.length}`}
            statText="Er åpen for å ta vakter"
            linkText="Utforsk dine ansatte"
            linkTo="/bs/ansatte/mine"
          />
          <DashboardCard
            icon="/icons/ledige_ansatte.svg"
            title="Ledige ansatte"
            description="Se en oversikt over alle tilgjengelige ansatte i området"
            statValue={availableInArea}
            statText="Tilgjengelige i ditt område"
            linkText="Utforsk ansatte i området"
            linkTo="/bs/ansatte/ledige"
          />
          <DashboardCard
            icon={"/icons/store_icon.svg"}
            title="Butikker"
            description="Se en oversikt over butikkene i Coop Øst og nyttig informasjon om dem"
            statValue={`${storeStats.needsHelp}/${storeStats.total}`}
            statText="Butikker trenger hjelp"
            linkText="Utforsk andre butikker"
            linkTo="/bs/butikker"
          />
        </div>
      )}
    </div>
  );
};

export default ButikksjefDashboard;

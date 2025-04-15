import React, { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import "./Dashboard.css";

const AnsattDashboard = () => {
  const { user } = useAuth();
  console.log(user);
  const [qualifiedShifts, setQualifiedShifts] = useState(0); // State for qualified shifts
  const [storeStats, setStoreStats] = useState({ total: 0, needsHelp: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [qualifiedRes, storeRes] = await Promise.all([
          axios.get(`/shifts/user_is_qualified_for`), // Fetch qualified shifts
          axios.get("/stores/stores-with-municipality?page=1&pageSize=1000"), // Fetch store stats
        ]);

        // Qualified shifts
        setQualifiedShifts(qualifiedRes.data.length);

        // Store stats
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
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user.id]);

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Ansatt Dashboard</h1>
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="dashboard-cards">
          <DashboardCard
            icon="/icons/vakter.svg"
            title="Vakter"
            description="Finn og reserver vakter i andre butikker"
            statValue={qualifiedShifts}
            statText="vakter"
            linkText="Utforsk vakter"
            linkTo="/ba/vakter"
          />
          <DashboardCard
            icon="/icons/store_icon.svg"
            title="Butikker"
            description="Se andre butikker i ditt område og relevant info"
            statValue={storeStats.total}
            statText="Butikker"
            linkText="Utforsk butikker"
            linkTo="/ba/butikker"
          />
        </div>
      )}
    </div>
  );
};

export default AnsattDashboard;

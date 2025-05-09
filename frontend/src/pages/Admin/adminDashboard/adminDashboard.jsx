import React, { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import Loading from "../../../components/Loading/Loading";
import { MdOutlineStorefront } from "react-icons/md";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [storeStats, setStoreStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreStats = async () => {
      try {
        const res = await axios.get("/stores/storesWithMunicipality?page=1&pageSize=1000");
        const stores = res.data.stores || [];
        setStoreStats({ total: stores.length });
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreStats();
  }, [user.id]);

  return (
    <div className="dashboard">
      {loading ? (
        <Loading />
      ) : (
        <div className="dashboard-cards">
          <DashboardCard
            icon={<MdOutlineStorefront size={52} />}
            themeClass="card-theme-stores"
            title="Butikker"
            description="Administrer alle butikker i systemet"
            statValue={storeStats.total}
            statText="Totalt antall butikker"
            linkText="Gå til butikkoversikt"
            linkTo="/admin/butikker"
          />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

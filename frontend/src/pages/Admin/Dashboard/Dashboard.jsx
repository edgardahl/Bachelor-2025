import { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import Loading from "../../../components/Loading/Loading";
import { RiUserSearchLine } from "react-icons/ri";
import { MdOutlineStorefront } from "react-icons/md";
import "./AdminDashboard.css";
import CoopMap from "../../../components/mapbox/CoopMap";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [storeStats, setStoreStats] = useState({ total: 0 });
  const [managersCount, setManagersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreStats = async () => {
      try {
        const res = await axios.get(
          "/stores/storesWithMunicipality?page=1&pageSize=1000"
        );
        const stores = res.data.stores || [];
        setStoreStats({ total: stores.length });
      } catch (error) {
        console.error("Error loading store data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchManagers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5001/api/users/store_managers"
        );
        setManagersCount(response.data.length);
        console.log("Store managers:", response.data.length);
      } catch (err) {
        console.error("Error fetching managers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagers();
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
          <DashboardCard
            icon={<RiUserSearchLine size={52} />}
            themeClass="card-theme-employees"
            title="Butikksjefer"
            description="Administrer alle butikksjefer i systemet."
            statValue={managersCount}
            statText="Totalt antall butikksjefer"
            linkText="Gå til butikksjefer"
            linkTo="/admin/butikksjefer"
          />
        </div>
      )}
      <CoopMap />
    </div>
  );
};

export default AdminDashboard;

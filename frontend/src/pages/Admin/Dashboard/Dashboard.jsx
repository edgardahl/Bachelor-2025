import { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import Loading from "../../../components/Loading/Loading";
import { RiUserSearchLine } from "react-icons/ri";
import { MdOutlineStorefront } from "react-icons/md";
import "./Dashboard.css";
import CoopMap from "../../../components/mapbox/CoopMap";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [storeStats, setStoreStats] = useState({ total: 0 });
  const [managersCount, setManagersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Henter butikkdata og butikksjefer når komponenten monteres
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
        setLoading(false); // Viktig: påvirker loading-indikator
      }
    };

    const fetchManagers = async () => {
      try {
        setLoading(true); // Starter loading her også, siden begge kall påvirker visning
        const response = await axios.get(
          "http://localhost:5001/api/users/store_managers"
        );
        setManagersCount(response.data.length);
      } catch (err) {
        console.error("Error fetching managers:", err);
      } finally {
        setLoading(false); // Viktig å stoppe loading etter begge kall
      }
    };

    fetchManagers();
    fetchStoreStats();
  }, [user.id]); // Re-fetch om bruker-ID endres

  return (
    <div className="dashboard">
      {loading ? (
        <Loading /> // Viser loading-spinner mens data hentes
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

      {/* Viser interaktivt kart uansett lastetilstand */}
      <CoopMap />
    </div>
  );
};

export default AdminDashboard;

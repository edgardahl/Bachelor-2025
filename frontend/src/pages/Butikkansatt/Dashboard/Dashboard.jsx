import React, { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import axios from "../../../api/axiosInstance";
import useAuth from "../../../context/UseAuth";
import Loading from "../../../components/Loading/Loading";
import CoopMap from "../../../components/mapbox/CoopMap";
import "./Dashboard.css";
import { FiBriefcase } from "react-icons/fi";
import { MdOutlineStorefront } from "react-icons/md";

const AnsattDashboard = () => {
  const { user } = useAuth();
  const [qualifiedShifts, setQualifiedShifts] = useState(0);
  const [storeStats, setStoreStats] = useState({ total: 0, needsHelp: 0 });
  const [loading, setLoading] = useState(true);

  // useEffect som kjører ved første render og henter data for dashboardet
  useEffect(() => {
    // Funksjon for å hente dashboard-data (kvalifiserte vakter og butikkstatistikk)
    const fetchDashboardData = async () => {
      try {
        // Parallelle API-kall for kvalifiserte vakter og butikkstatistikk
        const [qualifiedRes, storeRes] = await Promise.all([
          axios.get(`/shifts/qualified/preferred`), // Hent vakter brukeren er kvalifisert for
          axios.get("/stores/storesWithMunicipality?page=1&pageSize=1000"), // Hent butikkdata for alle butikker
        ]);

        // Setter state for antall kvalifiserte vakter
        setQualifiedShifts(qualifiedRes.data.length);

        // Håndterer butikkstatistikk
        const stores = storeRes.data.stores || [];
        const needsHelpCount = (
          await Promise.all(
            stores.map((store) =>
              axios
                .get(`/shifts/store/${store.store_id}`) // Henter vakter for hver butikk
                .then((res) => res.data.length > 0) // Sjekker om butikken har vakter tilgjengelig
                .catch(() => false)
            )
          )
        ).filter(Boolean).length; // Sier hvor mange butikker som trenger hjelp

        // Setter butikkstatistikk
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
      {loading ? ( // Vist spinner hvis data er i ferd med å lastes
        <Loading />
      ) : (
        <>
          <div className="dashboard-cards">
            <DashboardCard
              icon={<FiBriefcase size={52} />}
              themeClass="card-theme-shifts"
              title="Vakter"
              description="Finn og reserver vakter i andre butikker du er kvalifisert for"
              statValue={qualifiedShifts}
              statText="Ledige vakter i dine valgte kommuner"
              linkText="Utforsk vakter"
              linkTo="/ba/vakter"
            />
            <DashboardCard
              icon={<MdOutlineStorefront size={52} />}
              themeClass="card-theme-stores"
              title="Butikker"
              description="Se andre butikker i ditt område og relevant info"
              statValue={storeStats.total}
              statText="Butikker"
              linkText="Utforsk butikker"
              linkTo="/ba/butikker"
            />
          </div>
          <CoopMap />
        </>
      )}
    </div>
  );
};

export default AnsattDashboard;

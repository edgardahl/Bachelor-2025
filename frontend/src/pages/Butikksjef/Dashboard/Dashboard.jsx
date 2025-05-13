import React, { useEffect, useState } from "react";
import DashboardCard from "../../../components/Cards/DashboardCard/DashboardCard";
import Loading from "../../../components/Loading/Loading";
import axios from "../../../api/axiosInstance";
import "./Dashboard.css";
import { MdOutlineStorefront } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { RiUserSearchLine } from "react-icons/ri";
import { FiBriefcase } from "react-icons/fi";
import CoopMap from "../../../components/mapbox/CoopMap";

import useAuth from "../../../context/UseAuth";

const ButikksjefDashboard = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [storeStats, setStoreStats] = useState({ total: 0, needsHelp: 0 });
  const [shiftCount, setShiftCount] = useState({ claimed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [availableInArea, setAvailableInArea] = useState(0);

  // Henter all nødvendig data for dashbordet (vaktrater, ansatte, butikker osv.)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const managerId = user.id;
        const [availableRes, empRes, storeRes, shiftsRes] = await Promise.all([
          axios.get("/users/available"),                              // Tilgjengelige ansatte i området
          axios.get("/users/employees"),                              // Ansatte tilknyttet butikksjefen
          axios.get("/stores/storesWithMunicipality?page=1&pageSize=1000"), // Alle butikker
          axios.get(`/shifts/posted_by/${managerId}`),                // Vakter utlyst av butikksjefen
        ]);

        // Beregn og sett antall tilgjengelige ansatte i området
        setAvailableInArea(availableRes.data.length);

        // Håndter ansatte-listen og tell de fleksible
        const employeeList = empRes.data;
        setEmployees(employeeList);
        const available = employeeList.filter(
          (emp) => emp.availability === "Fleksibel"
        ).length;
        setAvailableCount(available);

        // Tell butikker som har vakter ledige (needsHelp)
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

        // Tell vakter utlyst og hvor mange som er tatt
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
  }, [user.id]);

  return (
    <div className="dashboard">
      {loading ? (
        // Viser loader mens data hentes
        <Loading />
      ) : (
        <>
          <div className="dashboard-cards">
            {/* Oversikt over vaktstatus */}
            <DashboardCard
              themeClass="card-theme-shifts"
              icon={<FiBriefcase size={52} />}
              title="Vakter"
              description="Se statusen på alle dine publiserte vakter & utlys en ny vakt"
              statValue={`${shiftCount.claimed}/${shiftCount.total}`}
              statText="Vakter er tatt"
              linkText="Se dine vakter"
              linkTo="/bs/vakter"
            />

            {/* Oversikt over egne ansatte */}
            <DashboardCard
              themeClass="card-theme-employees"
              icon={<FaRegUser size={52} />}
              title="Mine ansatte"
              description="Få en oversikt over dine ansatte, deres arbeidsstatus og kompetanse"
              statValue={`${availableCount}/${employees.length}`}
              statText="Ansatte er åpne for å ta vakter"
              linkText="Se dine ansatte"
              linkTo="/bs/ansatte/mine"
            />

            {/* Oversikt over alle tilgjengelige ansatte i området */}
            <DashboardCard
              themeClass="card-theme-available"
              icon={<RiUserSearchLine size={52} />}
              title="Alle ansatte"
              description="Få en oversikt over alle ansatte og deres kontaktinformasjon"
              statValue={availableInArea}
              statText="Tilgjengelige ansatte"
              linkText="Se alle ansatte"
              linkTo="/bs/ansatte/ledige"
            />

            {/* Oversikt over butikker som søker ansatte */}
            <DashboardCard
              themeClass="card-theme-stores"
              icon={<MdOutlineStorefront size={52} />}
              title="Butikker"
              description="Se en oversikt over butikkene i Coop Øst med kontaktinformasjon"
              statValue={`${storeStats.needsHelp}/${storeStats.total}`}
              statText="Butikker søker ansatte"
              linkText="Se alle butikker"
              linkTo="/bs/butikker"
            />
          </div>
          {/* Kart som viser butikkene */}
          <CoopMap />
        </>
      )}
    </div>
  );
};

export default ButikksjefDashboard;

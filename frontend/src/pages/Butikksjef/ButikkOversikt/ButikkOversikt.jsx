import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard/ButikkCard";
import KommuneFilter from "../../../components/Filter/kommuneFilter/kommuneFilter";
import Loading from "../../../components/Loading/Loading";
import "./ButikkOversikt.css";
import StoreChainFilter from "../../../components/Filter/ButikkKjedeFilter/ButikkKjedeFilter";
import useAuth from "../../../context/UseAuth";
import { Link } from "react-router-dom";
import { HiPlusSm } from "react-icons/hi";

const ButikkOversikt = () => {
  const { user } = useAuth();
  const [selectedChains, setSelectedChains] = useState([]);
  const [stores, setStores] = useState([]);
  const [shiftsCount, setShiftsCount] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [preferredMunicipalityNames, setPreferredMunicipalityNames] = useState(
    []
  );

  const PAGE_SIZE = 12;

  // Henter butikkdata med eventuelle filterparametere og paginering
  const fetchStores = async (filters = {}, page = 1, append = false) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.municipality && filters.municipality.length > 0) {
        queryParams.append("municipality", filters.municipality);
      }

      if (filters.store_chain && filters.store_chain.length > 0) {
        queryParams.append("store_chain", filters.store_chain);
      }

      // Justerer paging avhengig av om vi har filtere
      if (filters.municipality || filters.store_chain) {
        queryParams.append("pageSize", 1000);
      } else {
        queryParams.append("page", page);
        queryParams.append("pageSize", PAGE_SIZE);
      }

      const response = await axios.get(
        `/stores/storesWithMunicipality?${queryParams.toString()}`
      );

      const storeData = response.data.stores;
      const shiftsData = {};
      storeData.forEach((s) => {
        shiftsData[s.store_id] = s.shift_count || 0;
      });

      if (append) {
        setStores((prev) => [...prev, ...storeData]);
      } else {
        setStores(storeData);
      }

      setTotalStores(response.data.total);
      setShiftsCount((prev) => ({ ...prev, ...shiftsData }));
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Henter brukerens foretrukne kommuner ved innlasting
  useEffect(() => {
    const fetchPreferredMunicipalities = async () => {
      try {
        if (!user) return;
        const res = await axios.get(`/users/${user.id}`);
        setPreferredMunicipalityNames(res.data.work_municipalities || []);
      } catch (err) {
        console.error("Error fetching user preferred municipalities:", err);
      }
    };

    if (user) {
      fetchPreferredMunicipalities();
    }
  }, [user]);

  // Lytter på endringer i filters for å oppdatere butikklisten
  useEffect(() => {
    setLoading(true);
    fetchStores(filters, 1);
  }, [filters]);

  // Håndterer "Vis mer"-knappen for paginering
  const handleShowMore = () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchStores(filters, nextPage, true);
  };

  const filteredStores = selectedChains.length
    ? stores.filter((s) => selectedChains.includes(s.store_chain))
    : stores;

  return (
    <div className="butikkoversikt-container">
      <div className="butikkoversikt-intro">
        <h1>BUTIKKER</h1>
        <p>
          Oversikt over alle butikker i Coop Øst. Legg til eller rediger
          butikker ved behov.
        </p>

        {user?.role === "admin" && (
          <div className="mine-vakter-create-button-center">
            <Link to="/admin/butikker/ny" className="mine-vakter-create-link">
              <div className="mine-vakter-create-button-wrapper">
                <div className="mine-vakter-create-round-button">
                  <HiPlusSm size={26} />
                </div>
                <span className="mine-vakter-create-text">
                  Lag en ny butikk
                </span>
              </div>
            </Link>
          </div>
        )}

        <KommuneFilter
          userRole={user.role}
          onChange={(selectedMunicipalityIds) => {
            setFilters({
              municipality: selectedMunicipalityIds.join(","),
            });
            setCurrentPage(1);
          }}
          userPreferredMunicipalities={preferredMunicipalityNames}
        />

        <StoreChainFilter
          selectedChains={selectedChains}
          onChange={(chains) => {
            setSelectedChains(chains);
            setFilters((prev) => ({
              ...prev,
              store_chain: chains.join(","),
            }));
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="butikk-liste">
        {loading ? (
          <Loading />
        ) : filteredStores.length === 0 ? (
          <p>Ingen butikker funnet.</p>
        ) : (
          filteredStores.map((store) => (
            <ButikkCard
              key={store.store_id}
              store={store}
              shiftsCount={shiftsCount[store.store_id] || 0}
            />
          ))
        )}
      </div>

      {!loading && stores.length < totalStores && (
        <div className="show-more-container">
          <button
            className="show-more-button"
            onClick={handleShowMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Laster..." : "Vis mer"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ButikkOversikt;

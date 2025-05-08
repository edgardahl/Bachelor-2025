import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard/ButikkCard";
import KommuneFilter from "../../../components/Filter/kommuneFilter/kommuneFilter";
import Loading from "../../../components/Loading/Loading";
import "./ButikkOversikt.css";
import StoreChainFilter from "../../../components/Filter/ButikkKjedeFilter/ButikkKjedeFilter";
import useAuth from "../../../context/UseAuth";

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

  const fetchStores = async (filters = {}, page = 1, append = false) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.municipality && filters.municipality.length > 0) {
        queryParams.append("municipality", filters.municipality);
        console.log("Municipality filter:", filters.municipality);
      }

      if (filters.store_chain && filters.store_chain.length > 0) {
        queryParams.append("store_chain", filters.store_chain);
      }

      // Paginering (kun nødvendig om det ikke er filtrert)
      if (
        (filters.municipality && filters.municipality.length > 0) ||
        (filters.store_chain && filters.store_chain.length > 0)
      ) {
        queryParams.append("pageSize", 1000); // eller valgfritt tall
      } else {
        queryParams.append("page", page);
        queryParams.append("pageSize", PAGE_SIZE);
      }

      console.log("Query params:", queryParams.toString());

      const response = await axios.get(
        `/stores/storesWithMunicipality?${queryParams.toString()}`
      );

      const storeData = response.data.stores;

      // shiftCount allerede inkludert, så vi slipper egne API-kall
      const shiftsData = {};
      for (const store of storeData) {
        shiftsData[store.store_id] = store.shift_count || 0;
      }

      if (append) {
        setStores((prevStores) => [...prevStores, ...storeData]);
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

  useEffect(() => {
    setLoading(true);
    fetchStores(filters, 1);
  }, [filters]);

  const handleShowMore = () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchStores(filters, nextPage, true);
  };

  const filteredStores = selectedChains.length
    ? stores.filter((store) => selectedChains.includes(store.store_chain))
    : stores;

  return (
    <div className="butikkoversikt-container">
      <div className="butikkoversikt-intro">
        <h1>BUTIKKER</h1>
        <p>
          Få en oversikt over alle butikker i Coop Øst og vakter de har lagt ut.
        </p>

        <KommuneFilter
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

import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard/ButikkCard";
import KommuneFilter from "../../../components/Filter/kommuneFilter/kommuneFilter";
import Loading from "../../../components/Loading/Loading";
import "./ButikkOversikt.css";
import StoreChainFilter from "../../../components/Filter/ButikkKjedeFilter/ButikkKjedeFilter";

const ButikkOversikt = () => {
  const [selectedChains, setSelectedChains] = useState([]);
  const [stores, setStores] = useState([]);
  const [shiftsCount, setShiftsCount] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Separate state for "Show More" loading

  const PAGE_SIZE = 12;

  const fetchStores = async (filters = {}, page = 1, append = false) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.municipality) {
        queryParams.append("municipality", filters.municipality);
      }

      queryParams.append("page", page);
      queryParams.append("pageSize", PAGE_SIZE);

      const response = await axios.get(
        `/stores/stores-with-municipality?${queryParams.toString()}`
      );

      if (append) {
        setStores((prevStores) => [...prevStores, ...response.data.stores]);
      } else {
        setStores(response.data.stores);
      }

      setTotalStores(response.data.total);

      const shiftsData = {};
      for (const store of response.data.stores) {
        try {
          const shiftsResponse = await axios.get(
            `/shifts/store/${store.store_id}`
          );
          shiftsData[store.store_id] = shiftsResponse.data.length;
        } catch {
          shiftsData[store.store_id] = 0;
        }
      }
      setShiftsCount((prevShiftsCount) => ({
        ...prevShiftsCount,
        ...shiftsData,
      }));
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false); // Stop "Show More" loading
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStores(filters, 1);
  }, [filters]);

  const handleShowMore = () => {
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchStores(filters, nextPage, true); // Append new data
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
        />
        <StoreChainFilter
          selectedChains={selectedChains}
          onChange={(chains) => {
            setSelectedChains(chains);
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

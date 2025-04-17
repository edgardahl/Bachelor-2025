import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard/ButikkCard";
import KommuneFilter from "../../../components/Filter/kommuneFilter/kommuneFilter";
import Loading from "../../../components/Loading/Loading";
import "./ButikkOversikt.css";

const ButikkOversikt = () => {
  const [stores, setStores] = useState([]);
  const [shiftsCount, setShiftsCount] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  const PAGE_SIZE = 8;

  const fetchStores = async (filters = {}, page = 1) => {
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

      setStores(response.data.stores);
      setTotalStores(response.data.total);
      setTotalPages(Math.ceil(response.data.total / PAGE_SIZE));

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
      setShiftsCount(shiftsData);
    } catch (err) {
      console.error("Error fetching stores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchStores(filters, currentPage);
  }, [filters, currentPage]);

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
      </div>

      <div className="butikk-liste">
        {loading ? (
          <Loading />
        ) : stores.length === 0 ? (
          <p>Ingen butikker funnet.</p>
        ) : (
          stores.map((store) => (
            <ButikkCard
              key={store.store_id}
              store={store}
              shiftsCount={shiftsCount[store.store_id] || 0}
            />
          ))
        )}
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          <img src="/icons/chevron_left.svg" alt="Forrige" />
        </button>
        <p>
          {currentPage} av {totalPages}
        </p>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          <img src="/icons/chevron_right.svg" alt="Neste" />
        </button>
      </div>
    </div>
  );
};

export default ButikkOversikt;

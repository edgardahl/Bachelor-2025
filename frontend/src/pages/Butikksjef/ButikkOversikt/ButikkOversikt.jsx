import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ButikkCard from "../../../components/Cards/ButikkCard/ButikkCard";
import ButikkFilter from "../../../components/Filter/Butikkfilter/ButikkFilter";
import "./ButikkOversikt.css";

const ButikkOversikt = () => {
  const [stores, setStores] = useState([]);
  const [shiftsCount, setShiftsCount] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStores, setTotalStores] = useState(0);
  const [filters, setFilters] = useState({});

  const fetchStores = async (filters = {}, page = 1, pageSize = 4) => {
    try {
      const queryParams = new URLSearchParams();

      if (filters.county) queryParams.append("county", filters.county);
      if (filters.municipality)
        queryParams.append("municipality", filters.municipality);

      queryParams.append("page", page);
      queryParams.append("pageSize", pageSize);

      const response = await axios.get(
        `/stores/stores-with-municipality?${queryParams.toString()}`
      );

      setStores(response.data.stores);
      setTotalStores(response.data.total);
      setTotalPages(Math.ceil(response.data.total / pageSize));

      const shiftsData = {};
      for (const store of response.data.stores) {
        try {
          const shiftsResponse = await axios.get(
            `/shifts/store/${store.store_id}`
          );
          shiftsData[store.store_id] = shiftsResponse.data.length;
        } catch (error) {
          console.error(
            `Error fetching shifts for store ${store.store_id}:`,
            error
          );
          shiftsData[store.store_id] = 0;
        }
      }
      setShiftsCount(shiftsData);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  // Fetch stores when the component mounts or when filters or page changes
  useEffect(() => {
    fetchStores(filters, currentPage);
  }, [filters, currentPage]);

  return (
    <div className="dine-vakter">
      <h1>Butikker</h1>

      {/* Filter Component */}
      <ButikkFilter
        onFilter={(newFilters) => {
          setFilters(newFilters); // Update filters
          setCurrentPage(1); // Reset to the first page
        }}
      />

      <p>{totalStores} butikker</p>

      {/* Store List */}
      <div className="butikk-liste">
        {stores.map((store) => (
          <ButikkCard
            key={store.store_id}
            store={store}
            shiftsCount={shiftsCount[store.store_id] || 0}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button
          onClick={() => {
            if (currentPage > 1) {
              setCurrentPage((prev) => prev - 1);
            }
          }}
          disabled={currentPage === 1}
        >
          <img src="/icons/chevron_left.svg" alt="Forrige" />
        </button>
        <span>
          {currentPage} av {totalPages}
        </span>
        <button
          onClick={() => {
            if (currentPage < totalPages) {
              setCurrentPage((prev) => prev + 1);
            }
          }}
          disabled={currentPage === totalPages}
        >
          <img src="/icons/chevron_right.svg" alt="Neste" />
        </button>
      </div>

      <Link to="/dashboard/butikksjef">Tilbake til Dashboard</Link>
    </div>
  );
};

export default ButikkOversikt;

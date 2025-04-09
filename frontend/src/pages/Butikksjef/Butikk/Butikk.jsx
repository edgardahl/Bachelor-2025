import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import ShiftCard from "../../../components/Cards/ShiftCard/ShiftCard";
import "./Butikk.css";
import { set } from "lodash";
import useAuth from "../../../context/UseAuth";

const Butikk = () => {
  const { user } = useAuth(); // Get the user from context
  const { store_id } = useParams();
  const [store, setStore] = useState(null);
  const [shifts, setShifts] = useState([]); // State to store shifts
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [storeId, setStoreId] = useState(null);

  useEffect(() => {
    // Fetch store details
    const fetchStoreDetails = async () => {
      try {
        const response = await axios.get(`/stores/${store_id}`);
        setStore(response.data);
      } catch (error) {
        console.error("Error fetching store details:", error);
      }
    };

    // Fetch shifts
    const fetchShifts = async () => {
      try {
        const response = await axios.get(`/shifts/store/${store_id}`);
        setShifts(response.data); // Assuming the API returns an array of shifts
      } catch (error) {
        console.error("Error fetching shifts:", error);
      }
    };

    // Fetch current user's details (for userId)
    const fetchUserAndShifts = async () => {
      try {
        const id = user.id;
        const userRole = user.role;
        const storeId = user.storeId;
        setUserId(id);
        setUserRole(userRole);
        setStoreId(storeId);

        fetchShifts("mine", id, storeId);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchStoreDetails();
    fetchShifts();
    fetchUserAndShifts();
  }, [store_id]);

  // Handle deleting a shift and immediately removing it from the UI
  const deleteShift = (shiftId) => {
    setShifts((prevShifts) =>
      prevShifts.filter((shift) => shift.shift_id !== shiftId)
    );
  };

  if (!store) return <p>Loading...</p>;

  return (
    <div className="butikk-page">
      <h1>
        {store.store_chain} {store.name}
      </h1>
      <p>
        <a href={`mailto:${store.email}`}>{store.email}</a>
      </p>
      <p>
        <a href={`tel:${store.phone_number}`}>{store.phone_number}</a>
      </p>
      <p>{store.address}</p>
      <h2 className="butikk-shift-heading">Publiserte Vakter</h2>
      <div className="butikk-shift-list">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.shift_id}
              shiftId={shift.shift_id}
              title={shift.title}
              description={shift.description}
              date={shift.date}
              startTime={shift.start_time}
              endTime={shift.end_time}
              qualifications={shift.qualifications}
              storeName={shift.store_name}
              postedBy={
                shift.posted_by_first_name + " " + shift.posted_by_last_name
              }
              postedById={shift.posted_by_id} // Pass postedById here
              userId={userId} // Pass userId here
              userRole={userRole} // Pass userRole here
              usersstoreId={storeId} // Pass storeId here
              shiftStoreId={shift.store_id} // Pass the storeId from the shift
              deleteShift={deleteShift} // Pass the deleteShift function
            />
          ))
        ) : (
          <p className="butikk-no-shifts">
            Ingen vakter publisert for denne butikken.
          </p>
        )}
      </div>
    </div>
  );
};

export default Butikk;

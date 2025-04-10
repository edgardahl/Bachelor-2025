import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import "./CreateShift.css";
import useAuth from "../../../context/UseAuth";

const CreateShift = () => {
  const { user } = useAuth();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [UserId, setUserId] = useState("");
  const [StoreId, setStoreId] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserId(user.id);
        setStoreId(user.storeId);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const response = await axios.get("/qualifications");
        setQualifications(response.data);
      } catch (error) {
        console.error("Error fetching qualifications:", error);
      }
    };

    fetchQualifications();
  }, []);

  const handleQualificationChange = (qualificationId) => {
    setSelectedQualifications((prevSelected) =>
      prevSelected.includes(qualificationId)
        ? prevSelected.filter((id) => id !== qualificationId)
        : [...prevSelected, qualificationId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    const shiftData = {
      title,
      description,
      date,
      start_time: startTime,
      end_time: endTime,
      store_id: StoreId,
      posted_by: UserId,
      qualifications: selectedQualifications,
    };

    try {
      console.log("Shift Data:", shiftData);
      const response = await axios.post("/shifts", shiftData);
      setMessage("Shift created successfully! 🎉");
      console.log("Shift Created:", response.data);

      // Reset form fields
      setDate("");
      setStartTime("");
      setEndTime("");
      setTitle("");
      setDescription("");
      setSelectedQualifications([]);
    } catch (error) {
      console.error(
        "Error creating shift:",
        error.response?.data || error.message
      );
      setMessage("Failed to create shift. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-shift-container">
      <h2>Ny vakt</h2>
      {message && (
        <p className={message.includes("failed") ? "error" : "success"}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-step">
          <h3>Step 1: Hvor og når?</h3>
          <div>
            <label>Dato</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
              max={
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              }
            />
          </div>
          <div>
            <label>Fra</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Til</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-step">
          <h3>Step 2: Kvalifikasjon</h3>
          <div>
            {qualifications.map((qualification) => (
              <div key={qualification.qualification_id}>
                <input
                  type="checkbox"
                  id={`qualification-${qualification.qualification_id}`}
                  value={qualification.qualification_id}
                  checked={selectedQualifications.includes(
                    qualification.qualification_id
                  )}
                  onChange={() =>
                    handleQualificationChange(qualification.qualification_id)
                  }
                />
                <label
                  htmlFor={`qualification-${qualification.qualification_id}`}
                >
                  {qualification.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="form-step">
          <h3>Step 3: Beskrivelse</h3>
          <div>
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating Shift..." : "Create Shift"}
        </button>
      </form>
    </div>
  );
};

export default CreateShift;

import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance"; // Assuming axiosInstance is set up properly
import "./CreateShift.css"; // Add your CSS file here

const CreateShift = () => {
  // Step 1 - Shift time
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // Step 2 - Qualifications
  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);

  // Step 3 - Description
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState(""); // Error or success message
  const [loading, setLoading] = useState(false);

   //user INFO
    const [UserId, setUserId] = useState("");
    const [StoreId, setStoreId] = useState("");

 //Fetch user info
    useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/auth/me");
        console.log("User id:", response.data.user.id);
        console.log("User store:", response.data.user.storeId);
        setUserId(response.data.user.id);
        setStoreId(response.data.user.storeId);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  // Fetch qualifications (similar to Register component)
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

  // Handle qualification selection
  const handleQualificationChange = (qualificationId) => {
    setSelectedQualifications((prevSelected) =>
      prevSelected.includes(qualificationId)
        ? prevSelected.filter((id) => id !== qualificationId)
        : [...prevSelected, qualificationId]
    );
  };

  // Handle form submission
  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage(""); // Reset message
  setLoading(true);

  // Ensure times are in the correct format (HH:mm)
  const shiftData = {
    title,
    description,
    date, // already in YYYY-MM-DD format from <input type="date">
    start_time: startTime, // HH:mm
    end_time: endTime, // HH:mm
    store_id: StoreId,
    posted_by: UserId,
    qualifications: selectedQualifications, // Send selected qualifications
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
    console.error("Error creating shift:", error.response?.data || error.message);
    setMessage("Failed to create shift. Please try again.");
  } finally {
    setLoading(false);
  }
};

  
  

  

  return (
    <div className="create-shift-container">
      <h2>Create a Shift</h2>
      {message && (
        <p className={message.includes("failed") ? "error" : "success"}>
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit}>
        {/* Step 1: Hvor og når? */}
        <div className="form-step">
          <h3>Step 1: Hvor og når?</h3>
          <div>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label>End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Step 2: Kvalifikasjon */}
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
                <label htmlFor={`qualification-${qualification.qualification_id}`}>
                  {qualification.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Beskrivelse */}
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

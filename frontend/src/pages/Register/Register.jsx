import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Register.css";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availability, setAvailability] = useState("");
  const [role, setRole] = useState("employee"); // Default role
  const [storeId, setStoreId] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [municipalities, setMunicipalities] = useState([]);
  const [stores, setStores] = useState([]);
  const [qualifications, setQualifications] = useState([]); // Qualifications state
  const [selectedQualifications, setSelectedQualifications] = useState([]); // Selected qualifications
  const [message, setMessage] = useState(""); // Message for success or error
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch municipalities, stores, and qualifications
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await axios.get("/api/municipalities");
        setMunicipalities(response.data);
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      }
    };

    const fetchStores = async () => {
      try {
        const response = await axios.get("/api/stores");
        const sortedStores = response.data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setStores(sortedStores);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    const fetchQualifications = async () => {
      try {
        const response = await axios.get("/api/qualifications");
        setQualifications(response.data);
      } catch (error) {
        console.error("Error fetching qualifications:", error);
      }
    };

    fetchMunicipalities();
    fetchStores();
    fetchQualifications(); // Fetch qualifications here
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message
    setLoading(true);

    const userData = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      phone_number: phoneNumber,
      availability,
      role,
      store_id: storeId,
      municipality_id: municipalityId,
      qualifications: selectedQualifications, // Add selected qualifications here
    };

    try {
      const response = await axios.post("http://localhost:5001/api/auth/register", userData);
      setMessage("Registration successful! 🎉");
      console.log("Success:", response.data);
      
      // Optionally, redirect to login page after successful registration
      // window.location.href = "/login";

    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      setMessage("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {message && <p className={message.includes("failed") ? "error" : "success"}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Availability</label>
          <select value={availability} onChange={(e) => setAvailability(e.target.value)} required>
            <option value="">Select Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="employee">Employee</option>
            <option value="store_manager">Store Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label>Store</label>
          <select value={storeId} onChange={(e) => setStoreId(e.target.value)} required>
            <option value="">Select Store</option>
            {stores.map((store) => (
              <option key={store.store_id} value={store.store_id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Municipality</label>
          <select
            value={municipalityId}
            onChange={(e) => setMunicipalityId(e.target.value)}
            required
          >
            <option value="">Select Municipality</option>
            {municipalities.map((municipality) => (
              <option key={municipality.municipality_id} value={municipality.municipality_id}>
                {municipality.municipality_name}
              </option>
            ))}
          </select>
        </div>

        {/* Qualifications Section */}
        <div>
          <label>Qualifications</label>
          <div>
            {qualifications.map((qualification) => (
              <div key={qualification.qualification_id}>
                <input
                  type="checkbox"
                  id={`qualification-${qualification.qualification_id}`}
                  value={qualification.qualification_id}
                  checked={selectedQualifications.includes(qualification.qualification_id)}
                  onChange={() => handleQualificationChange(qualification.qualification_id)}
                />
                <label htmlFor={`qualification-${qualification.qualification_id}`}>
                  {qualification.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;

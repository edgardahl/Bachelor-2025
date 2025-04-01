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

  // Fetch municipalities and stores
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
        ); // Sort alphabetically
        setStores(sortedStores);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    };

    fetchMunicipalities();
    fetchStores();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  
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
    };
  
    console.log("User Registration Data:", userData);
  };
  

  return (
    <div className="register-container">
      <h2>Register</h2>
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from "react";
import axios from "../../api/axiosInstance";
import "./Register.css";
import {sanitizeUserData} from "../../../../backend/utils/sanitizeInput"; // Import the sanitize function

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
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState(""); // Message state
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch municipalities, stores, and qualifications
  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const response = await axios.get("/municipalities");
        if (Array.isArray(response.data)) {
          setMunicipalities(response.data);
        } else {
          console.error(
            "Municipalities response is not an array",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching municipalities:", error);
      }
    };

    const fetchStores = async () => {
      try {
        const response = await axios.get("/stores");
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
        const response = await axios.get("/qualifications");
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
    setMessage("");
    setLoading(true);
    setFieldErrors({}); // Clear previous errors
  
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
      qualifications: selectedQualifications,
    };
  
    try {
      const sanitizedData = sanitizeUserData(userData); // 👈 May throw field-specific errors
      await axios.post("/auth/register", sanitizedData);
    
      setMessage("Bruker registrert! 🎉");
    
      // ✅ Clear all form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setAvailability("");
      setRole("employee");
      setStoreId("");
      setMunicipalityId("");
      setSelectedQualifications([]);
      setFieldErrors({});
    
    } catch (error) {
      console.error("Registration error:", error.message);
  
      const errMsg = error.response?.data?.error || error.message;
  
      // Specific check for errors
      if (errMsg === "Email is already in use") {
        setFieldErrors((prev) => ({ ...prev, email: "This email is already registered" }));
      } else if (errMsg === "Phone number is already in use") {
        setFieldErrors((prev) => ({ ...prev, phone_number: "This phone number is already in use" }));
      } else if (errMsg.includes("First name")) setFieldErrors((prev) => ({ ...prev, first_name: errMsg }));
      else if (errMsg.includes("Last name")) setFieldErrors((prev) => ({ ...prev, last_name: errMsg }));
      else if (errMsg.includes("email")) setFieldErrors((prev) => ({ ...prev, email: errMsg }));
      else if (errMsg.includes("Password")) setFieldErrors((prev) => ({ ...prev, password: errMsg }));
      else if (errMsg.includes("Phone number")) setFieldErrors((prev) => ({ ...prev, phone_number: errMsg }));
      else if (errMsg.includes("Availability")) setFieldErrors((prev) => ({ ...prev, availability: errMsg }));
      else if (errMsg.includes("role")) setFieldErrors((prev) => ({ ...prev, role: errMsg }));
      else if (errMsg.includes("store")) setFieldErrors((prev) => ({ ...prev, store_id: errMsg }));
      else if (errMsg.includes("municipality")) setFieldErrors((prev) => ({ ...prev, municipality_id: errMsg }));
      else setMessage("Registration failed. Please check your inputs and try again.");
    } finally {
      setLoading(false);
    }
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
        {fieldErrors.first_name && <p className="error">{fieldErrors.first_name}</p>}
      </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {fieldErrors.last_name && <p className="error">{fieldErrors.last_name}</p>}
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && <p className="error">{fieldErrors.email}</p>}
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && <p className="error">{fieldErrors.password}</p>}
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {fieldErrors.phone_number && <p className="error">{fieldErrors.phone_number}</p>}
        </div>
        <div>
          <label>Availability</label>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            required
          >
            <option value="">Select Availability</option>
            <option value="Fleksibel">Available</option>
            <option value="Ikke-fleksibel">Unavailable</option>
          </select>
        </div>
        <div>
          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="employee">Employee</option>
            <option value="store_manager">Store Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label>Store</label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
          >
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
              <option
                key={municipality.municipality_id}
                value={municipality.municipality_id}
              >
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

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        {message && (
        <p className={message.includes("failed") ? "error" : "success"}>
          {message}
        </p>
      )}
      </form>
    </div>
  );
};

export default Register;

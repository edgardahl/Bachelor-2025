import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import "./Register.css";
import { sanitizeUserData } from "../../../../backend/utils/sanitizeInput";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [availability, setAvailability] = useState("");
  const [role, setRole] = useState("employee");
  const [storeId, setStoreId] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [municipalities, setMunicipalities] = useState([]);
  const [stores, setStores] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [selectedQualifications, setSelectedQualifications] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [municipalityRes, storeRes, qualificationRes] = await Promise.all([
          axios.get("/municipalities"),
          axios.get("/stores"),
          axios.get("/qualifications"),
        ]);

        setMunicipalities(municipalityRes.data);
        setStores(storeRes.data.sort((a, b) => a.name.localeCompare(b.name)));
        setQualifications(qualificationRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
  }, []);

  const handleQualificationChange = (qualificationId) => {
    setSelectedQualifications((prev) =>
      prev.includes(qualificationId)
        ? prev.filter((id) => id !== qualificationId)
        : [...prev, qualificationId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    setFieldErrors({});

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
      const sanitizedData = sanitizeUserData(userData);
      await axios.post("/auth/register", sanitizedData);
      setMessage("Bruker registrert! 🎉");

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
    } catch (error) {
      console.error("Registration error:", error.message);
      const errMsg = error.response?.data?.error || error.message;

      if (errMsg === "Email is already in use") {
        setFieldErrors((prev) => ({ ...prev, email: "This email is already registered" }));
      } else if (errMsg === "Phone number is already in use") {
        setFieldErrors((prev) => ({ ...prev, phone_number: "This phone number is already in use" }));
      } else {
        const knownFields = [
          "First name", "Last name", "email", "Password", "Phone number", "Availability", "role", "store", "municipality"
        ];

        let matched = false;
        for (const field of knownFields) {
          if (errMsg.includes(field)) {
            const key = field.toLowerCase().replace(" ", "_");
            setFieldErrors((prev) => ({ ...prev, [key]: errMsg }));
            matched = true;
            break;
          }
        }

        if (!matched) {
          setMessage("Registration failed. Please check your inputs and try again.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="register-form-group">
          <label className="register-label">First Name</label>
          <input
            type="text"
            className="register-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          {fieldErrors.first_name && <p className="register-error">{fieldErrors.first_name}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-label">Last Name</label>
          <input
            type="text"
            className="register-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {fieldErrors.last_name && <p className="register-error">{fieldErrors.last_name}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-label">Email</label>
          <input
            type="email"
            className="register-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && <p className="register-error">{fieldErrors.email}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-label">Password</label>
          <input
            type="password"
            className="register-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && <p className="register-error">{fieldErrors.password}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-label">Phone Number</label>
          <input
            type="text"
            className="register-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {fieldErrors.phone_number && <p className="register-error">{fieldErrors.phone_number}</p>}
        </div>
        <div className="register-form-group">
          <label className="register-label">Availability</label>
          <select
            className="register-select"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            required
          >
            <option value="">Select Availability</option>
            <option value="Fleksibel">Fleksibel</option>
            <option value="Ikke-fleksibel">Ikke-fleksibel</option>
          </select>
        </div>
        <div className="register-form-group">
          <label className="register-label">Role</label>
          <select
            className="register-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="employee">Employee</option>
            <option value="store_manager">Store Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="register-form-group">
          <label className="register-label">Store</label>
          <select
            className="register-select"
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
        <div className="register-form-group">
          <label className="register-label">Municipality</label>
          <select
            className="register-select"
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
        <div className="register-form-group">
          <label className="register-label">Qualifications</label>
          <div>
            {qualifications.map((qualification) => (
              <div key={qualification.qualification_id}>
                <input
                  type="checkbox"
                  className="register-checkbox"
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

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {message && (
          <p className={message.includes("failed") ? "register-error" : "register-success"}>
            {message}
          </p>
        )}
      </form>

      <div className="register-footer">
        <p>
          Already have an account?{" "}
          <Link to="/login" className="login-link">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Select from "react-select";
import { sanitizeUserData } from "../../../../backend/utils/sanitizeInput";
import "./AuthForm.css";

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
  const [selectedWorkMunicipalityOptions, setSelectedWorkMunicipalityOptions] =
    useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [municipalityRes, storeRes, qualificationRes] = await Promise.all(
          [
            axios.get("/municipalities"),
            axios.get("/stores"),
            axios.get("/qualifications"),
          ]
        );

        const formattedMunicipalities = municipalityRes.data.map((m) => ({
          label: m.municipality_name,
          value: m.municipality_id,
        }));

        setMunicipalities(formattedMunicipalities);
        setStores(storeRes.data.sort((a, b) => a.name.localeCompare(b.name)));
        setQualifications(qualificationRes.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (municipalityId && municipalities.length > 0) {
      const defaultOption = municipalities.find(
        (m) => m.value === municipalityId
      );
      if (defaultOption) {
        setSelectedWorkMunicipalityOptions([defaultOption]);
      }
    }
  }, [municipalityId, municipalities]);

  const handleQualificationChange = (id) => {
    setSelectedQualifications((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
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
      work_municipality_ids: selectedWorkMunicipalityOptions.map(
        (m) => m.value
      ),
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
      setSelectedWorkMunicipalityOptions([]);
    } catch (error) {
      const errMsg = error.response?.data?.error || error.message;

      if (errMsg === "Email is already in use") {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Denne e-posten er allerede registrert.",
        }));
      } else if (errMsg === "Phone number is already in use") {
        setFieldErrors((prev) => ({
          ...prev,
          phone_number: "Telefonnummeret er allerede i bruk.",
        }));
      } else {
        setMessage("Registrering feilet. Prøv igjen.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Registrer</h2>

        <div className="auth-field">
          <label className="auth-label">Fornavn</label>
          <input
            className="auth-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          {fieldErrors.first_name && (
            <p className="auth-error">{fieldErrors.first_name}</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">Etternavn</label>
          <input
            className="auth-input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          {fieldErrors.last_name && (
            <p className="auth-error">{fieldErrors.last_name}</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">E-post</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {fieldErrors.email && (
            <p className="auth-error">{fieldErrors.email}</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">Passord</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {fieldErrors.password && (
            <p className="auth-error">{fieldErrors.password}</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">Telefonnummer</label>
          <input
            className="auth-input"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {fieldErrors.phone_number && (
            <p className="auth-error">{fieldErrors.phone_number}</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-label">Tilgjengelighet</label>
          <select
            className="auth-input"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            required
          >
            <option value="">Velg tilgjengelighet</option>
            <option value="Fleksibel">Fleksibel</option>
            <option value="Ikke-fleksibel">Ikke-fleksibel</option>
          </select>
        </div>

        <div className="auth-field">
          <label className="auth-label">Rolle</label>
          <select
            className="auth-input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="employee">Ansatt</option>
            <option value="store_manager">Butikksjef</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="auth-field">
          <label className="auth-label">Butikk</label>
          <select
            className="auth-input"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            required
          >
            <option value="">Velg butikk</option>
            {stores.map((store) => (
              <option key={store.store_id} value={store.store_id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label className="auth-label">Bostedskommune</label>
          <select
            className="auth-input"
            value={municipalityId}
            onChange={(e) => setMunicipalityId(e.target.value)}
            required
          >
            <option value="">Velg kommune</option>
            {municipalities.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label className="auth-label">Ønskede kommuner å jobbe i</label>
          <Select
            classNamePrefix="select"
            isMulti
            isClearable={false}
            options={municipalities}
            value={selectedWorkMunicipalityOptions}
            onChange={(selected) =>
              setSelectedWorkMunicipalityOptions(selected || [])
            }
            placeholder="Velg kommuner..."
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Kvalifikasjoner</label>
          <div>
            {qualifications.map((q) => (
              <div key={q.qualification_id}>
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  id={`q-${q.qualification_id}`}
                  checked={selectedQualifications.includes(q.qualification_id)}
                  onChange={() => handleQualificationChange(q.qualification_id)}
                />
                <label htmlFor={`q-${q.qualification_id}`}>{q.name}</label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? "Registrerer..." : "Registrer"}
        </button>

        {message && (
          <p
            className={
              message.includes("feilet") ? "auth-error" : "auth-success"
            }
          >
            {message}
          </p>
        )}
        <div className="auth-footer">
          <p>
            Har du allerede en bruker?{" "}
            <Link to="/login" className="auth-link">
              Logg inn
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;

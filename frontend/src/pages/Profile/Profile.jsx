import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import Select from "react-select";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [municipalityOptions, setMunicipalityOptions] = useState([]);
  const [selectedMunicipalityOptions, setSelectedMunicipalityOptions] = useState([]);

  const navigate = useNavigate();
  const isOwnProfile = !profileId || user?.id === profileId;

  const fetchMunicipalities = useCallback(async () => {
    const res = await axios.get("/municipalities");
    return res.data.map((m) => ({
      label: m.municipality_name,
      value: m.municipality_id,
    }));
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const idToFetch = profileId || user?.id;
      if (!idToFetch) return;

      const [municipalityOptionsRes, profileRes] = await Promise.all([
        fetchMunicipalities(),
        axios.get(`/users/${idToFetch}`),
      ]);

      setMunicipalityOptions(municipalityOptionsRes);
      setFormData(profileRes.data);

      const currentSelected = profileRes.data.work_municipalities?.map((name) => {
        const match = municipalityOptionsRes.find((m) => m.label === name);
        return match ? { label: match.label, value: match.value } : null;
      }).filter(Boolean) || [];

      setSelectedMunicipalityOptions(currentSelected);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Kunne ikke hente profildata");
      if (isOwnProfile) navigate("/login");
    }
  }, [fetchMunicipalities, profileId, user?.id, isOwnProfile, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["currentPassword", "newPassword"].includes(name)) {
      setPasswords((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const toggleEdit = async () => {
    if (isEditing && isOwnProfile) {
      try {
        await axios.put(`/users/updateCurrentUser`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          availability: formData.availability,
          work_municipality_ids: selectedMunicipalityOptions.map((opt) => opt.value),
        });
        await fetchProfile();
        setIsEditing(false);
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Noe gikk galt ved lagring av profilen.");
      }
    } else {
      setIsEditing(true);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!passwords.currentPassword || !passwords.newPassword) {
        alert("Begge feltene må fylles ut");
        return;
      }

      await axios.patch("/users/me/password", passwords);

      alert("Passord oppdatert");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Kunne ikke oppdatere passordet.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!user || !formData) return <p>Laster inn profildata...</p>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{isOwnProfile ? "Min profil" : "Ansattprofil"}</h1>
        {isOwnProfile && !isEditing && (
          <button className="edit-button" onClick={toggleEdit}>Rediger</button>
        )}
      </div>

      <div className="profile-grid">
        <div className="profile-field">
          <label>Fornavn:</label>
          {isEditing ? <input name="first_name" value={formData.first_name} onChange={handleChange} /> : <p>{formData.first_name}</p>}
        </div>

        <div className="profile-field">
          <label>Etternavn:</label>
          {isEditing ? <input name="last_name" value={formData.last_name} onChange={handleChange} /> : <p>{formData.last_name}</p>}
        </div>

        <div className="profile-field">
          <label>E-post:</label>
          {isEditing ? <input name="email" value={formData.email} onChange={handleChange} /> : <p>{formData.email}</p>}
        </div>

        <div className="profile-field">
          <label>Telefonnummer:</label>
          {isEditing ? <input name="phone_number" value={formData.phone_number || ""} onChange={handleChange} /> : <p>{formData.phone_number || "Ikke registrert"}</p>}
        </div>

        <div className="profile-field">
          <label>Butikk:</label>
          <p>{formData.store_name || "Ingen tilknyttet butikk"}</p>
        </div>

        <div className="profile-field">
          <label>Kommune:</label>
          <p>{formData.municipality_name || "Ikke registrert"}</p>
        </div>

        {user?.role === "employee" && (
          <>
            <div className="profile-field">
              <label>Ønsker å jobbe i kommune(r):</label>
              {isEditing ? (
                <Select
                  className="municipality-select"
                  classNamePrefix="select"
                  isMulti
                  isClearable={false}
                  options={municipalityOptions}
                  value={selectedMunicipalityOptions}
                  onChange={setSelectedMunicipalityOptions}
                  placeholder="Velg kommuner..."
                />
              ) : (
                <ul className="municipality-list">
                  {formData.work_municipalities?.length > 0 ? (
                    formData.work_municipalities.map((name, i) => <li key={i}>{name}</li>)
                  ) : (
                    <li>Ingen valgt</li>
                  )}
                </ul>
              )}
            </div>

            <div className="profile-field">
              <label>Tilgjengelighet:</label>
              {isEditing ? (
                <select name="availability" value={formData.availability || ""} onChange={handleChange}>
                  <option value="Fleksibel">Fleksibel</option>
                  <option value="Ikke-fleksibel">Ikke-fleksibel</option>
                </select>
              ) : (
                <p>{formData.availability || "Ikke oppgitt"}</p>
              )}
            </div>
          </>
        )}
      </div>

      {isEditing && (
        <>
          <div className="save-container">
            <button className="save-button" onClick={toggleEdit}>Lagre</button>
            <button className="cancel-button" onClick={() => {
              setIsEditing(false);
              fetchProfile();
              setPasswords({ currentPassword: "", newPassword: "" });
            }}>Avbryt</button>
          </div>

          {isOwnProfile && (
            <div className="change-password-section">
              <h3>Endre passord</h3>
              <label>Nåværende passord:</label>
              <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} />
              <label>Nytt passord:</label>
              <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} />
              <button className="change-password-button" onClick={handlePasswordChange}>Oppdater passord</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;

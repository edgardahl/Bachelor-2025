import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import Select from "react-select";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingQualifications, setIsEditingQualifications] = useState(false);
  const [formData, setFormData] = useState({});
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [allQualifications, setAllQualifications] = useState([]);
  const [municipalityOptions, setMunicipalityOptions] = useState([]);
  const [selectedMunicipalityOptions, setSelectedMunicipalityOptions] = useState([]);

  const navigate = useNavigate();
  const isOwnProfile = !profileId || user?.id === profileId;

  // 🆕 Fetch all municipalities (label = name, value = uuid)
  const fetchMunicipalities = async () => {
    const res = await axios.get("/municipalities");
    return res.data.map((m) => ({
      label: m.municipality_name,
      value: m.municipality_id,
    }));
  };

  // 🆕 Fetch user + municipalities and match selected
  const fetchProfile = useCallback(async () => {
    try {
      const idToFetch = profileId || user?.id;
      if (!idToFetch) return;

      const [municipalityOptionsRes, profileRes] = await Promise.all([
        fetchMunicipalities(),
        axios.get(`/users/${idToFetch}`),
      ]);

      setMunicipalityOptions(municipalityOptionsRes);
      setProfileData(profileRes.data);
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
  }, [profileId, user?.id, isOwnProfile, navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const fetchQualifications = async () => {
      try {
        const res = await axios.get("/qualifications");
        const formatted = res.data.map((q) => ({
          id: q.qualification_id,
          name: q.name,
        }));
        setAllQualifications(formatted);
      } catch (err) {
        console.error("Failed to fetch qualifications", err);
      }
    };

    if (user?.role === "store_manager" && !isOwnProfile) {
      fetchQualifications();
    }
  }, [user, isOwnProfile]);

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
        return;
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Noe gikk galt ved lagring av profilen.");
        return;
      }
    }
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["currentPassword", "newPassword"].includes(name)) {
      setPasswords((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleQualificationToggle = (id) => {
    const isSelected = formData.qualifications.some((q) => q.qualification_id === id);
    const updated = isSelected
      ? formData.qualifications.filter((q) => q.qualification_id !== id)
      : [
          ...formData.qualifications,
          {
            qualification_id: id,
            qualification_name: allQualifications.find((q) => q.id === id)?.name,
          },
        ];
    setFormData((prev) => ({ ...prev, qualifications: updated }));
  };

  const saveQualifications = async () => {
    try {
      const selectedIds = formData.qualifications.map((q) => q.qualification_id);
      await axios.post("/users/myemployees/qualifications/update", {
        user_id: profileId,
        qualification_ids: selectedIds,
      });
      alert("Kvalifikasjoner oppdatert");
      setIsEditingQualifications(false);
      await fetchProfile();
    } catch (err) {
      console.error("Error updating qualifications:", err);
      alert("Kunne ikke oppdatere kvalifikasjoner.");
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!passwords.currentPassword || !passwords.newPassword) {
        alert("Begge feltene må fylles ut");
        return;
      }

      await axios.patch("/users/me/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      alert("Passord oppdatert");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Kunne ikke oppdatere passordet.");
    }
  };

  if (error) return <p>{error}</p>;
  if (!user || !profileData) return <p>Laster inn profildata...</p>;

  const {
    first_name,
    last_name,
    email,
    phone_number,
    availability,
    role,
    store_name,
    municipality_name,
    qualifications,
    work_municipalities,
  } = formData;

  const canEditQualifications =
    user?.role === "store_manager" &&
    !isOwnProfile &&
    user?.storeId === profileData?.store_id;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>{isOwnProfile ? "Min profil" : "Ansattprofil"}</h1>
        {isOwnProfile && !isEditing && (
          <button className="edit-button" onClick={toggleEdit}>
            Rediger
          </button>
        )}
      </div>

      <div className="profile-section">
        <label>Fornavn:</label>
        {isEditing ? (
          <input name="first_name" value={first_name} onChange={handleChange} />
        ) : (
          <p>{first_name}</p>
        )}

        <label>Etternavn:</label>
        {isEditing ? (
          <input name="last_name" value={last_name} onChange={handleChange} />
        ) : (
          <p>{last_name}</p>
        )}

        <label>E-post:</label>
        {isEditing ? (
          <input name="email" value={email} onChange={handleChange} />
        ) : (
          <p>{email}</p>
        )}

        {isOwnProfile && !isEditing && (
          <div className="profile-password-preview">
            <label>Passord:</label>
            <p>********</p>
          </div>
        )}

        <label>Telefonnummer:</label>
        {isEditing ? (
          <input
            name="phone_number"
            value={phone_number || ""}
            onChange={handleChange}
          />
        ) : (
          <p>{phone_number || "Ikke registrert"}</p>
        )}

        <label>Butikk:</label>
        <p>{store_name || "Ingen tilknyttet butikk"}</p>

        <label>Kommune:</label>
        <p>{municipality_name || "Ikke registrert"}</p>

        {role === "employee" && (
          <>
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
                {work_municipalities?.length > 0 ? (
                  work_municipalities.map((name, i) => <li key={i}>{name}</li>)
                ) : (
                  <li>Ingen valgt</li>
                )}
              </ul>
            )}

            <label>Tilgjengelighet:</label>
            {isEditing ? (
              <select
                name="availability"
                value={availability || ""}
                onChange={handleChange}
              >
                <option value="Fleksibel">Fleksibel</option>
                <option value="Ikke-fleksibel">Ikke-fleksibel</option>
              </select>
            ) : (
              <p>{availability || "Ikke oppgitt"}</p>
            )}

            <label>Kvalifikasjoner:</label>
            {canEditQualifications && !isEditingQualifications ? (
              <>
                <ul>
                  {qualifications?.length > 0 ? (
                    qualifications.map((q) => (
                      <li key={q.qualification_id}>{q.qualification_name}</li>
                    ))
                  ) : (
                    <li>Ingen kvalifikasjoner</li>
                  )}
                </ul>
                <button onClick={() => setIsEditingQualifications(true)}>
                  Rediger kvalifikasjoner
                </button>
              </>
            ) : canEditQualifications && isEditingQualifications ? (
              <>
                <div className="qualification-form">
                  {allQualifications.map((q) => (
                    <label key={q.id}>
                      <input
                        type="checkbox"
                        checked={formData.qualifications.some(
                          (selected) => selected.qualification_id === q.id
                        )}
                        onChange={() => handleQualificationToggle(q.id)}
                      />
                      {q.name}
                    </label>
                  ))}
                </div>
                <button onClick={saveQualifications}>
                  Lagre kvalifikasjoner
                </button>
                <button onClick={() => setIsEditingQualifications(false)}>
                  Avbryt
                </button>
              </>
            ) : (
              <ul>
                {qualifications?.length > 0 ? (
                  qualifications.map((q) => (
                    <li key={q.qualification_id}>{q.qualification_name}</li>
                  ))
                ) : (
                  <li>Ingen kvalifikasjoner</li>
                )}
              </ul>
            )}
          </>
        )}

        {isEditing && (
          <>
            <div className="save-container">
              <button className="save-button" onClick={toggleEdit}>
                Lagre
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData(profileData);
                  setSelectedMunicipalityOptions(
                    municipalityOptions.filter((m) =>
                      profileData.work_municipalities?.includes(m.label)
                    )
                  );
                  setPasswords({ currentPassword: "", newPassword: "" });
                }}
              >
                Avbryt
              </button>
            </div>

            {isOwnProfile && (
              <div className="change-password-section">
                <h3>Endre passord</h3>
                <label>Nåværende passord:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                />

                <label>Nytt passord:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                />

                <button
                  className="change-password-button"
                  onClick={handlePasswordChange}
                >
                  Oppdater passord
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;

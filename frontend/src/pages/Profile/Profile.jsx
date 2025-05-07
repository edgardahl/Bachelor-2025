// Profile.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import Select from "react-select";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import BackButton from "../../components/BackButton/BackButton";
import ButikkCard from "../../components/Cards/ButikkCard/ButikkCard";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingQualifications, setIsEditingQualifications] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [municipalityOptions, setMunicipalityOptions] = useState([]);
  const [selectedMunicipalityOptions, setSelectedMunicipalityOptions] =
    useState([]);
  const [selectedResidenceMunicipality, setSelectedResidenceMunicipality] =
    useState(null);
  const [allQualifications, setAllQualifications] = useState([]);
  const [qualificationMap, setQualificationMap] = useState({});
  const [storeData, setStoreData] = useState(null);

  const isOwnProfile = !profileId || user?.id === profileId;
  const showBackButton = user?.role === "store_manager" && !isOwnProfile;

  const fetchMunicipalities = useCallback(async () => {
    const res = await axios.get("/municipalities");
    return res.data.map((m) => ({
      label: m.municipality_name,
      value: m.municipality_id,
    }));
  }, []);

  const fetchQualifications = useCallback(async () => {
    const res = await axios.get("/qualifications");
    return res.data.map((q) => ({ id: q.qualification_id, name: q.name }));
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const idToFetch = profileId || user?.id;
      if (!idToFetch) return;

      const [municipalityOptionsRes, qualificationsRes, profileRes] =
        await Promise.all([
          fetchMunicipalities(),
          fetchQualifications(),
          axios.get(`/users/${idToFetch}`),
        ]);

      setMunicipalityOptions(municipalityOptionsRes);
      setAllQualifications(qualificationsRes);
      setFormData(profileRes.data);

      const currentSelected =
        profileRes.data.work_municipalities
          ?.map((name) => {
            const match = municipalityOptionsRes.find((m) => m.label === name);
            return match ? { label: match.label, value: match.value } : null;
          })
          .filter(Boolean) || [];
      setSelectedMunicipalityOptions(currentSelected);

      const residenceMatch = municipalityOptionsRes.find(
        (m) => m.label === profileRes.data.municipality_name
      );
      setSelectedResidenceMunicipality(residenceMatch || null);

      const qualificationMap = qualificationsRes.reduce((acc, q) => {
        acc[q.id] = q.name;
        return acc;
      }, {});
      setQualificationMap(qualificationMap);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Kunne ikke hente profildata");
      if (isOwnProfile) navigate("/login");
    }
  }, [
    fetchMunicipalities,
    fetchQualifications,
    profileId,
    user?.id,
    isOwnProfile,
    navigate,
  ]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const fetchStore = async () => {
      if (!formData?.store_id) return;
      try {
        const res = await axios.get(`/stores/${formData.store_id}`);
        setStoreData(res.data);
      } catch (err) {
        console.error("Error fetching store:", err);
      }
    };
    fetchStore();
  }, [formData?.store_id]);

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
        const rawData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          availability: formData.availability,
          municipality_id: selectedResidenceMunicipality?.value || null,
          work_municipality_ids: selectedMunicipalityOptions.map(
            (opt) => opt.value
          ),
        };

        await axios.put(`/users/updateCurrentUser`, rawData);
        await fetchProfile();
        setIsEditing(false);
        toast.success("Profil oppdatert.");
      } catch (err) {
        console.error("Error updating profile:", err);
        if (err.response?.status === 400 && err.response.data?.error) {
          toast.error(err.response.data.error);
        } else {
          toast.error("Noe gikk galt ved lagring av profilen.");
        }
      }
    } else {
      setIsEditing(true);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (!passwords.currentPassword || !passwords.newPassword) {
        toast.error("Begge feltene må fylles ut");
        return;
      }

      await axios.patch("/users/me/password", passwords);
      toast.success("Passord oppdatert");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Error changing password:", err);
      if (err.response?.status === 400 && err.response.data?.error) {
        toast.error(err.response.data.error);
      } else if (err.response?.status === 401 && err.response.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Kunne ikke oppdatere passordet.");
      }
    }
  };

  const handleQualificationToggle = (id) => {
    const isSelected = formData.qualifications.some(
      (q) => q.qualification_id === id
    );
    const updated = isSelected
      ? formData.qualifications.filter((q) => q.qualification_id !== id)
      : [
          ...formData.qualifications,
          { qualification_id: id, qualification_name: qualificationMap[id] },
        ];
    setFormData((prev) => ({ ...prev, qualifications: updated }));
  };

  const saveQualifications = async () => {
    try {
      const selectedIds = formData.qualifications.map(
        (q) => q.qualification_id
      );
      await axios.post("/users/myemployees/qualifications/update", {
        user_id: profileId,
        qualification_ids: selectedIds,
      });
      toast.success("Kvalifikasjoner oppdatert.");
      setIsEditingQualifications(false);
      await fetchProfile();
    } catch (err) {
      console.error("Error updating qualifications:", err);
      toast.error("Kunne ikke oppdatere kvalifikasjoner.");
    }
  };

  const canEditQualifications =
    user?.role === "store_manager" &&
    !isOwnProfile &&
    user?.storeId === formData?.store_id;
  const canViewQualifications =
    formData?.role === "employee" || canEditQualifications;

  if (error) return <p>{error}</p>;
  if (!user || !formData) return <Loading />;

  return (
    <div className="profile-page">
      {showBackButton && <BackButton />}

      <div className="profile-header">
        <h1>
          {isOwnProfile
            ? "Min profil"
            : `${formData.first_name} ${formData.last_name}`}
        </h1>
        {isOwnProfile && !isEditing && (
          <button className="edit-button" onClick={toggleEdit}>
            Rediger
          </button>
        )}
      </div>

      <div className="profile-grid">
        <div className="profile-field">
          <label>Fornavn:</label>
          {isEditing ? (
            <input
              name="first_name"
              value={formData.first_name || ""}
              onChange={handleChange}
            />
          ) : (
            <p>{formData.first_name || "Ikke oppgitt"}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Etternavn:</label>
          {isEditing ? (
            <input
              name="last_name"
              value={formData.last_name || ""}
              onChange={handleChange}
            />
          ) : (
            <p>{formData.last_name || "Ikke oppgitt"}</p>
          )}
        </div>

        <div className="profile-field">
          <label>E-post:</label>
          {isEditing ? (
            <input
              name="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
            />
          ) : (
            <p>{formData.email || "Ikke oppgitt"}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Telefonnummer:</label>
          {isEditing ? (
            <input
              name="phone_number"
              value={formData.phone_number || ""}
              onChange={handleChange}
            />
          ) : (
            <p>{formData.phone_number || "Ikke oppgitt"}</p>
          )}
        </div>

        <div className="profile-field">
          <label>Bostedskommune:</label>
          {isEditing ? (
            <Select
              classNamePrefix="select"
              options={municipalityOptions}
              value={selectedResidenceMunicipality}
              onChange={setSelectedResidenceMunicipality}
              placeholder="Velg bostedskommune..."
            />
          ) : (
            <p>{formData.municipality_name || "Ikke registrert"}</p>
          )}
        </div>

        {formData.role === "employee" && (
          <div className="profile-field">
            <label>Ønsker å jobbe i kommune(r):</label>
            {isEditing ? (
              <Select
                classNamePrefix="select"
                isMulti
                options={municipalityOptions}
                value={selectedMunicipalityOptions}
                onChange={setSelectedMunicipalityOptions}
                placeholder="Velg kommuner..."
              />
            ) : (
              <ul className="municipality-list">
                {formData.work_municipalities?.length > 0 ? (
                  formData.work_municipalities.map((name, i) => (
                    <li key={i}>{name}</li>
                  ))
                ) : (
                  <li>Ingen valgt</li>
                )}
              </ul>
            )}
          </div>
        )}

        {formData.role === "employee" && storeData && (
          <div className="profile-field">
            <label>Butikk:</label>
            <ButikkCard store={storeData} shiftsCount={0} />
          </div>
        )}

        {canViewQualifications && (
          <div className="profile-field">
            <label>Kvalifikasjoner:</label>
            {canEditQualifications && isEditingQualifications ? (
              <>
                <div className="qualification-cards">
                  {allQualifications.map((qualification) => {
                    const isSelected = formData.qualifications.some(
                      (q) => q.qualification_id === qualification.id
                    );
                    return (
                      <div
                        key={qualification.id}
                        className={`qualification-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() =>
                          handleQualificationToggle(qualification.id)
                        }
                      >
                        <h4>{qualification.name}</h4>
                        {isSelected && <span className="checkmark">✔</span>}
                      </div>
                    );
                  })}
                  <div className="qualification-action-buttons">
                    <button
                      className="qualification-save-btn"
                      onClick={saveQualifications}
                    >
                      Lagre kvalifikasjoner
                    </button>
                    <button
                      className="qualification-cancel-btn"
                      onClick={() => setIsEditingQualifications(false)}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <ul>
                  {formData.qualifications?.length > 0 ? (
                    formData.qualifications.map((q) => (
                      <li key={q.qualification_id}>{q.qualification_name}</li>
                    ))
                  ) : (
                    <li>Ingen kvalifikasjoner</li>
                  )}
                </ul>
                {canEditQualifications && !isEditingQualifications && (
                  <button
                    className="edit-qualifications-btn"
                    onClick={() => setIsEditingQualifications(true)}
                  >
                    Rediger kvalifikasjoner
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {isOwnProfile && !isEditing && (
          <div className="profile-field">
            <label>Passord:</label>
            <p>********</p>
          </div>
        )}

        {storeData && formData.role === "store_manager" && (
          <div className="profile-field full-width">
            <label>Butikk:</label>
            <div className="centered-store-card">
              <ButikkCard store={storeData} shiftsCount={0} />
            </div>
          </div>
        )}
      </div>

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
                fetchProfile();
                setPasswords({ currentPassword: "", newPassword: "" });
              }}
            >
              Avbryt
            </button>
          </div>

          <div className="change-password-section">
            <h3>Endre passord</h3>
            <div className="password-grid">
              <div className="password-field">
                <label>Nåværende passord:</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="password-field">
                <label>Nytt passord:</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button
              className="change-password-button"
              onClick={handlePasswordChange}
            >
              Oppdater passord
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;

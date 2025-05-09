// Profile.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import Select from "react-select";
import { toast } from "react-toastify";
import Loading from "../../components/Loading/Loading";
import BackButton from "../../components/BackButton/BackButton";
import ButikkCard from "../../components/Cards/ButikkCard/ButikkCard";
import { FaEdit } from "react-icons/fa";

import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [error, setError] = useState("");

  const [errors, setErrors] = useState({});
  const fieldRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    email: useRef(null),
    phone_number: useRef(null),
    municipality: useRef(null),
    availability: useRef(null),
    password: useRef(null),
  };

  const [originalFormData, setOriginalFormData] = useState(null);
  const [isEditingQualifications, setIsEditingQualifications] = useState(false);
  const [editingFields, setEditingFields] = useState({
    first_name: false,
    last_name: false,
    email: false,
    phone_number: false,
    municipality: false,
    availability: false,
    password: false,
  });

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
      setOriginalFormData(profileRes.data); // <- denne linjen er ny

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

  const toggleFieldEdit = (field, value = false) => {
    setEditingFields((prev) => ({ ...prev, [field]: value }));

    if (!value && originalFormData && formData) {
      // Tilbakestill feltet ved avbryt
      setFormData((prev) => ({
        ...prev,
        [field]: originalFormData[field],
      }));

      if (field === "municipality") {
        const match = municipalityOptions.find(
          (m) => m.value === originalFormData.municipality_id
        );
        setSelectedResidenceMunicipality(match || null);
      }

      if (field === "work_municipality_ids") {
        const matches =
          originalFormData.work_municipalities
            ?.map((name) => municipalityOptions.find((m) => m.label === name))
            .filter(Boolean) || [];
        setSelectedMunicipalityOptions(matches);
      }
    }
  };

  const handleFieldSave = async (field) => {
    try {
      let payload = {};
  
      if (field === "first_name") {
        payload.first_name = formData.first_name;
      }
      if (field === "last_name") {
        payload.last_name = formData.last_name;
      }
      if (field === "email") {
        payload.email = formData.email;
      }
      if (field === "phone_number") {
        payload.phone_number = formData.phone_number;
      }
      if (field === "availability") {
        payload.availability = formData.availability;
      }
      if (field === "work_municipality_ids") {
        payload.work_municipality_ids = selectedMunicipalityOptions.map(
          (opt) => opt.value
        );
      }
  
      setErrors({});
      await axios.put("/users/current/update", payload);
      toggleFieldEdit(field, false);
      await fetchProfile();
  
      // Vis suksessmelding for spesifikke felt
      const fieldLabels = {
        first_name: "Fornavn",
        last_name: "Etternavn",
        email: "E-post",
        phone_number: "Telefonnummer",
      };
      if (fieldLabels[field]) {
        toast.success(`${fieldLabels[field]} oppdatert`);
      }
    } catch (err) {
      const apiError = err.response?.data?.error;
  
      if (apiError) {
        if (typeof apiError === "string") {
          setErrors((prev) => ({
            ...prev,
            [field]: apiError,
          }));
        } else {
          setErrors((prev) => ({ ...prev, ...apiError }));
        }
  
        if (fieldRefs[field] && fieldRefs[field].current) {
          fieldRefs[field].current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          fieldRefs[field].current.focus();
        }
      } else {
        setErrors((prev) => ({ ...prev, general: "Noe gikk galt." }));
      }
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["currentPassword", "newPassword"].includes(name)) {
      setPasswords((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePasswordChange = async () => {
    setErrors({}); // Fjern gamle feil
  
    if (!passwords.currentPassword || !passwords.newPassword) {
      setErrors((prev) => ({
        ...prev,
        password: "Begge feltene må fylles ut",
      }));
      return;
    }
  
    try {
      await axios.patch("/users/current/password", passwords);
      toast.success("Passord oppdatert");
      setPasswords({ currentPassword: "", newPassword: "" });
      toggleFieldEdit("password", false);
    } catch (err) {
      const apiError = err.response?.data?.error;
      if (typeof apiError === "string") {
        setErrors((prev) => ({
          ...prev,
          password: apiError,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          password: "Kunne ikke oppdatere passordet.",
        }));
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
      await axios.post("/users/employees/qualifications/update", {
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
        {user?.role === "store_manager" &&
          !isOwnProfile &&
          formData.role === "employee" && (
            <div
              className={`status-badge ${
                formData.availability === "Fleksibel"
                  ? "status-green"
                  : "status-red"
              }`}
            >
              {formData.availability === "Fleksibel"
                ? "Tilgjengelig"
                : "Utilgjengelig"}
            </div>
          )}
      </div>

      <div className="profile-grid">
        <div className="profile-field">
          <label>Fornavn</label>
          {editingFields.first_name ? (
            <>
              <div className="input-error-wrapper">
                <input
                  name="first_name"
                  ref={fieldRefs.first_name}
                  value={formData.first_name || ""}
                  onChange={handleChange}
                  className={errors.first_name ? "error" : ""}
                />
                {errors.first_name && (
                  <div className="error-message">{errors.first_name}</div>
                )}
              </div>
              <div className="field-buttons">
                <button
                  className="primary-button"
                  onClick={() => handleFieldSave("first_name")}
                >
                  Lagre
                </button>
                <button
                  className="secondary-button"
                  onClick={() => toggleFieldEdit("first_name", false)}
                >
                  Avbryt
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{formData.first_name || "Ikke oppgitt"}</p>
              {isOwnProfile && (
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("first_name", true)}
                >
                  <FaEdit size={28} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="profile-field">
          <label>Etternavn</label>
          {editingFields.last_name ? (
            <>
              <input
                name="last_name"
                ref={fieldRefs.last_name}
                value={formData.last_name || ""}
                onChange={handleChange}
                className={errors.last_name ? "error" : ""}
              />
              {errors.last_name && (
                <div className="error-message">{errors.last_name}</div>
              )}
              <div className="field-buttons">
                <button
                  className="primary-button"
                  onClick={() => handleFieldSave("last_name")}
                >
                  Lagre
                </button>
                <button
                  className="secondary-button"
                  onClick={() => toggleFieldEdit("last_name", false)}
                >
                  Avbryt
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{formData.last_name || "Ikke oppgitt"}</p>
              {isOwnProfile && (
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("last_name", true)}
                >
                  <FaEdit size={28} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="profile-field">
          <label>E-post:</label>
          {editingFields.email ? (
            <>
              <div className="input-error-wrapper">
                <input
                  name="email"
                  type="email"
                  ref={fieldRefs.email}
                  value={formData.email || ""}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>
              <div className="field-buttons">
                <button
                  className="primary-button"
                  onClick={() => handleFieldSave("email")}
                >
                  Lagre
                </button>
                <button
                  className="secondary-button"
                  onClick={() => toggleFieldEdit("email", false)}
                >
                  Avbryt
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{formData.email || "Ikke oppgitt"}</p>
              {isOwnProfile && (
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("email", true)}
                >
                  <FaEdit size={28} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="profile-field">
          <label>Telefonnummer:</label>
          {editingFields.phone_number ? (
            <>
              <div className="input-error-wrapper">
                <input
                  name="phone_number"
                  ref={fieldRefs.phone_number}
                  value={formData.phone_number || ""}
                  onChange={handleChange}
                  className={errors.phone_number ? "error" : ""}
                />
                {errors.phone_number && (
                  <div className="error-message">{errors.phone_number}</div>
                )}
              </div>
              <div className="field-buttons">
                <button
                  className="primary-button"
                  onClick={() => handleFieldSave("phone_number")}
                >
                  Lagre
                </button>
                <button
                  className="secondary-button"
                  onClick={() => toggleFieldEdit("phone_number", false)}
                >
                  Avbryt
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{formData.phone_number || "Ikke oppgitt"}</p>
              {isOwnProfile && (
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("phone_number", true)}
                >
                  <FaEdit size={28} />
                </button>
              )}
            </>
          )}
        </div>

        <div className="profile-field">
          <label>Bostedskommune:</label>
          {editingFields.municipality ? (
            <>
              <Select
                classNamePrefix="select"
                options={municipalityOptions}
                value={selectedResidenceMunicipality}
                onChange={setSelectedResidenceMunicipality}
                placeholder="Velg bostedskommune..."
              />
              <div className="field-buttons">
                <button
                  className="primary-button"
                  onClick={async () => {
                    try {
                      await axios.put("/users/current/update", {
                        municipality_id:
                          selectedResidenceMunicipality?.value || null,
                      });
                      toast.success("Bostedskommune oppdatert");
                      toggleFieldEdit("municipality", false);
                      await fetchProfile();
                    } catch {
                      toast.error("Kunne ikke oppdatere bostedskommune.");
                    }
                  }}
                >
                  Lagre
                </button>
                <button
                  className="secondary-button"
                  onClick={() => toggleFieldEdit("municipality", false)}
                >
                  Avbryt
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{formData.municipality_name || "Ikke registrert"}</p>
              {isOwnProfile && (
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("municipality", true)}
                >
                  <FaEdit size={28} />
                </button>
              )}
            </>
          )}
        </div>

        {formData.role === "employee" && (
          <div className="profile-field">
            <label>Ønsker å jobbe i kommune(r):</label>
            {isOwnProfile && editingFields.work_municipality_ids ? (
              <>
                <Select
                  classNamePrefix="select"
                  isMulti
                  options={municipalityOptions}
                  value={selectedMunicipalityOptions}
                  onChange={setSelectedMunicipalityOptions}
                  placeholder="Velg kommuner..."
                />
                <div className="field-buttons">
                  <button
                    className="primary-button"
                    onClick={() => handleFieldSave("work_municipality_ids")}
                  >
                    Lagre
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      toggleFieldEdit("work_municipality_ids", false);
                      fetchProfile();
                    }}
                  >
                    Avbryt
                  </button>
                </div>
              </>
            ) : (
              <>
                <ul className="municipality-list">
                  {formData.work_municipalities?.length > 0 ? (
                    formData.work_municipalities.map((name, i) => (
                      <li key={i}>{name}</li>
                    ))
                  ) : (
                    <li>Ingen valgt</li>
                  )}
                </ul>
                {isOwnProfile && (
                  <button
                    className="edit-icon-button"
                    onClick={() =>
                      toggleFieldEdit("work_municipality_ids", true)
                    }
                  >
                    <FaEdit size={28} />
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {formData.role === "employee" && isOwnProfile && (
          <div className="profile-field">
            <label>Status:</label>
            {editingFields.availability ? (
              <>
                <div className="availability-toggle">
                  <label className="availability-option">
                    <input
                      type="radio"
                      name="availability"
                      value="Fleksibel"
                      checked={formData.availability === "Fleksibel"}
                      onChange={handleChange}
                    />
                    <span className="custom-radio">Tilgjengelig</span>
                  </label>
                  <label className="availability-option">
                    <input
                      type="radio"
                      name="availability"
                      value="Ikke-fleksibel"
                      checked={formData.availability === "Ikke-fleksibel"}
                      onChange={handleChange}
                    />
                    <span className="custom-radio">Utilgjengelig</span>
                  </label>
                </div>
                <div className="field-buttons">
                  <button
                    className="primary-button"
                    onClick={() => handleFieldSave("availability")}
                  >
                    Lagre
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => toggleFieldEdit("availability", false)}
                  >
                    Avbryt
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>{formData.availability}</p>
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("availability", true)}
                >
                  <FaEdit size={28} />
                </button>
              </>
            )}
          </div>
        )}

        {isOwnProfile && (
          <div className="profile-field">
            <label>Passord:</label>
            {editingFields.password ? (
              <>
                <div className="input-error-wrapper">
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Nåværende passord"
                    value={passwords.currentPassword}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Nytt passord"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                  />
                </div>

                {errors.password && (
                  <div className="error-message">{errors.password}</div>
                )}

                <div className="field-buttons">
                  <button
                    className="primary-button"
                    onClick={handlePasswordChange}
                  >
                    Lagre
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => {
                      toggleFieldEdit("password", false);
                      setPasswords({ currentPassword: "", newPassword: "" });
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                  >
                    Avbryt
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>***********</p>
                <button
                  className="edit-icon-button"
                  onClick={() => toggleFieldEdit("password", true)}
                >
                  <FaEdit size={28} />
                </button>
              </>
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
                    } ${
                      canEditQualifications && isEditingQualifications
                        ? "clickable"
                        : "disabled"
                    }`}
                    onClick={() =>
                      canEditQualifications &&
                      isEditingQualifications &&
                      handleQualificationToggle(qualification.id)
                    }
                  >
                    <h4>{qualification.name}</h4>
                    {isSelected && <span className="checkmark">✔</span>}
                  </div>
                );
              })}
            </div>

            {canEditQualifications && !isEditingQualifications && (
              <button
                className="edit-qualifications-btn"
                onClick={() => setIsEditingQualifications(true)}
              >
                Rediger kvalifikasjoner
              </button>
            )}

            {canEditQualifications && isEditingQualifications && (
              <div className="qualification-action-buttons">
                <button className="primary-button" onClick={saveQualifications}>
                  Lagre kvalifikasjoner
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setIsEditingQualifications(false)}
                >
                  Avbryt
                </button>
              </div>
            )}
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
    </div>
  );
};

export default Profile;

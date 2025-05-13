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
import ConfirmDeletePopup from "../../components/Popup/ConfirmDeletePopup/ConfirmDeletePopup";
import { FaEdit } from "react-icons/fa";

import "./Profile.css";

const Profile = () => {
  // Henter brukerdata og routinginformasjon
  const { user } = useAuth();
  const { id: profileId } = useParams();
  const navigate = useNavigate();

  // State-variabler for skjema og redigering
  const [formData, setFormData] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isEditingQualifications, setIsEditingQualifications] = useState(false);
  const [showDeleteUI, setShowDeleteUI] = useState(false);
  const [editingFields, setEditingFields] = useState({
    first_name: false,
    last_name: false,
    email: false,
    phone_number: false,
    municipality: false,
    availability: false,
    password: false,
    work_municipality_ids: false,
  });

  // Andre state-variabler
  const [municipalityOptions, setMunicipalityOptions] = useState([]);
  const [selectedMunicipalityOptions, setSelectedMunicipalityOptions] =
    useState([]);
  const [selectedResidenceMunicipality, setSelectedResidenceMunicipality] =
    useState(null);
  const [allQualifications, setAllQualifications] = useState([]);
  const [qualificationMap, setQualificationMap] = useState({});
  const [storeData, setStoreData] = useState(null);
  const [publishedShiftCount, setPublishedShiftCount] = useState(0);

  // Konstanter basert på bruker og profilvisning
  const isOwnProfile = !profileId || user?.id === profileId;
  const showBackButton =
    (user?.role === "store_manager" || user?.role === "admin") && !isOwnProfile;

  // Definerer på norsk for hvert felt i brukerprofilen
  const fieldLabels = {
    first_name: "Fornavn",
    last_name: "Etternavn",
    email: "E-post",
    phone_number: "Telefonnummer",
    availability: "Tilgjengelighet",
    work_municipality_ids: "Ønskede kommuner",
    municipality: "Bostedskommune",
  };

  // Hent alle kommuner
  const fetchMunicipalityOptions = async () => {
    const res = await axios.get("/municipalities");
    return res.data.map((m) => ({
      label: m.municipality_name,
      value: m.municipality_id,
    }));
  };

  // Hent alle kvalifikasjoner
  const fetchQualifications = async () => {
    const res = await axios.get("/qualifications");
    return res.data.map((q) => ({ id: q.qualification_id, name: q.name }));
  };

  // Hent brukerprofil (egen eller annen sin)
  const fetchUserProfile = async (id) => {
    const res = await axios.get(`/users/${id}`);
    return res.data;
  };

  // Kombinert henting av nødvendige data for profilvisning
  const fetchProfile = useCallback(async () => {
    try {
      const idToFetch = profileId || user?.id;
      if (!idToFetch) return;

      const [municipalityOptionsRes, qualificationsRes, profileData] =
        await Promise.all([
          fetchMunicipalityOptions(),
          fetchQualifications(),
          fetchUserProfile(idToFetch),
        ]);

      setMunicipalityOptions(municipalityOptionsRes);
      setAllQualifications(qualificationsRes);
      setFormData({ ...profileData, currentPassword: "", newPassword: "" });
      setOriginalFormData(profileData);

      const updatedSelected = profileData.work_municipalities
        ?.map((name) => municipalityOptionsRes.find((m) => m.label === name))
        .filter(Boolean);
      setSelectedMunicipalityOptions(updatedSelected);

      const residenceMatch = municipalityOptionsRes.find(
        (m) => m.label === profileData.municipality_name
      );
      setSelectedResidenceMunicipality(residenceMatch || null);

      const map = qualificationsRes.reduce((acc, q) => {
        acc[q.id] = q.name;
        return acc;
      }, {});
      setQualificationMap(map);
    } catch (err) {
      console.error("Error fetching profile:", err);
      toast.error("Kunne ikke hente profildata");
      if (isOwnProfile) navigate("/login");
    }
  }, [profileId, user?.id, isOwnProfile, navigate]);

  // Hent data når komponenten monteres
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Hent butikkdata og antall publiserte vakter
  useEffect(() => {
    const fetchStore = async () => {
      if (!formData?.store_id) return;
      try {
        const res = await axios.get(`/stores/storesWithMunicipality`);
        const matchedStore = res.data.stores.find(
          (store) => store.store_id === formData.store_id
        );
        setStoreData(matchedStore);
        setPublishedShiftCount(matchedStore?.shift_count || 0);
      } catch (err) {
        console.error("Error fetching store with shift count:", err);
      }
    };

    fetchStore();
  }, [formData?.store_id]);

  // Aktiverer/redigerer enkeltfelt eller tilbakestiller til originalverdi
  const toggleFieldEdit = (field, value = false) => {
    setEditingFields((prev) => ({ ...prev, [field]: value }));

    // Hvis redigering avbrytes, tilbakestill verdien
    if (!value) {
      setFormData((prev) => ({
        ...prev,
        [field]: originalFormData[field],
      }));

      // Tilbakestill valgt bostedskommune
      if (field === "municipality") {
        const match = municipalityOptions.find(
          (m) => m.value === originalFormData.municipality_id
        );
        setSelectedResidenceMunicipality(match || null);
      }

      // Tilbakestill ønskede kommuner
      if (field === "work_municipality_ids") {
        const matches =
          originalFormData.work_municipalities
            ?.map((name) => municipalityOptions.find((m) => m.label === name))
            .filter(Boolean) || [];
        setSelectedMunicipalityOptions(matches);
      }
    }
  };

  // Lagre oppdatert felt til backend
  const handleFieldSave = async (field) => {
    try {
      let payload = {
        [field]: formData[field],
      };

      // Håndtering for ønskede kommuner (multiselect)
      if (field === "work_municipality_ids") {
        payload.work_municipality_ids = selectedMunicipalityOptions.map(
          (opt) => opt.value
        );
      }

      // Håndtering for bostedskommune
      if (field === "municipality") {
        payload.municipality_id = selectedResidenceMunicipality?.value || null;
      }

      // Sørg for at ønskede kommuner beholdes hvis man ikke redigerer dem
      if (
        field !== "work_municipality_ids" &&
        selectedMunicipalityOptions.length > 0 &&
        !("work_municipality_ids" in payload)
      ) {
        payload.work_municipality_ids = selectedMunicipalityOptions.map(
          (opt) => opt.value
        );
      }

      setErrors({});
      await axios.put("/users/current/update", payload);
      toggleFieldEdit(field, false);
      await fetchProfile();

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
      } else {
        setErrors((prev) => ({ ...prev, general: "Noe gikk galt." }));
      }
    }
  };

  // Oppdater verdier i state ved input-endringer
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Endre passord og håndter feil
  const handlePasswordChange = async () => {
    setErrors({}); // Fjern gamle feil

    if (!formData.currentPassword || !formData.newPassword) {
      setErrors((prev) => ({
        ...prev,
        password: "Begge feltene må fylles ut", // Feilmelding hvis et av feltene er tomt
      }));
      return;
    }

    try {
      // Forsøk å oppdatere passordet ved å sende en PATCH-forespørsel til API-et
      await axios.patch("/users/current/password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      // Hvis passordet ble oppdatert uten problemer, vis en suksessmelding
      toast.success("Passord oppdatert");

      // Tøm formfeltene etter vellykket oppdatering
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
      }));

      // Lukk redigeringsfeltet for passord
      toggleFieldEdit("password", false);
    } catch (err) {
      // Håndter feil hvis forespørselen mislykkes
      const apiError = err.response?.data?.error;
      if (typeof apiError === "string") {
        // Hvis API-et gir en spesifikk feil, vis denne feilen
        setErrors((prev) => ({
          ...prev,
          password: apiError,
        }));
      } else {
        // Hvis det er en ukjent feil, vis en generell feilmelding
        setErrors((prev) => ({
          ...prev,
          password: "Kunne ikke oppdatere passordet.",
        }));
      }
    }
  };

  // Legg til eller fjern kvalifikasjon i state
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

  // Lagre kvalifikasjoner til backend
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

  // Sjekker om brukeren kan redigere kvalifikasjoner
  const canEditQualifications =
    user?.role === "store_manager" && // Brukeren må ha rollen "store_manager"
    !isOwnProfile && // Brukeren kan ikke redigere sine egne kvalifikasjoner
    user?.storeId === formData?.store_id; // Brukeren må ha samme butikk-ID som den som redigeres

  // Sjekker om brukeren kan se kvalifikasjoner
  const canViewQualifications =
    formData?.role === "employee" || canEditQualifications; // Brukeren kan se kvalifikasjonene hvis de er en ansatt eller kan redigere kvalifikasjonene

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

        {user?.role !== "admin" && (
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
                    onClick={() => handleFieldSave("municipality")}
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
        )}

        {formData.role === "employee" && (
          <div className="profile-field">
            <label>
              Ønsker å jobbe i kommune(r):
              {isOwnProfile && formData.role === "employee" && (
                <span className="tooltip-container">
                  <span className="question-icon">?</span>
                  <span className="tooltip-text">
                    Her kan du angi hvilke kommuner du ønsker å jobbe i. Du får
                    varslinger når relevante vakter legges ut.
                  </span>
                </span>
              )}
            </label>

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
            <label>
              Status:
              <span className="tooltip-container">
                <span className="question-icon">?</span>
                <span className="tooltip-text">
                  Statusen avgjør om butikksjefer ser deg som tilgjengelig for
                  vakter og får varslinger når nye vakter blir utlyst.
                </span>
              </span>
            </label>
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
                <p>
                  {formData.availability === "Fleksibel"
                    ? "Tilgjengelig"
                    : "Utilgjengelig"}
                </p>
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
                    value={formData.currentPassword || ""}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Nytt passord"
                    value={formData.newPassword || ""}
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
                      setFormData((prev) => ({
                        ...prev,
                        currentPassword: "",
                        newPassword: "",
                      }));

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

        {storeData && (
          <div
            className={`profile-field ${
              formData.role === "store_manager" ? "full-width" : ""
            }`}
          >
            <label>Butikk:</label>
            <div
              className={
                formData.role === "store_manager" ? "centered-store-card" : ""
              }
            >
              <div className="no-margin-wrapper">
                <ButikkCard
                  store={storeData}
                  shiftsCount={publishedShiftCount}
                />
              </div>
            </div>
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
              <div className="qualification-button">
                <button
                  className="primary-button"
                  onClick={() => setIsEditingQualifications(true)}
                >
                  Endre kvalifikasjoner
                </button>
              </div>
            )}

            {canEditQualifications && isEditingQualifications && (
              <div className="qualification-action-buttons">
                <button className="primary-button" onClick={saveQualifications}>
                  Lagre
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
      </div>

      {showDeleteUI && (
        <ConfirmDeletePopup
          title="brukerkonto"
          itemName={`${formData.first_name} ${formData.last_name}`}
          onCancel={() => setShowDeleteUI(false)}
          onConfirm={async () => {
            try {
              await axios.delete(`/users/${formData.user_id}`);
              toast.success("Konto slettet");

              if (isOwnProfile) {
                navigate("/login");
              } else if (user.role === "store_manager") {
                navigate("/bs/ansatte/mine");
              } else if (user.role === "admin") {
                navigate("/admin/butikksjefer");
              }
            } catch (err) {
              console.error("Feil ved sletting:", err);
              toast.error("Kunne ikke slette kontoen.");
              throw err;
            }
          }}
        />
      )}
      {((isOwnProfile && user?.role === "employee") ||
        (user?.role === "store_manager" &&
          !isOwnProfile &&
          formData.role === "employee" &&
          user.storeId === formData.store_id) ||
        (user?.role === "admin" &&
          !isOwnProfile &&
          formData.role === "store_manager")) && (
        <div className="delete-account-section">
          <button
            className="danger-button"
            onClick={() => setShowDeleteUI(true)}
          >
            Slett konto
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

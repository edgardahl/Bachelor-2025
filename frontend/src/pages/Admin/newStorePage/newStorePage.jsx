import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import BackButton from "../../../components/BackButton/BackButton";
import Select from "react-select";
import "./NewStorePage.css";

export default function NewStorePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    store_name: "",
    store_chain: "",
    municipality_id: "",
    address: "",
    postal_code: "",
    store_phone: "",
    store_email: "",
    manager_id: "",
  });

  const [municipalities, setMunicipalities] = useState([]);
  const [managers, setManagers] = useState([]);
  const [errors, setErrors] = useState({});

  const fieldRefs = {
    store_name: useRef(null),
    address: useRef(null),
    store_email: useRef(null),
    store_phone: useRef(null),
    postal_code: useRef(null),
    store_chain: useRef(null),
    municipality_id: useRef(null),
    manager_id: useRef(null),
  };

  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const res = await axios.get("/municipalities");
        setMunicipalities(res.data);
      } catch (error) {
        console.error("Feil ved henting av kommuner:", error);
        toast.error("Kunne ikke hente kommuner.");
      }
    };

    const fetchManagers = async () => {
      try {
        const res = await axios.get("/users/store_managers");
        setManagers(res.data);
      } catch (error) {
        console.error("Feil ved henting av butikksjefer:", error);
        toast.error("Kunne ikke hente butikksjefer.");
      }
    };
    
    fetchManagers();
    fetchMunicipalities();
  }, []);

  useEffect(() => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const errorElement = fieldRefs[firstErrorField].current;
      if (errorElement && errorElement.scrollIntoView) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
    }
  }, [errors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selected, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selected?.value || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post("/stores/createNewStore", formData);
      toast.success("Butikk opprettet!");
      navigate("/admin/butikker"); // Endre path ved behov
    } catch (err) {
      const serverError = err.response?.data?.error;

      if (serverError) {
        setErrors(serverError);

        if (serverError.general) {
          toast.error(serverError.general);
        }

        // Scroll/fokus på første felt med feil
        const firstErrorField = Object.keys(fieldRefs).find(
          (key) => serverError[key]
        );
        if (firstErrorField && fieldRefs[firstErrorField].current) {
          fieldRefs[firstErrorField].current.scrollIntoView({
            behavior: "smooth",
          });
          fieldRefs[firstErrorField].current.focus();
        }
      } else {
        toast.error("Noe gikk galt. Prøv igjen.");
      }
    }
  };

  const municipalityOptions = municipalities.map((m) => ({
    value: m.municipality_id,
    label: m.municipality_name,
  }));

  const storeChainOptions = [
    { value: "Coop Mega", label: "Coop Mega" },
    { value: "Coop Prix", label: "Coop Prix" },
    { value: "Coop Marked", label: "Coop Marked" },
    { value: "Extra", label: "Extra" },
    { value: "Obs", label: "Obs" },
    { value: "Obs BYGG", label: "Obs BYGG" },
    { value: "Coop Byggmix", label: "Coop Byggmix" },
  ];

  const managerOptions = managers.map((m) => {
    const storeInfo =
      !m.store_chain && !m.store_name
        ? "Ingen butikk"
        : `${m.store_chain ?? ""} ${m.store_name ?? ""}`.trim();

    return {
      value: m.user_id,
      label: `${m.first_name} ${m.last_name} (${storeInfo})`,
    };
  });

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <BackButton onClick={() => navigate(-1)} />
      <h2 className="form-title">Ny butikk</h2>

      <label>Butikknavn</label>
      <input
        name="store_name"
        ref={fieldRefs.store_name}
        value={formData.store_name}
        onChange={handleChange}
        required
        className={errors.store_name ? "error" : ""}
      />
      {errors.store_name && (
        <div className="error-message">{errors.store_name}</div>
      )}

      <label>Kjedetilhørighet</label>
      <Select
        options={storeChainOptions}
        onChange={(selected) => handleSelectChange(selected, "store_chain")}
        placeholder="Velg kjede..."
        className={errors.store_chain ? "error-select" : ""}
      />
      {errors.store_chain && (
        <div className="error-message">{errors.store_chain}</div>
      )}

      <label>Kommune</label>
      <Select
        options={municipalityOptions}
        onChange={(selected) => handleSelectChange(selected, "municipality_id")}
        placeholder="Velg kommune..."
        className={errors.municipality_id ? "error-select" : ""}
      />
      {errors.municipality_id && (
        <div className="error-message">{errors.municipality_id}</div>
      )}

      <label>Adresse</label>
      <input
        name="address"
        ref={fieldRefs.address}
        value={formData.address}
        onChange={handleChange}
        required
        className={errors.address ? "error" : ""}
      />
      {errors.address && <div className="error-message">{errors.address}</div>}

      <label>Postnummer</label>
      <input
        name="postal_code"
        type="text"
        value={formData.postal_code}
        onChange={handleChange}
        className={errors.postal_code ? "error" : ""}
      />
      {errors.postal_code && (
        <div className="error-message">{errors.postal_code}</div>
      )}

      <label>Telefonnummer</label>
      <input
        name="store_phone"
        type="text"
        value={formData.store_phone}
        onChange={handleChange}
        required
        className={errors.store_phone ? "error" : ""}
      />
      {errors.store_phone && (
        <div className="error-message">{errors.store_phone}</div>
      )}

      <label>E-post</label>
      <input
        name="store_email"
        type="email"
        ref={fieldRefs.store_email}
        value={formData.store_email}
        onChange={handleChange}
        required
        className={errors.store_email ? "error" : ""}
      />
      {errors.store_email && (
        <div className="error-message">{errors.store_email}</div>
      )}

      <label>Butikksjef (valgfritt)</label>
      <Select
        options={managerOptions}
        onChange={(selected) => handleSelectChange(selected, "manager_id")}
        placeholder="Velg butikksjef..."
        className={errors.manager_id ? "error-select" : ""}
      />
      {errors.manager_id && (
        <div className="error-message">{errors.manager_id}</div>
      )}

      {errors.general && <div className="error-message">{errors.general}</div>}

      <button type="submit" className="submit-btn">
        Opprett butikk
      </button>
    </form>
  );
}

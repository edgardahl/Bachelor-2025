import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import Select from "react-select";
import BackButton from "../../../components/BackButton/BackButton";
import "./NewManagerPage.css";

const NewManagerPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    store_id: "",
  });

  const [stores, setStores] = useState([]);
  const [errors, setErrors] = useState({});

  const fieldRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    email: useRef(null),
    password: useRef(null),
  };

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get("/stores");
        setStores(res.data);
      } catch (err) {
        console.error("Kunne ikke hente butikker:", err);
        toast.error("Feil ved henting av butikker.");
      }
    };

    fetchStores();
  }, []);

  const storeOptions = stores.map((store) => ({
    value: store.store_id,
    label: `${store.name} (${store.store_chain})`,
  }));

  console.log("Store options:", storeOptions);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStoreChange = (selectedOption) => {
    setFormData((prev) => ({ ...prev, store_id: selectedOption?.value || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await axios.post("/auth/store_manager/register", formData);
      toast.success("Butikksjef opprettet!");
      navigate("/admin/butikksjefer");
    } catch (err) {
      if (err.response?.data?.error) {
        const newErrors = err.response.data.error;
        setErrors(newErrors);

        const firstErrorField = Object.keys(fieldRefs).find(
          (key) => newErrors[key]
        );
        if (firstErrorField && fieldRefs[firstErrorField].current) {
          fieldRefs[firstErrorField].current.scrollIntoView({ behavior: "smooth" });
          fieldRefs[firstErrorField].current.focus();
        }
      } else {
        toast.error("Noe gikk galt. Prøv igjen.");
      }
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <BackButton onClick={() => navigate(-1)} />
      <h2 className="form-title">Ny butikksjef</h2>
      <p className="form-subtitle">
        Butikksjefen kan senere redigere passord og annen informasjon selv.
      </p>

      <label>Fornavn</label>
      <input
        name="first_name"
        ref={fieldRefs.first_name}
        value={formData.first_name}
        onChange={handleChange}
        required
        className={errors.first_name ? "error" : ""}
      />
      {errors.first_name && <div className="error-message">{errors.first_name}</div>}

      <label>Etternavn</label>
      <input
        name="last_name"
        ref={fieldRefs.last_name}
        value={formData.last_name}
        onChange={handleChange}
        required
        className={errors.last_name ? "error" : ""}
      />
      {errors.last_name && <div className="error-message">{errors.last_name}</div>}

      <label>E-post</label>
      <input
        name="email"
        type="email"
        ref={fieldRefs.email}
        value={formData.email}
        onChange={handleChange}
        required
        className={errors.email ? "error" : ""}
      />
      {errors.email && <div className="error-message">{errors.email}</div>}

      <label>Telefonnummer</label>
      <input
        name="phone_number"
        type="text"
        value={formData.phone_number}
        onChange={handleChange}
        required
        className={errors.phone_number ? "error" : ""}
      />
      {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}

      <label>Passord (minimum 6 tegn)</label>
      <input
        name="password"
        type="password"
        ref={fieldRefs.password}
        value={formData.password}
        onChange={handleChange}
        required
        className={errors.password ? "error" : ""}
      />
      {errors.password && <div className="error-message">{errors.password}</div>}

      <label>Tilknytt butikk (valgfritt)</label>
      <Select
        options={storeOptions}
        onChange={handleStoreChange}
        placeholder="Velg butikk..."
        className={errors.store_id ? "error-select" : ""}
      />
      {errors.store_id && <div className="error-message">{errors.store_id}</div>}

      {errors.general && <div className="error-message">{errors.general}</div>}

      <button type="submit" className="submit-btn">Opprett butikksjef</button>
    </form>
  );
};

export default NewManagerPage;

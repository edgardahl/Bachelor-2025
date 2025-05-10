import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Select from "react-select";
import axios from "../../../api/axiosInstance";
import Loading from "../../../components/Loading/Loading";
import BackButton from "../../../components/BackButton/BackButton";
import { toast } from "react-toastify";
import "./AdminButikk.css";

const AdminButikk = () => {
  const errorRefs = useRef({});
  const { store_id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [storeManagers, setStoreManagers] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    store_name: "",
    store_chain: "",
    address: "",
    store_phone: "",
    store_email: "",
    municipality_id: "", // 👈 ny
  });
  const [errors, setErrors] = useState({}); // For storing error messages

  useEffect(() => {
    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0];
      const errorElement = errorRefs.current[firstErrorField];
      if (errorElement && errorElement.scrollIntoView) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [errors]);
  


  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await axios.get(`/stores/getStoreWithInfo/${store_id}`);
        const storeData = res.data?.[0];
        if (storeData) {
          setStore(storeData);
          setFormData({
            store_name: storeData.store_name || "",
            store_chain: storeData.store_chain || "",
            address: storeData.address || "",
            store_phone: storeData.store_phone || "",
            store_email: storeData.store_email || "",
            municipality_id: storeData.municipality_id || "", // 👈 ny
          });
        }
      } catch (err) {
        console.error("Feil ved henting av butikk:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchMunicipalities = async () => {
      try {
        const res = await axios.get("/municipalities");
        setMunicipalities(res.data);
      } catch (err) {
        console.error("Feil ved henting av kommuner:", err);
      }
    };

    const fetchStoreManagers = async () => {
      try {
        const res = await axios.get(`/users/store_managers/${store_id}`);
        setStoreManagers(res.data);
      } catch (err) {
        console.error("Feil ved henting av store managers:", err);
      }
    };

    fetchStore();
    fetchStoreManagers();
    fetchMunicipalities();
  }, [store_id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      setErrors({});
      const res = await axios.put(`/stores/${store_id}`, formData);
      setStore((prev) => ({ ...prev, ...formData }));
      setEditing(false);
  
      // ✅ Vis toast ved suksess
      toast.success("Endringer lagret!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      if (err.response?.data?.error) {
        setErrors(err.response.data.error);
      } else {
        console.error("Error updating store:", err);
      }
    }
  };
  

  const storeChainOptions = [
    "Coop Mega",
    "Coop Prix",
    "Coop Marked",
    "Extra",
    "Obs",
    "Obs BYGG",
    "Coop Byggmix",
  ].map((chain) => ({ label: chain, value: chain }));

  const municipalityOptions = municipalities.map((m) => ({
    label: m.municipality_name,
    value: m.municipality_id,
  }));

  if (loading) return <Loading />;

  return (
    <div className="adminbutikk-page">
      <BackButton />
      <h1 className="adminbutikk-title">Butikkdetaljer</h1>
      <div className="adminbutikk-form">
        <div
  className="adminbutikk-field"
  ref={(el) => {
    if (errors.store_name) {
      errorRefs.current.store_name = el;
    }
  }}
>
  <label className="adminbutikk-label">Navn</label>
  {editing ? (
    <input
      className={`adminbutikk-input ${errors.store_name ? "error" : ""}`}
      name="store_name"
      value={formData.store_name}
      onChange={handleChange}
    />
  ) : (
    <p className="adminbutikk-text">{store.store_name}</p>
  )}
  {errors.store_name && <div className="error-message">{errors.store_name}</div>}
</div>

<div
  className="adminbutikk-field"
  ref={(el) => {
    if (errors.address) {
      errorRefs.current.address = el;
    }
  }}
>
  <label className="adminbutikk-label">Adresse</label>
  {editing ? (
    <input
      className={`adminbutikk-input ${errors.address ? "error" : ""}`}
      name="address"
      value={formData.address}
      onChange={handleChange}
    />
  ) : (
    <p className="adminbutikk-text">{store.address}</p>
  )}
  {errors.address && <div className="error-message">{errors.address}</div>}
</div>

<div
  className="adminbutikk-field"
  ref={(el) => {
    if (errors.store_phone) {
      errorRefs.current.store_phone = el;
    }
  }}
>
  <label className="adminbutikk-label">Telefon</label>
  {editing ? (
    <input
      className={`adminbutikk-input ${errors.store_phone ? "error" : ""}`}
      name="store_phone"
      value={formData.store_phone}
      onChange={handleChange}
    />
  ) : (
    <p className="adminbutikk-text">{store.store_phone}</p>
  )}
  {errors.store_phone && <div className="error-message">{errors.store_phone}</div>}
</div>

<div
  className="adminbutikk-field"
  ref={(el) => {
    if (errors.store_email) {
      errorRefs.current.store_email = el;
    }
  }}
>
  <label className="adminbutikk-label">E-post</label>
  {editing ? (
    <input
      className={`adminbutikk-input ${errors.store_email ? "error" : ""}`}
      name="store_email"
      value={formData.store_email}
      onChange={handleChange}
    />
  ) : (
    <p className="adminbutikk-text">{store.store_email}</p>
  )}
  {errors.store_email && <div className="error-message">{errors.store_email}</div>}
</div>
        <div
        className="adminbutikk-field"
        ref={(el) => {
            if (errors.store_chain) {
            errorRefs.current.store_chain = el;
            }
        }}
        >
          <label className="adminbutikk-label">Kjedetilhørighet</label>
          {editing ? (
            <Select
              className="adminbutikk-select"
              options={storeChainOptions}
              value={storeChainOptions.find(
                (opt) => opt.value === formData.store_chain
              )}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  store_chain: selected.value,
                }))
              }
            />
          ) : (
            <p className="adminbutikk-text">{store.store_chain}</p>
          )}
          {errors.store_chain && <div className="error-message">{errors.store_chain}</div>}
        </div>

        <div
            className="adminbutikk-field"
            ref={(el) => {
                if (errors.municipality_id) {
                errorRefs.current.municipality_id = el;
                }
            }}
            >
          <label className="adminbutikk-label">Kommune</label>
          {editing ? (
            <Select
              className="adminbutikk-select"
              options={municipalityOptions}
              placeholder="Velg kommune"
              value={municipalityOptions.find(
                (opt) => opt.value === formData.municipality_id
              )}
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  municipality_id: selected ? selected.value : "",
                }))
              }
            />
          ) : (
            <p className="adminbutikk-text">
              {store.municipality_name}, {store.county_name}
            </p>
          )}
          {errors.municipality_id && <div className="error-message">{errors.municipality_id}</div>}
        </div>

        {/* Static store managers display */}
        <div className="adminbutikk-field">
          <label className="adminbutikk-label">Butikksjefer</label>
          <div>
            {storeManagers.length === 0 ? (
              <p className="adminbutikk-text">
                Ingen butikksjefer. legg til en butikksjef{" "}
                <Link to={"/admin/managers"} className="adminbutikk-manager-link">
                  Her
                </Link>
              </p>
            ) : (
              storeManagers.map((manager) => (
                <Link
                  key={manager.user_id}
                  to={`/admin/manager/${manager.user_id}`}
                  className="adminbutikk-manager-link"
                >
                  <p className="adminbutikk-text">
                    {manager.first_name} {manager.last_name} ({manager.email})
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
        <div className="adminbutikk-actions">
          {editing ? (
            <div>
                <button className="adminbutikk-button-edit" onClick={handleSave}>
                Lagre endringer
                </button>
                <button className="adminbutikk-button-cancle" onClick={()=> setEditing(false)}>
                    Avbryt
                </button>
            </div>
          ) : (
            <button className="adminbutikk-button-edit" onClick={() => setEditing(true)}>
              Rediger butikk
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminButikk;

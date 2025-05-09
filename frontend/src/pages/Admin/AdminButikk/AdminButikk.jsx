import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Select from "react-select";
import axios from "../../../api/axiosInstance";
import Loading from "../../../components/Loading/Loading";
import BackButton from "../../../components/BackButton/BackButton";
import "./AdminButikk.css";

const AdminButikk = () => {
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
    manager_id: "",
    municipality_id: "", // 👈 ny
  });
  

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
            manager_id: storeData.manager_id || "",
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
          const res = await axios.get("/users/store_managers"); // Oppdater til ny rute
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
      // Send store data with manager_id
      await axios.put(`/stores/${store_id}`, formData);
      setEditing(false);
      setStore((prev) => ({ ...prev, ...formData }));
    } catch (err) {
      console.error("Error updating store:", err);
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
  

  const storeManagerOptions = storeManagers.map((m) => {
    const storeInfo = m.store_name && m.store_chain ? `${m.store_chain} - ${m.store_name}` : "Ingen butikk";
    return {
      label: `${m.first_name} ${m.last_name} (${m.email}) - ${storeInfo}`,
      value: m.user_id,
    };
  });
  

  if (loading) return <Loading />;

  return (
    <div className="adminbutikk-page">
      <BackButton />
      <h1 className="adminbutikk-title">Butikkdetaljer</h1>
      <div className="adminbutikk-form">
  {[
    ["store_name", "Navn"],
    ["address", "Adresse"],
    ["store_phone", "Telefon"],
    ["store_email", "E-post"],
  ].map(([field, label]) => (
    <div key={field} className="adminbutikk-field">
      <label className="adminbutikk-label">{label}</label>
      {editing ? (
        <input
          className="adminbutikk-input"
          name={field}
          value={formData[field]}
          onChange={handleChange}
        />
      ) : (
        <p className="adminbutikk-text">{store[field]}</p>
      )}
    </div>
  ))}

  {/* Select fields for store chain, manager, and municipality */}
  <div className="adminbutikk-field">
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
  </div>

  <div className="adminbutikk-field">
    <label className="adminbutikk-label">Butikksjef</label>
    {editing ? (
      <Select
        className="adminbutikk-select"
        options={storeManagerOptions}
        isClearable
        placeholder="Velg butikksjef"
        value={storeManagerOptions.find(
          (opt) => opt.value === formData.manager_id
        )}
        onChange={(selected) =>
          setFormData((prev) => ({
            ...prev,
            manager_id: selected ? selected.value : "",
          }))
        }
      />
    ) : store.manager_id ? (
      <p className="adminbutikk-text">
        {store.manager_first_name} {store.manager_last_name} ({store.manager_email})
      </p>
    ) : (
      <p className="adminbutikk-text">Ingen butikksjef</p>
    )}
  </div>

  <div className="adminbutikk-field">
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
  </div>

  <div className="adminbutikk-actions">
    {editing ? (
      <button className="adminbutikk-button" onClick={handleSave}>
        Lagre endringer
      </button>
    ) : (
      <button className="adminbutikk-button" onClick={() => setEditing(true)}>
        Rediger butikk
      </button>
    )}
  </div>
</div>

    </div>
  );
};

export default AdminButikk;

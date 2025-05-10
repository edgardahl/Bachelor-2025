import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import { toast } from "react-toastify";
import BackButton from "../../../components/BackButton/BackButton";
import "./NewEmployeeForm.css";

export default function RegisterNewEmployeeForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    qualifications: [],
  });

  const fieldRefs = {
    first_name: useRef(null),
    last_name: useRef(null),
    email: useRef(null),
    password: useRef(null),
  };

  const [qualifications, setQualifications] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qualificationRes] = await Promise.all([
          axios.get("/qualifications"),
        ]);
        setQualifications(qualificationRes.data);
      } catch (error) {
        console.error("Feil ved henting av data:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQualificationChange = (id) => {
    setFormData((prev) => {
      const alreadySelected = prev.qualifications.includes(id);
      return {
        ...prev,
        qualifications: alreadySelected
          ? prev.qualifications.filter((q) => q !== id)
          : [...prev.qualifications, id],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrors({});
      await axios.post("/auth/employee/register", formData);
      toast.success("Bruker registrert!");
  
      navigate("/bs/ansatte/mine"); // ← Naviger dit
  
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone_number: "",
        qualifications: [],
      });
    } catch (err) {
      if (err.response?.data?.error) {
        const errorMessages = err.response.data.error;
        const newErrors = {};

        for (const key in errorMessages) {
          if (Object.hasOwnProperty.call(errorMessages, key)) {
            newErrors[key] = errorMessages[key];
          }
        }

        setErrors(newErrors);

        const firstErrorField = Object.keys(fieldRefs).find(
          (key) => newErrors[key]
        );
        if (firstErrorField && fieldRefs[firstErrorField].current) {
          fieldRefs[firstErrorField].current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
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

      <h2 className="form-title">Registrer ny bruker</h2>
      <p className="form-subtitle">
        Den ansatte kan endre e-post, telefonnummer, passord og mer etter
        innlogging.
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
      {errors.first_name && (
        <div className="error-message">{errors.first_name}</div>
      )}

      <label>Etternavn</label>
      <input
        name="last_name"
        ref={fieldRefs.last_name}
        value={formData.last_name}
        onChange={handleChange}
        required
        className={errors.last_name ? "error" : ""}
      />
      {errors.last_name && (
        <div className="error-message">{errors.last_name}</div>
      )}

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
      {errors.phone_number && (
        <div className="error-message">{errors.phone_number}</div>
      )}

      <label>
        Passord
        <br />
        <span className="label-note">
          (kan endres av den ansatte etter innlogging)
        </span>
      </label>
      <input
        name="password"
        type="password"
        ref={fieldRefs.password}
        value={formData.password}
        onChange={handleChange}
        required
        className={errors.password ? "error" : ""}
      />
      {errors.password && (
        <div className="error-message">{errors.password}</div>
      )}

      <label>Kvalifikasjoner</label>
      <div className="qualification-cards">
        {qualifications.map((qualification) => {
          const isSelected = formData.qualifications.includes(
            qualification.qualification_id
          );
          return (
            <div
              key={qualification.qualification_id}
              className={`qualification-card ${isSelected ? "selected" : ""}`}
              onClick={() =>
                handleQualificationChange(qualification.qualification_id)
              }
            >
              <h4>{qualification.name}</h4>
              {isSelected && <span className="checkmark">✔</span>}
            </div>
          );
        })}
      </div>

      {errors.general && <div className="error-message">{errors.general}</div>}

      <button type="submit" className="submit-btn">
        Registrer
      </button>
    </form>
  );
}

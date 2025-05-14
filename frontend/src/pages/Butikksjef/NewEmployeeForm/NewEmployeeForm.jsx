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

  // Hent kvalifikasjoner fra API ved mount
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

  // Oppdaterer skjemafelter ved input-endring

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Legger til/fjerner kvalifikasjon i skjema

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

  // Sender registreringen av den nye ansatte til API-et for å lagre dataene
  const handleSubmit = async (e) => {
    e.preventDefault(); // Hindrer at skjemaet sendes på tradisjonelt vis (fullstendig sideoppdatering)

    try {
      setErrors({}); // Nullstiller eventuelle tidligere feil før innsending

      // Sender dataene til API-et for å registrere den nye ansatte
      await axios.post("/auth/employee/register", formData);

      // Vist en suksessmelding etter at registreringen er gjennomført
      toast.success("Bruker registrert");

      // Naviger brukeren til en liste over ansatte etter at registreringen er fullført
      navigate("/bs/ansatte/mine");

      // Nullstiller skjemaet etter innsending
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        phone_number: "",
        qualifications: [], // Resetter kvalifikasjoner
      });
    } catch (err) {
      if (err.response?.data?.error) {
        // Finner feilmeldingene fra API-svaret og lagrer dem
        const errorMessages = err.response.data.error;
        const newErrors = {};

        // Går gjennom feilmeldingene og setter dem i state
        for (const key in errorMessages) {
          if (Object.hasOwnProperty.call(errorMessages, key)) {
            newErrors[key] = errorMessages[key];
          }
        }

        setErrors(newErrors); // Oppdaterer feilmeldingene i state

        // Finner det første feltet som har en feil og ruller til det
        const firstErrorField = Object.keys(fieldRefs).find(
          (key) => newErrors[key]
        );
        if (firstErrorField && fieldRefs[firstErrorField].current) {
          // Ruller til det første feilede feltet for bedre brukeropplevelse
          fieldRefs[firstErrorField].current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          fieldRefs[firstErrorField].current.focus(); // Setter fokus på feltet med feil
        }
      } else {
        // Hvis det ikke er noen spesifikke feilmeldinger, vis en generell feilmelding
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

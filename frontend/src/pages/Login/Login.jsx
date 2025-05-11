import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa";
import "../Register/AuthForm.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inlineError, setInlineError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInlineError("");

    try {
      const res = await axios.post("/auth/login", { email, password });
      localStorage.setItem("accessToken", res.data.accessToken);
      setUser(res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg === "Feil e-post eller passord.") {
        setInlineError(msg);
      } else {
        toast.error(msg || "Noe gikk galt under innlogging.");
      }
    }
  };

  return (
    <div className="login-wrapper">
      <button
        type="button"
        className="back-to-home-button"
        onClick={() => navigate("/hjem")}
      >
        <FaArrowLeft style={{ marginRight: "8px" }} />
        Tilbake til forside
      </button>

      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Logg inn</h2>

        <div className="login-field">
          <label className="login-label">E-post</label>
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label className="login-label">Passord</label>
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {inlineError && <p className="login-error">{inlineError}</p>}

        <button type="submit" className="login-button">
          Logg inn
        </button>

        <div className="login-footer">
          <p>Har du ikke brukerkonto?</p>
          <p className="login-note">Kontakt butikksjefen din for brukerkonto.</p>
        </div>
      </form>
    </div>
  );
}

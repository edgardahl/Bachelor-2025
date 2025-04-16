import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
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
      toast.success("Innlogging vellykket!");
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
    <div className="auth-wrapper">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2 className="auth-title">Logg inn</h2>

        <div className="auth-field">
          <label className="auth-label">E-post</label>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-label">Passord</label>
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {inlineError && <p className="auth-error">{inlineError}</p>}

        <button type="submit" className="auth-button">
          Logg inn
        </button>

        <div className="auth-footer">
          <p>
            Har du ikke brukerkonto?{" "}
            <Link to="/register" className="auth-link">
              Registrer deg her
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth"; // ✅ import context
import "./Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // ✅ include setUser

  useEffect(() => {
    if (user?.role === "store_manager") {
      navigate("/dashboard/butikksjef");
    } else if (user?.role === "employee") {
      navigate("/dashboard/butikkansatt");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("/auth/login", { email, password });

      // Save token + update context
      localStorage.setItem("accessToken", res.data.accessToken);
      const user = res.data.user;
      setUser(user); // ✅ update global auth state

      // Redirect based on role
      if (user.role === "store_manager") {
        navigate("/dashboard/butikksjef");
      } else if (user.role === "employee") {
        navigate("/dashboard/butikkansatt");
      } else {
        console.log("fakk dette")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-wrapper">
      <form onSubmit={handleSubmit} className="login-form">
        <h2 className="login-title">Login</h2>

        {error && <p className="login-error">{error}</p>}

        <div className="login-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="login-field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-button">
          Log In
        </button>

        <button
          type="button"
          className="register-button"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </form>
    </div>
  );
}

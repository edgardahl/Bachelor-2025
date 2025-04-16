import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Velkommen til Coop Øst Ansattdeling</h1>
        <p>Effektiviser arbeidsdelingen mellom ansatte og butikker.</p>
      </header>

      <section className="landing-features">
        <div className="feature landing-butikker">
          <h2>Utforsk Butikker</h2>
          <p>Se en oversikt over butikker i ditt område og deres behov.</p>
        </div>
        <div className="feature landing-vakter">
          <h2>Finn Vaktene Dine</h2>
          <p>
            Reserver vakter som passer dine kvalifikasjoner og tilgjengelighet.
          </p>
        </div>
        <div className="feature landing-ansatte">
          <h2>Administrer Ansatte</h2>
          <p>
            For butikksjefer: Få full kontroll over dine ansatte og deres
            status.
          </p>
        </div>
        <div className="feature landing-vakter">
          <h2>Utlys vakter</h2>
          <p>
            For butikksjefer: Legg ut en åpen vakt for å fylle tidsskjemaet en
            uke frem i tid
          </p>
        </div>
      </section>

      <div className="landing-footer">
        <button className="login-button" onClick={() => navigate("/login")}>
          Logg inn
        </button>
        <p>eller</p>
        <button className="login-button" onClick={() => navigate("/register")}>
          Registrer ny bruker
        </button>
      </div>
    </div>
  );
};

export default Landing;

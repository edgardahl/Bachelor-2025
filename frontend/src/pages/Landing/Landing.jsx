import React from "react";
import { useNavigate } from "react-router-dom";
import ButikkCard from "../../components/Cards/ButikkCard/ButikkCard";
import ShiftCard from "../../components/Cards/ShiftCard/ShiftCard";
import ButikkansattCard from "../../components/Cards/ButikkansattCard/ButikkansattCard";
import "./Landing.css";
import "../../components/Cards/ButikkCard/ButikkCard.css";
import "../../components/Cards/ShiftCard/ShiftCard.css";
import "../../components/Cards/ButikkansattCard/ButikkansattCard.css";

const Landing = () => {
  const navigate = useNavigate();

  // Oppretter employee objektet her
  const employee = {
    first_name: "Kari",
    last_name: "Nordmann",
    availability: "Ikke tilgjengelig",
    qualifications: "Kasse, Post",
    store_name: "Coop Mega Løren",
  };
  const employee2 = {
    first_name: "Ola",
    last_name: "Nordmann",
    availability: "Tilgjengelig",
    qualifications: "Kasse, Post",
    store_name: "Coop Extra Bekkestua",
  };

  return (
    <div className="landing-container">
      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-content">
          <img
            src="/icons/coop-compis-logo-sort.svg"
            alt="Coop logo"
            className="hero-logo"
          />
          <h1 className="hero-title">Velkommen til Coop Compis</h1>
          <p className="hero-subtitle">
            Den smarte måten å organisere vakter og ansatte i butikkene dine.
          </p>
          <button
            className="kom-i-gang-button"
            onClick={() => navigate("/login")}
          >
            Kom i gang
          </button>
          <div
            className="scroll-down-indicator"
            onClick={() =>
              window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
            }
          >
            <span className="scroll-down-text">Bla ned</span>
            <span className="scroll-down-arrow">⌄</span>
          </div>
        </div>
      </section>

      {/* Section 1 – Butikker */}
      <section className="landing-section">
        <h2 className="landing-section-heading">🏬 Butikker</h2>
        <p className="landing-section-text">
          Få oversikt over alle Coop Øst-butikker. Se deres beliggenhet,
          tilgjengelige vakter og hvilke behov de har for bemanning.
        </p>
        <div className="preview-card">
          <ButikkCard
            store={{
              store_id: "1",
              name: "Majorstua",
              store_chain: "Coop Obs",
              address: "Majorstuveien 2, 0353 Oslo",
            }}
            shiftsCount={3}
          />
        </div>
      </section>

      {/* Section 2 – Publisere vakter */}
      <section className="landing-section alt">
        <h2 className="landing-section-heading">📢 Publisere vakter</h2>
        <p className="landing-section-text">
          Trenger du folk på jobb? Legg ut en vakt! Systemet matcher den med
          ansatte som har riktig kvalifikasjon og tilgjengelighet.
        </p>
        <div className="preview-card">
          <ShiftCard
            shiftId="abc123"
            title="Kassehjelp"
            date={new Date().toISOString()}
            startTime="09:00"
            endTime="17:00"
            qualifications={["Kasse", "Kundebehandling"]}
            storeName="Coop Extra Bekkestua"
            shiftStoreId="2"
            deleteShift={() => {}}
            claimedByName=""
            claimedById=""
          />
        </div>
      </section>

      {/* Section 3 – Ta vakt */}
      <section className="landing-section">
        <h2 className="landing-section-heading">📆 Ta vakt</h2>
        <p className="landing-section-text">
          Som ansatt kan du selv velge vakter i kommunene du er interessert i.
          Du får kun opp relevante vakter du er kvalifisert for.
        </p>
        <div className="preview-card">
          <ShiftCard
            shiftId="xyz789"
            title="Varepåfyller"
            date={new Date().toISOString()}
            startTime="14:00"
            endTime="22:00"
            qualifications={["Lager", "Truck"]}
            storeName="Coop Obs Alnabru"
            shiftStoreId="3"
            deleteShift={() => {}}
            claimedByName="Ola Nordmann"
            claimedById="user123"
          />
        </div>
      </section>

      {/* Section 4 – Administrer ansatte */}
      <section className="landing-section alt">
        <h2 className="landing-section-heading">👥 Administrer ansatte</h2>
        <p className="landing-section-text">
          Butikksjefer får full oversikt over egne ansatte, deres
          kvalifikasjoner og hvilke eksterne ansatte som er interesserte i å
          jobbe i din kommune.
        </p>
        <div className="preview-card">
          <ButikkansattCard employee={employee} cardClass="employee-theme" />
          <ButikkansattCard employee={employee2} cardClass="available-theme" />
        </div>
      </section>

      {/* Kom i gang knapp på bunnen */}
      <section className="kom-i-gang-container">
        <div className="kom-i-gang-content">
          <h2 className="kom-i-gang-heading">Er du klar for å komme i gang?</h2>
          <p className="kom-i-gang-text">
            Bli med på Coop Compis og effektiviser hvordan du administrerer
            vakter og ansatte!
          </p>
          <button
            className="kom-i-gang-button"
            onClick={() => navigate("/login")}
          >
            Kom i gang
          </button>
        </div>
      </section>
    </div>
  );
};

export default Landing;

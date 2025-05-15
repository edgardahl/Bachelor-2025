import React from "react";
import { useNavigate } from "react-router-dom";
import { IoStorefrontSharp } from "react-icons/io5";
import { FaClipboardList, FaClipboardCheck } from "react-icons/fa";
import { FaClipboardUser } from "react-icons/fa6";
import ButikkCard from "../../components/Cards/ButikkCard/ButikkCard";
import ShiftCard from "../../components/Cards/ShiftCard/ShiftCard";
import ButikkansattCard from "../../components/Cards/ButikkansattCard/ButikkansattCard";
import "./LandingPage.css";
import "../../components/Cards/ButikkCard/ButikkCard.css";
import "../../components/Cards/ShiftCard/ShiftCard.css";
import "../../components/Cards/ButikkansattCard/ButikkansattCard.css";

import "./Landing.css";

const Landing = () => {
  // Henter navigasjonsfunksjon for å rute brukeren til andre sider
  const navigate = useNavigate();

  // Eksempeldata for ansatte som vises i preview
  const employee = {
    first_name: "Kari",
    last_name: "Nordmann",
    availability: "Utilgjengelig",
    qualifications: "Kasse, Post",
    store_name: "Coop Mega Løren",
  };
  const employee2 = {
    first_name: "Ola",
    last_name: "Nordmann",
    availability: "Tilgjengelig",
    qualifications: "Kasse, Post",
    store_name: "Extra Bekkestua",
  };

  return (
    <div className="landing-container">
      {/* HERO-SEKSJON: Velkomst og startknapp */}
      <section className="landing-hero">
        <div className="hero-content">
          <img
            src="/icons/coop-compis-logo-sort.svg"
            alt="Coop logo"
            className="hero-logo"
          />
          <h1 className="hero-title">Velkommen til Coop Compis</h1>
          <p className="hero-subtitle">
            - En enklere måte å organisere arbeidshverdagen.
          </p>
          {/* Naviger til innloggingssiden */}
          <button
            className="kom-i-gang-button"
            onClick={() => navigate("/login")}
          >
            Kom i gang
          </button>
          {/* Ruller siden ned med jevn animasjon */}
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

      {/* SEKSJON 1 – Publisere vakter */}
      <section className="landing-section">
        <h2 className="landing-section-heading">
          <FaClipboardList className="section-icon" />
          Publisere vakter
        </h2>
        <p className="landing-section-text">
          Har du behov for ekstra bemanning? Legg ut en vakt, så kan
          kvalifiserte ansatte ta den.
        </p>
        {/* Preview av et ShiftCard-komponent */}
        <div className="preview-card">
          <ShiftCard
            shiftId="abc123"
            title="Kassehjelp"
            date={new Date().toISOString()}
            startTime="09:00"
            endTime="17:00"
            qualifications={["Kasse", "Kundebehandling"]}
            storeName="Extra Bekkestua"
            shiftStoreId="2"
            deleteShift={() => {}}
            claimedByName=""
            claimedById=""
            showLesMer={false}
            interactive={false}
          />
        </div>
      </section>

      {/* SEKSJON 2 – Ta vakt */}
      <section className="landing-section alt">
        {/* Overskrift med ikon */}
        <div className="landing-heading-container">
          <h2 className="landing-section-heading">
            <FaClipboardCheck className="section-icon" />
            Ta vakt
          </h2>
        </div>
        <p className="landing-section-text">
          Som ansatt kan du selv velge vakter i kommunene du er interessert i.
          Du får kun opp relevante vakter du er kvalifisert for.
        </p>
        {/* Preview av et annet ShiftCard-komponent */}
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
            showLesMer={false}
            interactive={false}
          />
        </div>
      </section>

      {/* SEKSJON 3 – Butikker */}
      <section className="landing-section">
        <h2 className="landing-section-heading">
          <IoStorefrontSharp className="section-icon" />
          Butikker
        </h2>
        <p className="landing-section-text">
          Få oversikt over alle Coop Øst-butikker. Se deres beliggenhet,
          tilgjengelige vakter og hvilke behov de har for bemanning.
        </p>
        {/* Preview av et ButikkCard-komponent */}
        <div className="preview-card">
          <ButikkCard
            store={{
              store_id: "1",
              name: "Majorstua",
              store_chain: "Coop Obs",
              address: "Majorstuveien 2, 0353 Oslo",
            }}
            shiftsCount={3}
            interactive={false}
          />
        </div>
      </section>

      {/* SEKSJON 4 – Administrer ansatte */}
      <section className="landing-section alt">
        <h2 className="landing-section-heading">
          <FaClipboardUser className="section-icon" />
          Administrer ansatte
        </h2>
        <p className="landing-section-text">
          Butikksjefer får oversikt over sine ansatte, deres kvalifikasjoner og
          hvilke eksterne ansatte som er interesserte i å jobbe i din kommune.
        </p>
        {/* Preview av to ButikkansattCard-komponenter */}
        <div className="preview-card">
          <ButikkansattCard
            employee={employee}
            cardClass="employee-theme"
            interactive={false}
          />
          <ButikkansattCard
            employee={employee2}
            cardClass="available-theme"
            interactive={false}
          />
        </div>
      </section>

      {/* SLUTTSEKSJON – Kom i gang knapp nederst */}
      <section className="kom-i-gang-container">
        <div className="kom-i-gang-content">
          <h2 className="kom-i-gang-heading">
            Klar for en enklere arbeidshverdag?
          </h2>
          {/* Naviger til innlogging */}
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

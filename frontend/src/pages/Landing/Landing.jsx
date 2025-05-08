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
    first_name: "Sara",
    last_name: "Larsen",
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
        <img src="../../../public/icons/coop-compis-logo-sort.svg" alt="Coop logo" />
        <h1>Velkommen til Coop Compis</h1>
        <p>En enklere måte å koordinere vakter og ansatte i butikkene.</p>
      </section>

      {/* Section 1 – Butikker */}
      <section className="landing-section">
        <h2 className="landing-section-heading">🏬 Butikker</h2>
        <p className="landing-section-text">
          Se alle butikker i Coop Øst, hva de kan tilby og hva de trenger hjelp med.
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
          Når du trenger en vakt fylt, kan du legge den ut, og alle ansatte i Coop Øst med de kvalifikasjonene du trenger vil få den opp og kunne ta den.
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
          Som ansatt kan du velge hvilke kommuner du er interessert i å jobbe i, og ta vakter i de områdene du er kvalifisert for.
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
          Som butikksjef kan du se en oversikt over alle dine ansatte og deres kvalifikasjoner. Du kan også se alle ansatte i Coop Øst som ønsker å jobbe i din kommune.
        </p>
        <div className="preview-card">
          <ButikkansattCard
            employee={employee}
            cardClass="employee-theme"
          />
          <ButikkansattCard
            employee={employee2}
            cardClass="available-theme"
          />
        </div>
      </section>

      {/* Kom i gang knapp på bunnen */}
      <section className="landing-cta">
        <div className="cta-content">
          <h2 className="cta-heading">Er du klar for å komme i gang?</h2>
          <p className="cta-text">Bli med på Coop Compis og effektiviser hvordan du administrerer vakter og ansatte!</p>
          <button
            className="cta-button"
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

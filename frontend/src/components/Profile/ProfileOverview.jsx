import React from "react";

const ProfileOverview = ({ profileData }) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    availability,
    role,
    store_name,
    municipality_name,
    qualifications,
  } = profileData;

  return (
    <div className="profile-overview">
      <h2>Profilinformasjon</h2>

      <p><strong>Navn:</strong> {first_name} {last_name}</p>
      <p><strong>E-post:</strong> {email}</p>
      <p><strong>Telefonnummer:</strong> {phone_number || "Ikke registrert"}</p>

      {role === "employee" && (
        <p><strong>Tilgjengelighet:</strong> {availability || "Ikke oppgitt"}</p>
      )}

      <p><strong>Rolle:</strong> {role === "store_manager" ? "Butikksjef" : "Butikkansatt"}</p>
      <p><strong>Butikk:</strong> {store_name || "Ingen tilknyttet butikk"}</p>
      <p><strong>Kommune:</strong> {municipality_name || "Ikke registrert"}</p>

      {role === "employee" && (
        <div>
          <h3>Kvalifikasjoner:</h3>
          <ul>
            {qualifications?.length > 0 ? (
              qualifications.map((q) => (
                <li key={q.qualification_id}>{q.qualification_name}</li>
              ))
            ) : (
              <li>Ingen kvalifikasjoner</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;

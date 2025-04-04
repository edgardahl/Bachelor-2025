import React from "react";

const ContactInfoEditor = ({ profileData }) => {
  return (
    <div>
      <h2>Kontaktinformasjon</h2>
      <p><strong>Navn:</strong> {profileData.first_name} {profileData.last_name}</p>
      <p><strong>E-post:</strong> {profileData.email}</p>
      <p><strong>Telefonnummer:</strong> {profileData.phone_number}</p>
      <p><strong>Tilgjengelighet:</strong> {profileData.availability}</p>
      <p><strong>Rolle:</strong> {profileData.role === "store_manager" ? "Butikksjef" : "Butikkansatt"}</p>
    </div>
  );
};

export default ContactInfoEditor;

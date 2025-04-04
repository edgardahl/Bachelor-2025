import React, { useState } from "react";

const ContactInfoEditor = ({ profileData, isManager, setUser }) => {
  const [email, setEmail] = useState(profileData.email);
  const [phone, setPhone] = useState(profileData.phone_number);

  const handleSave = async () => {
    const response = await fetch(`/api/users/${profileData.user_id}`, {
      method: "PUT",
      body: JSON.stringify({ email, phone_number: phone }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setUser(data); // Update the user state after saving
  };

  return (
    <div>
      <h2>Contact Information</h2>
      <p>Email: 
        <input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={!isManager} 
        />
      </p>
      <p>Phone Number: 
        <input 
          type="text" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          disabled={!isManager} 
        />
      </p>
      {isManager && <button onClick={handleSave}>Save</button>}
    </div>
  );
};

export default ContactInfoEditor;

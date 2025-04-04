import React, { useState, useEffect } from "react";

const QualificationEditor = ({ employeeId }) => {
  const [qualifications, setQualifications] = useState([]);
  const [newQualification, setNewQualification] = useState("");

  useEffect(() => {
    // Fetch qualifications for the employee
    const fetchQualifications = async () => {
      const response = await fetch(`/api/users/${employeeId}/qualifications`);
      const data = await response.json();
      setQualifications(data);
    };
    fetchQualifications();
  }, [employeeId]);

  const handleAddQualification = async () => {
    const response = await fetch(`/api/users/${employeeId}/qualifications`, {
      method: "POST",
      body: JSON.stringify({ qualification_name: newQualification }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    setQualifications([...qualifications, data]);
    setNewQualification(""); // Clear the input
  };

  return (
    <div>
      <h2>Qualifications</h2>
      <ul>
        {qualifications.map((qual) => (
          <li key={qual.qualification_id}>{qual.qualification_name}</li>
        ))}
      </ul>

      {/* Allow manager to add qualifications */}
      <input
        type="text"
        value={newQualification}
        onChange={(e) => setNewQualification(e.target.value)}
        placeholder="Add new qualification"
      />
      <button onClick={handleAddQualification}>Add Qualification</button>
    </div>
  );
};

export default QualificationEditor;

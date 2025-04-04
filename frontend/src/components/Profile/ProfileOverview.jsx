import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ContactInfoEditor from "../../components/Profile/ContactInfoEditor";
import QualificationEditor from "../../components/Profile/QualificationEditor";  // Only for employees, used by managers to edit qualifications

const ProfileOverview = ({ isManager, user, setUser }) => {
  const { id } = useParams(); // If you're passing the user ID through the URL
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    // Fetch profile data using the ID or user information
    const fetchProfile = async () => {
      // Assuming API call to fetch user profile data by user ID
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();
      setProfileData(data);
    };
    fetchProfile();
  }, [id]);

  if (!profileData) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile Overview</h1>
      {/* Display the profile and provide contact info editing */}
      <ContactInfoEditor profileData={profileData} isManager={isManager} setUser={setUser} />

      {/* Only show qualifications editor if it's a manager viewing an employee */}
      {isManager && profileData.role === 'employee' && (
        <QualificationEditor employeeId={profileData.user_id} />
      )}

      <Link to="/dashboard">Back to Dashboard</Link>
    </div>
  );
};

export default ProfileOverview;

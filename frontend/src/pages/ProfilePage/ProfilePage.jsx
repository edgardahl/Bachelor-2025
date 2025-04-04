import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileOverview from "../../components/Profile/ProfileOverview"; // Import the ProfileOverview component

const ProfilePage = ({ isManager, user, setUser }) => {
  const { id } = useParams(); // Get the user ID from the URL
  const [profileData, setProfileData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch the profile data using the provided ID
        const response = await fetch(`/api/users/${id}`);
        const data = await response.json();

        // If the user is trying to access a profile that doesn't exist, navigate to an error page or redirect
        if (!data) {
          navigate("/error"); // Adjust to your error page
        }

        setProfileData(data); // Set profile data
      } catch (error) {
        console.error("Error fetching profile data:", error);
        navigate("/error"); // Adjust to your error page
      }
    };

    fetchProfileData();
  }, [id, navigate]);

  if (!profileData) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h1>Profile Page</h1>
      <ProfileOverview 
        isManager={isManager} 
        user={user} 
        setUser={setUser} 
        profileData={profileData} 
      />
    </div>
  );
};

export default ProfilePage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileOverview from "../../components/Profile/ProfileOverview";
import axios from "../../api/axiosInstance";
import useAuth from "../../context/UseAuth";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(`/users/${user.id}`);
        setProfileData(res.data);
      } catch (err) {
        console.error("Error fetching user by ID:", err);
        setError("Kunne ikke hente profildata");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [user?.id, navigate]);

  if (error) return <p>{error}</p>;
  if (!profileData) return <p>Laster profildata...</p>;

  return (
    <div className="profile-page">
      <h1>Min profil</h1>
      <ProfileOverview profileData={profileData} />
    </div>
  );
};

export default ProfilePage;

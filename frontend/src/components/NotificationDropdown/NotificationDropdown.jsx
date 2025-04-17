import { useState, useEffect, useRef } from "react";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import useAuth from "../../context/UseAuth";
import axios from "../../api/axiosInstance"; // Ensure axiosInstance is correctly set up
import { useNavigate, useLocation } from "react-router-dom";
import "./NotificationDropdown.css";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unopenedCount, setUnopenedCount] = useState(0);
  const dropdownRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // To listen to location changes

  // Fetch notifications on mount or user ID change
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/notifications/getNotificationByUserId`, {
          params: { userId: user.id },
        });

        // Check if no notifications were found
        if (res.data.message === "No notifications found.") {
          setNotifications([]); // Set an empty array if no notifications
          setUnopenedCount(0); // No unopened notifications
        } else {
          const sortedNotifications = res.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setNotifications(sortedNotifications);
          setUnopenedCount(
            sortedNotifications.filter((notif) => notif.status === "unopened")
              .length
          );
        }
      } catch (err) {
        setError("Kunne ikke hente varsler.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id, location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notification as opened when clicked
  const handleNavigate = async (
    notificationId,
    notificationStatus,
    shiftId
  ) => {
    if (notificationStatus === "unopened") {
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, status: "opened" }
            : notif
        )
      );
      setUnopenedCount((prevCount) => prevCount - 1);

      try {
        await axios.put("/notifications/updateNotificationStatus", {
          notificationId,
          userId: user.id,
        });

        if (user.role === "employee") {
          navigate(`/ba/vakter/detaljer/${shiftId}`);
        } else if (user.role === "store_manager") {
          navigate(`/bs/vakter/detaljer/${shiftId}`);
        }
        setOpen(false);
      } catch (error) {
        console.error("Error updating notification status", error);
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) =>
            notif.notification_id === notificationId
              ? { ...notif, status: "unopened" }
              : notif
          )
        );
        setUnopenedCount((prevCount) => prevCount + 1);
      }
    } else {
      if (user.role === "employee") {
        navigate(`/ba/vakter/detaljer/${shiftId}`);
      } else if (user.role === "store_manager") {
        navigate(`/bs/vakter/detaljer/${shiftId}`);
      }
      setOpen(false);
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button className="notification-icon" onClick={() => setOpen(!open)}>
        <FaBell size={30} />
        {unopenedCount > 0 && (
          <span className="notification-badge">{unopenedCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown">
          {loading ? (
            <div className="loading">Laster varsler...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">Du har ingen varsler</div> // Message when no notifications
          ) : (
            <ul className="notification-list">
              {notifications.map((notif) => (
                <li
                  key={notif.notification_id}
                  onClick={() =>
                    handleNavigate(
                      notif.notification_id,
                      notif.status,
                      notif.shift_id
                    )
                  }
                  className={`notification-item ${
                    notif.status === "unopened" ? "unopened" : ""
                  }`}
                >
                  <div className="notification-title">
                    {notif.title}
                    {notif.status === "unopened" && (
                      <FaCheckCircle className="unopened-tick" size={16} />
                    )}
                  </div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">
                    {new Date(notif.created_at).toLocaleString("no-NO")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

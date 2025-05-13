import { useState, useEffect, useRef } from "react";
import { FaBell, FaTimes } from "react-icons/fa";
import useAuth from "../../context/UseAuth";
import axios from "../../api/axiosInstance";
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
  const location = useLocation();

  // Henter varsler for brukeren ved innlasting og ved ruteendring
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/notifications/user");
        const sorted = Array.isArray(res.data)
          ? res.data.sort(
              (a, b) => new Date(b.created_at) - new Date(a.created_at)
            )
          : [];
        setNotifications(sorted);
        setUnopenedCount(sorted.filter((n) => n.status === "unopened").length);
      } catch {
        setError("Kunne ikke hente varsler.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id, location]);

  // Lukker dropdown når brukeren klikker utenfor
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Marker varsel som åpnet og naviger til vaktdetaljer
  const handleNavigate = async (id, status, shiftId) => {
    if (status === "unopened") {
      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, status: "opened" } : n
        )
      );
      setUnopenedCount((c) => c - 1);
      try {
        await axios.put("/notifications/status/update", {
          notificationId: id,
          userId: user.id,
        });
      } catch {
        // Rull tilbake ved feil
        setNotifications((prev) =>
          prev.map((n) =>
            n.notification_id === id ? { ...n, status: "unopened" } : n
          )
        );
        setUnopenedCount((c) => c + 1);
        return;
      }
    }
    const path =
      user.role === "employee"
        ? `/ba/vakter/detaljer/${shiftId}`
        : `/bs/vakter/detaljer/${shiftId}`;
    navigate(path);
    setOpen(false);
  };

  // Sletter et varsel og oppdaterer uåpnet-teller
  const handleRemoveNotification = async (id) => {
    const wasUnopened = notifications.find(
      (n) => n.notification_id === id && n.status === "unopened"
    );
    setNotifications((prev) =>
      prev.filter((n) => n.notification_id !== id)
    );
    if (wasUnopened) setUnopenedCount((c) => Math.max(0, c - 1));
    try {
      await axios.delete(`/notifications/delete/${id}`);
    } catch {
      // Ignorer slettfeil
    }
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        className="notification-icon"
        onClick={() => setOpen((o) => !o)}
      >
        <FaBell size={35} />
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
            <div className="no-notifications">Du har ingen varsler</div>
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
                    {notif.status === "unopened" && (
                      <span className="unread-indicator" />
                    )}
                    {notif.title}
                    <button
                      className="notification-close"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveNotification(notif.notification_id);
                      }}
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                  <div className="notification-message">{notif.message}</div>
                  <div className="notification-time">
                    {new Date(notif.created_at).toLocaleDateString("no-NO", {
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    {new Date(notif.created_at).toLocaleTimeString("no-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
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

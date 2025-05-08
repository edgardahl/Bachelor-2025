import {
  getNotificationByUserIdModel,
  updateNotificationStatusModel,
  deleteNotificationByIdModel,
} from "../models/notificationModel.js";

// Henter varsler for en spesifikk bruker
export const getNotificationByUserIdController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const notifications = await getNotificationByUserIdModel(userId);

    if (notifications.length === 0) {
      return res.status(200).json({ message: "Ingen varsler funnet." });
    }

    return res.status(200).json(notifications);
  } catch (err) {
    console.error("Feil ved henting av varsler:", err);
    return res.status(500).json({ message: "Kunne ikke hente varsler." });
  }
};

// Oppdaterer statusen til et varsel og markerer det som lest
export const updateNotificationStatusController = async (req, res) => {
  const { notificationId, userId } = req.body;

  try {
    const updatedNotification = await updateNotificationStatusModel(
      notificationId,
      userId
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Varsel ikke funnet." });
    }

    return res.status(200).json({ message: "Varsel markert som lest." });
  } catch (err) {
    console.error("Feil ved oppdatering av varselstatus:", err);
    return res
      .status(500)
      .json({ message: "Kunne ikke oppdatere varselstatus." });
  }
};

// Sletter et varsel
export const deleteNotificationController = async (req, res) => {
  const { notificationId } = req.params;

  try {
    await deleteNotificationByIdModel(notificationId);
    return res.status(200).json({ message: "Varsel slettet." });
  } catch (err) {
    console.error("Feil ved sletting av varsel:", err);
    return res
      .status(500)
      .json({ message: err.message || "Intern serverfeil." });
  }
};

import {
  getShiftsByStoreModel,
  getShiftByIdModel,
  getClaimedShiftsByUserModel,
  claimShiftModel,
  createShiftModel,
  deleteShiftModel,
  getShiftsUserIsQualifiedForModel,
  getShiftByPostedByModel,
  getPreferredQualifiedShiftsModel,
} from "../models/shiftModel.js";
import {
  newShiftPublishedNotificationModel,
  notifyStoreManagerOnShiftClaimedModel,
} from "../models/notificationModel.js";
import { getUserByIdModel } from "../models/userModel.js";
import { getShiftQualificationsModel } from "../models/qualificationModel.js";
import { sanitizeShift } from "../utils/sanitizeInput.js";

// Henter alle vakter i en spesifikk butikk
export const getShiftsByStoreController = async (req, res) => {
  const { store_id } = req.params;
  try {
    const shifts = await getShiftsByStoreModel(store_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter alle vakter publisert av en spesifikk butikksjef (basert på bruker-ID)
export const getShiftByPostedByController = async (req, res) => {
  const { posted_by } = req.params;
  try {
    const shifts = await getShiftByPostedByModel(posted_by);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter en spesifikk vakt basert på vaktens ID
export const getShiftByIdController = async (req, res) => {
  const { shift_id } = req.params;
  try {
    const shift = await getShiftByIdModel(shift_id);
    return res.json(shift);
  } catch (error) {
    console.error("Error fetching shift:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Lar en butikksjef publisere en ny vakt i sin butikk
export const createShiftController = async (req, res) => {
  try {
    const shiftData = req.body;

    // Validerer og renser input
    let sanitizedShiftData;
    try {
      sanitizedShiftData = sanitizeShift(shiftData);
    } catch (sanitizeError) {
      return res
        .status(400)
        .json({ error: { general: sanitizeError.message } });
    }

    if (sanitizedShiftData.errors) {
      return res.status(400).json({ error: sanitizedShiftData.errors });
    }

    // Oppretter vakt og sender varsel til ansatte
    const newShift = await createShiftModel(shiftData);
    const fullShiftData = {
      ...newShift,
      qualifications: shiftData.qualifications,
    };
    await newShiftPublishedNotificationModel(fullShiftData);

    return res.status(201).json({
      message: "Vakt opprettet!",
      shift: newShift,
    });
  } catch (error) {
    console.error("Feil ved oppretting av vakt:", error);
    return res.status(500).json({
      error: "Noe gikk galt under oppretting av vakten.",
    });
  }
};

// Lar en ansatt ta en vakt dersom de har nødvendige kvalifikasjoner
export const claimShiftController = async (req, res) => {
  const { shift_id } = req.params;
  const userId = req.user.userId;

  // Sjekker at vakt-ID er oppgitt
  if (!shift_id) {
    return res.status(400).json({ error: "Shift ID is required." });
  }

  try {
    // Henter kvalifikasjonskrav for vakten og brukerens kvalifikasjoner
    const shiftQualifications = await getShiftQualificationsModel(shift_id);
    const user = await getUserByIdModel(userId);
    const userQualifications = user.qualifications || [];

    // Sammenligner kvalifikasjoner
    const shiftQualificationIds = shiftQualifications.map(
      (q) => q.qualification_id
    );
    const userQualificationIds = userQualifications.map(
      (q) => q.qualification_id
    );
    const hasAllQualifications = shiftQualificationIds.every((id) =>
      userQualificationIds.includes(id)
    );

    if (!hasAllQualifications) {
      return res.status(403).json({
        error:
          "You do not have the required qualifications to claim this shift.",
      });
    }

    // Registrerer at vakten er tatt og sender varsel til butikksjefen
    const claimedShift = await claimShiftModel(shift_id, userId);
    await notifyStoreManagerOnShiftClaimedModel(shift_id, userId);

    return res.json({
      ...claimedShift,
      claimed_by_first_name: user.first_name,
      claimed_by_last_name: user.last_name,
      claimed_by_email: user.email,
      claimed_by_phone: user.phone_number,
    });
  } catch (error) {
    console.error("Error claiming shift:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Lar en butikksjef slette en vakt de selv har publisert
export const deleteShiftController = async (req, res) => {
  const { shiftId, shiftStoreId } = req.body;

  // Sjekker at innlogget butikksjef er tilknyttet butikken som eier vakten
  if (shiftStoreId !== req.user.storeId) {
    return res.status(403).json({
      error: "Du har ikke tillatelse til å slette denne vakten.",
    });
  }

  try {
    const deletedShift = await deleteShiftModel(shiftId);
    return res.json({
      message: "Vakt slettet.",
      deletedShift,
    });
  } catch (error) {
    console.error("Feil ved sletting av vakt:", error);
    return res.status(500).json({
      error: "Noe gikk galt under sletting av vakten.",
    });
  }
};

// Henter alle vakter som er blitt tatt (claimed) av den innloggede brukeren
export const getClaimedShiftsByUserController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const shifts = await getClaimedShiftsByUserModel(userId);
    return res.json({ data: shifts });
  } catch (error) {
    console.error("Error fetching claimed shifts for user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter vakter ansatten er kvalifisert for
export const getShiftsUserIsQualifiedForController = async (req, res) => {
  const user_id = req.user.userId;

  try {
    const shifts = await getShiftsUserIsQualifiedForModel(user_id);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Henter vakter i kommuner ansatten har valgt som foretrukket å jobbe i
export const getPreferredQualifiedShiftsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const shifts = await getPreferredQualifiedShiftsModel(userId);
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching preferred shifts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Henter vakter i en valgt kommune som ansatten er kvalifisert for
export const getRequestedQualifiedShiftsController = async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await getUserByIdModel(userId);

    // Henter ønskede kommuner fra brukerprofil
    const municipalityIds = user?.municipalities?.map((m) => m.municipality_id);

    if (!municipalityIds || municipalityIds.length === 0) {
      return res
        .status(400)
        .json({ error: "User has no associated municipalities." });
    }

    const shifts = await getRequestedQualifiedShiftsModel(
      userId,
      municipalityIds
    );
    return res.json(shifts);
  } catch (error) {
    console.error("Error fetching requested municipality shifts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

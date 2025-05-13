import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";
import {
  registerUserInDB,
  insertUserQualifications,
  getUserByEmail,
  getUserById,
  getUserBasicById,
  getUserByPhoneNumber,
} from "../models/authModel.js";
import { getUserQualificationsModel } from "../models/userModel.js";

import { getStoreByIdModel, updateStoreModel } from "../models/storeModel.js";
import { sanitizeUser } from "../utils/sanitizeInput.js";

// Logger inn bruker og returnerer access + refresh token i tillegg til brukerinfo
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Feil e-post eller passord." });
    }

    // Sammenligner oppgitt passord med hashet passord i databasen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Feil e-post eller passord." });
    }

    const userQualifications = await getUserQualificationsModel([user.user_id]);
    const qualificationIds = userQualifications.map((q) => q.qualification_id);

    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
      user_qualifications: qualificationIds,
    });

    const refreshToken = generateRefreshToken({
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
      user_qualifications: qualificationIds,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.first_name,
        role: user.role,
        storeId: user.store_id,
        user_qualifications: qualificationIds,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Intern serverfeil" });
  }
};

// Oppretter nytt access token basert på gyldig refresh token
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);

  try {
    // Verifiserer refresh-token og henter bruker
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await getUserBasicById(decoded.userId);
    if (!user) return res.sendStatus(403);

    const userQualifications = await getUserQualificationsModel([user.user_id]);
    const qualificationIds = userQualifications.map((q) => q.qualification_id);

    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: decoded.role,
      storeId: decoded.storeId,
      user_qualifications: qualificationIds,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.sendStatus(403);
  }
};

// Returnerer informasjon om innlogget bruker (basert på access token)
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "Bruker ikke funnet." });
    }

    res.json({
      user: {
        id: user.user_id,
        email: user.email,
        name: user.first_name,
        role: user.role,
        storeId: user.store_id,
        user_qualifications: user.user_qualifications,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ error: "Ugyldig token." });
  }
};

// Registrerer ny ansatt (kun tilgjengelig for butikksjefer)
export const registerNewEmployeeController = async (req, res) => {
  try {
    const storeManager = req.user;

    const sanitizedData = {
      ...req.body,
      role: "employee",
      availability: "Ikke-fleksibel",
      store_id: storeManager.storeId,
    };

    let sanitizedUserData;
    try {
      sanitizedUserData = sanitizeUser(sanitizedData);
    } catch (sanitizeError) {
      return res
        .status(400)
        .json({ error: { general: sanitizeError.message } });
    }

    if (sanitizedUserData.errors) {
      return res.status(400).json({ error: sanitizedUserData.errors });
    }

    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      availability,
      role,
      store_id,
      municipality_id,
      qualifications,
    } = sanitizedUserData;

    // Rolle sjekk
    if (storeManager.role !== "store_manager") {
      return res.status(403).json({ error: "Ikke autorisert." });
    }

    if (!storeManager.storeId) {
      return res.status(403).json({ error: "Ingen tilknyttede butikker." });
    }

    // Unikhetsvalidering
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: { email: "E-postadressen er allerede i bruk." } });
    }

    const existingPhone = await getUserByPhoneNumber(phone_number);
    if (existingPhone) {
      return res.status(400).json({
        error: { phone_number: "Telefonnummeret er allerede i bruk." },
      });
    }

    // Hasher passord før lagring
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await registerUserInDB({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone_number,
      availability,
      role,
      store_id,
      municipality_id,
    });

    if (!newUser) {
      return res
        .status(400)
        .json({ error: { general: "Kunne ikke registrere bruker." } });
    }

    // Lagrer kvalifikasjoner hvis valgt
    if (qualifications?.length > 0) {
      const inserted = await insertUserQualifications(
        newUser.user_id,
        qualifications
      );
      if (!inserted) {
        return res
          .status(400)
          .json({ error: { general: "Kunne ikke lagre kvalifikasjoner." } });
      }
    }

    return res.status(201).json({
      message: "Ansatt registrert.",
      user: newUser,
    });
  } catch (error) {
    console.error("Register new employee error:", error);

    if (error.message) {
      return res.status(400).json({ error: { general: error.message } });
    }

    return res.status(400).json({
      error: {
        first_name: "First name must only contain letters and cannot be empty.",
        email: "Email format is incorrect.",
        password: "Password must be at least 6 characters long.",
        phone_number: "Phone number is invalid.",
      },
    });
  }
};

// Registrerer ny butikksjef (kun for admin), og knytter til butikk hvis oppgitt
export const registerNewManagerController = async (req, res) => {
  try {
    const data = {
      ...req.body,
      role: "store_manager",
      availability: "Ikke-fleksibel",
    };

    let sanitizedUserData;
    try {
      sanitizedUserData = sanitizeUser(data);
    } catch (sanitizeError) {
      return res
        .status(400)
        .json({ error: { general: sanitizeError.message } });
    }

    if (sanitizedUserData.errors) {
      return res.status(400).json({ error: sanitizedUserData.errors });
    }

    const {
      first_name,
      last_name,
      email,
      password,
      phone_number,
      availability,
      role,
      store_id,
      municipality_id,
    } = sanitizedUserData;

    // Unikhetsvalidering
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: { email: "E-postadressen er allerede i bruk." },
      });
    }

    const existingPhone = await getUserByPhoneNumber(phone_number);
    if (existingPhone) {
      return res.status(400).json({
        error: { phone_number: "Telefonnummeret er allerede i bruk." },
      });
    }

    // Hasher passord før lagring
    const hashedPassword = await bcrypt.hash(password, 10);

    const newManager = await registerUserInDB({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone_number,
      availability,
      role,
      store_id: store_id === "" ? null : store_id,
      municipality_id,
    });

    if (!newManager) {
      return res
        .status(400)
        .json({ error: { general: "Kunne ikke registrere butikksjef." } });
    }

    // Oppdater butikkens manager hvis `store_id` ble gitt
    if (store_id && store_id !== "") {
      const store = await getStoreByIdModel(store_id);

      if (store) {
        try {
          // Trekker ut postnummer og butikknavn fra adressestreng
          const [addressPart, postalCodePart] = store.address
            .split(",")
            .map((part) => part.trim());
          const postal_code = postalCodePart?.split(" ")[0] || "";
          const store_name =
            postalCodePart?.split(" ").slice(1).join(" ") || "";

          await updateStoreModel(store_id, {
            ...store,
            address: addressPart,
            postal_code,
            store_name,
            manager_id: newManager.user_id,
          });
        } catch (updateError) {
          console.error("Feil ved oppdatering av butikk:", updateError.message);
          return res.status(500).json({
            error: {
              general:
                "Butikksjef ble opprettet, men butikken kunne ikke oppdateres.",
            },
          });
        }
      }
    }

    return res.status(201).json({
      message: "Butikksjef registrert.",
      user: newManager,
    });
  } catch (error) {
    console.error("Register new manager error:", error);

    if (error.message) {
      return res.status(400).json({ error: { general: error.message } });
    }

    return res.status(400).json({
      error: {
        first_name: "Fornavn må kun inneholde bokstaver og kan ikke være tomt.",
        email: "E-postformat er ugyldig.",
        password: "Passord må være minst 6 tegn.",
        phone_number: "Telefonnummeret er ugyldig.",
      },
    });
  }
};

// Logger ut bruker ved å fjerne refresh-token-cookie
export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  res.json({ message: "Du er logget ut." });
};

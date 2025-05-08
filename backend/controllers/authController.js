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
  insertUserMunicipalitiesModel,
} from "../models/authModel.js";
import { getUserQualificationsModel } from "../models/userModel.js";
import { sanitizeUser } from "../utils/sanitizeInput.js";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Feil e-post eller passord." });
    }

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
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("userinfo stored in cookie:", {
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
      user_qualifications: qualificationIds,
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

export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204); // Ingen feilmelding til frontend

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await getUserBasicById(decoded.userId);
    if (!user) return res.sendStatus(403); // Ingen feilmelding til frontend

    const userQualifications = await getUserQualificationsModel([user.user_id]);
    const qualificationIds = userQualifications.map((q) => q.qualification_id);
    console.log("userqualifications in refresh:", userQualifications);

    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: decoded.role,
      storeId: decoded.storeId,
      user_qualifications: qualificationIds,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.sendStatus(403); // Ingen feilmelding til frontend
  }
};

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

export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  res.json({ message: "Du er logget ut." });
};

export const registerUser = async (req, res) => {
  try {
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
      work_municipality_ids,
    } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "E-postadressen er allerede i bruk." });
    }

    const existingPhoneNumber = await getUserByPhoneNumber(phone_number);
    if (existingPhoneNumber) {
      return res
        .status(400)
        .json({ error: "Telefonnummeret er allerede i bruk." });
    }

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
      return res.status(400).json({ error: "Kunne ikke registrere bruker." });
    }

    if (qualifications && qualifications.length > 0) {
      const inserted = await insertUserQualifications(
        newUser.user_id,
        qualifications
      );
      if (!inserted) {
        return res
          .status(400)
          .json({ error: "Kunne ikke lagre kvalifikasjoner." });
      }
    }

    if (role === "employee") {
      const municipalitiesToInsert = new Set([
        municipality_id, // bosted
        ...(work_municipality_ids || []), // ønskede
      ]);

      console.log("Municipalities to insert:", municipalitiesToInsert);

      const success = await insertUserMunicipalitiesModel(
        newUser.user_id,
        Array.from(municipalitiesToInsert)
      );

      if (!success) {
        return res
          .status(400)
          .json({ error: "Kunne ikke lagre ønskede kommuner." });
      }
    }

    return res.status(201).json({
      message: "Bruker registrert.",
      user: newUser,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Intern serverfeil" });
  }
};

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

    console.log("Sanitize data after", sanitizedUserData);

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

    if (storeManager.role !== "store_manager") {
      return res.status(403).json({ error: "Ikke autorisert." });
    }

    if (!storeManager.storeId) {
      return res.status(403).json({ error: "Ingen tilknyttede butikker." });
    }

    const existingUser = await getUserByEmail(email);
    console.log("Existing user:", existingUser);
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

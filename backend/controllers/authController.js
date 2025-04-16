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
import { insertDefaultWorkMunicipality } from "../models/userModel.js";

// 🟢 Login User
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

    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
    });

    const refreshToken = generateRefreshToken({
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Intern serverfeil" });
  }
};

// 🔄 Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204); // Ingen feilmelding til frontend

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await getUserBasicById(decoded.userId);
    if (!user) return res.sendStatus(403); // Ingen feilmelding til frontend

    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: decoded.role,
      storeId: decoded.storeId,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.sendStatus(403); // Ingen feilmelding til frontend
  }
};

// 👤 Get Current User
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
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ error: "Ugyldig token." });
  }
};

// 🚪 Logout User
export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  res.json({ message: "Du er logget ut." });
};

// 📝 Register User
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
    } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "E-postadressen er allerede i bruk." });
    }

    const existingPhoneNumber = await getUserByPhoneNumber(phone_number);
    if (existingPhoneNumber) {
      return res.status(400).json({ error: "Telefonnummeret er allerede i bruk." });
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
      const inserted = await insertUserQualifications(newUser.user_id, qualifications);
      if (!inserted) {
        return res.status(400).json({ error: "Kunne ikke lagre kvalifikasjoner." });
      }
    }

    if (role === "employee" && municipality_id) {
      await insertDefaultWorkMunicipality(newUser.user_id, municipality_id);
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
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import {
  registerUserInDB,
  insertUserQualifications,
  getUserByEmail,
  getUserById,
  getUserBasicById,
  updateUserById,
  getUserByPhoneNumber
} from "../models/authModel.js";

// 🟢 Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    console.log("FROM GET BY EMAIL", user);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });
    const accessToken = generateAccessToken({ userId: user.user_id, role: user.role, storeId: user.store_id });
    const refreshToken = generateRefreshToken({ userId: user.user_id, role: user.role, storeId: user.store_id });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", /* If you're deploying the frontend (e.g., on Vercel) and backend (e.g., on Render) on different domains,
                                                                           change "strict" to "none" and also set `secure: true` to allow cross-site cookies.
                                                                          */
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
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔄 Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(400).json({ error: "Token not provided" }); // Updated error message for missing token

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await getUserBasicById(decoded.userId);

    if (!user) return res.status(401).json({ error: "Invalid token user" });

    const accessToken = generateAccessToken({ userId: user.user_id, role: decoded.role, storeId: decoded.storeId });
    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// 👤 Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;  // This comes from the token, added by the verifyToken middleware
    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
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
    res.status(401).json({ error: "Invalid token" });
  }
};

// 🔒 Update Profile
export const updateOwnProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(400).json({ error: "Token not provided" }); // Updated error message for missing token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const sanitizedData = sanitizeUserInput(req.body);
    const updatedUser = await updateUserById(userId, sanitizedData);

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({
      id: updatedUser.user_id,
      email: updatedUser.email,
      name: updatedUser.first_name,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
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

  res.json({ message: "Logged out successfully" });
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

    // Check if the email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Check if the phone number already exists
    const existingPhoneNumber = await getUserByPhoneNumber(phone_number);
    if (existingPhoneNumber) {
      return res.status(400).json({ error: "Phone number is already in use" });
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
      return res.status(400).json({ error: "Failed to register user" });
    }

    if (qualifications && qualifications.length > 0) {
      const qualificationsInserted = await insertUserQualifications(
        newUser.user_id,
        qualifications
      );

      if (!qualificationsInserted) {
        return res.status(400).json({ error: "Failed to insert qualifications" });
      }
    }

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



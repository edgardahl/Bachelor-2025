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

// 🟢 Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Step 1: Get the user from the database by email
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Step 2: Compare the password provided with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" }); // Return error for wrong password
    }

    // Step 3: Generate the access token and refresh token
    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
    });

    console.log("Generated access token 1:", accessToken);

    const refreshToken = generateRefreshToken({
      userId: user.user_id,
      role: user.role,
      storeId: user.store_id,
    });
    console.log("Generated refresh token 1:", refreshToken);

    // Step 4: Set the refresh token in an HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite:
        process.env.NODE_ENV === "production"
          ? "strict"
          : "lax" /* If you're deploying the frontend (e.g., on Vercel) and backend (e.g., on Render) on different domains,
      change "strict" to "none" and also set `secure: true` to allow cross-site cookies.
     */,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // Refresh token expiration (7 days)
    });

    const responsePayload = {
      accessToken,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.first_name,
        role: user.role,
        storeId: user.store_id,
      },
    };
    
    console.log("Login response:", responsePayload); // 👈 Log before sending
    
    res.json(responsePayload);
    
    
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
    console.log("Decoded refresh token:", decoded);
    const user = await getUserBasicById(decoded.userId);

    if (!user) return res.status(401).json({ error: "Invalid token user" });

    const accessToken = generateAccessToken({
      userId: user.user_id,
      role: decoded.role,
      storeId: decoded.storeId,
    });
    console.log("Generated access token:", accessToken);
    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// 👤 Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId; // This comes from the token, added by the verifyToken middleware
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
        return res
          .status(400)
          .json({ error: "Failed to insert qualifications" });
      }
    }

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new passwords are required." });
  }

  try {
    const user = await getUserWithPasswordById(userId); // Must return user with `password` field

    if (!user || !user.password) {
      return res.status(404).json({ error: "User not found or missing password." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updated = await updateUserById(userId, { password: hashedNewPassword });

    if (!updated) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    return res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

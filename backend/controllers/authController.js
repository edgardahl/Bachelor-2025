import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; // Use bcryptjs for password comparison
import { supabase } from "../config/supabaseClient.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import { registerUserInDB, insertUserQualifications} from "../models/authModel.js";

// 🟢 Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // ✅ Find user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, name") // Include only necessary fields
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // ✅ Send refresh token as HTTP-only cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🔄 Refresh Access Token
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "Missing refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // ✅ Fetch user from database
    const { data: user, error } = await supabase.from("users").select("id").eq("id", decoded.userId).single();
    if (error || !user) return res.status(401).json({ error: "Invalid token user" });

    // ✅ Generate new access token
    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// 👤 Get Current User
export const getCurrentUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch user from database
    const { data: user, error } = await supabase.from("users").select("id, email, name").eq("id", decoded.userId).single();
    if (error || !user) return res.status(404).json({ error: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// 🔒 Update Profile
export const updateOwnProfile = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const sanitizedData = sanitizeUserInput(req.body);

    // ✅ Update user in database
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update(sanitizedData)
      .eq("id", userId)
      .select("id, email, name")
      .single();

    if (error || !updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🚪 Logout User
export const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh-token",
  });
  res.json({ message: "Logged out successfully" });
};


// 📝 Register User
export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone_number, availability, role, store_id, municipality_id, qualifications } = req.body;

    console.log("Received registration data:", req.body);

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Call the model function to insert the user into DB
    const newUser = await registerUserInDB({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone_number,
      availability,
      role,
      store_id,
      municipality_id
    });

    if (!newUser) {
      return res.status(400).json({ error: "Failed to register user" });
    }

    // ✅ Insert the qualifications into the user_qualifications junction table
    if (qualifications && qualifications.length > 0) {
      const qualificationsInserted = await insertUserQualifications(newUser.user_id, qualifications);

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
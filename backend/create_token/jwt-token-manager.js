import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// For user: Simen Elvhaug (store manager)
const token = jwt.sign(
  { userId: "d0d51865-ffb8-4fe2-ad72-e13feb0f9d33", role: "store_manager" }, // Ensure role is included
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

console.log("Generated Token:", token);

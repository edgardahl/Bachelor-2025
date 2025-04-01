import jwt from "jsonwebtoken";

// For user: Simen Elvhaug
const token = jwt.sign(
  { userId: "d0d51865-ffb8-4fe2-ad72-e13feb0f9d33", role: "store_manager" }, // Ensure role is included
  "dkiwx3n2ehl4tcu1ir0k119pe6qpjf7w",
  { expiresIn: "1h" }
);

console.log("Generated Token:", token);

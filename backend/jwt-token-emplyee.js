import jwt from "jsonwebtoken";

// For user: Simen Elvhaug
const token = jwt.sign(
  { userId: "50de70e9-9385-403c-b77c-9d2c37bb8d5b", role: "employee" }, // Ensure role is included
  "dkiwx3n2ehl4tcu1ir0k119pe6qpjf7w",
  { expiresIn: "1h" }
);

console.log("Generated Token:", token);

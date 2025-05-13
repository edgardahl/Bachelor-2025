import jwt from "jsonwebtoken";

// Middleware for å verifisere JWT-token fra Authorization-header
export const verifyToken = (req, res, next) => {
  // Henter Authorization-header og trekker ut token ("Bearer <token>")
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  // Returnerer 401 hvis ingen token ble gitt
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // Verifiserer token og legger brukerinfo inn i req.user for videre bruk
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      storeId: decoded.storeId,
      user_qualifications: decoded.user_qualifications,
    };
    next(); // Går videre til neste middleware eller route handler
  } catch (err) {
    // Returnerer 401 hvis token er ugyldig eller utløpt
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Middleware for å begrense tilgang basert på roller
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    // Returnerer 403 hvis brukeren ikke har en rolle
    if (!userRole) {
      return res.status(403).json({ error: "Forbidden: No role assigned" });
    }

    // Tillater alltid admin, eller hvis brukerens rolle er en av de tillatte
    if (userRole === "admin" || allowedRoles.includes(userRole)) {
      return next();
    }

    // Returnerer 403 hvis rollen ikke har tilgang
    return res
      .status(403)
      .json({ error: "Forbidden: Insufficient permissions" });
  };
};

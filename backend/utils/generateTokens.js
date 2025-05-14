import jwt from "jsonwebtoken";

/**
 * Genererer et access token for brukeren.
 * Brukes til autentisering ved hver API-forespørsel og varer i 15 minutter.
 * Inkluderer informasjon om brukerens ID, rolle, butikk og kvalifikasjoner.
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      role: user.role,
      storeId: user.storeId,
      user_qualifications: user.user_qualifications,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

/**
 * Genererer et refresh token for brukeren.
 * Brukes til å hente et nytt access token når det gamle utløper (uten at brukeren logger inn på nytt).
 * Varer i 7 dager og inneholder samme payload som access token.
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.userId,
      role: user.role,
      storeId: user.storeId,
      user_qualifications: user.user_qualifications,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

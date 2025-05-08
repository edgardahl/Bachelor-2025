import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  console.log("generateAccessToken", user);
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

export const generateRefreshToken = (user) => {
  console.log("generateRefreshToken", user);
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

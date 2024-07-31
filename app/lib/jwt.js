import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (e) {
    return null;
  }
};

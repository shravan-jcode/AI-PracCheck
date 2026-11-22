
import jwt from "jsonwebtoken";
import { getCookieOptions } from "./cookieOptions.js";

export const generateToken = (res, user, message) => {

  // Step 1: Create JWT token
  const token = jwt.sign(
    { userId: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  // Step 2: Get cookie settings
  const cookieOptions = getCookieOptions();

  // Step 3: Set cookie expiration (7 days)
  cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;

  // Step 4: Send token in cookie and response
  res.cookie("token", token, cookieOptions);

  return res.status(200).json({
    success: true,
    message: message,
    user: user
  });
};

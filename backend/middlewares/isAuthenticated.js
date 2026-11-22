import jwt from "jsonwebtoken";
import User from "../models/user.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const decode = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findById(decode.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or inactive"
      });
    }

    req.id = user._id;
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

export default isAuthenticated;
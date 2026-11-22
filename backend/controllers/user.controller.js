import User from "../models/user.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided."
      });
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid data."
      });
    }

    if (!["student", "teacher"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role."
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email."
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters."
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully."
    });

  } catch (error) {
    console.log(error);

    // Two requests with the same email at the same moment
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to register."
    });
  }
};


// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password."
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password."
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive."
      });
    }

    // Never send password hash to frontend
    const safeUser = user.toObject();
    delete safeUser.password;

    return generateToken(res, safeUser, `Welcome back ${user.name}`);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to login."
    });
  }
};


// LOGOUT
// LOGOUT
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .clearCookie("token", getCookieOptions())
      .json({
        success: true,
        message: "Logged out successfully."
      });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to logout."
    });
  }
};


// GET PROFILE
// isAuthenticated already loaded the user, so we just send it back
export const getUserProfile = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  });
};


// UPDATE PROFILE (only the name can be changed)
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.id,
      { name: name.trim() },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile."
    });
  }
};


// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required."
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters."
      });
    }

    const user = await User.findById(req.id).select("+password");

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect."
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully."
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to change password."
    });
  }
};
import express from "express";

import {
  changePassword,
  getUserProfile,
  login,
  logout,
  register,
  updateProfile
} from "../controllers/user.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateProfile);
router.put("/change-password", isAuthenticated, changePassword);

export default router;
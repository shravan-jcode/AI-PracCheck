import express from "express";

import {
  createSubject,
  getEnrolledStudents,
  getMySubjects,
  getSubjectById,
  joinSubject,
  regenerateJoiningCode,
  removeStudent,
  updateSubject
} from "../controllers/subject.controller.js";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";

const router = express.Router();

// All subject routes need a logged-in user
router.use(isAuthenticated);

router.post("/", authorizeRoles("teacher"), createSubject);
router.get("/", getMySubjects);

router.post("/join", authorizeRoles("student"), joinSubject);

router.get("/:id", getSubjectById);
router.put("/:id", authorizeRoles("teacher"), updateSubject);

router.get("/:id/students", authorizeRoles("teacher"), getEnrolledStudents);
router.delete("/:id/students/:studentId", authorizeRoles("teacher"), removeStudent);

router.put("/:id/regenerate-code", authorizeRoles("teacher"), regenerateJoiningCode);

export default router;
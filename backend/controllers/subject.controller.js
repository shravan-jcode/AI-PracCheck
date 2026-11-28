import mongoose from "mongoose";
import Subject from "../models/subject.js";
import { generateJoiningCode } from "../utils/generateJoiningCode.js";

// Helper: find a subject only if it belongs to this teacher
const getOwnedSubject = async (subjectId, teacherId) => {
  if (!mongoose.isValidObjectId(subjectId)) {
    return null;
  }

  return await Subject.findOne({ _id: subjectId, teacher: teacherId });
};


// CREATE SUBJECT (teacher)
export const createSubject = async (req, res) => {
  try {
    const { name, subjectCode, description, college, department, year } = req.body;

    if (!name || !college || !department || !year) {
      return res.status(400).json({
        success: false,
        message: "Name, college, department and year are required."
      });
    }

    const joiningCode = await generateJoiningCode();

    const subject = await Subject.create({
      name,
      subjectCode,
      description,
      college,
      department,
      year,
      teacher: req.id,
      joiningCode
    });

    return res.status(201).json({
      success: true,
      message: "Subject created successfully.",
      subject
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create subject."
    });
  }
};


// GET MY SUBJECTS (teacher: created ones, student: joined ones)
export const getMySubjects = async (req, res) => {
  try {
    if (req.user.role === "teacher") {
      const subjects = await Subject.find({ teacher: req.id })
        .sort({ createdAt: -1 })
        .lean();

      // Send the number of students instead of the whole student list
      const result = subjects.map((subject) => {
        const { students, ...rest } = subject;
        return { ...rest, studentCount: students.length };
      });

      return res.status(200).json({
        success: true,
        subjects: result
      });
    }

    // Student: hide joining code and other students
    const subjects = await Subject.find({ "students.student": req.id })
      .select("-students -joiningCode")
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      subjects
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subjects."
    });
  }
};


// GET ONE SUBJECT (owner teacher or enrolled student)
export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    const subject = await Subject.findById(id)
      .populate("teacher", "name email")
      .lean();

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    const { students, ...rest } = subject;

    // Teacher who owns the subject
    if (subject.teacher._id.toString() === req.id.toString()) {
      return res.status(200).json({
        success: true,
        subject: { ...rest, studentCount: students.length }
      });
    }

    // Student who joined the subject
    const enrollment = students.find(
      (s) => s.student.toString() === req.id.toString()
    );

    if (enrollment) {
      delete rest.joiningCode; // students must not see the code

      return res.status(200).json({
        success: true,
        subject: { ...rest, myRollNumber: enrollment.rollNumber }
      });
    }

    // Same message for "no access" so we don't reveal that it exists
    return res.status(404).json({
      success: false,
      message: "Subject not found."
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load subject."
    });
  }
};


// UPDATE SUBJECT (teacher who owns it)
export const updateSubject = async (req, res) => {
  try {
    const subject = await getOwnedSubject(req.params.id, req.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    const { name, subjectCode, description, college, department, year } = req.body;

    // Only change the fields that were sent
    if (name) subject.name = name;
    if (subjectCode !== undefined) subject.subjectCode = subjectCode;
    if (description !== undefined) subject.description = description;
    if (college) subject.college = college;
    if (department) subject.department = department;
    if (year) subject.year = year;

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Subject updated successfully.",
      subject
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update subject."
    });
  }
};


// JOIN SUBJECT (student)
export const joinSubject = async (req, res) => {
  try {
    const { joiningCode, rollNumber } = req.body;

    if (!joiningCode || !rollNumber) {
      return res.status(400).json({
        success: false,
        message: "Joining code and roll number are required."
      });
    }

    if (typeof joiningCode !== "string" || typeof rollNumber !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid data."
      });
    }

    const subject = await Subject.findOne({
      joiningCode: joiningCode.trim().toUpperCase()
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Invalid joining code."
      });
    }

    const cleanRollNumber = rollNumber.trim();

    const alreadyJoined = subject.students.some(
      (s) => s.student.toString() === req.id.toString()
    );

    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "You have already joined this subject."
      });
    }

    const rollNumberTaken = subject.students.some(
      (s) => s.rollNumber.toLowerCase() === cleanRollNumber.toLowerCase()
    );

    if (rollNumberTaken) {
      return res.status(400).json({
        success: false,
        message: "This roll number is already used in this subject."
      });
    }

    subject.students.push({
      student: req.id,
      rollNumber: cleanRollNumber
    });

    await subject.save();

    return res.status(200).json({
      success: true,
      message: `You joined ${subject.name}.`,
      subjectId: subject._id
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to join subject."
    });
  }
};


// GET ENROLLED STUDENTS (teacher who owns it)
export const getEnrolledStudents = async (req, res) => {
  try {
    const subject = await getOwnedSubject(req.params.id, req.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    await subject.populate("students.student", "name email");

    const students = subject.students.map((s) => ({
      studentId: s.student._id,
      name: s.student.name,
      email: s.student.email,
      rollNumber: s.rollNumber,
      joinedAt: s.joinedAt
    }));

    // Sort by roll number (1, 2, 10 instead of 1, 10, 2)
    students.sort((a, b) =>
      a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
    );

    return res.status(200).json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load students."
    });
  }
};


// REMOVE A STUDENT (teacher who owns it)
export const removeStudent = async (req, res) => {
  try {
    const subject = await getOwnedSubject(req.params.id, req.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    const { studentId } = req.params;

    const studentExists = subject.students.some(
      (s) => s.student.toString() === studentId
    );

    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this subject."
      });
    }

    subject.students = subject.students.filter(
      (s) => s.student.toString() !== studentId
    );

    await subject.save();

    return res.status(200).json({
      success: true,
      message: "Student removed from the subject."
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove student."
    });
  }
};


// REGENERATE JOINING CODE (teacher who owns it)
export const regenerateJoiningCode = async (req, res) => {
  try {
    const subject = await getOwnedSubject(req.params.id, req.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found."
      });
    }

    subject.joiningCode = await generateJoiningCode();
    await subject.save();

    return res.status(200).json({
      success: true,
      message: "New joining code generated.",
      joiningCode: subject.joiningCode
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate new code."
    });
  }
};
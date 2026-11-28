import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    subjectCode: {
      type: String,
      trim: true // optional, e.g. DBMS-SEM4
    },
    description: {
      type: String,
      trim: true
    },
    college: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: String,
      required: true,
      trim: true // e.g. "2nd Year / Semester 4"
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    joiningCode: {
      type: String,
      required: true,
      unique: true
    },
    students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        rollNumber: {
          type: String,
          required: true,
          trim: true
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

// Makes "find subjects joined by this student" fast
subjectSchema.index({ "students.student": 1 });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;
import mongoose from "mongoose"

const subjectSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Everything below is entered ONLY by the teacher
    name: { type: String, required: true, trim: true },
    subjectCode: { type: String, required: true, trim: true }, // e.g. DBMS-SEM4
    description: { type: String, trim: true },
    collegeName: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    course: { type: String, trim: true },       // e.g. B.Tech CSE
    className: { type: String, trim: true },    // e.g. SE-A
    semester: { type: String, trim: true },     // e.g. 4
    academicYear: { type: String, trim: true }, // e.g. 2026-27

    // Joining code
    joiningCode: { type: String, required: true, unique: true, index: true },
    joiningCodeActive: { type: Boolean, default: true },

    // Completion report settings
    completionRules: {
      requireAllMandatoryApproved: { type: Boolean, default: true },
      minApprovedCount: { type: Number, default: 0 }, // 0 = ignore
    },
    reportEnabled: { type: Boolean, default: false },

    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
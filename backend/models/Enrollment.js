import mongoose from "mongoose"

const enrollmentSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["active", "removed"], default: "active" },
    joinedAt: { type: Date, default: Date.now },
    removedAt: { type: Date },
  },
  { timestamps: true }
);

// A student can join a subject only once
enrollmentSchema.index({ subject: 1, student: 1 }, { unique: true });
enrollmentSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
import mongoose from "mongoose"

const reviewSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true, index: true },
    versionNumber: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    aiAnalysis: { type: mongoose.Schema.Types.ObjectId, ref: "AiAnalysis" }, // optional

    decision: {
      type: String,
      enum: ["approved", "revision_required", "rejected", "comment_only"],
      required: true,
    },

    aiDraftFeedback: String,   // AI suggestion (never auto-sent)
    finalFeedback: String,     // teacher-approved, visible to student
    privateTeacherNotes: String, // teacher-only

    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
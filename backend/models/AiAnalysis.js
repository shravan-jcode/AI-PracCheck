import mongoose from "mongoose"

const resultSchema = new mongoose.Schema(
  {
    criterionId: mongoose.Schema.Types.ObjectId,
    criterion: String,
    finding: {
      type: String,
      enum: ["appears_satisfied", "appears_missing", "partially_present", "unclear"],
    },
    explanation: String,
    evidence: [{ page: Number, description: String }],
    confidence: { type: String, enum: ["low", "medium", "high"] },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission", required: true, index: true },
    practical: { type: mongoose.Schema.Types.ObjectId, ref: "Practical", required: true },
    versionNumber: { type: Number, required: true },   // which submission version
    criteriaVersion: { type: Number, required: true }, // which criteria version was used

    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["teacher_review", "student_readiness_check"], default: "teacher_review" },

    status: { type: String, enum: ["running", "completed", "failed"], default: "running" },
    results: [resultSchema],
    overallSummary: String,
    requiresTeacherAttention: Boolean,

    modelName: String,
    errorMessage: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AiAnalysis", aiAnalysisSchema);
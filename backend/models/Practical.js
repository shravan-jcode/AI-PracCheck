import mongoose from "mongoose"

const referenceFileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storageKey: { type: String, required: true }, // cloud path / URL (storage still to be decided)
    mimeType: String,
    sizeBytes: Number,
    useForAiEvaluation: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const criterionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    required: { type: Boolean, default: true },
    evidenceTypes: [{ type: String, enum: ["text", "image", "table", "diagram", "code", "other"] }],
    assessmentMode: { type: String, enum: ["ai_assisted", "manual_only"], default: "ai_assisted" },
  },
  { _id: true }
);

const criteriaVersionSchema = new mongoose.Schema(
  {
    version: { type: Number, required: true },
    criteria: [criterionSchema],
    source: { type: String, enum: ["ai_suggested", "manual"], default: "manual" },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    confirmedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const practicalSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    practicalNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    aim: { type: String, trim: true },
    instructions: { type: String, trim: true },
    isMandatory: { type: Boolean, default: true },

    deadline: { type: Date },
    allowLateSubmission: { type: Boolean, default: true },

    acceptedFileTypes: { type: [String], default: ["application/pdf"] },
    maxFileSizeMB: { type: Number, default: 20 },
    evidenceRequirements: { type: String, trim: true },

    referenceFiles: [referenceFileSchema],

    // Only teacher-confirmed criteria are official
    criteriaVersions: [criteriaVersionSchema],
    currentCriteriaVersion: { type: Number, default: 0 }, // 0 = none confirmed yet

    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

practicalSchema.index({ subject: 1, practicalNumber: 1 }, { unique: true });

module.exports = mongoose.model("Practical", practicalSchema);
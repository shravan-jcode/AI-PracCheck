import mongoose from "mongoose"

const versionSchema = new mongoose.Schema(
  {
    versionNumber: { type: Number, required: true },
    file: {
      originalName: { type: String, required: true },
      storageKey: { type: String, required: true },
      mimeType: { type: String, default: "application/pdf" },
      sizeBytes: Number,
      pageCount: Number,
    },
    uploadedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    criteriaVersionAtSubmission: Number,
    status: {
      type: String,
      enum: ["submitted", "processing", "pending_review", "revision_required", "approved"],
      default: "pending_review",
    },
    hiddenFromStudent: { type: Boolean, default: false }, // old rejected versions, never deleted
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true, index: true },
    practical: { type: mongoose.Schema.Types.ObjectId, ref: "Practical", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    versions: [versionSchema],
    currentVersion: { type: Number, default: 1 },

    // Latest status (copy of current version's status for fast queries)
    status: {
      type: String,
      enum: ["submitted", "processing", "pending_review", "revision_required", "approved"],
      default: "pending_review",
    },
    lastSubmittedAt: Date,
    approvedAt: Date,
  },
  { timestamps: true }
);

// One submission document per student per practical (multiple versions inside)
submissionSchema.index({ practical: 1, student: 1 }, { unique: true });
submissionSchema.index({ student: 1, subject: 1 });
submissionSchema.index({ practical: 1, status: 1 });

module.exports = mongoose.model("Submission", submissionSchema);
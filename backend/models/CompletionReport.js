import mongoose from "mongoose"

const completionReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true, index: true }, // used by QR/verify page
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    version: { type: Number, default: 1 },
    status: { type: String, enum: ["issued", "revoked", "superseded"], default: "issued" },
    issuedAt: { type: Date, default: Date.now },
    revokedAt: Date,
    revokeReason: String,

    // Snapshot at issue time so the report stays accurate even if data changes later
    snapshot: {
      studentName: String,
      rollNumber: String,
      collegeName: String,
      department: String,
      course: String,
      semester: String,
      subjectName: String,
      subjectCode: String,
      practicals: [
        {
          practicalNumber: Number,
          title: String,
          isMandatory: Boolean,
          status: String,
          approvedAt: Date,
        },
      ],
    },
  },
  { timestamps: true }
);

completionReportSchema.index({ subject: 1, student: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("CompletionReport", completionReportSchema);
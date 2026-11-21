import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["feedback", "status_change", "deadline", "report_available", "new_submission", "new_practical"],
      required: true,
    },
    message: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
    practical: { type: mongoose.Schema.Types.ObjectId, ref: "Practical" },
    submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
const mongoose = require("mongoose");
const { Schema } = mongoose;

const loanSchema = new Schema(
  {
     userId: { type: mongoose.Schema.Types.Mixed },
    // _id: mongoose.Schema.Types.Mixed,
    name: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1000, "Minimum loan amount is 1000"],
    },
    tenure: {
      type: Number,
      required: true,
      min: [1, "Tenure must be at least 1 month"],
    },
    employmentStatus: {
      type: String,
      required: true,
      enum: ["employed", "unemployed", "self-employed"],
    },
    loanReason: {
      type: String,
      required: true,
      trim: true,
    },
    employmentAddress: {
      type: String,
      required: function () {
        return this.employmentStatus !== "unemployed";
      },
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "approved", "rejected"],
      default: "pending",
    },
    loanSubmittedAt: {
      type: String, // e.g., "6:30 PM"
    },
    submittedDate: {
      type: String, // e.g., "June 7, 2024"
    },
  },
  { timestamps: true }
);

// ✅ Pre-save hook to auto-generate date/time
loanSchema.pre("save", function (next) {
  const now = new Date();

  // Format time: 6:30 PM
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
  this.loanSubmittedAt = now.toLocaleTimeString("en-US", timeOptions);

  // Format date: June 7, 2024
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  this.submittedDate = now.toLocaleDateString("en-US", dateOptions);

  next();
});

const Loan = mongoose.model("Loan", loanSchema);
module.exports = { Loan };

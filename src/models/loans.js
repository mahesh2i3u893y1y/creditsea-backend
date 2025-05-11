const mongoose = require("mongoose");
const { Schema } = mongoose;

const loanSchema = new Schema(
  {
    _id: {
      type: String, // Store _id as a string, not ObjectId
      required: true,
    },
    userId: { type: mongoose.Schema.Types.Mixed },
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
    loanSubmittedAt: String,
    submittedDate: String,
  },
  { timestamps: true }
);



loanSchema.pre("save", function (next) {
  const now = new Date();

  
  const timeOptions = { hour: "numeric", minute: "numeric", hour12: true };
  this.loanSubmittedAt = now.toLocaleTimeString("en-US", timeOptions);

 
  const dateOptions = { year: "numeric", month: "long", day: "numeric" };
  this.submittedDate = now.toLocaleDateString("en-US", dateOptions);

  next();
});

const Loan = mongoose.model("Loan", loanSchema);
module.exports = { Loan };

const express = require("express");
const { Loan } = require("../models/loans");
const { authMiddleWare } = require("../middlewares/auth"); // Adjust the path as needed
const loanRouter = express.Router();
const { Repayment } = require("../models/repayment");
const mongoose = require("mongoose");

loanRouter.post("/apply-loan", authMiddleWare, async (req, res) => {
  try {
    const {
      userId,
      name,
      amount,
      tenure,
      employmentStatus,
      loanReason,
      employmentAddress,
    } = req.body;

    // Create new loan application
    const loan = new Loan({
      userId,
      name,
      amount,
      tenure,
      employmentStatus,
      loanReason,
      employmentAddress,
    });

    await loan.save();

    res.status(201).json({
      message: "Loan application submitted successfully",
      loan,
    });
  } catch (err) {
    res.status(400).json({
      error: "Failed to submit loan application",
      details: err.message,
    });
  }
});

loanRouter.get("/my-loans", authMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    const objectId = mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : null;

    const loans = await Loan.find({
      $or: [
        { userId: userId.toString() },
        ...(objectId ? [{ userId: objectId }] : []),
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json({ loans });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch loans", details: err.message });
  }
});

// GET all loans - for verifier/admin
loanRouter.get("/all-loans", async (req, res) => {
  try {
    const loans = await Loan.find({})
      .populate("userId", "userName email") // optional: populate user info
      .sort({ updatedAt: -1 }); // latest first

    res.status(200).json({ loans });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

loanRouter.post("/verifier/update-status", async (req, res) => {
  try {
    const { status, loanId } = req.body;

    // Allow only 'verified' or 'rejected' status
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update. Allowed: verified or rejected." });
    }

    // Check if loanId is a valid ObjectId
    // const isValidObjectId = mongoose.Types.ObjectId.isValid(loanId) && loanId.length === 24;

    // Use findOneAndUpdate since findByIdAndUpdate works only with ObjectId
    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: loanId },  // No need to convert, directly pass the loanId
      { status },
      { new: true } // returns the updated document
    );

    if (!updatedLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res.status(200).json({ message: "Loan status updated", loan: updatedLoan });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});




loanRouter.post("/admin/update-status", async (req, res) => {
  try {
    const { status, loanId } = req.body;
    console.log(loanId);
    // Allow only 'approved' or 'rejected'
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Allowed: approved or rejected." });
    }

    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: loanId },
      { status },
      { new: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ error: "Loan not found" });
    }

    res
      .status(200)
      .json({ message: "Loan status updated by admin", loan: updatedLoan });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

loanRouter.post("/repayments", async (req, res) => {
  try {
    const { loanId, userId, amountPaid } = req.body;

    // Validate required fields
    if (!loanId || !userId || !amountPaid) {
      return res.status(400).json({
        error: "All fields are required: loanId, userId, amountPaid, paidAt",
      });
    }

    const repayment = new Repayment({
      loanId,
      userId,
      amountPaid,
    });

    const savedRepayment = await repayment.save();
    res.status(201).json(savedRepayment);
  } catch (error) {
    console.error("Error creating repayment:", error);
    res.status(500).json({ error: "Failed to create repayment" });
  }
});

loanRouter.get("/repayments", async (req, res) => {
  try {
    const repayments = await Repayment.find()
      .populate("loanId")
      .populate("userId");
    res.status(200).json({ repayments: repayments });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch repayments", details: error.message });
  }
});

module.exports = loanRouter;

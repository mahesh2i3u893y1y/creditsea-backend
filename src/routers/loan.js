const express = require("express");
const { Loan } = require("../models/loans");
const { authMiddleWare } = require("../middlewares/auth"); 
const loanRouter = express.Router();
const { Repayment } = require("../models/repayment");
const mongoose = require("mongoose");
const crypto = require("crypto");

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

    // Generate 24-character hex string (like ObjectId)
    const customId = crypto.randomBytes(12).toString("hex"); // 12 bytes → 24 hex chars

    const loan = new Loan({
      _id: customId,
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

// GET all loans 
loanRouter.get("/all-loans", async (req, res) => {
  try {
    const loans = await Loan.find({})
      .populate("userId", "userName email") 
      .sort({ updatedAt: -1 }); 

    res.status(200).json({ loans });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

loanRouter.post("/verifier/update-status", async (req, res) => {
  try {
    const { status, loanId } = req.body;
    console.log(typeof loanId)
    
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update. Allowed: verified or rejected." });
    }    

   
    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: loanId },  
      { status },
      { new: true }
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

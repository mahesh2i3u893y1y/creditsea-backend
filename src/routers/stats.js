const express = require("express");
// const mongoose = require("mongoose");
const statsRouter = express.Router();
const { Loan } = require("../models/loans");
const { Users } = require("../models/Users");
const { Repayment } = require("../models/repayment");

statsRouter.get("/statistics/summary", async (req, res) => {
  try {
    const totalLoans = await Loan.countDocuments();
    const totalUsers = await Users.countDocuments();
    const totalCashDistributed = await Loan.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalCashReceived = await Repayment.aggregate([
      { $group: { _id: null, total: { $sum: "$amountPaid" } } },
    ]);
    const repaidLoans = await Loan.countDocuments({ status: "approved" });
    const activeUsers = await Loan.distinct("userId");

    const cashOut = totalCashDistributed[0]?.total || 0;
    const cashIn = totalCashReceived[0]?.total || 0;
    const savings = cashIn * 0.12;

    res.json({
      totalLoans,
      totalBorrowers: totalUsers,
      cashDistributed: cashOut,
      cashReceived: cashIn,
      savings,
      repaidLoans,
      activeUsers: activeUsers.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch statistics." });
  }
});

function formatMonth(date) {
  const d = new Date(date);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}

statsRouter.get("/statistics/monthly", async (req, res) => {
  try {
    const loans = await Loan.find({});
    const repayments = await Repayment.find({});

    const loansPerMonth = {};
    const repaymentsPerMonth = {};
    const outstandingLoansPerMonth = {};

    // Count loans per month and outstanding loans
    loans.forEach((loan) => {
      const month = formatMonth(loan.createdAt);
      if (!loansPerMonth[month]) loansPerMonth[month] = 0;
      loansPerMonth[month]++;

      if (loan.status !== "repaid") {
        if (!outstandingLoansPerMonth[month]) outstandingLoansPerMonth[month] = 0;
        outstandingLoansPerMonth[month]++;
      }
    });

    // Count repayments per month 
    repayments.forEach((rep) => {
      const month = formatMonth(rep.paidAt);
      if (!repaymentsPerMonth[month]) repaymentsPerMonth[month] = 0;
      repaymentsPerMonth[month]++;
    });

    res.json({
      loansPerMonth,
      repaymentsPerMonth,
      outstandingLoansPerMonth,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = statsRouter;

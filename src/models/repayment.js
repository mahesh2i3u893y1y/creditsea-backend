const mongoose = require("mongoose")

const repaymentSchema = new mongoose.Schema({
    loanId: { type: String, required: true },
    userId: { type: String, required: true },
    amountPaid: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now }
});



const Repayment = mongoose.model('Repayment', repaymentSchema)

module.exports = {Repayment}

// module.exports = mongoose.model('Repayment', repaymentSchema);

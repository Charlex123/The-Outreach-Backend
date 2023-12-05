
const mongoose = require('mongoose');

const firstreportSentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  campaignId: {
    type: Number
  },
  useremail: {
    type: String,
    required: true
  },
  firstdraftreport: {
    type: String,
    default: "unsent"
  },
  firstmailsentreport: {
    type: String,
    default: "unsent"
  },
  firstautofollowupemailreport: {
    type: String,
    default: "unsent"
  },
  firstscheduledemailreport: {
    type: String,
    default: "unsent"
  },
  createdAt:{
    type:Date,
    default:Date.now()
  }
  });

const firstreportSents = mongoose.model('firstreportSents', firstreportSentSchema);

module.exports = firstreportSents;

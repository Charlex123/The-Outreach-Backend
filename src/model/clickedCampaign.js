
const mongoose = require('mongoose');

const clickedcampaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  emailId: {
    type: String,
    required: true
  },
  emailaddress: {
    type: String,
    required: true
  },
  createdAt:{
    type:Date,
    default:Date.now()
  }
  });

const clickedCampaign = mongoose.model('clickedCampaign', clickedcampaignSchema);

module.exports = clickedCampaign;

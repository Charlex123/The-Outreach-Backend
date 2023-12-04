
const mongoose = require('mongoose');

const clickedcampaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  campaignId: {
    type: String
  },
  createdAt:{
    type:Date,
    default:Date.now()
  }
  });

const clickedCampaign = mongoose.model('clickedCampaign', clickedcampaignSchema);

module.exports = clickedCampaign;

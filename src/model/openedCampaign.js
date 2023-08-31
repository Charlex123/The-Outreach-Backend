
const mongoose = require('mongoose');
const { genTrackingId } = require('../utils');
const messageId = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;
const messageId2 = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;
const messageId3 = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;

const openedcampaignSchema = new mongoose.Schema({
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

const openedCampaign = mongoose.model('openedCampaign', openedcampaignSchema);

module.exports = openedCampaign;

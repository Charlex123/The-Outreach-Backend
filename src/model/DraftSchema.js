const mongoose = require('mongoose');
const { genTrackingId } = require('../utils');
const CampaingSchema = require('./campaignSchema');
const uuid= require('uuid');
const messageId = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;

const DraftSchema = new mongoose.Schema({
  appLabelId: { type: String, required: true , unique: true, default:uuid.v4()},
  userId: { type: String, required: true ,ref: 'user'},
  name: { type: String },
  messageId: { type: String, default: uuid.v4() },
  threadId: { type: String},
  emails:{type:Array,default:[]},
  draft:String,
  rt :String,
  subject: { type: String},
  body: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  emails: Array,

  campaigns:{
    type: Array,
    default: [CampaingSchema]
  }
});

const DraftModel = mongoose.model('emailLabel', DraftSchema);

module.exports = DraftModel;

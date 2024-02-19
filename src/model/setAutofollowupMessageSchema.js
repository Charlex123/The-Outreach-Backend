
const mongoose = require('mongoose');


const autofollowupMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
  },
  autofollowupmessage: {
    type: String
  },
  createdAt:{
    type:Date,
    default:Date.now()
  }
  });

const AutoFollowUpMessage = mongoose.model('AutoFollowUpMessage', autofollowupMessageSchema);

module.exports = AutoFollowUpMessage;

const mongoose = require('mongoose');
const EmailLabel = require('./DraftSchema');
const userSchema = new mongoose.Schema({
  userAppKey: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  googleId: {
    type: String
  },

  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  tokenExpire: {
    type: Number
  },
  emailSendingLimit: {
    type: String
  },
  picture: {
    type: String
  },
  Jobs: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    default: []
  },
  emailLabels: {type:Array,default:[]},
});

const User = mongoose.model('User', userSchema);

module.exports = User;

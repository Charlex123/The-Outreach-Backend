const moment = require('moment');
const mongoose = require('mongoose');
const trackingId = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;

const EmailSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    default: trackingId
  },
  createdAt: {
    type: Date,
    default: moment(Date.now()).format()
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  trackingId:{
    type: String,
    default: trackingId
  },

  repliedEMail:Array,
  clickedEmail:Array
 
});



const Email = mongoose.model('Email', EmailSchema);

module.exports = {Email, EmailSchema}

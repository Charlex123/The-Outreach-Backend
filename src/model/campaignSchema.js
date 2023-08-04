
const mongoose = require('mongoose');
const { genTrackingId } = require('../utils');
const messageId = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  emailList: {
    type: [String],
    required: true
  },
  createdAt:{
    type:Date,
    default:Date.now()
  },
  tracking: {
    isOpened: {
      type: Boolean,
      default: false
    },
    isClicked: {
      type: Boolean,
      default: false
    }
  },
  action: {
    type: String,
    required: true
  },
  autofollowup: [
    {
      condition: {
        type: String,
        required: true
      },
      duration: {
        type: String,
        required: true
      },
      sendType: {
        type: String,
        required: true
      },
      message: {
        type: String,
        messageId: {
          type: String,
          default: messageId
        },
        required: true
      }
    }
  ],
  schedule: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    },
    days: [
      {
        type: String,
        enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        required: true
      }
    ],
    timezone: {
      type: String,
      required: true
    },
    speed: {
      mailsPerDay: {
        type: String,
        required: true
      },
      delay: {
        type: String,
        required: true
      }
    },
    repeat: {
      type: String,
      required: true
    }
  },
  email: Array,
  subject: {
    type: String
  },
  message: {
    type: String
  },
  lastRun: {
    type: Date,
    default: null
  },
  nextRun: {
    type: Date,
    default: null
  },
  trackingId: {
    type: String,
    default: genTrackingId()
  },
  untrackedMails: [
    {
      threadId: String,
      messageSentDate: Date,
      from: String,
      to: String,
      messageId: String,
      scheduleId: String
    }
  ],
  viewEmails: [
    {
      threadId: String,
      messageSentDate: Date,
      from: String,
      to: String,
      messageId: String,
      scheduleId: String,
      country: String,
      region: String,
      city: String,
      latitude: String,
      longitude: String,
      firstOpen: Date,
      lastOpen: Date,
      opened: Boolean,
      clickCount: Number
    }
  ],
  repliedMails: Array
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;


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

const ScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  campaignId: {
    type: Number
  },
  scheduleId: {
    type: String
  },
  emailId: {
    type: String,
    required: true
  },
  threadId: {
    type: String,
    required: true
  },
  emailaddress: {
    type: String,
    required: true
  },
  emailsubject: {
    type: String,
    required: true
  },
  emailbody: {
    type: String,
    required: true
  },
  emailrecipients: {
    type: String,
    required: true
  },
  emailrecipient: {
    type: String,
    required: true
  },
  mailsentDate:{
    type:Date
  },
  createdAt:{
    type:Date,
    default:Date.now()
  },
  tracking: {
    isOpened: {
      type: Boolean,
      default: true
    },
    isClicked: {
      type: Boolean,
      default: true
    },
    redlinktext: {
      type: String
    },
    redlinkurl: {
      type: String
    }
  },
  schedule: {
    scheduletime: {
      type: String
    },
    skipweekends: {
      type: String
    },
    speed: {
      mailsPerDay: {
        type: Number,
        default: null
      },
      delay: {
        type: String
      }
    },
    repeat: {
      repeatinterval: {
        type: String
      },
      repeattimes: {
        type: Number,
        default: null
      }
    },
    status: {
      type: String,
      default: 'unsent'
    }
  }
  
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);

module.exports = Schedule;

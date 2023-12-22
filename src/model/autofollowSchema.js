
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

const autofollowupSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  autofollowupId: {
    type: Number
  },
  campaignId: {
    type: Number
  },
  emailId: {
    type: String,
    required: true
  },
  threadId: {
    type: String,
    required: true
  },
  name: {
    type: String
  },
  emailaddress: {
    type: String,
    required: true
  },
  emailsubject: {
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
  autofollowup: {
    firstfollowup: {
      reply1type: {
        type: String,
      },
      reply1interval: {
        type: Number
      },
      reply1time: {
        type: Date,
        default: null
      },
      reply1message: {
        type: String
      },
      status: {
        type: String,
        default: 'unsent'
      }
    },
    secondfollowup: {
      reply2type: {
        type: String,
      },
      reply2interval: {
        type: Number,
      },
      reply2time: {
        type: Date,
        default: null
      },
      reply2message: {
        type: String
      },
      status: {
        type: String,
        default: 'unsent'
      }
    },      
    thirdfollowup: {
      reply3type: {
        type: String,
      },
      reply3interval: {
        type: Number,
      },
      reply3time: {
        type: Date,
        default: null
      },
      reply3message: {
        type: String
      },
      status: {
        type: String,
        default: 'unsent'
      }
    }
  }
  
});

const Autofollowup = mongoose.model('Autofollowup', autofollowupSchema);

module.exports = Autofollowup;

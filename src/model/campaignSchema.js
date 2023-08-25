
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

const campaignSchema = new mongoose.Schema({
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
  createdAt:{
    type:Date,
    default:Date.now()
  },
  tracking: {
    isOpened: {
      type: Boolean,
    },
    isClicked: {
      type: Boolean,
    }
  },
  action: {
    type: Number
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
          type: String
        },
        reply1message: {
          type: String
        },
      },
      secondfollowup: {
        reply2type: {
          type: String,
        },
        reply2interval: {
          type: Number,
        },
        reply2time: {
          type: String,
        },
        reply2message: {
          type: String
        },
      },      
      thirdfollowup: {
        reply3type: {
          type: String,
        },
        reply3interval: {
          type: Number,
        },
        reply3time: {
          type: String,
        },
        reply3message: {
          type: String
        }
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
        type: String
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
        type: String
      }
    }
  },
  trackingId: {
    type: String,
    default: genTrackingId()
  },
  advance: {
    sendas: {
      type: String
    },
    verifyemail: {
      type: Boolean
    }
  }
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;

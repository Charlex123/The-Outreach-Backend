
const mongoose = require('mongoose');
const { genTrackingId } = require('../utils');

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  campaignId: {
    type: Number,
    required: true
  },
  emailId: {
    type: String,
    required: true
  },
  threadId: {
    type: String,
  },
  emailaddress: {
    type: String,
    required: true
  },
  name: {
    type: String
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
  recipientscount: {
    type: Number,
    default: 0
  },
  recipientsdeliveredto: {
    type: String,
    default: ""
  },
  recipientsdeliveredtocount: {
    type: Number,
    default: 0
  },
  remainingrecipients: {
    type: String,
    default: ""
  },
  remainingrecipientscount: {
    type: Number,
    default: 0
  },
  createdAt:{
    type:Date,
    default:Date.now()
  },
  Opens: {
    type: Number,
    default: 0
  },
  Clicks: {
    type: Number,
    default: 0
  },
  Bounces: {
    type: Number,
    default: 0
  },
  Replies: {
    type: Number,
    default: 0
  },
  nextRun: {
    type: Date,
    default: null
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
  action: {
    type: String
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
      type: String
    }
  }
});

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;

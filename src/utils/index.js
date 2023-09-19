const crypto = require('crypto');
const dotenv = require('dotenv');
const axios = require('axios');
const config = require('../config');
// const oAuth2Client = require('../controllers/auth/googleOauth2/auth');
// const { OAuth2Client, auth } = require('google-auth-library');
// const auth = require ('../controllers/auth/googleOauth2/auth');
const { google } = require('googleapis');
const moment = require('moment');

dotenv.config();
const genHash = (data) => {
  const salt = crypto.randomBytes(32).toString('hex').concat(config.appSecret);
  const hash = crypto
    .pbkdf2Sync(data, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { salt, hash };
};
// =======
// const moment = require('moment');
// const os = require('os');

// dotenv.config()
// const genHash =  (data) => {

//     const salt = crypto.randomBytes(32).toString('hex').concat(config.appSecret);
//     const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
//     return {salt, hash}
// }

// const validateHash = (hash, salt, data) => {
//     const originalHash = hash;
//     const newHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
//     return newHash === originalHash;
// }

// const genAppAccessToken = async ()=>{
//     const userKey = crypto.randomBytes(32).toString('hex');
//     return  crypto.pbkdf2Sync(userKey, config.appSecret, 10000, 64, 'sha512').toString('hex');
// }
// >>>>>>> main

const validateHash = (hash, salt, data) => {
  const originalHash = hash;
  const newHash = crypto
    .pbkdf2Sync(data, salt, 10000, 64, 'sha512')
    .toString('hex');
  return newHash === originalHash;
};

const genAppAccessToken = async () => {
  const userKey = crypto.randomBytes(32).toString('hex');
  return crypto
    .pbkdf2Sync(userKey, config.appSecret, 10000, 64, 'sha512')
    .toString('hex');
};

const verifyAppAccessToken = async (token, userAppKey) => {
  return (
    token ===
    crypto
      .pbkdf2Sync(userAppKey, config.appSecret, 10000, 64, 'sha512')
      .toString('hex')
  );
};

function encryptEmail(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptEmail(data, key) {
  const [ivHex, encryptedHex] = data.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

const generateTrackingLink = async ({
  email,
  messageId,
  scheduleId,
  trackingId
}) => {
  return `${config.TRACKING_URL}/?trackingId=${trackingId}&email=${email}&scheduleId=${scheduleId}&messageId=${messageId}&no_proxy=1`;
};

const getGeolocationInfo = async (ipAddress) => {
  try {
    const response = await axios.get(
      `https://get.geojs.io/v1/ip/geo/${ipAddress}.json`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

const genTrackingId = () =>
  `${
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  }`;

async function convertToCronSchedule(
  hour = '*',
  minute = '*',
  days = '*',
  months = '*',
  weeks = '*'
) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ];

  // Convert day names to cron values
  const daysFormatted = days
    .split(',')
    .map((day) => {
      const index = dayNames.indexOf(day);
      return index !== -1 ? index : day;
    })
    .join(',');

  // Convert month names to cron values
  const monthsFormatted = months
    .split(',')
    .map((month) => {
      const index = monthNames.indexOf(month);
      return index !== -1 ? index + 1 : month;
    })
    .join(',');

  // Create cron expression
  const cronExpression = `${minute} ${hour} ${daysFormatted} ${monthsFormatted} ${weeks}`;

  return cronExpression;
}

async function calculateChunkSize(
  numEmails,
  processingTimePerEmail,
  maxWorkerThreads,
  minChunkSize,
  maxChunkSize,
  dailyEmailLimitPerUser = 500
) {
  try {
    // console.log("calculateChunkSize",numEmails, processingTimePerEmail, maxWorkerThreads, minChunkSize, maxChunkSize, dailyEmailLimitPerUser)
    const range = await generateRandomValueFromRange(processingTimePerEmail);
    const totalProcessingTime = numEmails * range;
    const availableWorkerThreads = Math.min(maxWorkerThreads, numEmails);
    let chunkSize = Math.ceil(totalProcessingTime / availableWorkerThreads);

    // Adjust the chunk size if necessary
    chunkSize = Math.max(chunkSize, minChunkSize);
    chunkSize = Math.min(chunkSize, maxChunkSize);
    // Calculate the maximum number of emails allowed per user in a day
    const maxEmailsPerUser =
      Math.floor(dailyEmailLimitPerUser / chunkSize) * chunkSize;

    // Adjust the chunk size based on the maximum emails allowed per user
    if (maxEmailsPerUser < chunkSize) {
      chunkSize = maxEmailsPerUser;
    }

    return chunkSize;
  } catch (error) {
    // console.log(error)
    return 1;
  }
}

async function generateRandomValueFromRange(range) {
  const [min, to, max, unit] = range.split(' ');
  const minValue = parseFloat(min);
  const maxValue = parseFloat(max);

  // Convert the values to a standard unit (e.g., seconds)
  let convertedMinValue, convertedMaxValue;

  switch (unit) {
    case 'seconds':
      convertedMinValue = minValue;
      convertedMaxValue = maxValue;
      break;
    case 'minutes':
      convertedMinValue = minValue * 60;
      convertedMaxValue = maxValue * 60;
      break;
    case 'hours':
      convertedMinValue = minValue * 3600;
      convertedMaxValue = maxValue * 3600;
      break;
    // Add more cases for other units if needed

    default:
      throw new Error(`Invalid unit: ${unit}`);
  }

  // Generate a random value within the range
  const randomValue = Math.floor(
    Math.random() * (convertedMaxValue - convertedMinValue) + convertedMinValue
  );

  return Math.ceil(randomValue / 60);
}

async function convertToTimezone(date, timeZone) {
  const userLocale = process.env.LANG || os.env.LANG;
  let locale = userLocale.split('.')[0];
  locale = locale.split('_').join('-');

  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone
  };

  if (typeof date === 'string') {
    return new Date(new Date(date).toLocaleString(`${locale}`, options));
  }

  return new Date(date.toLocaleString(`${locale}`, options));
}

async function handleFollowUpCampaigns(campaign) {
  try {
    const {
      repliedMails,
      untrackedMails,
      viewEmails,
      emailList,
      schedule,
      lastRun,
      createdAt
    } = campaign;
    const scheduleRepeat = schedule?.repeat?.split('$');
    const now = moment(Date.now());
    const allMessages = [];

    for (const autoFollowUpMessage of campaign?.autofollowup) {
      const { condition, duration } = autoFollowUpMessage;
      if (emailList.length > 0 && condition === 'Everyone') {
        const runTime = duration.split('$');
        const nextFollowUpTime = moment(lastRun).add(
          Number(runTime[0]),
          `${runTime[1]}`
        );
        if (now.isAfter(nextFollowUpTime)&& emailList.length > 0 && condition === 'Everyone') {
          
          allMessages.push({list: emailList, messageData:autoFollowUpMessage,condition:'Everyone',trackList:"emailList" });
          // console.log('Send email to emailList array');
        } else {
          // console.log('Not yet time to run', nextFollowUpTime);
        }
      } else if (condition === 'No Open' && untrackedMails.length > 0 ) {
        const runTime = duration.split('$');
        const nextFollowUpTime = moment(lastRun).add(
          Number(runTime[0]),
          `${runTime[1]}`
        );
        if (now.isAfter(nextFollowUpTime) ) {
          const uniqueEmails = untrackedMails.reduce((acc, email) => {
            const existingEmail = acc.find((e) => e.to === email.to);
            if (!existingEmail) {
              acc.push(email);
            }
            return acc;
          }, []);
          allMessages.push({list: uniqueEmails, messageData:autoFollowUpMessage,condition:'No Open',trackList:"untrackedMails" });
        } else {
          // console.log('Not yet time to run', nextFollowUpTime);
        }
      } else if (condition === 'No Click' && untrackedMails.length > 0) {
        const runTime = duration.split('$');
        const nextFollowUpTime = moment(lastRun).add(
          Number(runTime[0]),
          `${runTime[1]}`
        );
        if (now.isAfter(nextFollowUpTime)  ) {
          const uniqueEmails = untrackedMails.reduce((acc, email) => {
            const existingEmail = acc.find((e) => e.to === email.to);
            if (!existingEmail) {
              acc.push(email);
            }
            return acc;
          }, []);
          allMessages.push({list:uniqueEmails,messageData: autoFollowUpMessage ,condition:'No Click',trackList:"untrackedMails" });
        } else {
          // console.log('Not yet time to run', nextFollowUpTime);
        }
      } else if (condition === 'No Reply' && viewEmails.length > 0) {
        const runTime = duration.split('$');
        const nextFollowUpTime = moment(lastRun).add(
          Number(runTime[0]),
          `${runTime[1]}`
        );
        if (now.isAfter(nextFollowUpTime)) {
          const uniqueEmails = viewEmails.reduce((acc, email) => {
            const existingEmail = acc.find((e) => e.to === email.to);
            if (!existingEmail) {
              acc.push(email);
            }
            return acc;
          }, []);
          allMessages.push({list:uniqueEmails, messageData:autoFollowUpMessage,condition:'No Reply',trackList:"viewEmails" });
        } else {
          // console.log('Not yet time to run', nextFollowUpTime);
        }
      }
    }

    return allMessages;
  } catch (error) {
    console.error('Error handling follow-up campaigns:', error);
  }
}



// Create Gmail Labels
let labels = [];
async function createGmailLabels(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  const labelData = [
    {
      name: "Outreach Reports",
    },
    {
      name: "Outreach Sent",
    },
    {
      name: "Outreach Scheduled",
    },
    {
      name: "Outreach Auto FollowUp",
    }
  ];

  try {
    for (const label of labelData) {
      const createLabelResponse = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: label.name,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });

      
    }
    return labels;
  } catch (error) {
    console.error('Error creating Gmail labels:', error.message);
  }
}

// Create Nested Gmail Labels
// async function createNestedLabels(gmail, parentLabelId, subLabels) {
//   for (const subLabel of subLabels) {
//     const createSubLabelResponse = await gmail.users.labels.create({
//       userId: 'me',
//       requestBody: {
//         name: subLabel,
//         labelListVisibility: 'labelShow',
//         messageListVisibility: 'show',
//         parent: parentLabelId,
//       },
//     });

//     //push the created label to the array

//     labels.push(createSubLabelResponse.data);
//     console.log('Sub-label created:', createSubLabelResponse.data);
//   }

// }




module.exports = {
  genTrackingId,
  genHash,
  getGeolocationInfo,
  validateHash,
  genAppAccessToken,
  verifyAppAccessToken,
  encryptEmail,
  decryptEmail,
  generateTrackingLink,
  // convertToCronSchedule,
  createGmailLabels,
  calculateChunkSize,
  generateRandomValueFromRange,
  convertToTimezone,
  handleFollowUpCampaigns
};

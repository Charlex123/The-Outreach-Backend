
const sendEmail = require('../../utils/sendEmail');
const { generateTrackingLink, generateRandomValueFromRange, handleFollowUpCampaigns } = require('../../utils');
const { workerData, parentPort } = require('worker_threads');
const cron = require('node-cron');

// Retrieve the campaignId and emailList from the workerData
let { campaign, emailList, message, sendType } = workerData;

// Retrieve the campaign object based on the campaignId
campaign = JSON.parse(campaign);
const emailData = JSON.parse(emailList);

// Function to send a single email
const sendSingleEmail = async ({mail, messageData, trackList,threadId}) => {
  const trackingLink = await generateTrackingLink({
    email: mail,
    messageId: messageData._id,
    scheduleId: campaign._id,
    trackingId: campaign.trackingId,
  });

  return await sendEmail({
    from: campaign.userId.email,
    sendType: messageData?.sendType,
    messageId: messageData._id,
    scheduleId: campaign.trackingId,
    to: mail,
    subject: campaign.subject || messageData.subject || 'theOutreach',
    message: messageData.message,
    accessToken: campaign.userId.accessToken,
    refreshToken: campaign.userId.refreshToken,
    threadId: threadId || null,
    labelIds: campaign.labelIds,
    followUpList: trackList,
    trackingLink,
    parentPort,
  });
};

// Array to hold the promises of email sending tasks
const emailPromises = [];
(async ()=>{
// Iterate over the email data
for (let i = 0; i < emailData.length; i++) {
  const { list, messageData, trackList } = emailData[i];
  if (list.length > 0 && typeof list[0] === 'string') {
    for (const mail of list) {
      const emailPromise = sendSingleEmail({mail, messageData, trackList});
      emailPromises.push(emailPromise);
    }
  } else if (list.length > 0 && typeof list[0] === 'object') {
    for (let mail of list) {
      const emailPromise = sendSingleEmail({mail:mail.to, messageData, trackList,threadId:mail.threadId});
      emailPromises.push(emailPromise);
    }
  }
}

// Schedule the cron job
const runtime = await generateRandomValueFromRange(campaign.schedule.speed.delay);
cron.schedule(`*/${runtime} * * * *`, () => {
  if (emailPromises.length > 0) {
    const emailPromise = emailPromises.shift();
    emailPromise
      .then(() => {
        if (emailPromises.length === 0) {
          // All emails have been sent
          parentPort.postMessage({ message: 'done' });
        }
      })
      .catch((error) => {
        parentPort.postMessage({ message: 'Error sending emails', error });
      });
  }
});
})() 
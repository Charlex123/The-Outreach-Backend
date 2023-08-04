const cron = require('node-cron');
const Campaign = require('../../model/campaignSchema');
const moment = require('moment');
const { Worker } = require('worker_threads');
const path = require('path');
const workerPath = path.resolve(__dirname, './emailWorker.js');
const { calculateChunkSize,handleFollowUpCampaigns } = require('../../utils/index');

// Function to chunk an array into smaller arrays
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// Function to handle campaign execution
// Function to handle campaign execution
async function executeCampaign(campaign) {
  try {

    const allCampaignsRuntimeEmails= await  handleFollowUpCampaigns(campaign)
    // console.log("allCampaignsRuntimeEmails",allCampaignsRuntimeEmails)
    const now = moment(Date.now()).format();
    const repeatTime = campaign.schedule.repeat.split('$');
    const time = repeatTime[0];
    const interval = repeatTime[1];
    const nextRunTime = moment(Date.now())
      .add(Number(time), `${interval}`)
      .format();
    campaign.lastRun = now;
    campaign.nextRun = nextRunTime;
    await campaign.save();

    // let { emailList, untrackedMails } = campaign;
    const chunkSize = await calculateChunkSize(
      allCampaignsRuntimeEmails.length,
      campaign.schedule.speed.delay,
      campaign.schedule.speed.mailsPerDay,
      2,
      50,
      1000
    );

  
    const emailChunks = chunkArray(allCampaignsRuntimeEmails, chunkSize);
    const workerPromises = [];
    // console.log("emailChunks",emailChunks)
    // Spawn worker threads to process each email chunk
    for (const chunk of emailChunks) {
      const workerPromise = new Promise((resolve, reject) => {
        const worker = new Worker(workerPath, {
          workerData: {
            campaign: JSON.stringify(campaign),
            emailList: JSON.stringify(chunk),
          },
        });

        // Handle messages from the worker thread
        worker.on('message', async (eventData) => {
          const { message, data } = eventData;
          if (message === 'sent') {
            // Update the untracked emails array and remove the email from emailList atomically
            await Campaign.updateOne(
              { _id: campaign._id },
              {
                $push: { untrackedMails: data },
                $pull: { emailList: data.to }
              }
            );
          } else if (message === 'done') {
            console.log()
            await campaign.save();
            resolve();
          }
          // Do something with the data received from the child process
        });

        // Handle errors from the worker thread
        worker.on('error', (error) => {
          // console.error(`Worker thread ${worker.threadId} error: ${error}`);
          console.log(error)
          reject(error);
        });

        // Handle worker thread completion
        worker.on('exit', (code) => {
          if (code === 0) {
            console.log(`Worker thread ${worker.threadId} completed successfully`);
            resolve();
          } else {
            console.error(`Worker thread ${worker.threadId} exited with code ${code}`);
            reject(new Error(`Worker thread ${worker.threadId} exited with code ${code}`));
          }
        });
      });

      workerPromises.push(workerPromise);
    }

    // Wait for all worker threads to complete
    await Promise.all(workerPromises);
  } catch (error) {
    // console.error(`Error executing campaigns: ${error}`);
  }
}


// Run the campaign every minute for testing purposes
cron.schedule('* * * * *', async () => {
  try {
   
    // Find all campaigns that are due to run
    const now = moment(Date.now()).format();
    const campaigns = await Campaign.find({ nextRun: { $lte: now } }).populate('userId');
    // console.log("all current campaigns", campaigns);

    // Loop through each campaign and execute it in a separate worker thread
    const campaignPromises = campaigns.map((campaign) => executeCampaign(campaign));

    // Wait for all campaigns to complete
    await Promise.all(campaignPromises);
  } catch (error) {
    console.error(`Error executing campaigns: ${error}`);
  }
});

// Export the cron object
module.exports.cron = cron;

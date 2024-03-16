require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const autofollowSchema = require("../model/autofollowSchema");
const User = require("../model/user");
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const config = require('../config');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const v4 = require("uuid");
const Agenda = require("agenda");

const autofollowup_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;

const agenda = new Agenda({
  db: {
    address: process.env.DATABASE_URL
  },
});

const loadCampData = async () => {
  const campd = await campaignSchema.find();
  if(campd) {
    for (const campaignd of campd) {
      const nxtrun = campaignd.nextRun;
      const recpcount = campaignd.recipientscount;
      const rmrecptcount = campaignd.remainingrecipientscount;
      const recptsdeliveredtocount = campaignd.recipientsdeliveredtocount;
      const skipweekends = campaignd.schedule.skipweekends;
      const repeatinterval = campaignd.schedule.repeat.repeatinterval;
      const repeattimes = campaignd.schedule.repeat.repeattimes;
      const mailsperday = campaignd.schedule.speed.mailsPerDay;
      const schedtime = campaignd.schedule.scheduletime;
      const campaignId_ = campaignd.campaignId;
      const delay_ = campaignd.schedule.speed.delay;
      const name = campaignd.name;
      const campaignrecipients = campaignd.emailrecipients;
      const campaignbody = campaignd.emailbody;
      const subject = campaignd.emailsubject;
      const useremail = campaignd.emailaddress;
      const redlinktext = campaignd.redlinktext;
      const redlinkurl = campaignd.redlinkurl;
      const timezone = campaignd.timezone;
      const delivertorecipients = campaignd.recipientsdeliveredto;
      const deliveredtorecipientscount = campaignd.recipientsdeliveredtocount;
      const remainingrecipients = campaignd.remainingrecipients;
      const remainingrecipientscount = campaignd.remainingrecipientscount;
      const recipientscount = campaignd.recipientscount;

      process.env.TZ = timezone;
      if(repeatinterval && repeatinterval != "" && repeattimes && repeattimes != "") {
        let cronexpression;
        if(repeatinterval == 'h') {
          cronexpression = `0 */${repeattimes} * * *`;
        }else if(repeatinterval == 'd') {
          cronexpression = `0 12 */${repeattimes} * *`;
        }else if(repeatinterval == 'w') {
          cronexpression = `0 12 * * 1/${repeattimes}`;
        }else if(repeatinterval == 'm') {
          cronexpression = `0 12 1 */${repeattimes} *`;
        }
        cron.schedule(cronexpression, function() {
          console.log('repeat camp is ran -----')
          processMailData(nxtrun,recpcount,rmrecptcount,recptsdeliveredtocount,skipweekends,repeatinterval,repeattimes,mailsperday,schedtime,campaignId_,delay_,name,campaignrecipients,campaignbody,subject,useremail,redlinktext,redlinkurl,delivertorecipients,deliveredtorecipientscount,remainingrecipients,remainingrecipientscount,recipientscount,timezone)
        })
          
      }
      
    }
  }
}
loadCampData()

async function processMailData(nxtrun,recpcount,rmrecptcount,recptsdeliveredtocount,skipweekends,repeatinterval,repeattimes,mailsperday,schedtime,campaignId_,delay_,name,campaignrecipients,campaignbody,subject,useremail,redlinktext,redlinkurl,delivertorecipients,deliveredtorecipientscount,remainingrecipients,remainingrecipientscount,recipientscount) {
  
  console.log('repeat campaign Job is running!');
  const verifyuserdata = await User.findOne({email: useremail});
  if (verifyuserdata) {
    
      verifyuserdata.verified = true;
      
      const verifiedUser = await verifyuserdata.save();
      const accessToken = verifiedUser.accessToken;
      const refreshToken = verifiedUser.refreshToken;
      const userappkey = verifiedUser.userAppKey;

      const oAuth2Client = new google.auth.OAuth2(
        config.client_id,
        config.client_secret,
        config.redirect_uris
      );
  
  
      oAuth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
  
      const gmail = google.gmail({
        version: 'v1',
        auth: oAuth2Client
      });
        
      let intervalId;
      let startcount;
      let recipientLists;
      let remrecipients_
      let remrecptstosendmailto;
      let remrecipientLista;

      if((mailsperday > remainingrecipientscount)) {
        remrecipients_ = remainingrecipients;
        remrecptstosendmailto = remainingrecipientscount;
        remrecipientLista = remrecipients_.split(',');
        const remuniqueSet = new Set(remrecipientLista);
        // Convert the Set back to an array
        recipientLists = [...remuniqueSet];
      }else {
        remrecptstosendmailto = remainingrecipientscount - mailsperday;
        remrecipients_ = remainingrecipients;
        remrecipientLista = remrecipients_.split(',');
        const remuniqueSet = new Set(remrecipientLista);
        // Convert the Set back to an array
        recipientLists = [...remuniqueSet];
      }
      console.log('remrecptstosendmailto -----',remrecptstosendmailto);
      
      if(schedtime == "Now") {
        startnxtrunmailSending();
        console.log('scheduletime Now ran ')
      }else if(schedtime == "FiveMinutes"){
        setTimeout(startnxtrunmailSending,5*60*1000)
        console.log('scheduletime Now ran 11')
      }else if(schedtime == "OneHour"){
        setTimeout(startnxtrunmailSending,1*60*60*1000)
        console.log('scheduletime Now ran 22')
      }else if(schedtime == "ThreeHours"){
        setTimeout(startnxtrunmailSending,3*60*60*1000)
        console.log('scheduletime Now ran 33')
      }
      // call send function

      function startnxtrunmailSending() {
        console.log('start mail sending ran')
        let currentIndex = startcount;

        function sendToEachRecipient() {
          // Check if there are more elements to process
          if (currentIndex < remrecptstosendmailto) {
            const recipient = recipientLists[currentIndex];
            sendmailCamp(timezone,skipweekends,repeatinterval,repeattimes,name,mailsperday,gmail,campaignrecipients,draftId,recipient,campaignbody, subject,accessToken, refreshToken, useremail, userappkey,redlinktext,redlinkurl,campaignId_);
            // Increment the index for the next iteration
            currentIndex++;
          } else {
            // If all elements have been processed, stop the interval
            clearInterval(intervalId);
            console.log("Finished processing all items.");
          }
        }
        intervalId = setInterval(sendToEachRecipient, delay_ * 1000); // Run it every 10 secs
        sendToEachRecipient(); // Run it once immediately
        
      }
    }
  
}


  async function sendmailCamp(timezone,skipweekends,repeatinterval,repeattimes,name,mailsperday,gmail,campaignrecipients,draftId,recipient,body,subject,accessToken,refreshToken,useremail,userappkey,redlinktexta,redlinkurla,campaignId_) {
    console.log('send mail function ran')
    let redlinktexter = redlinktexta;
    let redlinkurler = redlinkurla;
  
    let redlinker;
    if(redlinkurler !== "" && redlinkurler !== undefined && redlinkurler !== null && redlinktexter !== "" && redlinktexter !== undefined && redlinktexter !== null) {
        redlinker = `<a href="${config.BACKEND_URL}/campaignclicks/${userappkey}/${campaignId_}/${redlinkurler}" style="background-color: darkblue;padding: 4px 12px 4px 12px;color: white;">${redlinktexter}</a>`;
    }else {
        redlinker = "";
    }
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      debug: true,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: useremail,
        clientId: config.client_id,
        clientSecret: config.client_secret,
        refreshToken: refreshToken,
        accessToken: accessToken
      }
    });
  
    const mailOptions = {
      from: {
        name: name,
        address: useremail
      },
      "email": useremail,
      to: recipient,
      subject: subject,
      html: `<html>
                <head>
                  <style>
                  body {
                    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif !important;font-size: 16px;line-height: 20.8px;margin: .5rem 0 .5rem 0;
                    text-align: center;width: 100%;
                  }
                  .getap-op {
                    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif !important;font-size: 16px;line-height: 20.8px;margin: .5rem 0 .5rem 0;
                    text-align: left;width: 60%;margin-left: 0;
                  }
                  p {
                    text-align: left;font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;font-size: 16px;
                  }
                  div {
                    text-align: left;font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;font-size: 16px;
                  }
                  span {
                    text-align: left;font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;font-size: 16px;
                  }
                  a.redlink {
                    text-align: center;padding: 3px 12px 3px 12px;background-color: #191970;border-radius: 4px;
                    color: white;
                  }
                  a.unsubscribe {
                    text-align: left;color: #4682B4;
                  }
                  </style>
                </head>
                <body>
                  <div class="getap-op">
                    <img src="${config.BACKEND_URL}/campaignopens/${userappkey}/${campaignId_}/image.png" style="display: none" class="kioper" alt="imager">
                    <div>
                      <span>${body}</span>
                    </div>
                    <div style="margin: 1rem auto 1rem auto;text-align: center">${redlinker}</div>                    
                  </div>
                </body>
              </html>`,
      "campaignrecipients":campaignrecipients,
      "gmail":gmail,
      "body_": body,
      campaignId_: campaignId_,
      "mailsperday": mailsperday,
      "name": name
    };
  
    const campaigndet = await campaignSchema.findOne({'campaignId':campaignId_});
    if (campaigndet) {
  
      campaigndet.nextRun = moment().add(1,'day');
      await campaigndet.save();
  
      if(skipweekends == true) {
        let day = date.getDay();
        if((day == 6) || (day ==7)) {

        }else {
          // Delivering mail with sendMail method
          transporter.sendMail(mailOptions, (error) => {
            if (error) {
              console.error(error);
            } else {
              updateEmailCampaignId(mailOptions.name,mailOptions.gmail,mailOptions.email,mailOptions.subject,mailOptions.to,mailOptions.body_,mailOptions.campaignId_)
            }
          });
        }
      }else {
        // skip weekeds false
        // Delivering mail with sendMail method
        transporter.sendMail(mailOptions, (error) => {
          if (error) {
            console.error(error);
          } else {
            updateEmailCampaignId(mailOptions.name,mailOptions.gmail,mailOptions.email,mailOptions.subject,mailOptions.to,mailOptions.body_,mailOptions.campaignId_)
          }
        });
      }
      
    }
      
  }

  async function updateEmailCampaignId(name,gmail, email, subject, to, body,campaignId_) {

    try{
      // Retrieve the email threads in the user's mailbox
      
      let query = subject; 
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: query,
      });
  
      const messages = response.data.messages;
  
      if (messages[0]) {
        const messageId = messages[0].id;
        const threadId = messages[0].threadId;
  
        const campaign = await campaignSchema.findOne({'campaignId':campaignId_});
  
        if (campaign) {
  
          let rmrecipientscount = campaign.remainingrecipientscount;
          let rmrecipients = campaign.remainingrecipients;
          let deliveredto = campaign.recipientsdeliveredto;
          let deliveredtocount = campaign.recipientsdeliveredtocount;
          let mailsperday = campaign.schedule.speed.mailsPerDay;
          let rptcount = campaign.repeatcount;
          let campaignrecipients = campaign.emailrecipients;
          let campaignrecipientscount = campaign.recipientscount;
          const recipient = to;

          let rmrecipientsarray = rmrecipients.split(',');
          let campaignrecipientsarray = campaignrecipients.split(',');
          let recipientsdeliveredtoarray = deliveredto.split(',');
          console.log('rm receipts array',rmrecipientsarray,'campaignrecpts array',campaignrecipientsarray,' receipts delivered to array',recipientsdeliveredtoarray)
          let noofrecptstosendto;
          let indexofrecpt;
  
          if((mailsperday > campaignrecipientscount)) {
            noofrecptstosendto = campaignrecipientscount;
            if(deliveredtocount <= noofrecptstosendto) {
              deliveredtocount++;
              rmrecipientscount = campaignrecipientscount - deliveredtocount;
  
              if(rmrecipientsarray.length > 1) {
                rmrecipientsarray.splice(indexofrecpt, 1)
                rmrecipientsarray = rmrecipientsarray;
                recipientsdeliveredtoarray.push(recipient);
                recipientsdeliveredtoarray.filter((str) => str !== '');
                console.log('filtered array',recipientsdeliveredtoarray)
              }else {
                campaignrecipientsarray.splice(indexofrecpt, 1)
                rmrecipientsarray = campaignrecipientsarray;
                recipientsdeliveredtoarray.push(recipient);
                recipientsdeliveredtoarray.filter((str) => str !== '');
                console.log('filtered array',recipientsdeliveredtoarray)
              }
              
            }
            
          }else {
            noofrecptstosendto = campaignrecipientscount - mailsperday;
            
            if(deliveredtocount <= noofrecptstosendto) {
              deliveredtocount++;
              if(rmrecipientsarray.length > 1) {
                rmrecipientsarray.splice(indexofrecpt, 1)
                rmrecipientsarray = rmrecipientsarray;
                recipientsdeliveredtoarray.push(recipient);
                recipientsdeliveredtoarray.filter((str) => str !== '');
                console.log('filtered array',recipientsdeliveredtoarray)
              }else {
                campaignrecipientsarray.splice(indexofrecpt, 1)
                rmrecipientsarray = campaignrecipientsarray;
                recipientsdeliveredtoarray.push(recipient);
                recipientsdeliveredtoarray.filter((str) => str !== '');
                console.log('filtered array',recipientsdeliveredtoarray)
              }
            }
          }
          
          campaign.messageId = messageId;
          campaign.threadId = threadId; 
          campaign.recipientsdeliveredto = recipientsdeliveredtoarray.toString();
          campaign.recipientsdeliveredtocount = deliveredtocount;
          campaign.remainingrecipientscount = rmrecipientscount;
          campaign.remainingrecipients = rmrecipientsarray.toString();

          if(rmrecipientscount == 0 && (campaignrecipientscount == deliveredtocount)) {
            campaign.repeatcount = rptcount+1;
          }
            
          const updatedCampgn = await campaign.save();
          if(updatedCampgn) {
  
            const getautofollowup = await campaignSchema.aggregate([ 
              {$match: {'campaignId':campaignId_}},
              {$project:{"_id":0,"userId":"$userId","autofollowup": "$autofollowup","tracking": "$tracking","created":"$createdAt","timezone":"$timezone" }},
              {$sort: {"emailsubject": -1}},
              {$limit: 1}
            ])
    
            let getautofollowup_ = getautofollowup[0].autofollowup;
            let _id = getautofollowup[0].userId;
            let mailtsentdate  = getautofollowup[0].created;
            let tracking_  = getautofollowup[0].tracking;
            let autofollowptimezone = getautofollowup[0].timezone;
    
            const newautofollowUp = await autofollowSchema.create({
              userId: _id,
              autofollowupId: autofollowup_Id,
              campaignId: campaignId_,
              messageId: messageId,
              threadId: threadId,
              emailaddress: email,
              name: name,
              emailsubject: subject,
              emailrecipients: campaignrecipients,
              emailrecipient: to,
              mailsentDate: mailtsentdate,
              timezone: autofollowptimezone,
              tracking: tracking_,
              autofollowup: getautofollowup_
            })
    
            
            newautofollowUp.save();
        }
  
        } else {
          res.status(404);
          throw new Error("User Not Found");
        }
  
        // Function to get the labelId by label name.
        async function getLabelIdByName(gmail,labelName) {
    
          try {
            const response = await gmail.users.labels.list({
              userId: 'me',
            });
            
            const labels = response.data.labels;
            const label = labels.find((l) => l.name === labelName);
  
            if (label) {
              return label.id;
            } else {
              throw new Error(`Label "${labelName}" not found.`);
            }
          } catch (err) {
            throw new Error('Error listing labels:', err);
          }
        }
  
        const labelId = await getLabelIdByName(gmail,"Outreach Sent");
        if(labelId) {
          addEmailToLabel(labelId, messageId,email);
        }
        // Function to add an email to a label.
        function addEmailToLabel(labelId, messageId,email) {
          // Specify the email ID and label you want to add the email to.
  
          gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            resource: {
              addLabelIds: [labelId],
            },
          }, (err, response) => {
            if (err) {
              console.error('Error adding email to label:', err);
            } else {
              console.log('Email added to label:');
            }
          });
        }
        
      } else {
        console.log('No messages found.');
      }
  
    }catch(error) {
      console.log(error)
    }
  
    
  };
  

  const repeatCampaign = asyncHandler(async(req,res)=> {

    console.log('req params',req.params);
    agenda.define('send test email', async () => {
      console.log('Job is running!');
    });
    
    (async () => {
      await agenda.start();
      await agenda.every('1 minutes', 'send test email');
    })();    
})

  module.exports = { repeatCampaign }
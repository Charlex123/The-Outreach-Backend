require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const DraftSchema = require("../model/DraftSchema");
const autofollowSchema = require("../model/autofollowSchema");
const firstreportsentSchema = require("../model/firstreportsentSchema");
const User = require("../model/user");
const { generateTrackingLink } = require('../utils');
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const config = require('../config');
const nodemailer = require("nodemailer");
const v4 = require("uuid");
const { get } = require("lodash");
const cron = require("node-cron");

dotenv.config();

const autofollowUpCampaign = asyncHandler(async (req, res) => {
  try {
      
    const useremail_ = req.body;
    const useremail = useremail_.toString();
    console.log('u email string', useremail);
    const verifyuserdata = await User.findOne({email: useremail});

      if (verifyuserdata) {
        
          verifyuserdata.verified = true;
          
          const verifiedUser = await verifyuserdata.save();
          const _id = verifiedUser._id;
          const email = verifiedUser.email;
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

          const checkfirstreportsent = await firstreportsentSchema.findOne({useremail: useremail});

          console.log('check first report sent length',Object.keys(checkfirstreportsent).length)
          if(!checkfirstreportsent || Object.keys(checkfirstreportsent).length === 0) {
            const newmailReport = await firstreportsentSchema.create({
              userId: _id,
              useremail: useremail
            });
          }

          const getautofollowups = await autofollowSchema.find({"emailaddress":useremail,"autofollowup.firstfollowup.status":"unsent"});
          let timenow = moment();
          console.log(' time now ',timenow)
          for (const autofollowup of getautofollowups) {
            try {
              const autofollowup_Id = autofollowup.autofollowupId;
              const message_Id = autofollowup.emailId;
              const thread_Id = autofollowup.threadId;
              const campaign_Id = autofollowup.campaignId;
              const recipient = autofollowup.emailrecipient;
              const subject = autofollowup.emailrecipient;
              const campaignsenttime = autofollowup.mailsentDate;
              const redlinktexta = autofollowup.tracking.redlinktext;
              const redlinkurla = autofollowup.tracking.redlinkurl;
              const followupreply1type = autofollowup.autofollowup.firstfollowup.reply1type;
              const followupreply1interval = autofollowup.autofollowup.firstfollowup.reply1interval;
              const followupreply1time = autofollowup.autofollowup.firstfollowup.reply1time;
              const followupreply1message = autofollowup.autofollowup.firstfollowup.reply1message;
              const followupreply1status = autofollowup.autofollowup.firstfollowup.status;
              const followupreply2type = autofollowup.autofollowup.secondfollowup.reply2type;
              const followupreply2interval = autofollowup.autofollowup.secondfollowup.reply2interval;
              const followupreply2time = autofollowup.autofollowup.secondfollowup.reply2time;
              const followupreply2message = autofollowup.autofollowup.secondfollowup.reply2message;
              const followupreply2status = autofollowup.autofollowup.secondfollowup.status;
              const followupreply3type = autofollowup.autofollowup.thirdfollowup.reply3type;
              const followupreply3interval = autofollowup.autofollowup.thirdfollowup.reply3interval;
              const followupreply3time = autofollowup.autofollowup.thirdfollowup.reply3time;
              const followupreply3message = autofollowup.autofollowup.thirdfollowup.reply3message;
              const followupreply3status = autofollowup.autofollowup.thirdfollowup.status;

                  
              // Function to check if a message has a reply
              // function checkIfMessageHasReply() {
              //   return new Promise((resolve, reject) => {
                  
              //     gmail.users.threads.list({
              //       userId: 'me',
              //       q: `in:inbox id:${message_Id}`, // Search for the thread containing the message
              //     }, (err, res) => {
              //       if (err) {
              //         reject(err);
              //         return;
              //       }

              //       const threads = res.data.threads;
              //       console.log('res 00--', res)
              //       console.log('res data 00--', res.data)
              //       console.log('threads 00--', threads)
              //       const hasReply = threads;
              //       resolve(threads);
              //     });
              //   });
              // }

              // const checkmessagereply = await checkIfMessageHasReply();

              // console.log('check reply',checkmessagereply)


              if(followupreply1type && followupreply1type !== "" && followupreply1type === "r") {
                console.log('rrrrr1',followupreply1type)
                if(followupreply1time && followupreply1time !== "" && followupreply1time !== undefined && followupreply1time !== null) {
                  const ffrplt = moment(campaignsenttime).add(`${followupreply1interval}`,'days');
                  const freply1timer = moment(ffrplt,followupreply1time);
                  console.log('ffrplt',ffrplt)
                  console.log('ffrplt',freply1timer)
                  // send first autofollowupreport
                  const getfirstautofol_upsentReport = await firstreportsentSchema.find({"useremail":useremail,"firstautofollowupemailreport":"unsent"});
                  console.log('get first sent report aaa',Object.keys(getfirstautofol_upsentReport).length)
                  if(Object.keys(getfirstautofol_upsentReport).length > 0) {
                    sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail, accessToken, refreshToken,redlinktexta,redlinkurla,autofollowup_Id);
                  }
                  
                  if(timenow.isSameOrAfter(freply1timer)) {
                    sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply1message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                    console.log('hella',moment().format('hh:mm:ss'))
                  }
                  
                }else {
                  const ffrplt = moment(campaignsenttime).add(`${followupreply1interval}`,'days');
                  const freply1timer_ = moment(ffrplt);
                  console.log('ffrplt',freply1timer_)
                  if(timenow.isSameOrAfter(freply1timer_)) {
                    sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply1message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                    console.log('hella',moment().format('hh:mm:ss'))
                  }
                }
              } 

              if(followupreply2type && followupreply2type !== "" && followupreply2type === "r") {
                if(followupreply2time && followupreply2time !== "" && followupreply2time !== undefined && followupreply2time !== null) {
                  const ffrplt2 = moment(campaignsenttime).add(`${followupreply2interval}`,'days');
                  freply2timer = moment(ffrplt2,followupreply2time);

                  // send first autofollowupreport
                  const getfirstautofol_upsentReport = await firstreportsentSchema.find({"useremail":useremail,"firstautofollowupemailreport":"unsent"});
                  console.log('get first sent report',getfirstautofol_upsentReport)
                  if(Object.keys(getfirstautofol_upsentReport).length > 0) {
                    sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail, accessToken, refreshToken,redlinktexta,redlinkurla,autofollowup_Id);
                  }
                  

                  if(timenow.isSameOrAfter(freply2timer)) {
                    sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply2message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                  }
                  
                }else {
                  const ffrplt2 = moment(campaignsenttime).add(`${followupreply2interval}`,'days');
                  freply2timer = moment(ffrplt2);
                  if(timenow.isSameOrAfter(freply2timer)) {
                    sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply2message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                  }
                }
              }
              
              if(followupreply3type && followupreply3type !== "" && followupreply3type === "r") {
                if(followupreply3time && followupreply3time !== "" && followupreply3time !== undefined && followupreply3time !== null) {
                  const ffrplt3 = moment(campaignsenttime).add(`${followupreply3interval}`,'days');
                  freply3timer = moment(ffrplt3,followupreply3time);
                  console.log('ffr timer 3 33',freply3timer)
                  // send first autofollowupreport
                  const getfirstautofol_upsentReport = await firstreportsentSchema.find({"useremail":useremail,"firstautofollowupemailreport":"unsent"});
                  console.log('get first sent report',getfirstautofol_upsentReport)
                  if(Object.keys(getfirstautofol_upsentReport).length > 0) {
                    sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail, accessToken, refreshToken,redlinktexta,redlinkurla,autofollowup_Id);
                  }
                  
                  
                  if(timenow.isSameOrAfter(freply3timer)) {
                    sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply3message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                  }
                  
                }else {
                  const ffrplt3 = moment(campaignsenttime).add(`${followupreply3interval}`,'days');
                  freply3timer = moment(ffrplt3);
                  if(timenow.isSameOrAfter(freply3timer)) {
                    sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply3message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                  }
                }
              } 
              
              
            } catch (error) {
              console.error(`Ooops!!! something occurred: ${error}`);
            }
          } 

        }else {
          console.log("user not found")
      }
      

    }catch (error) {
      console.log('server error',error);
      // res.status(500).json({ message: error.message });
    }

    
    
  
});


async function sendautofollowupCamp(thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id) {

  let redlinktexter = redlinktexta;
  let redlinkurler = redlinkurla;

  let redlinker;
  if(redlinkurler !== "" && redlinkurler !== undefined && redlinkurler !== null && redlinktexter !== "" && redlinktexter !== undefined && redlinktexter !== null) {
      redlinker = `<a href="${config.BACKEND_URL}/campaignclicks/${userappkey}/${message_Id}/${redlinkurler}">${redlinktexter}</a>`;
  }else {
      redlinker = "";
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
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
    from: useremail,
    to: recipient,
    subject: subject,
    html: `<div class="getap-op"><img src="${config.BACKEND_URL}/campaignopens/${userappkey}/${message_Id}/image.png" style="display: none" class="kioper" alt="imager"><p>${body}<div style="margin: 2rem auto 1rem auto">${redlinker}</div></p></div>`,
    autofollowupId: autofollowup_Id
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else {
      console.log('Email sent: ' + info.response);
      updateautofollowupsentStatus(mailOptions.from,thread_Id,campaign_Id,message_Id,mailOptions.autofollowupId)
      autofollowupsentSuccess(mailOptions.from,thread_Id,campaign_Id,message_Id)
    }
  });
  
  
}

async function updateautofollowupsentStatus(useremail,threadId,campaignId,messageId,autofollowupId) {
  const updautofollowupstat = await autofollowSchema.updateOne({"emailaddress":useremail,"campaignId": campaignId,"autofollowup":autofollowupId},{$set: {"autofollowup.firstfollowup.status":"sent"}});
  if(updautofollowupstat) {
    console.log('updautofollowupstat status: success')
  }
}

async function sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail,accesstoken,refreshtoken,redlinktexta,redlinkurla,autofollowup_Id) {

  let redlinktexter = redlinktexta;
  let redlinkurler = redlinkurla;

  let redlinker;
  if(redlinkurler !== "" && redlinkurler !== undefined && redlinkurler !== null && redlinktexter !== "" && redlinktexter !== undefined && redlinktexter !== null) {
      redlinker = `<a href="${config.BACKEND_URL}/campaignclicks/${userappkey}/${campaign_Id}/${message_Id}/${redlinkurler}">${redlinktexter}</a>`;
  }else {
      redlinker = "";
  }
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: useremail,
      clientId: config.client_id,
      clientSecret: config.client_secret,
      refreshToken: refreshtoken,
      accessToken: accesstoken
    }
  });

  let body = "Auto FollowUp Mail sent successful report body";
  let subject = "Auto Follow Up Sent report success"; 
  const mailOptions = {
    from: "aliakbar512006@gmail.com",
    to: useremail,
    subject: subject,
    html: `<html><body><div class="getap-op"><p>${body}<div style="margin: 2rem auto 1rem auto">${redlinker}</div></p></div></body></html>`,
    "gmail":gmail
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      addfirstautofollowupreporttoLabel(mailOptions.gmail,mailOptions.from,mailOptions.subject,mailOptions.to,mailOptions.html)
    }
  });
}

async function addfirstautofollowupreporttoLabel(gmail,from,subject,to,body) {
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

      const labelId = await getLabelIdByName(gmail,"Outreach Auto FollowUp");
      if(labelId) {
        addEmailToLabel(labelId, messageId,to);
      }
      // Function to add an email to a label.
      function addEmailToLabel(labelId, messageId, to) {
        // Specify the email ID and label you want to add the email to.
        const emailId = messageId;

        gmail.users.messages.modify({
          userId: 'me',
          id: emailId,
          resource: {
            addLabelIds: [labelId],
          },
        }, (err, response) => {
          if (err) {
            console.error('Error adding email to label:', err);
          } else {
            console.log('Email added to label');
            firstsentautofollowupreport_(to)
          }
        });
      }
    }
  }catch(error) {

    }
}

async function firstsentautofollowupreport_(to) {
  const checkreport = await firstreportsentSchema.findOne({'useremail': to},{firstautofollowupemailreport: "unsent"});
  // check if report details exists
  if (checkreport || Object.keys(checkreport).length > 0) {
      checkreport.verified = true;
      const updatedautofollowupfirstsentreport = await firstreportsentSchema.updateOne({'useremail':to,'firstautofollowupemailreport': "unsent"},{$set: {firstautofollowupemailreport: 'sent'}});
      if(updatedautofollowupfirstsentreport) {
      }
      
    }else {
      console.log('no user in check report')
    }
  }

  async function autofollowupsentSuccess(useremail,emailId,threadId,campaignId) {
    const updatedautofollowupcampaign = await campaignSchema.updateOne({'emailaddress':useremail,'emailId': emailId,'threadId': threadId,'campaignId': campaignId},{$set: {"autofollowup.status": 'sent'}});
    if(updatedautofollowupcampaign) {
      console.log('updated autofollow up campaign success')
    }
    
  }

module.exports = { autofollowUpCampaign  };

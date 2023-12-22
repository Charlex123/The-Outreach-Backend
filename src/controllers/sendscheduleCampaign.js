require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const scheduleSchema = require("../model/scheduleSchema");
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

const scheduleCampaign = asyncHandler(async (req, res) => {
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

          if(!checkfirstreportsent || Object.keys(checkfirstreportsent).length === 0) {
            const newmailReport = await firstreportsentSchema.create({
              userId: _id,
              useremail: useremail
            });
          }else {
            console.log('create d already')
          }

          const getmailcampaign = await campaignSchema.find({"emailaddress":useremail});
          if(getmailcampaign){
            const camprecpts = getmailcampaign.emailrecipients;
            const deliveredtorecpts = getmailcampaign.recipientsdeliveredto;
            const deliveredtorecptscount = getmailcampaign.recipientsdeliveredtocount;
            const remrecpts = getmailcampaign.remainingrecipients;
            const remrecptscount = getmailcampaign.remainingrecipientscount;
            const campcreationtime = getmailcampaign.createdAt;

            let recipients_ = campaignrecipients;
            let recipientLista = recipients_.split(',');
            const uniqueSet = new Set(recipientLista);
            // Convert the Set back to an array
            const recipientLists = [...uniqueSet];
            console.log('mail recipients',recipientLists)
            let campaignId_ = newMailCampaign.campaignId;
            
            const getfirstreportSent = await firstreportsentSchema.find({"useremail":useremail,"firstmailsentreport":"unsent"});
            
            if(getfirstreportSent.length === 0) {
              firstsentreport_(useremail)
            }else {
              sendfirstmailsentReport(gmail,useremail, req.body.accessToken, req.body.refreshToken,campaignId_);
            }

            if(scheduletime === "Now") {
              let senttorecptscount;
              if((recipientLists.length - mailsperday) <= 0) {
                senttorecptscount = recipientLists.length;
              }else {
                senttorecptscount = mailsperday;
              }

              for (let sr = 0; sr < senttorecptscount; sr++) {
                  senttorecipients.push(recipientLists[sr]);
              }
              
              let currentIndex = 0;

              if(delay_ === "1") {
                
                  function sendToEachRecipient() {
                    // Check if there are more elements to process
                    if (currentIndex < senttorecptscount) {
                      const recipient = recipientLists[currentIndex];
                      sendmailCamp(name,senttorecipients,mailsperday,gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_);
                      console.log(`recipient sent to: ${recipient}`);
                      
                      // Increment the index for the next iteration
                      currentIndex++;
                    } else {
                      // If all elements have been processed, stop the interval
                      clearInterval(intervalId);
                      console.log("Finished processing all items.");
                    }
                  }
                  sendToEachRecipient(); // Run it once immediately
                  const intervalId = setInterval(sendToEachRecipient, 10000); // Run it every 10 secs
                
              }else if(delay_ === "2") {
                function sendToEachRecipient() {
                  // Check if there are more elements to process
                  if (currentIndex < senttorecptscount) {
                    const recipient = recipientLists[currentIndex];
                    sendmailCamp(name,senttorecipients,mailsperday,gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_);
                    console.log(`recipient sent to: ${recipient}`);
                    
                    // Increment the index for the next iteration
                    currentIndex++;
                  } else {
                    // If all elements have been processed, stop the interval
                    clearInterval(intervalId);
                    console.log("Finished processing all items.");
                  }
                }
                sendToEachRecipient(); // Run it once immediately
                const intervalId = setInterval(sendToEachRecipient, 60000); // Run it every 10 secs
                
              }else if(delay_ === "3") {
                function sendToEachRecipient() {
                  // Check if there are more elements to process
                  if (currentIndex < senttorecptscount) {
                    const recipient = recipientLists[currentIndex];
                    sendmailCamp(name,senttorecipients,mailsperday,gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_);
                    console.log(`recipient sent to: ${recipient}`);
                    
                    // Increment the index for the next iteration
                    currentIndex++;
                  } else {
                    // If all elements have been processed, stop the interval
                    clearInterval(intervalId);
                    console.log("Finished processing all items.");
                  }
                }
                sendToEachRecipient(); // Run it once immediately
                const intervalId = setInterval(sendToEachRecipient, 300000); // Run it every 10 secs
                
              }else if(delay_ === "5") {
                function sendToEachRecipient() {
                  // Check if there are more elements to process
                  if (currentIndex < senttorecptscount) {
                    const recipient = recipientLists[currentIndex];
                    sendmailCamp(name,senttorecipients,mailsperday,gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_);
                    console.log(`recipient sent to: ${recipient}`);
                    
                    // Increment the index for the next iteration
                    currentIndex++;
                  } else {
                    // If all elements have been processed, stop the interval
                    clearInterval(intervalId);
                    console.log("Finished processing all items.");
                  }
                }
                sendToEachRecipient(); // Run it once immediately
                const intervalId = setInterval(sendToEachRecipient, 600000); // Run it every 10 secs
              }

            }else if(scheduletime === "FiveMinutes") {
              if(skipweekends !== "" && skipweekends == "true") {
                const ffrplt = moment(mailsenttime).add(5,'minutes');
                if(moment().isSameOrAfter(ffrplt)) {
                  // cronExpression = `* * * * 1-5`;
                  sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                }
              }else {
                const ffrplt = moment(campaignsenttime).add(5,'minutes');
                if(moment().isSameOrAfter(ffrplt)) {
                  // cronExpression = `* * * * *`;
                  sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                }
              }
            }
              
          }
          const getscheduledata = await scheduleSchema.find({"emailaddress":useremail,"schedule.status":"unsent"});

          for (const schedule of getscheduledata) {
            try {

              const schedule_Id = schedule.scheduleId;
              const message_Id = schedule.emailId;
              const campaign_Id = schedule.campaignId;
              const recipient = schedule.emailrecipient;
              const name = schedule.name;
              const subject = schedule.emailrecipient;
              const body = schedule.emailbody;
              const campaignsenttime = schedule.mailsentDate;
              const redlinktexta = schedule.tracking.redlinktext;
              const redlinkurla = schedule.tracking.redlinkurl;
              const scheduletime = schedule.schedule.scheduletime;
              const skipweekends = schedule.schedule.skipweekends;
              const mailperday = schedule.schedule.speed.mailsPerDay;
              const delayinterval = schedule.schedule.speed.delay;
              const repeatinterval = schedule.schedule.repeat.repeatinterval;
              const repeattimes = schedule.schedule.repeat.repeattimes;
              const status = schedule.schedule.status;

              let cronExpression;

              if(scheduletime && scheduletime !== "" && scheduletime !== undefined && scheduletime !== null) {
                if(scheduletime === "Now") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime);
                    if(moment().isSameOrAfter(ffrplt)) {
                      console.log('now cron ran')
                      // cronExpression = `* * * * 1-5`;
                      if(mailperday && mailperday !== null) {
                        // Calculate the interval in milliseconds between each run
                        // cronExpression = `*/${Math.floor(24 / mailperday)} * * * 1-5`;
                        // if(delayinterval && delayinterval !== "") {
                          // cronExpression = `*/${Math.floor(24 / mailperday)} * * * 1-5`;
                        // }else {

                        // }
                      }else {
                        // cronExpression = `* * * * 1-5`;
                        // if(delayinterval && delayinterval !== "") {
                        //   cronExpression = `* * * * 1-5`;
                        // }
                      }
                      
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime);
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "FiveMinutes") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(5,'minutes');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(5,'minutes');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "OneHour") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "ThreeHours") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(3,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(3,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "TomorrowMor") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "TomorrowAft") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "TomorrowEve") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }
                }else if(scheduletime === "Custom") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'hour');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'hour');
                    if(moment().isSameOrAfter(ffrplt)) {
                      // cronExpression = `* * * * *`;
                      sendschedulemailCamp(name,cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id)
                    }
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


async function sendschedulemailCamp(name,cronExpression,message_Id,gmail,accesstoken,refreshtoken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,schedule_Id,campaign_Id,cronboolean) {

  console.log('mail cron details',cronExpression)
  let redlinktexter = redlinktexta;
  let redlinkurler = redlinkurla;

  let redlinker;
  if(redlinkurler !== "" && redlinkurler !== undefined && redlinkurler !== null && redlinktexter !== "" && redlinktexter !== undefined && redlinktexter !== null) {
      redlinker = `<a href="${config.BACKEND_URL}/campaignclicks/${userappkey}/${campaign_Id}/${message_Id}/${redlinkurler}" class="redlink">${redlinktexter}</a>`;
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
      refreshToken: refreshtoken,
      accessToken: accesstoken
    }
  });

  const mailOptions = {
    from: {
      name: name,
      address: useremail
    },
    to: recipient,
    subject: subject,
    html: `<html>
              <head>
                <style>
                  body {
                    font-family: 'Tahoma';font-size: 16px;line-height: 0.8px;margin: .5rem auto .5rem auto;
                    text-align: center;
                  }
                  p {
                    text-align: left;
                  }
                  span {
                    text-align: left;
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
                  <img src="${config.BACKEND_URL}/campaignopens/${userappkey}/${message_Id}/image.png" style="display: none" class="kioper" alt="imager">
                  <p>${body}<div style="margin: 1rem auto 1rem auto">${redlinker}</div></p>
                  <br>
                  <div style="margin-top: .2rem">
                    You can <a href='https://theoutreach.co/unsubscribe' class='unsubscribe'>unsubscribe</a> to this email by clicking the above link
                  </div>
                </div>
              </body>
            </html>`,
  };

  // if(cronboolean === true) {
  //   cron.schedule(cronExpression, function () {
  //     console.log('Running Cron Process');
  //     // Delivering mail with sendMail method
  //     transporter.sendMail(mailOptions, (error, info) => {
  //       if (error) {
  //         console.error(error);
  //       } else {
  //         console.log('Email sent: ' + info.response);
  
  //         let query = mailOptions.subject+' to:'+mailOptions.to
  //         console.log('queryyyyyyyy',query)
  //             }
  //     });
  //   });
  // }else {
  //   transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       console.error(error);
  //     } else {
  //       console.log('Email sent: ' + info.response);
  
  //       let query = mailOptions.subject+' to:'+mailOptions.to
  //       console.log('queryyyyyyyy',query)
  //     }
  //   });
  // }
  
}



module.exports = { scheduleCampaign  };

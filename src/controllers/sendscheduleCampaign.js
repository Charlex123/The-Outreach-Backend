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

          console.log('check first schedule report sent length',Object.keys(checkfirstreportsent).length)
          if(!checkfirstreportsent || Object.keys(checkfirstreportsent).length === 0) {
            const newmailReport = await firstreportsentSchema.create({
              userId: _id,
              useremail: useremail
            });
          }else {
            console.log('create d already')
          }

          const getscheduledata = await scheduleSchema.find({"emailaddress":useremail,"schedule.status":"unsent"});

          for (const schedule of getscheduledata) {
            try {

              const schedule_Id = schedule.scheduleId;
              const message_Id = schedule.emailId;
              const campaign_Id = schedule.campaignId;
              const recipient = schedule.emailrecipient;
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
                      cronExpression = `* * * * 1-5`;
                      if(mailperday && mailperday !== null) {
                        // Calculate the interval in milliseconds between each run
                        cronExpression = `*/${Math.floor(24 / mailperday)} * * * 1-5`;
                        if(delayinterval && delayinterval !== "") {
                          cronExpression = `*/${Math.floor(24 / mailperday)} * * * 1-5`;
                        }else {

                        }
                      }else {
                        cronExpression = `* * * * 1-5`;
                        if(delayinterval && delayinterval !== "") {
                          cronExpression = `* * * * 1-5`;
                        }
                      }
                      
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime);
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "FiveMinutes") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(5,'minutes');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(5,'minutes');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "OneHour") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "ThreeHours") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(3,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(3,'hours');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "TomorrowMor") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "TomorrowAft") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "TomorrowEve") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'days');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }
                }else if(scheduletime === "Custom") {
                  if(skipweekends !== "" && skipweekends == "true") {
                    const ffrplt = moment(campaignsenttime).add(1,'hour');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * 1-5`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
                    }
                  }else {
                    const ffrplt = moment(campaignsenttime).add(1,'hour');
                    if(moment().isSameOrAfter(ffrplt)) {
                      cronExpression = `* * * * *`;
                      sendschedulemailCamp(cronExpression,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla)
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


async function sendschedulemailCamp(cronExpression,message_Id,gmail,accesstoken,refreshtoken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla) {

  console.log('mail cron details',cronExpression)
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
      refreshToken: refreshtoken,
      accessToken: accesstoken
    }
  });

  const mailOptions = {
    from: useremail,
    to: recipient,
    subject: subject,
    html: `<div class="getap-op"><img src="${config.BACKEND_URL}/campaignopens/${userappkey}/${message_Id}/image.png" style="display: none" class="kioper" alt="imager"><p>${body}<div style="margin: 2rem auto 1rem auto">${redlinker}</div></p></div>`,
  };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.error(error);
  //   } else {
  //     console.log('Email sent: ' + info.response);

  //     let query = mailOptions.subject+' to:'+mailOptions.to
  //     console.log('queryyyyyyyy',query)
  //         }
  // });

  cron.schedule(cronExpression, function () {
    console.log('Running Cron Process');
    // Delivering mail with sendMail method
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
      } else {
        console.log('Email sent: ' + info.response);

        let query = mailOptions.subject+' to:'+mailOptions.to
        console.log('queryyyyyyyy',query)
            }
    });
  });

}



module.exports = { scheduleCampaign  };

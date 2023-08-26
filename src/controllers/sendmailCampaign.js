require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const DraftSchema = require("../model/DraftSchema");
const { generateTrackingLink } = require('../utils');
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const config = require('../config');
const nodemailer = require("nodemailer");
const v4 = require("uuid");

dotenv.config();
const email_Id = `${
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15)
}`;

const mailCampaign = asyncHandler(async (req, res) => {
  try {
      
      const maildetails = req.body;
      console.log(maildetails);
      const useremail = req.body.useremail;
      const emailsubject = req.body.mailcampaignsubject;
      const emailbody = req.body.mailcampaignbody;
      const emailrecipients = req.body.mailcampaignrecipents;
      const trackbyopen = req.body.trackbyopen;
      const trackbyclicks = req.body.trackbyclicks;
      const action = req.body.mailsendtesttype;
      const followupreply1type = req.body.followupreply1type;
      const followupreply1interval = req.body.followupreply1interval;
      const followupreply1time = req.body.followupreply1time;
      const followupreply1message = req.body.followupreply1message;
      const followupreply2type = req.body.followupreply2type;
      const followupreply2interval = req.body.followupreply2interval;
      const followupreply2time = req.body.followupreply2time;
      const followupreply2message = req.body.followupreply2message;
      const followupreply3type = req.body.followupreply3type;
      const followupreply3interval = req.body.followupreply3interval;
      const followupreply3time = req.body.followupreply3time;
      const followupreply3message = req.body.followupreply3message;
      const scheduletime = req.body.scheduletime;
      const skipweekends = req.body.skipweekends;
      const mailsperday = req.body.mailsperday;
      const delay_ = req.body.senddelayinterval;
      const repeatinterval = req.body.repeatinterval;
      const repeattimes = req.body.repeatTimes;
      const sendas = req.body.sendas;
      const verifyemail = req.body.verifyemails;

      // const { emails, body, subject,draft,rt } = req.body;
      // let drafttMessageId = draft.split(':')[1]
      // let labelId = req.user?.emailLabels.find((label) => {
      //   const regex = new RegExp(
      //     `${req.body.labelName}|Outreach \\[Campaigns\\]/Drafts`
      //   );
      //   return regex.test(label.name);
      // })?.id;
      
      const oAuth2Client = new google.auth.OAuth2(
        config.client_id,
        config.client_secret,
        config.redirect_uris
      );

      console.log('Oauth', oAuth2Client)

      oAuth2Client.setCredentials({
        access_token: req.body.accessToken,
        refresh_token: req.body.refreshToken
      });
      

      const gmail = google.gmail({
        version: 'v1',
        auth: oAuth2Client
      });
      
      if(action === '1') {
        const newMailCampaign = await campaignSchema.create({
          emailId: email_Id,
          emailaddress: useremail,
          emailsubject: emailsubject,
          emailbody: emailbody,
          emailrecipients: emailrecipients,
          tracking: {
            isOpened: trackbyopen,
            isClicked: trackbyclicks,
          },
          action: action, // Or any valid number for the action
          autofollowup: {
            firstfollowup: {
              reply1type: followupreply1type,
              reply1interval: followupreply1interval,
              reply1time: followupreply1time,
              reply1message: followupreply1message,
            },
            secondfollowup: {
              reply2type: followupreply2type,
              reply2interval: followupreply2interval,
              reply2time: followupreply2time,
              reply2message: followupreply2message,
            },
            thirdfollowup: {
              reply3type: followupreply3type,
              reply3interval: followupreply3interval,
              reply3time: followupreply3time,
              reply3message: followupreply3message,
            },
          },
          schedule: {
            scheduletime: scheduletime, // or any time format you prefer
            skipweekends: skipweekends,
            speed: {
              mailsPerDay: mailsperday, // or any valid number
              delay: delay_, // or any valid time interval
            },
            repeat: {
              repeatinterval: repeatinterval, // or any valid number
              repeattimes: repeattimes, // or any valid string
            },
          },
          advance: {
            sendas: sendas,
            verifyemail: verifyemail,
          }
        });
  
        if(newMailCampaign.save()) {
          let recipients_ = req.body.mailcampaignrecipents;
          let recipientLists = recipients_.split(',');

          console.log('rec  ',recipientLists)
          for (const recipient of recipientLists) {
            try {
              const info = await sendmailCamp(recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail);
              console.log(`Email sent to ${recipient}: ${info.response}`);
            } catch (error) {
              console.error(`Error sending email to ${recipient}: ${error}`);
            }
          }  
        }

      }else if(action === '2') {
        const newMailCampaignDraft = await DraftSchema.create({
          emailId: email_Id,
          emailaddress: useremail,
          emailsubject: emailsubject,
          emailbody: emailbody,
          emailrecipients: emailrecipients,
          tracking: {
            isOpened: trackbyopen,
            isClicked: trackbyclicks,
          },
          action: action, // Or any valid number for the action
          autofollowup: {
            firstfollowup: {
              reply1type: followupreply1type,
              reply1interval: followupreply1interval,
              reply1time: followupreply1time,
              reply1message: followupreply1message,
            },
            secondfollowup: {
              reply2type: followupreply2type,
              reply2interval: followupreply2interval,
              reply2time: followupreply2time,
              reply2message: followupreply2message,
            },
            thirdfollowup: {
              reply3type: followupreply3type,
              reply3interval: followupreply3interval,
              reply3time: followupreply3time,
              reply3message: followupreply3message,
            },
          },
          schedule: {
            scheduletime: scheduletime, // or any time format you prefer
            skipweekends: skipweekends,
            speed: {
              mailsPerDay: mailsperday, // or any valid number
              delay: delay_, // or any valid time interval
            },
            repeat: {
              repeatinterval: repeatinterval, // or any valid number
              repeattimes: repeattimes, // or any valid string
            },
          },
          advance: {
            sendas: sendas,
            verifyemail: verifyemail,
          }
        });

        newMailCampaignDraft.save();
      }else if(action === '') {
        const newMailCampaign = await campaignSchema.create({
          emailId: email_Id,
          emailaddress: useremail,
          emailsubject: emailsubject,
          emailbody: emailbody,
          emailrecipients: emailrecipients,
          tracking: {
            isOpened: trackbyopen,
            isClicked: trackbyclicks,
          },
          action: action, // Or any valid number for the action
          autofollowup: {
            firstfollowup: {
              reply1type: followupreply1type,
              reply1interval: followupreply1interval,
              reply1time: followupreply1time,
              reply1message: followupreply1message,
            },
            secondfollowup: {
              reply2type: followupreply2type,
              reply2interval: followupreply2interval,
              reply2time: followupreply2time,
              reply2message: followupreply2message,
            },
            thirdfollowup: {
              reply3type: followupreply3type,
              reply3interval: followupreply3interval,
              reply3time: followupreply3time,
              reply3message: followupreply3message,
            },
          },
          schedule: {
            scheduletime: scheduletime, // or any time format you prefer
            skipweekends: skipweekends,
            speed: {
              mailsPerDay: mailsperday, // or any valid number
              delay: delay_, // or any valid time interval
            },
            repeat: {
              repeatinterval: repeatinterval, // or any valid number
              repeattimes: repeattimes, // or any valid string
            },
          },
          advance: {
            sendas: sendas,
            verifyemail: verifyemail,
          }
        });
  
        if(newMailCampaign.save()) {
          let recipients_ = req.body.mailcampaignrecipents;
          let recipientLists = recipients_.split(',');

          console.log('rec  ',recipientLists)
          for (const recipient of recipientLists) {
            try {
                sendmailCamp(recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail);
                console.log(`Email sent to ${recipient}`);
            } catch (error) {
              console.error(`Error sending email to ${recipient}`);
            }
          }  
        }
      }
      // 385965910519
      if(followupreply1type) {

      }

      
    }catch (error) {
      console.log('server error',error);
      // res.status(500).json({ message: error.message });
    }

    
    
  
});


async function sendmailCamp(recipient,body,subject,accesstoken,refreshtoken,useremail) {
  console.log('recipientaaa',recipient)
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
    html: `<div><img src="${config.redirect_uris}" style="display: none"><p>${body}</p></div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = { mailCampaign,  };

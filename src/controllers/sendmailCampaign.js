require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const DraftSchema = require("../model/DraftSchema");
const autofollowSchema = require("../model/autofollowSchema");
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
const campagn_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;
const autofollowup_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;
const schedule_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;
const defaultthread_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;

dotenv.config();

const mailCampaign = asyncHandler(async (req, res) => {
  try {
      
      const maildetails = req.body;
      const autofolinterval1 = req.body.followupreply1interval; 
      const autofoltime1 = req.body.followupreply1time;
      const autofollowuptime1 = moment().add({days:autofolinterval1,seconds: autofoltime1});

      const autofolinterval2 = req.body.followupreply2interval; 
      const autofoltime2 = req.body.followupreply2time;
      const autofollowuptime2 = moment().add({days:autofolinterval2,seconds: autofoltime2});

      const autofolinterval3 = req.body.followupreply3interval; 
      const autofoltime3 = req.body.followupreply3time;
      const autofollowuptime3 = moment().add({days:autofolinterval3,seconds: autofoltime3});
      
      console.log('autofollowuptime1',autofollowuptime1)
      console.log('autofollowuptime2',autofollowuptime2)
      console.log('autofollowuptime3',autofollowuptime3);

      const redlinktext_ = req.body.redlinktext;
      const redlinkurl_ = req.body.redlinkurl;
      const useremail = req.body.useremail;
      const emailsubject = req.body.mailcampaignsubject;
      const emailbody = req.body.mailcampaignbody;
      const trackbyopen = req.body.trackbyopen;
      const trackbyclicks = req.body.trackbyclicks;
      const action = req.body.mailsendtesttype;
      const followupreply1type = req.body.followupreply1type;
      const followupreply1interval = req.body.followupreply1interval;
      const followupreply1time = autofollowuptime1;
      const followupreply1message = req.body.followupreply1message;
      const followupreply2type = req.body.followupreply2type;
      const followupreply2interval = req.body.followupreply2interval;
      const followupreply2time = autofollowuptime2;
      const followupreply2message = req.body.followupreply2message;
      const followupreply3type = req.body.followupreply3type;
      const followupreply3interval = req.body.followupreply3interval;
      const followupreply3time = autofollowuptime3;
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

      oAuth2Client.setCredentials({
        access_token: req.body.accessToken,
        refresh_token: req.body.refreshToken
      });
      

      const gmail = google.gmail({
        version: 'v1',
        auth: oAuth2Client
      });

      // Function to retrieve recipient email addresses
      async function getRecipientEmails() {
        return new Promise((resolve, reject) => {
            gmail.users.drafts.list({ userId: 'me' }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }

                const drafts = res.data.drafts;
                if (drafts) {
                    const draftId = drafts[0].id; // Assuming you want the first draft's ID

                    gmail.users.drafts.get({ userId: 'me', id: draftId }, (err, res) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        // Extract the message ID
                        const messageId = res.data.message.id;

                        const recipients = res.data.message.payload.headers
                            .filter(header => header.name === 'To')
                            .flatMap(header => header.value.split(','))
                            .map(email => email.trim());

                        resolve(recipients,messageId);
                    });
                } else {
                    resolve([]);
                }
            });
        });
      } 
      
      // Function to retrieve recipient email addresses
      async function getDraftId() {
        return new Promise((resolve, reject) => {
            gmail.users.drafts.list({ userId: 'me' }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }

                const drafts = res.data.drafts;
                if (drafts) {
                    const draftId = drafts[0].id; // Assuming you want the first draft's ID

                    gmail.users.drafts.get({ userId: 'me', id: draftId }, (err, res) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        // Extract the message ID
                        const messageId = res.data.message.id;

                        resolve(messageId);
                    });
                } else {
                    resolve([]);
                }
            });
        });
      } 
      

      const recipientEmails = await getRecipientEmails();
      const draftId = await getDraftId();
      
      let rec_recip = recipientEmails.toString();
      let email_recipt = rec_recip.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
      let campaignrecipients = email_recipt.toString();
      
      let user_AppKey = req.body.userAppKey;
      const verifyuserdata = await User.findOne({userAppKey: user_AppKey});

      if (verifyuserdata) {
        verifyuserdata.verified = true;
        
        const verifiedUser = await verifyuserdata.save();
        const _id = verifiedUser._id;

        const checkfirstreportsent = await firstreportsentSchema.findOne({useremail: useremail});

        if(checkfirstreportsent) {

        }else {
          const newmailReport = await firstreportsentSchema.create({
            userId: _id,
            useremail: useremail
          });
        }
        
        console.log('mail send action here',req.body.mailsendtesttype)
        let senttorecipients = [];

        if(action == '1') {
          const newMailCampaign = await campaignSchema.create({
            userId: _id,
            campaignId: campagn_Id,
            emailId: draftId,
            threadId: defaultthread_Id,
            emailaddress: useremail,
            emailsubject: emailsubject,
            emailbody: emailbody,
            emailrecipients: campaignrecipients.split(','),
            tracking: {
              isOpened: trackbyopen,
              isClicked: trackbyclicks,
              redlinktext: redlinktext_,
              redlinkurl: redlinkurl_,
            },
            action: action, // Or any valid number for the action
            autofollowup: {
              firstfollowup: {
                reply1type: followupreply1type,
                reply1interval: followupreply1interval,
                reply1time: followupreply1time,
                reply1message: followupreply1message,
                status: "unsent",
              },
              secondfollowup: {
                reply2type: followupreply2type,
                reply2interval: followupreply2interval,
                reply2time: followupreply2time,
                reply2message: followupreply2message,
                status: "unsent",
              },
              thirdfollowup: {
                reply3type: followupreply3type,
                reply3interval: followupreply3interval,
                reply3time: followupreply3time,
                reply3message: followupreply3message,
                status: "unsent",
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
            let recipients_ = campaignrecipients;
            let recipientLists = recipients_.split(',');

            let campaignId_ = newMailCampaign.campaignId;
            
            const getfirstreportSent = await firstreportsentSchema.find({"useremail":useremail,"firstmailsentreport":"unsent"});
            console.log('get first sent report',getfirstreportSent)
            console.log('get first sent report length',getfirstreportSent.length)
            if(getfirstreportSent.length != 0) {
              firstsentreport_(useremail)
              console.log('first report already sent')
            }else {
              console.log('send first report')
              sendfirstmailsentReport(gmail,useremail, req.body.accessToken, req.body.refreshToken,campaignId_);
            }

            if(scheduletime === "Now") {
              
              for (let r = 0; r <= mailsperday; r++) {
                let recipient = recipientLists[r];
                senttorecipients.push(recipient);
                try {
                  if(delay_ === "1") {
                    setTimeout(sendmailCamp(gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_), 10000)
                  }else if(delay_ === "2") {
                    setTimeout(sendmailCamp(gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_), 60000)
                  }else if(delay_ === "3") {
                    setTimeout(sendmailCamp(gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_), 300000)
                  }else if(delay_ === "5") {
                    setTimeout(sendmailCamp(gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_), 600000)
                  }else {
                    setTimeout(sendmailCamp(gmail,campaignrecipients,draftId,recipient,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_), 1000)
                  }
                  console.log(`Email sent to ${recipientLists[r]}`);
                } catch (error) {
                  console.error(`Error sending email to ${recipientLists[r]}: ${error}`);
                }
              }
            }else {
              
            }
              
            res.json({
              message: "success"
            })
          }
  
        }else if(action == '2') {
          
          const recipient__ = useremail;
          const subject = emailsubject;
          const messageContent = `<html><body><p>${emailbody}</p></body></html>`;

          const senddraftEmail = {
            message: {
              raw: Buffer.from(
                `To: ${recipient__}\r\n`+
                `Subject: ${subject}\r\n`+
                `Content-Type: text/html; charset=utf-8\r\n\r\n`+
                `${messageContent}`
              ).toString('base64'),
            },
          };
          
          gmail.users.drafts.create(
            {
              userId: 'me', // Use 'me' to refer to the authenticated user's Gmail account.
              resource: senddraftEmail,
            },
            (err, draftResponse) => {
              if (err) {
                console.error('Error creating draft:', err);
              } else {
                console.log('Draft created:', draftResponse.data);
                const draft_id = draftResponse.data.id;
                console.log('draft --id',draft_id)
                // Send the draft email.
                gmail.users.drafts.send(
                  {
                    userId: 'me',
                    draftId: draftResponse.data.id,
                  },
                  (sendErr, sendResponse) => {
                    createdraftModelSchema(draft_id)
                      
                    // if (sendErr) {
                    //   console.error('Error sending draft:', sendErr);
                    // } else {
                    //   console.log('Draft sent:', sendResponse.data);
                    //   createdraftModelSchema(draft_id)
                    //   adddrafttodraftLabel(draft_id,campaignrecipients, gmail, subject, useremail);
                      
                    // }
                  }
                );
              }
            }
          );

          async function createdraftModelSchema(draft_id) {
            console.log('create draft schema true/false')
            const newMailCampaignDraft = await DraftSchema.create({
              userId: _id,
              emailId: draft_id,
              threadId: defaultthread_Id,
              emailaddress: useremail,
              emailsubject: emailsubject,
              emailbody: emailbody,
              emailrecipients: campaignrecipients,
              tracking: {
                isOpened: trackbyopen,
                isClicked: trackbyclicks,
                redlinktext: redlinktext_,
                redlinkurl: redlinkurl_,
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
          }
          
          const getfirstdraftreport = await firstreportsentSchema.find({"useremail":useremail,"firstdraftreport":"unsent"});
          // console.log('get first draft report',getfirstdraftreport.length)
          if(getfirstdraftreport.length != 0) {
            let recipients_ = campaignrecipients;
            let recipientLists = recipients_.split(',');
          
            const recipient = recipients_;
            const subject = 'How Outreach Mail Draft Works';
            const messageContent = '<html><body><p>This is an HTML email draft with recipient and message variables.</p></body></html>';

            const draftEmail = {
              message: {
                subject: 'How Outreach Mail Draft Works',
                raw: Buffer.from(
                  `To: ${recipient}\r\n` +
                  `Subject: ${subject}\r\n` +
                  `Content-Type: text/html; charset=utf-8\r\n\r\n` +
                  `${messageContent}`
                ).toString('base64'),
              },
            };
            
            gmail.users.drafts.create(
              {
                userId: 'me', // Use 'me' to refer to the authenticated user's Gmail account.
                resource: draftEmail,
              },
              (err, draftResponse) => {
                if (err) {
                  console.error('Error creating draft report:', err);
                } else {
                  console.log('First Draft report created:', draftResponse.data);
                  const draft_id = draftResponse.data.id;
                  // Send the draft email.
                  gmail.users.drafts.send(
                    {
                      userId: 'me',
                      draftId: draftResponse.data.id,
                    },
                    (sendErr, sendResponse) => {
                      // adddrafttodraftLabel(draft_id,campaignrecipients, gmail, subject, useremail);
                      // firstdraftsentreport_(useremail)
                      // if (sendErr) {
                      //   console.error('Error sending first draft report:', sendErr);
                      // } else {
                      //   console.log('first Draft report sent:', sendResponse.data);
                      //   adddrafttodraftLabel(draft_id,campaignrecipients, gmail, subject, useremail);
                      // }
                    }
                  );
                }
              }
            );
          }
        
          res.json({
            message: "success"
          })

        }
        // 385965910519
        

        } else {
          res.status(404);
          throw new Error("User Not Found");
        }

      

      
    }catch (error) {
      console.log('server error',error);
      // res.status(500).json({ message: error.message });
    }

    
    
  
});


async function sendmailCamp(gmail,campaignrecipients,draftId,recipient,body,subject,accesstoken,refreshtoken,useremail,userappkey,redlinktexta,redlinkurla,campaignId_) {

  let redlinktexter = redlinktexta;
  let redlinkurler = redlinkurla;

  let redlinker;
  if(redlinkurler !== "" && redlinkurler !== undefined && redlinkurler !== null && redlinktexter !== "" && redlinktexter !== undefined && redlinktexter !== null) {
      redlinker = `<a href="${config.BACKEND_URL}/campaignclicks/${userappkey}/${campaignId_}/${redlinkurler}">${redlinktexter}</a>`;
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
    from: useremail,
    to: recipient,
    subject: subject,
    html: `<html>
              <head>
                <style>
                  body {
                    font-family: 'Tahoma';font-size: 16px;line-height: 0.8px;margin: 1rem auto 1rem auto;
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
                  <img src="${config.BACKEND_URL}/campaignopens/${userappkey}/${campaignId_}/image.png" style="display: none" class="kioper" alt="imager">
                  <p>${body}<div style="margin: 2rem auto 1rem auto">${redlinker}</div></p>
                  <br>
                  <div style="margin-top: 2rem">
                    You can <a href='https://theoutreach.co/unsubscribe'>unsubscribe</a> to this email by clicking the above link
                  </div>
                </div>
              </body>
            </html>`,
    "campaignrecipients":campaignrecipients,
    "gmail":gmail,
    "body_": body,
    campaignId_: campaignId_
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      updateEmailCampaignId(mailOptions.campaignrecipients,mailOptions.gmail,mailOptions.from,mailOptions.subject,mailOptions.to,mailOptions.body_,mailOptions.campaignId_)
    }
  });
}


async function sendfirstmailsentReport(gmail,useremail,accesstoken,refreshtoken,campaignId_) {

  
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

  let body = "Mail sent successful report body";
  let subject = "Sent report success"; 
  const mailOptions = {
    from: "aliakbar512006@gmail.com",
    to: useremail,
    subject: subject,
    html: `<html><body><div class="getap-op"><p>${body}</p></div></body></html>`,
    "gmail":gmail
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      firstsentreport_(mailOptions.to)
      addfirstreportsentmailtoLabel(mailOptions.gmail,mailOptions.from,mailOptions.subject,mailOptions.to,mailOptions.html)
    }
  });
}


async function firstsentreport_(to) {
  const checkreport = await firstreportsentSchema.findOne({'useremail': to},{firstmailsentreport: "unsent"});
  
  if (checkreport) {
    checkreport.verified = true;
    const updatedfirstsentreport = await firstreportsentSchema.updateOne({'useremail':to},{$set: {firstmailsentreport: 'sent'}});
    if(updatedfirstsentreport) {
      console.log('updated first sent report',updatedfirstsentreport)
    }
  }
}


async function addfirstreportsentmailtoLabel(gmail,from,subject,to,body) {
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

      const labelId = await getLabelIdByName(gmail,"Outreach Sent");
      if(labelId) {
        addEmailToLabel(labelId, messageId,from);
      }
      // Function to add an email to a label.
      function addEmailToLabel(labelId, messageId,from) {
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
            console.log('Email added to label:', response);
            firstsentreport_(from)
          }
        });
      }
    }
  }catch(error) {

    }
}


async function updateEmailCampaignId(campaignrecipients, gmail, from, subject, to, body,campaignId_) {

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
      let rmrecipients = [];
      const emailrecipts = campaignrecipients.split(',');
      const reciptscount_ = emailrecipts.length;
      let rmrecipientscount;
      if((reciptscount_ - mailsperday) > 0) {
        rmrecipientscount = reciptscount_ - mailsperday;
        for(let rr = mailsperday; rr <= emailrecipts.length; rr++) {
          rmrecipients.push(emailrecipts[rr]);
        }
      }else {
        rmrecipientscount = 0;
      }

      const campaign = await campaignSchema.findOne({'campaignId':campaignId_});
      if (campaign) {
        campaign.emailId = messageId;
        campaign.threadId = threadId; 
        campaign.recipientscount = reciptscount_;
        campaign.recipientsdeliveredto = senttorecipients;
        campaign.recipientsdeliveredtocount = mailsperday;
        campaign.remainingrecipientscount = rmrecipientscount;
        campaign.remainingrecipients = rmrecipients;
          
        const updatedCampgn = await campaign.save();
        if(updatedCampgn) {

          const getautofollowup = await campaignSchema.aggregate([ 
            {$match: {'campaignId':campaignId_}},
            { $project:{"_id":0,"userId":"$userId","autofollowup": "$autofollowup","tracking": "$tracking","created":"$createdAt" }},
            {$sort: {"emailsubject": -1}},
            {$limit: 1}
          ])
  
          const getschedule = await campaignSchema.aggregate([ 
            {$match: {'campaignId':campaignId_}},
            { $project:{"_id":0,"userId":"$userId","schedule": "$schedule","tracking": "$tracking","created":"$createdAt" }},
            {$sort: {"emailsubject": -1}},
            {$limit: 1}
          ])
  
          let getautofollowup_ = getautofollowup[0].autofollowup;
          let _id = getautofollowup[0].userId;
          let mailtsentdate  = getautofollowup[0].created;
          let tracking_  = getautofollowup[0].tracking;
  
          const newautofollowUp = await autofollowSchema.create({
            userId: _id,
            autofollowupId: autofollowup_Id,
            campaignId: campaignId_,
            emailId: messageId,
            threadId: threadId,
            emailaddress: from,
            emailsubject: subject,
            emailrecipients: campaignrecipients,
            emailrecipient: to,
            mailsentDate: mailtsentdate,
            tracking: tracking_,
            autofollowup: getautofollowup_
          })
  
          let getschedule_ = getschedule[0].schedule;
          let _id_ = getschedule[0].userId;
          let scheduletracking_ = getschedule[0].tracking;
          let mailtsentdate_  = getschedule[0].created;
          const newSchedule = await scheduleSchema.create({
            userId: _id_,
            scheduleId: schedule_Id,
            campaignId: campaignId_,
            emailId: messageId,
            threadId: threadId,
            emailaddress: from,
            emailsubject: subject,
            emailbody: body,
            emailrecipients: campaignrecipients,
            emailrecipient: to,
            mailsentDate: mailtsentdate_,
            tracking: scheduletracking_,
            schedule: getschedule_
          })
  
          newautofollowUp.save();
  
          newSchedule.save();
        }

      } else {
        res.status(404);
        throw new Error("User Not Found");
      }

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
        addEmailToLabel(labelId, messageId,from);
      }
      // Function to add an email to a label.
      // function addEmailToLabel(labelId, messageId,from) {
      //   // Specify the email ID and label you want to add the email to.
      //   const emailId = messageId;

      //   gmail.users.messages.modify({
      //     userId: 'me',
      //     id: emailId,
      //     resource: {
      //       addLabelIds: [labelId],
      //     },
      //   }, (err, response) => {
      //     if (err) {
      //       console.error('Error adding email to label:', err);
      //     } else {
      //       console.log('Email added to label:', response);
      //       firstsentreport_(from)
      //     }
      //   });
      // }

    } else {
      console.log('No messages found.');
    }

  }catch(error) {
    console.log(error)
  }

  
};


// async function adddrafttodraftLabel(draftid,campaignrecipients, gmail, subject, from) {

//   try{

//     // Retrieve the email threads in the user's mailbox
//     let query = subject; 
//     const draft = await gmail.users.drafts.get({
//       userId: 'me',
//       id: draftid,
//     });

//     if (draft) {
      
//       // Function to get the labelId by label name.
//       async function getLabelIdByName(gmail,labelName) {
        
//         try {
//           const response = await gmail.users.labels.list({
//             userId: 'me',
//           });
          
//           const labels = response.data.labels;
//           const label = labels.find((l) => l.name === labelName);

//           if (label) {
//             return label.id;
//           } else {
//             throw new Error(`Label "${labelName}" not found.`);
//           }
//         } catch (err) {
//           throw new Error('Error listing labels:', err);
//         }
//       }

//       const labelId = await getLabelIdByName(gmail,"Outreach Drafts");
//       if(labelId) {
//         firstdraftsentreport_(from)
//       }
//       // Function to add an email to a label.
//       function addDraftToLabel(labelId, draftid, from) {
//         // Specify the email ID and label you want to add the email to.
//         const draftId = draftid;

//         gmail.users.drafts.update({
//           userId: 'me',
//           id: draftId,
//           resource: {
//             addLabelIds: [labelId],
//           },
//         }, (err, response) => {
//           if (err) {
//             console.error('Error adding email to label:', err);
//           } else {
//             console.log('Email added to label:', response);
            
//           }
//         });
//       }
      
      
//     } else {
//       console.log('No messages found.');
//     }

//   }catch(error) {
//     console.log(error)
//   }

  
// };

// async function firstdraftsentreport_(from) {
//   const checkreport = await firstreportsentSchema.findOne({'useremail': from},{firstdraftreport: "unsent"});
//   console.log('first report sent schemma')
//   if (checkreport.length > 0) {
//     checkreport.verified = true;
//     const updatedfirstsentdraftreport = await firstreportsentSchema.updateOne({ 'useremail': from, firstdraftreport: "unsent" },{$set: {firstdraftreport: 'sent'}});
//     if(updatedfirstsentdraftreport) {
//       console.log('updated first draft report',updatedfirstsentdraftreport)
//     }
    
//     }
// }

// async function firstsentreport_(from) {
//   const checkreport = await firstreportsentSchema.findOne({'useremail': from},{firstmailsentreport: "unsent"});
  
//   if (checkreport.length > 0) {
//     checkreport.verified = true;
//     const updatedfirstsentreport = await firstreportsentSchema.updateOne({'useremail':from, firstmailsentreport: 'unsent'},{$set: {firstmailsentreport: 'sent'}});
//     if(updatedfirstsentreport) {
//       console.log('updated first sent report',updatedfirstsentreport)
//     }
//   }
// }

module.exports = { mailCampaign };

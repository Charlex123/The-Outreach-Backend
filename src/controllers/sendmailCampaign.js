require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const DraftSchema = require("../model/DraftSchema");
const autofollowSchema = require("../model/autofollowSchema");
const AutoFollowUpMessage = require("../model/autofollowupMessageSchema");
const firstreportsentSchema = require("../model/firstreportsentSchema");
const { sendautofollowupCamp } = require("./sendautofollowupEmail")
const User = require("../model/user");
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const config = require('../config');
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const v4 = require("uuid");
dotenv.config();

const campagn_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;
const autofollowup_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;
const defaultthread_Id = `${
  Math.floor(100000000 + Math.random() * 900000000)
}`;

const mailCampaign = asyncHandler(async (req, res) => {
  try {
      // const autofolinterval1 = req.body.followupreply1interval; 
      // const autofoltime1 = req.body.followupreply1time;
      const autofollowuptime1 = moment().add(24,'hours');

      // const autofolinterval2 = req.body.followupreply2interval;
      let autofollowuptime2;
      const autofoltime2 = req.body.followupreply2time;
      const autofolinterval2 = req.body.followupreply2interval;
      if(autofoltime2 && autofoltime2 !== null) {
        autofollowuptime2 = moment(autofoltime2).add(autofolinterval2,'days');
      }else {
        autofollowuptime2 = null;
      }
      
      // const autofolinterval3 = req.body.followupreply3interval; 
      let autofollowuptime3;
      const autofoltime3 = req.body.followupreply3time;
      const autofolinterval3 = req.body.followupreply3interval;
      if(autofoltime3 && autofoltime3 !== null) {
        autofollowuptime3 = moment(autofoltime3).add(autofolinterval3,'days');
      }else {
        autofollowuptime3 = null;
      }
      
      console.log('autofollowuptime1',autofollowuptime1)
      console.log('autofollowuptime2',autofollowuptime2)
      console.log('autofollowuptime3',autofollowuptime3);

      process.env.TZ = req.body.timezone;
      const name = req.body.name;
      const redlinktext_ = req.body.redlinktext;
      const redlinkurl_ = req.body.redlinkurl;
      const useremail = req.body.useremail;
      const emailsubject = req.body.mailcampaignsubject;
      const emailbody = req.body.mailcampaignbody;
      const trackbyopen = req.body.trackbyopen;
      const trackbyclicks = req.body.trackbyclicks;
      const timezone = req.body.timezone;
      const action = req.body.mailsendtesttype;
      const followupreply1type = req.body.followupreply1type;
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
        let recipients_ = campaignrecipients;
        let recipientLista = recipients_.split(',');
        const uniqueSet = new Set(recipientLista);
        // Convert the Set back to an array
        const recipientLists = [...uniqueSet];
        console.log('mail recipients',recipientLists)

        if(action == '1') {
          const newMailCampaign = await campaignSchema.create({
            userId: _id,
            campaignId: campagn_Id,
            messageId: draftId,
            threadId: defaultthread_Id,
            emailaddress: useremail,
            emailsubject: emailsubject,
            emailbody: emailbody,
            emailrecipients: campaignrecipients,
            recipientscount: recipientLists.length,
            timezone: timezone,
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
                reply1time: followupreply1time,
                reply1message: followupreply1message,
                status: "unsent",
              },
              secondfollowup: {
                reply2type: followupreply2type,
                reply2interval : followupreply2interval,
                reply2time: followupreply2time,
                reply2message: followupreply2message,
                status: "unsent",
              },
              thirdfollowup: {
                reply3type: followupreply3type,
                reply3interval : followupreply3interval,
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
            
            let campaignId_ = newMailCampaign.campaignId;
        
            const getfirstreportSent = await firstreportsentSchema.find({"useremail":useremail,"firstmailsentreport":"unsent"});
          
            if(getfirstreportSent.length === 0) {
              firstsentreport_(useremail)
            }else {
              sendfirstmailsentReport(gmail,useremail, req.body.accessToken, req.body.refreshToken);
            }

            
            if(scheduletime == "Now") {
              startmailSending();
              console.log('scheduletime Now ran');
            }else if(scheduletime == "FiveMinutes"){
              setTimeout(startmailSending,5*60*1000);
            }else if(scheduletime == "OneHour"){
              setTimeout(startmailSending,1*60*60*1000);
            }else if(scheduletime == "ThreeHours"){
              setTimeout(startmailSending,3*60*60*1000);
            }
            // call send function
            function startmailSending() {
                sendmailCamp(recipientLists,mailsperday,delay_,timezone,skipweekends,repeatinterval,repeattimes,name,senttorecipients,mailsperday,gmail,campaignrecipients,draftId,req.body.mailcampaignbody, req.body.mailcampaignsubject, req.body.accessToken, req.body.refreshToken, req.body.useremail, req.body.userAppKey,req.body.redlinktext,req.body.redlinkurl,campaignId_);
            }
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
                      
                    if (sendErr) {
                      console.error('Error sending draft:', sendErr);
                    } else {
                      console.log('Draft sent:', sendResponse.data);
                      createdraftModelSchema(draft_id)
                      adddrafttodraftLabel(draft_id,campaignrecipients, gmail, subject, useremail);
                      
                    }
                  }
                );
              }
            }
          );

          async function createdraftModelSchema(draft_id) {
            const newMailCampaignDraft = await DraftSchema.create({
              userId: _id,
              campaignId: campagn_Id,
              messageId: draftId,
              threadId: defaultthread_Id,
              emailaddress: useremail,
              emailsubject: emailsubject,
              emailbody: emailbody,
              emailrecipients: campaignrecipients,
              recipientscount: recipientLists.length,
              timezone: timezone,
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
                  reply1time: followupreply1time,
                  reply1message: followupreply1message,
                  status: "unsent",
                },
                secondfollowup: {
                  reply2type: followupreply2type,
                  reply2interval : followupreply2interval,
                  reply2time: followupreply2time,
                  reply2message: followupreply2message,
                  status: "unsent",
                },
                thirdfollowup: {
                  reply3type: followupreply3type,
                  reply3interval : followupreply3interval,
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
                      adddrafttodraftLabel(draft_id,campaignrecipients, gmail, subject, useremail);
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
            message: "Draft successfully saved"
          })

        }

        } else {
          res.status(404);
          throw new Error("User Not Found");
        }

      

      
    }catch (error) {
      console.log('server error',error);
      // res.status(500).json({ message: error.message });
    }
  
});


async function sendmailCamp(recipientLists,mailsperday,delay_,timezone,skipweekends,repeatinterval,repeattimes,name,senttorecipients,mailsperday,gmail,campaignrecipients,draftId,body,subject,accesstoken,refreshtoken,useremail,userappkey,redlinktexta,redlinkurla,campaignId_) {

  let delay__ = delay_ * 1000;
  let sendtorecptscount;
            
  if((recipientLists.length - mailsperday) <= 0) {
    sendtorecptscount = recipientLists.length;
  }else {
    sendtorecptscount = mailsperday;
  }

  for (let sr = 0; sr < sendtorecptscount; sr++) {
      senttorecipients.push(recipientLists[sr]);
  }
  
  console.log("sent to recipients",senttorecipients)
  
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
      refreshToken: refreshtoken,
      accessToken: accesstoken
    }
  });

  // Loop through recipients and send original emails with delay
  senttorecipients.forEach((recipient, index) => {
    setTimeout(() => {
        const mailOptions = {
          from: {
            name: name,
            address: useremail
          },
          "email": useremail,
          accessToken: accesstoken,
          refreshToken: refreshtoken,
          to: recipient,
          subject: subject,
          html: `<html>
                    <head>
                      <style>
                        body {
                          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif !important;font-size: 14px;line-height: 22.8px;margin: .5rem 0 .5rem 0;
                          text-align: center;width: 100%;
                        }
                        .getap-op {
                          font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif !important;font-size: 14px;line-height: 22.8px;margin: .5rem 0 .5rem 0;
                          text-align: left;width: 60%;margin-left: 0;
                        }
                        p {
                          text-align: left;font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;font-size: 14px;
                        }
                        div {
                          text-align: left;font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;font-size: 14px;
                        }
                        span {
                          text-align: left;font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;font-size: 14px;
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
          userappkey: userappkey,
          redlinktexta: redlinktexta,
          redlinkurla: redlinkurla,
          "name": name,
          "senttorecipients":senttorecipients
        };

        if(skipweekends == true) {
          let day = date.getDay();
          if((day == 6) || (day ==7)) {

          }else {
            // Delivering mail with sendMail method
            transporter.sendMail(mailOptions, (error,info) => {
              if (error) {
                console.error(error);
              } else {
                console.log('Email sent:', info.response,"+ ----",info.messageId);
                updateEmailCampaignId(mailOptions.name,mailOptions.gmail,mailOptions.email,mailOptions.subject,mailOptions.to,mailOptions.body_,mailOptions.campaignId_,info.messageId,mailOptions.accessToken,mailOptions.refreshToken,mailOptions.userappkey,mailOptions.redlinktexta,mailOptions.redlinkurla)
              }
            });
          }
        }else {
          // skip weekeds false
          // Delivering mail with sendMail method
          transporter.sendMail(mailOptions, (error,info) => {
            if (error) {
              console.error(error);
            } else {
              console.log('Email sent:', info.response,"+ ----",info.messageId);
              updateEmailCampaignId(mailOptions.name,mailOptions.gmail,mailOptions.email,mailOptions.subject,mailOptions.to,mailOptions.body_,mailOptions.campaignId_,info.messageId,mailOptions.accessToken,mailOptions.refreshToken,mailOptions.userappkey,mailOptions.redlinktexta,mailOptions.redlinkurla)
            }
          });
        }
        
      }, index * delay__); // Send emails every 60 seconds
    });
    
}

async function sendfirstmailsentReport(gmail,useremail,accesstoken,refreshtoken) {

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
    from: "Ali Akbar <aliakbar512006@gmail.com>",
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
    checkreport.firstmailsentreport = "sent";

    const updatedfirstsentreport = await checkreport.save();
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
            firstsentreport_(from)
          }
        });
      }
    }
  }catch(error) {

    }
}


async function updateEmailCampaignId(name,gmail, email, subject, to, body,campaignId_,messageId, accessToken,refreshToken,userappkey,redlinktexta,redlinkurla) {

  try{
    // Retrieve the email threads in the user's mailbox
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: subject,
    });

    const messages = response.data.messages;

    console.log("mail messageId --",messageId)
    console.log("mail send details",messages);
    const message__Id = messageId;

    if (messages[0]) {
      const messageId = messages[0].id;
      const threadId = messages[0].threadId;

      const campaign = await campaignSchema.findOne({'campaignId':campaignId_});

      if (campaign) {

        campaign.nextRun = moment().add(1,'day');
        await campaign.save();

        let rmrecipientscount = campaign.remainingrecipientscount;
        let rmrecipients = campaign.remainingrecipients;
        let deliveredto = campaign.recipientsdeliveredto;
        let deliveredtocount = campaign.recipientsdeliveredtocount;
        let mailsperday = campaign.schedule.speed.mailsPerDay;
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
            console.log('rem recpt array count',rmrecipientsarray.length)
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
          
        const updatedCampgn = await campaign.save();
        if(updatedCampgn) {

          const getautofollowup = await campaignSchema.aggregate([ 
            {$match: {'campaignId':campaignId_}},
            { $project:{"_id":0,"userId":"$userId","autofollowup": "$autofollowup","tracking": "$tracking","created":"$createdAt","timezone":"$timezone" }},
            {$sort: {"emailsubject": -1}},
            {$limit: 1}
          ])
  
          let getautofollowup_ = getautofollowup[0].autofollowup;
          let getautofollowup2interval = getautofollowup[0].autofollowup.secondfollowup.reply2interval;
          let getautofollowup3interval = getautofollowup[0].autofollowup.thirdfollowup.reply3interval;
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

          // check for autoreplymessage
          let afsubject1;
          let afmessage1;
          let afsubject2;
          let afmessage2;
          let afsubject3;
          let afmessage3;
          const getafm = await AutoFollowUpMessage.findOne({email: email});

          if(getafm) {
              afsubject1 = subject;
              afmessage1 = getafm.autofollowupmessage;
              afsubject2 = subject;
              afmessage2 = getafm.autofollowupmessage;
              afsubject3 = subject;
              afmessage3 = getafm.autofollowupmessage;
          }else {
              afsubject1 = subject;
              afmessage1 = followupreply1message;
              afsubject2 = subject;
              afmessage2 = followupreply2message;
              afsubject3 = subject;
              afmessage3 = followupreply3message;
          }

          // autofollow up 1 timeout
          setTimeout(function() {
            sendautofollowupCamp(name,threadId,campaignId_,messageId,gmail,accessToken,refreshToken,afsubject1,to,afmessage1,email,userappkey,redlinktexta,redlinkurla,autofollowup_Id);
          }, 86400000)
          // autofollow up 2 timeout
          if(getautofollowup2interval) {
            setTimeout(function() {
              sendautofollowupCamp(name,threadId,campaignId_,messageId,gmail,accessToken,refreshToken,afsubject2,to,afmessage2,email,userappkey,redlinktexta,redlinkurla,autofollowup_Id);
            }, getautofollowup2interval * 86400 * 1000)
          }
          
          // autofollow up 3 timeout
          if(getautofollowup3interval) {
            setTimeout(function() {
              sendautofollowupCamp(name,threadId,campaignId_,messageId,gmail,accessToken,refreshToken,afsubject3,to,afmessage3,email,userappkey,redlinktexta,redlinkurla,autofollowup_Id);
            }, getautofollowup3interval * 86400 * 1000)
          }

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

      const sentlabelId = await getLabelIdByName(gmail,"Outreach Sent");
      const scheduledlabelId = await getLabelIdByName(gmail,"Outreach Scheduled");
      if(sentlabelId) {
        addEmailToLabel(sentlabelId, messageId,email);
      }
      if(scheduledlabelId) {
        addEmailToLabel(scheduledlabelId, messageId,email);
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
            firstsentreport_(email)
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


async function adddrafttodraftLabel(draftid,campaignrecipients, gmail, subject, from) {

  try{

    // Retrieve the email threads in the user's mailbox
    let query = subject; 
    const draft = await gmail.users.drafts.get({
      userId: 'me',
      id: draftid,
    });

    if (draft) {
      
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

      const labelId = await getLabelIdByName(gmail,"Outreach Drafts");
      if(labelId) {
        firstdraftsentreport_(from)
      }
      // Function to add an email to a label.
      // Specify the email ID and label you want to add the email to.
      const draftId = draftid;

      gmail.users.drafts.update({
        userId: 'me',
        id: draftId,
        resource: {
          addLabelIds: [labelId],
        },
      }, (err, response) => {
        if (err) {
          console.error('Error adding email to label:', err);
        } else {
          console.log('Email added to label:', response);
          
        }
      });
      
      
    } else {
      console.log('No messages found.');
    }

  }catch(error) {
    console.log(error)
  }

  
};

async function firstdraftsentreport_(from) {
  const checkreport = await firstreportsentSchema.findOne({'useremail': from},{firstdraftreport: "unsent"});
  console.log('first report sent schemma')
  if (checkreport.length > 0) {
    checkreport.verified = true;
    const updatedfirstsentdraftreport = await firstreportsentSchema.updateOne({ 'useremail': from, firstdraftreport: "unsent" },{$set: {firstdraftreport: 'sent'}});
    if(updatedfirstsentdraftreport) {
      console.log('updated first draft report',updatedfirstsentdraftreport)
    }
    
    }
}

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

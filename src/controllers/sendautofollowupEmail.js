require("express");
const asyncHandler = require("express-async-handler");
const campaignSchema = require('../model/campaignSchema');
const autofollowSchema = require("../model/autofollowSchema");
const firstreportsentSchema = require("../model/firstreportsentSchema");
const User = require("../model/user");
const { google } = require('googleapis');
const moment = require('moment');
const dotenv = require('dotenv');
const config = require('../config');
const nodemailer = require("nodemailer");
const v4 = require("uuid");
const { get } = require("lodash");
const cron = require("node-cron");

dotenv.config();

const loadAutoFollowUp = async () => {
  
  const getautofollowups = await autofollowSchema.find({$or:[{"autofollowup.firstfollowup.status":"unsent"},{"autofollowup.secondfollowup.status":"unsent"},{"autofollowup.thirdfollowup.status":"unsent"}]});
  for (const autofollowup of getautofollowups) {
    console.log('autofollowup --- auto follow upppp')
    try {
      const autofollowup_Id = autofollowup.autofollowupId;
      const message_Id = autofollowup.emailId;
      const thread_Id = autofollowup.threadId;
      const campaign_Id = autofollowup.campaignId;
      const recipient = autofollowup.emailrecipient;
      const name = autofollowup.name;
      const useremail = autofollowup.emailaddress;
      const subject = autofollowup.emailrecipient;
      const campaignsenttime = autofollowup.mailsentDate;
      const redlinktexta = autofollowup.tracking.redlinktext;
      const redlinkurla = autofollowup.tracking.redlinkurl;
      const followupreply1type = autofollowup.autofollowup.firstfollowup.reply1type;
      const followupreply1time = autofollowup.autofollowup.firstfollowup.reply1time;
      const followupreply1message = autofollowup.autofollowup.firstfollowup.reply1message;
      const followupreply1status = autofollowup.autofollowup.firstfollowup.status;
      const followupreply2type = autofollowup.autofollowup.secondfollowup.reply2type;
      const followupreply2interval = autofollowup.autofollowup.secondfollowup.reply2interval;
      const followupreply2time = autofollowup.autofollowup.secondfollowup.reply2time;
      const followupreply2message = autofollowup.autofollowup.secondfollowup.reply2message;
      const followupreply2status = autofollowup.autofollowup.secondfollowup.status;
      const followupreply3type = autofollowup.autofollowup.thirdfollowup.reply3type;
      const followupreply3interval = autofollowup.autofollowup.secondfollowup.reply2interval;
      const followupreply3time = autofollowup.autofollowup.thirdfollowup.reply3time;
      const followupreply3message = autofollowup.autofollowup.thirdfollowup.reply3message;
      const followupreply3status = autofollowup.autofollowup.thirdfollowup.status;

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

          if(followupreply1status == "unsent") {
            if(followupreply1type && followupreply1type !== "" && followupreply1type === "r") {
              console.log('rrrrr1',followupreply1type)
              if(followupreply1time && followupreply1time !== "" && followupreply1time !== undefined && followupreply1time !== null) {
                if(moment().isSameOrAfter(followupreply1time)) {
                  console.log('hella after time',moment(followupreply1time))
                  sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply1message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                }
                // else {
                //   console.log('hella before time',moment(followupreply1time))
                //   sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply1message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                // }
                // send first autofollowupreport
                // const getfirstautofol_upsentReport = await firstreportsentSchema.find({"useremail":useremail,"firstautofollowupemailreport":"unsent"});
                // console.log('get first sent report aaa',Object.keys(getfirstautofol_upsentReport).length)
                // if(Object.keys(getfirstautofol_upsentReport).length > 0) {
                //   sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail, accessToken, refreshToken,redlinktexta,redlinkurla,autofollowup_Id);
                // }
                
              }else {
                console.log('timer zz1 occurred ---')
                sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply1message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
              }
            } 
          }else {
            console.log('auto follow up 1 has been sent',followupreply1status)
          }

          if(followupreply2status == "unsent") {
            if(followupreply2type && followupreply2type !== "" && followupreply2type === "r") {
              if(followupreply2time && followupreply2time !== "" && followupreply2time !== undefined && followupreply2time !== null) {
                if(moment().isSameOrAfter(followupreply2time)) {
                  console.log('hella after time 2',moment(followupreply2time))
                  sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply2message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                }
                // else {
                //   console.log('hella before time 2',moment(followupreply2time))
                //   sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply2message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                // }
                // send first autofollowupreport
                // const getfirstautofol_upsentReport = await firstreportsentSchema.find({"useremail":useremail,"firstautofollowupemailreport":"unsent"});
                // console.log('get first sent report',getfirstautofol_upsentReport)
                // if(Object.keys(getfirstautofol_upsentReport).length > 0) {
                //   sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail, accessToken, refreshToken,redlinktexta,redlinkurla,autofollowup_Id);
                // }
                
              }else {
                sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply2message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
              }
            }
          }else {
            console.log('auto follow up 2 has been sent',followupreply2status)
          }
          
          if(followupreply3status == "unsent") {
            if(followupreply3type && followupreply3type !== "" && followupreply3type === "r") {
              if(followupreply3time && followupreply3time !== "" && followupreply3time !== undefined && followupreply3time !== null) {
                
                if(moment().isSameOrAfter(followupreply3time)) {
                  console.log('hella after time 3',moment(followupreply3time))
                  sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply3message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                }
                // else {
                //   console.log('hella before time 3',moment(followupreply3time))
                //   sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply2message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
                // }
                // send first autofollowupreport
                // const getfirstautofol_upsentReport = await firstreportsentSchema.find({"useremail":useremail,"firstautofollowupemailreport":"unsent"});
                // console.log('get first sent report',getfirstautofol_upsentReport)
                // if(Object.keys(getfirstautofol_upsentReport).length > 0) {
                //   sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail, accessToken, refreshToken,redlinktexta,redlinkurla,autofollowup_Id);
                // }
                
              }else {
                sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,followupreply3message,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id)
              }
            }
          }else {
            console.log('auto follow up 3 has been sent',followupreply3status)
          }
      
        }else {
          console.log("user not found")
      }
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

    } catch (error) {
      console.error(`Ooops!!! something occurred: ${error}`);
    }
  }  
}
loadAutoFollowUp()

// const loadautofollowUpCampaign = asyncHandler(async () => {
//   try {
      
//     const useremail_ = req.body;
//     const useremail = useremail_.toString();
//     console.log('u email string', useremail);
    
//     }catch (error) {
//       console.log('server error',error);
//       // res.status(500).json({ message: error.message });
//     }
// });

// updateautofollowupsentStatus("juanromeroj1962@gmail.com",147826144,311573948);
// async function updateautofollowupsentStatus(useremail,campaignId,autofollowupId) {
//   console.log('auto follow up status update --')
//   const updautofollowupstat1 = await autofollowSchema.updateOne({"emailaddress":useremail,"campaignId": campaignId,"autofollowup":autofollowupId},{$set: {"autofollowup.firstfollowup.status":"sent"}});
//   const updautofollowupstat2 = await autofollowSchema.updateOne({"emailaddress":useremail,"campaignId": campaignId,"autofollowup":autofollowupId},{$set: {"autofollowup.secondfollowup.status":"sent"}});
//   const updautofollowupstat3 = await autofollowSchema.updateOne({"emailaddress":useremail,"campaignId": campaignId,"autofollowup":autofollowupId},{$set: {"autofollowup.thirdfollowup.status":"sent"}});
//   if(updautofollowupstat1) {
//     console.log('updautofollowupstat status: success',updautofollowupstat)
//   }
// }

async function sendautofollowupCamp(name,thread_Id,campaign_Id,message_Id,gmail,accessToken,refreshToken,subject,recipient,body,useremail,userappkey,redlinktexta,redlinkurla,autofollowup_Id) {

  console.log('send autofollow up email ran --')
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
    to: recipient,
    "In-Reply-To": thread_Id,
    References: thread_Id,
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
                  <img src="${config.BACKEND_URL}/campaignopens/${userappkey}/${message_Id}/image.png" style="display: none" class="kioper" alt="imager">
                  <div>
                    <span>${body}</span>
                  </div>
                  <div style="margin: 1rem auto 1rem auto;text-align: center">${redlinker}</div>
                  <br>
                  <div style="margin-top: .2rem">
                    You can <a href='https://theoutreach.co/unsubscribe'>unsubscribe</a> to this email by clicking the above link
                  </div>
                </div>
              </body>
            </html>`,
    autofollowupId: autofollowup_Id
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.log(error);
    else {
      console.log('Email sent: ' + info.response);
      updateautofollowupsentStatus(useremail,campaign_Id,autofollowup_Id,body)
      autofollowupsentSuccess(useremail,campaign_Id,autofollowup_Id)
    }
  });
  
  
}


async function updateautofollowupsentStatus(emailaddress,campaignId,autofollowupId,body) {
  const getautofollupStat = await autofollowSchema.find({"emailaddress":emailaddress,"campaignId": campaignId,"autofollowupId":autofollowupId});
  if(getautofollupStat) {
    for(const gautofollowupStat of getautofollupStat) {
      if(gautofollowupStat.autofollowup.firstfollowup.status != undefined && gautofollowupStat.autofollowup.firstfollowup.status != "" && gautofollowupStat.autofollowup.firstfollowup.status == "unsent") {
        if(gautofollowupStat.autofollowup.firstfollowup.reply1message == body) {
          gautofollowupStat.autofollowup.firstfollowup.status = "sent";
          await gautofollowupStat.save();
        } 
      }
      if(gautofollowupStat.autofollowup.secondfollowup.status != undefined && gautofollowupStat.autofollowup.secondfollowup.status != "" && gautofollowupStat.autofollowup.secondfollowup.status == "unsent") {
        if(gautofollowupStat.autofollowup.secondfollowup.reply2message == body) {
          gautofollowupStat.autofollowup.secondfollowup.status = "sent";
          await gautofollowupStat.save();
        }
      }
      if(gautofollowupStat.autofollowup.thirdfollowup.status != undefined && gautofollowupStat.autofollowup.thirdfollowup.status != "" && gautofollowupStat.autofollowup.thirdfollowup.status == "unsent") {
        if(gautofollowupStat.autofollowup.thirdfollowup.reply3message == body) {
          gautofollowupStat.autofollowup.thirdfollowup.status = "sent";
          await gautofollowupStat.save();
        }
      }
    }
    
    // const updatedgetautofollupStat = await autofollowSchema.findOne({"emailaddress":emailaddress,"campaignId": campaignId,"autofollowupId":autofollowupId});
    
  }
}

// async function autofollowupsentSuccess(emailaddress,campaignId,autofollowupId) {
//   const updatedgetautofollupStat = await autofollowSchema.findOne({"emailaddress":emailaddress,"campaignId": campaignId,"autofollowupId":autofollowupId});
//   if(updatedgetautofollupStat) {
//     if(updatedgetautofollupStat.autofollowup.firstfollowup.status == "sent" && updatedgetautofollupStat.autofollowup.secondfollowup.status == "sent" && updatedgetautofollupStat.autofollowup.thirdfollowup.status == "sent") {
//       const updatedautofollowupcampaign = await campaignSchema.find({'emailaddress':emailaddress,'campaignId': campaignId});
//       updatedautofollowupcampaign.autofollowup.firstfollowup.status = "sent";
//       updatedautofollowupcampaign.autofollowup.secondfollowup.status = "sent";
//       updatedautofollowupcampaign.autofollowup.thirdfollowup.status = "sent";
//     }
      
//   }
// }
// async function sendfirstautofollowupsentReport(thread_Id,campaign_Id,message_Id,userappkey,gmail,useremail,accesstoken,refreshtoken,redlinktexta,redlinkurla,autofollowup_Id) {

//   let redlinktexter = redlinktexta;
//   let redlinkurler = redlinkurla;

//   let redlinker;
//   if(redlinkurler !== "" && redlinkurler !== undefined && redlinkurler !== null && redlinktexter !== "" && redlinktexter !== undefined && redlinktexter !== null) {
//       redlinker = `<a href="${config.BACKEND_URL}/campaignclicks/${userappkey}/${campaign_Id}/${message_Id}/${redlinkurler}">${redlinktexter}</a>`;
//   }else {
//       redlinker = "";
//   }
  
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       type: 'OAuth2',
//       user: useremail,
//       clientId: config.client_id,
//       clientSecret: config.client_secret,
//       refreshToken: refreshtoken,
//       accessToken: accesstoken
//     }
//   });

//   let body = "Auto followup mail sent successful ";
//   let subject = "Auto Follow Up Sent Report Success"; 
//   const mailOptions = {
//     from: "aliakbar512006@gmail.com",
//     to: useremail,
//     subject: subject,
//     html: `<html><body><div class="getap-op"><p>${body}<div style="margin: 2rem auto 1rem auto">${redlinker}</div></p></div></body></html>`,
//     "gmail":gmail
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.error(error);
//     } else {
//       updateautofollowupsentfirstreportStatus(mailOptions.from,campaign_Id,mailOptions.autofollowupId)
//       addfirstautofollowupreporttoLabel(mailOptions.gmail,mailOptions.from,mailOptions.subject,mailOptions.to,mailOptions.html)
//     }
//   });
// }

// async function updateautofollowupsentfirstreportStatus(useremail,campaignId,autofollowupId) {
//   const updautofollowupstat = await autofollowSchema.updateOne({"emailaddress":useremail,"campaignId": campaignId,"autofollowup":autofollowupId},{$set: {"autofollowup.firstfollowup.status":"sent"}});
//   if(updautofollowupstat) {
//     console.log('updautofollowupstat status: success')
//   }
// }

// async function addfirstautofollowupreporttoLabel(gmail,from,subject,to,body) {
//   try{

//     // Retrieve the email threads in the user's mailbox
//     let query = subject; 
//     const response = await gmail.users.messages.list({
//       userId: 'me',
//       q: query,
//     });

//     const messages = response.data.messages;

//     if (messages[0]) {
//       const messageId = messages[0].id;
//       const threadId = messages[0].threadId;

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

//       const labelId = await getLabelIdByName(gmail,"Outreach Auto FollowUp");
//       if(labelId) {
//         addEmailToLabel(labelId, messageId,to);
//       }
//       // Function to add an email to a label.
//       function addEmailToLabel(labelId, messageId, to) {
//         // Specify the email ID and label you want to add the email to.
//         const emailId = messageId;

//         gmail.users.messages.modify({
//           userId: 'me',
//           id: emailId,
//           resource: {
//             addLabelIds: [labelId],
//           },
//         }, (err, response) => {
//           if (err) {
//             console.error('Error adding email to label:', err);
//           } else {
//             console.log('Email added to label');
//             firstsentautofollowupreport_(to)
//           }
//         });
//       }
//     }
//   }catch(error) {

//     }
// }

// async function firstsentautofollowupreport_(to) {
//   const checkreport = await firstreportsentSchema.findOne({'useremail': to},{firstautofollowupemailreport: "unsent"});
//   // check if report details exists
//   if (checkreport || Object.keys(checkreport).length > 0) {
//       checkreport.verified = true;
//       const updatedautofollowupfirstsentreport = await firstreportsentSchema.updateOne({'useremail':to,'firstautofollowupemailreport': "unsent"},{$set: {firstautofollowupemailreport: 'sent'}});
//       if(updatedautofollowupfirstsentreport) {
//       }
      
//     }else {
//       console.log('no user in check report')
//     }
//   }

  // async function autofollowupsentSuccess(useremail,emailId,threadId,campaignId) {
  //   const updatedautofollowupcampaign = await campaignSchema.updateOne({'emailaddress':useremail,'emailId': emailId,'threadId': threadId,'campaignId': campaignId},{$set: {"autofollowup.status": 'sent'}});
  //   if(updatedautofollowupcampaign) {
  //     console.log('updated autofollow up campaign success')
  //   }
    
  // }

  const autofollowUpCampaign = asyncHandler(async(req,res)=> {

    console.log('req params',req.params);
    agenda.define('send test email', async () => {
      console.log('Job is running!');
      res.json({
        "message":"hello ran 3 x"
      })
    });
    
    (async () => {
      await agenda.start();
      await agenda.every('1 minutes', 'send test email');
    })();    
})

module.exports = { autofollowUpCampaign  };

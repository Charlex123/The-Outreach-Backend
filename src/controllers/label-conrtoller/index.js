const config = require('../../config');
const { google } = require('googleapis');
const DraftModel = require('../../model/DraftSchema')
const sendMail = require('../../utils/sendEmail');
const { generateTrackingLink } = require('../../utils');

const create = async (req, res) => {
  try {
    const { emails, body, subject,draft,rt } = req.body;
    let drafttMessageId = draft.split(':')[1]
    let labelId = req.user?.emailLabels.find((label) => {
      const regex = new RegExp(
        `${req.body.labelName}|Outreach \\[Campaigns\\]/Drafts`
      );
      return regex.test(label.name);
    })?.id;
    
    const oAuth2Client = new google.auth.OAuth2(
      config.client_id,
      config.client_secret,
      config.redirect_uri
    );

    console.log('Oauth', oAuth2Client)

    oAuth2Client.setCredentials({
      access_token: req.user.accessToken,
      refresh_token: req.user.refreshToken
    });

      const gmail = google.gmail({
        version: 'v1',
        auth: oAuth2Client
      });
      //cretae a campaign
    //  let userDraft= await DraftModel.create({
    //     userId: req.user._id,
    //     rt,
    //     draft,
    //   threadId:rt?rt.threadId:null,
    //     subject,
    //     body: body,
    //     emails,
    //     messageId: rt?rt.messageId:null,
    //     campaigns: []
    //   })

    let draftMessage = await gmail.users.drafts.list({
      userId: 'me',
      // q: `subject:${subject} to:${emails[0]}`

    })

   


   const data =  await  sendMail({from: req.user.email, to:req.user.email, subject, message: body,accessToken:req.user.accessToken,refreshToken:req.user.refreshToken})
   console.log(data)
   const updatedGmail = await gmail.users.messages.modify({
    userId: "me", // if user is authenticated
    id: data.id, // id of email
    requestBody: {
        addLabelIds: [labelId],
        removeLabelIds: ["UNREAD", "INBOX"]
    }
  })
  // await gmail.users.drafts.delete({
  //   userId: 'me',
  //   id:drafttMessageId
  // })
    res.status(201).json({ message: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = { create };

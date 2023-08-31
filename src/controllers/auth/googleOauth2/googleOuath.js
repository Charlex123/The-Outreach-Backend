// const auth = require('./auth');
// const User = require('../../../model/user');
// const moment  = require('moment');
// const { genAppAccessToken } = require('../../../utils');
// const config = require('../../../config');
// const dotenv = require('dotenv')
// dotenv.config()

// const googleOathConroller = (app) => {
  
//   app.get('/', (req, res) => {
//     res.status(200).json({ code: 200, message: 'checked' });
//   });

//   app.get('/auth/google', (req, res) => {
//     const authUrl = auth.getAuthUrl();//    
//     res.redirect(authUrl);
//   });

//   app.get('/0auth2/callback', async (req, res) => {
//     try {
     
//       const { code } = req.query;
//       const token = await auth.getAllTokens(code);
//       const googlUser = await auth.getUserData(token.id_token);
//       // const emailSendingLimit = await auth.fetchAccountDetails(token.access_token)
//       // check if user exist
//       const existUser =  await User.findOne({ googleId: googlUser.sub })
//       if(!existUser){
//         // create new user
//         const userAppKey = await genAppAccessToken() 
//         const newUser =  await User.create({
//           userAppKey:userAppKey,
//           name: googlUser.name,
//           email: googlUser.email,
//           googleId: googlUser.sub,
//           picture: googlUser.picture,
//           accessToken: token.access_token,
//           refreshToken: token.refresh_token,
//           tokenExpire: token.expiry_date,
//           emailSendingLimit: 200, // Include email sending limit in user account
//         })
      
//         //create labels for the user



      
//           const gmail = google.gmail({ version: 'v1', auth });
        
//           // Define the labels and their sub-labels
//           const labelData = [
//             {
//               name: 'Outreach Autofollowup',
//               subLabels: []
//             },
//             {
//               name: 'Outreach Report',
//               subLabels: ['Campaigns', 'Opens Sent Copies']
//             },
//             {
//               name: 'Outreach Schedule',
//               subLabels: []
//             }
//           ];
        
//           try {
//             // Create the main labels
//             for (const label of labelData) {
//               const createLabelResponse = await gmail.users.labels.create({
//                 userId: 'me',
//                 requestBody: {
//                   name: label.name,
//                   labelListVisibility: 'labelShow',
//                   messageListVisibility: 'show'
//                 }
//               });
        
//               console.log('Label created:', createLabelResponse.data);
        
//               // Create the sub-labels if any
//               if (label.subLabels.length > 0) {
//                 for (const subLabelName of label.subLabels) {
//                   const createSubLabelResponse = gmail.users.labels.create({
//                     userId: 'me',
//                     requestBody: {
//                       name: subLabelName,
//                       labelListVisibility: 'labelShow',
//                       messageListVisibility: 'show',
//                       parent: createLabelResponse.data.id
//                     }
//                   });
        
//                   console.log('Sub-label created:', createSubLabelResponse.data);
//                 }
//               }
        
//               // Add predefined emails to the label
//               if (label.name === 'Outreach Report') {
//                 await addPredefinedEmailsToLabel(gmail, createLabelResponse.data.id);
//               }
//             }
//           } catch (error) {
//             console.error('Error creating Gmail labels:', error.message);
//           }
        
        
//         async function addPredefinedEmailsToLabel(gmail, labelId) {
//           const predefinedEmails = [
//             {
//               to: 'me',
//               subject: 'Email 1 Subject',
//               message: 'Email 1 Message'
//             },
//             {
//               to: 'me',
//               subject: 'Email 2 Subject',
//               message: 'Email 2 Message'
//             },
//             // Add more predefined emails as needed
//           ];
        
//           for (const email of predefinedEmails) {
//             const encodedEmail = Buffer.from(
//               `To: ${email.to}\r\n` +
//               `Subject: ${email.subject}\r\n` +
//               `Content-Type: text/plain; charset=utf-8\r\n` +
//               '\r\n' +
//               `${email.message}`
//             )
//               .toString('base64')
//               .replace(/\+/g, '-')
//               .replace(/\//g, '_')
//               .replace(/=+$/, '');
        
//             try {
//               const response = await gmail.users.messages.send({
//                 userId: 'me',
//                 requestBody: {
//                   raw: encodedEmail,
//                   labelIds: [labelId]
//                 }
//               });
        
//               console.log('Email created:', response.data);
//             } catch (error) {
//               console.error('Error creating email:', error.message);
//             }
//           }
//         }
        

        
//         return res.redirect(`${config.FRONTEND_URL}/social/?token=${userAppKey}`);
//       }else {
//         if(existUser.tokenExpire <= moment().subtract(3, 'days')){
//           //get new token from refresh token
//           const newToken = await auth.getNewToken(existUser.refreshToken);
//           await User.updateOne({ googleId: existUser.sub }, {
//             tokenExpire: newToken.expiry_date,
//             accessToken: newToken.access_token,
//             refreshToken: newToken.refresh_token,
//             emailSendingLimit: emailSendingLimit
//           })
//           //create ht elabels for the user











//           return res.redirect(`${config.FRONTEND_URL}/social/?token=${existUser.userAppKey}`);
//         }else {
//           return res.redirect(`${config.FRONTEND_URL}/social/?token=${existUser.userAppKey}`);
//         }

//       }

//     } catch (error) {  
//       console.log(error)
//       // return res.redirect(`${config.FRONTEND_URL}`);
//     }
   
//   });

//   app.get('/new_token/:refeshToken', async (req, res) => {
//     try {
//       const { refeshToken } = req.params;
//       const token = await auth.getNewToken(refeshToken);
//       res.status(200).json({
//         message: 'refreshed successful',
//         token: token
//       });
//     } catch (error) {
//       return res.status(400).json({ code: '400', message: 'Bad Request' });
//     }
//   });
// };

// module.exports = {
//   googleOathConroller
// };



const { google } = require('googleapis');
const auth = require('./auth');
const User = require('../../../model/user');
const moment = require('moment');
const { genAppAccessToken,createGmailLabels } = require('../../../utils');
const config = require('../../../config');
const dotenv = require('dotenv');
dotenv.config();

const googleOathController = (app) => {
  app.get('/', (req, res) => {
    res.status(200).json({ code: 200, message: 'checked' });
  });

  app.get('/auth/google', (req, res) => {
    const authUrl = auth.getAuthUrl();
    res.redirect(authUrl);
  });

  app.get('/0auth2/callback', async (req, res) => {
    try {
      const { code } = req.query;
      const token = await auth.getAllTokens(code);
      const googleUser = await auth.getUserData(token.id_token);
      
      const existUser = await User.findOne({ googleId: googleUser.sub });
      if (!existUser) {
        const userAppKey = await genAppAccessToken();
        const newUser = await User.create({
          userAppKey: userAppKey,
          name: googleUser.name,
          email: googleUser.email,
          googleId: googleUser.sub,
          picture: googleUser.picture,
          accessToken: token.access_token,
          refreshToken: token.refresh_token,
          tokenExpire: token.expiry_date,
          emailSendingLimit: 200,
        });

        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: newUser.accessToken });
        const labelData =  await createGmailLabels(oauth2Client);
        newUser.emailLabels = labelData;
        await newUser.save();
        return res.redirect(`${config.FRONTEND_URL}/social/?token=${userAppKey}`);
        
      } else {
        if(existUser.tokenExpire <= moment().add(3, 'days')) {
          const newToken = await auth.getNewToken(existUser.refreshToken);
          await User.updateOne(
            { googleId: existUser.sub },
            {
              tokenExpire: newToken.expiry_date,
              accessToken: newToken.access_token,
              refreshToken: newToken.refresh_token,
              emailSendingLimit: existUser.emailSendingLimit,
            }
          );

          const oauth2Client = new google.auth.OAuth2();
          oauth2Client.setCredentials({ access_token: newToken.access_token });
          await createGmailLabels(oauth2Client);

          return res.redirect(`${config.FRONTEND_URL}/social/?token=${existUser.userAppKey}`);
        } else {
          return res.redirect(`${config.FRONTEND_URL}/social/?token=${existUser.userAppKey}`);
        }
      }
    } catch (error) {
      console.log(error);
      // return res.redirect(`${config.FRONTEND_URL}`);
    }
  });

  app.get('/new_token/:refreshToken', async (req, res) => {
    try {
      const { refreshToken } = req.params;
      const token = await auth.getNewToken(refreshToken);
      res.status(200).json({
        message: 'refreshed successful',
        token: token,
      });
    } catch (error) {
      return res.status(400).json({ code: '400', message: 'Bad Request' });
    }
  });
};

// async function createGmailLabels(auth) {
//   const gmail = google.gmail({ version: 'v1', auth });

//   const labelData = [

//     {
//       name: "Outreach [Campaigns]",
//       subLabels: [
//         'Outreach [Campaigns]/Reports',
//         'Outreach [Campaigns]/Opens',
//         'Outreach [Campaigns]/Sent Copies', 
//         'Outreach [Campaigns]/Replies',
//         'Outreach [Campaigns]/Bounces',
//         'Outreach [Campaigns]/Unsubscribes',
//         'Outreach [Campaigns]/Clicks'],
//     },
//     {
//       name: 'Outreach Auto Followup',
//       subLabels: [],
//     },
//     {
//       name: 'Outreach Reports',
//       subLabels: [
//         'Outreach Reports/[CAMPAIGNS]',
//         'Outreach Reports/Opens',
//         'Outreach Reports/Sent Copies',
//       ],
//     },
//     {
//       name: 'Outreach Scheduled',
//       subLabels: [],
//     },
//   ];

//   try {
//     for (const label of labelData) {
//       const createLabelResponse = await gmail.users.labels.create({
//         userId: 'me',
//         requestBody: {
//           name: label.name,
//           labelListVisibility: 'labelShow',
//           messageListVisibility: 'show',
//         },
//       });

//       console.log('Label created:', createLabelResponse.data);

//       if (label.subLabels.length > 0) {
//         await createNestedLabels(gmail, createLabelResponse.data.id, label.subLabels);
//       }
//     }
//   } catch (error) {
//     console.error('Error creating Gmail labels:', error.message);
//   }
// }

// async function createNestedLabels(gmail, parentLabelId, subLabels) {
//   for (const subLabel of subLabels) {
//     const createSubLabelResponse = await gmail.users.labels.create({
//       userId: 'me',
//       requestBody: {
//         name: subLabel,
//         labelListVisibility: 'labelShow',
//         messageListVisibility: 'show',
//         parent: parentLabelId,
//       },
//     });

//     console.log('Sub-label created:', createSubLabelResponse.data);
//   }
// }




module.exports = {
  googleOathController,
};

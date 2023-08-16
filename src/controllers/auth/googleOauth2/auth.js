
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { OAuth2Client } = require('google-auth-library'); 
const dotenv = require('dotenv')
dotenv.config()
const config = require ("../../../config/index");

const oauth2Client = new OAuth2(
  config.client_id,
  config.client_secret,
  config.redirect_uris
  );

const SCOPES = [
    "https://mail.google.com/",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.readonly",
];

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
}

async function getAllTokens(code) {
  return new Promise((resolve, reject) => {
    oauth2Client.getToken(code, (err, token) => {
      if (err) return reject(err);
      resolve(token);
    });
  });
}

async function getUserData(idToken) {

  try {
    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2'
    });
    
    // 
  
    // decode the ID token
    const client = new OAuth2Client(config.client_id);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: config.client_id,
    });
    return ticket.getPayload();
  
  } catch (error) {
    return null

  }
 
}

async function getNewToken(refreshToken) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });
  
  return new Promise((resolve, reject) => {
    oauth2Client.refreshAccessToken((err, tokens) => {
      if (err) return reject(err);
      resolve(tokens);
    });
  });
}


async function fetchAccountDetails(access_token) {
  try {
    
    oauth2Client.setCredentials({
      access_token
    });
    // Fetch account details
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    // Retrieve account details
    const accountInfo = await gmail.users.settings.sendAs.get({
      userId:"me",
     // sendAsEmail: "emason.tech@gmail.com",
  }) //.getProfile({ userId: 'me'});
// console.log(JSON.stringify(accountInfo))
    // Extract relevant information (e.g., email sending limit)

    // Process the account details or implement logic based on the email sending limit
    return undefined // no available method to check limit from gmail 
  } catch (error) {
    console.error('Error fetching account details:', error);
    // Handle the error appropriately
  }
}



const checkIfEmailHasReply = async (email, accessToken) => {
  const gmail = google.gmail({ version: 'v1', auth: accessToken });

  try {
    // Retrieve the email threads in the user's mailbox
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `from:${email}`,
    });

    const threads = response.data.threads;

    // Check if any of the threads have a reply
    for (const thread of threads) {
      const threadId = thread.id;

      // Retrieve the email thread
      const threadResponse = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
      });

      const messages = threadResponse.data.messages;

      // Check if any of the messages in the thread are not from the user
      for (const message of messages) {
        if (message.from && message.from.emailAddress && message.from.emailAddress !== email) {
          // Return the thread details if a reply is found
          return {
            hasReply: true,
            threadId: threadId,
            thread: threadResponse.data,
          };
        }
      }
    }

    // No reply found
    return {
      hasReply: false,
    };
  } catch (error) {
    console.error('Error checking email reply:', error);
    throw error;
  }
};




module.exports = {checkIfEmailHasReply, getAuthUrl, getAllTokens, getUserData, getNewToken, oauth2Client };



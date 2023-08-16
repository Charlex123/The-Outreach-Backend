// // const { google } = require('googleapis');
// // const config = require('../config');

// // const sendMail = async ({
// //   from,
// //   to,
// //   subject,
// //   message,
// //   accessToken,
// //   refreshToken,
// //   labelIds,
// //   scheduleId,
// //   threadId,
// //   sendType,
// //   messageId,
// //   trackingLink,
// //   parentPort, // Add parentPort as a parameter to send messages to the parent process
// // }) => {
// //   try {
// //     // Create an OAuth2 client with the stored credentials
// //     const oAuth2Client = new google.auth.OAuth2(
// //       config.client_id,
// //       config.client_secret,
// //       config.redirect_uri
// //     );

// //     oAuth2Client.setCredentials({
// //       access_token: accessToken||req.user.accessToken,
// //       refresh_token: refreshToken||req.user.refreshToken,
// //     });

// //     // Use the Gmail API to send the email
// //     const gmail = google.gmail({
// //       version: 'v1',
// //       auth: oAuth2Client,
// //     });

// //     const messageParts = [
// //       `From: ${from}`,
// //       `To: ${to}`,
// //       `Subject: ${subject}`,
// //       `MIME-Version: 1.0`,
// //       `Content-Type: text/html; charset=utf-8`,
// //       `Content-Transfer-Encoding: 7bit`,
// //       `X-No-Cache: ${messageId}`, // Use the emailId as the X-No-Cache header value
// //       `X-Schedule-Id: ${scheduleId}`, // Add the scheduleId as a custom header
// //       `X-Message-Id: ${messageId}`, // Add the messge as a custom header
// //       `X-User-Email: ${to}`, // Add the email of user as a custom header
// //       '',
// //       `<html><body><img src="${trackingLink}" width="1" xlink:href="${trackingLink}" height="1">${message}</body></html>`,
// //     ];

// //     const encodedMessage = Buffer.from(messageParts.join('\n')).toString('base64');
// //     console.log(labelIds)
// //     const messageToSend = {
// //       raw: encodedMessage,
// //       threadId:(sendType === 'rich text')&&threadId ? threadId : null,
// //       labelIds: [labelIds], // Optionally set labelIds
// //     };

// //     const result = await gmail.users.messages.send({
// //       userId: 'me',
// //       requestBody: messageToSend,
// //     });

// //     // Send the email details back to the parent process
// //     const emailDetails = {
// //       threadId: result.data.threadId,
// //       messageSentDate: result.headers.date,
// //       from,
// //       to,
// //       messageId,
// //       scheduleId,
// //     };

// //     parentPort?parentPort.postMessage({ message: 'sent', data: emailDetails }):null;
// //     return emailDetails;
// //   } catch (error) {
// //     console.error(error);
// //     parentPort.postMessage({ message: 'Error sending email', error });
// //   }
// // };

// // module.exports = sendMail;



// const { google } = require('googleapis');
// const config = require('../config');

// const sendMail = async ({
//   from,
//   to,
//   subject,
//   message,
//   accessToken,
//   refreshToken,
//   labelIds, // Add the labelIds parameter
//   scheduleId,
//   threadId,
//   sendType,
//   messageId,
//   trackingLink,
//   parentPort,
// }) => {
//   try {
//     // Create an OAuth2 client with the stored credentials
//     const oAuth2Client = new google.auth.OAuth2(
//       config.client_id,
//       config.client_secret,
//       config.redirect_uri
//     );

//     oAuth2Client.setCredentials({
//       access_token: accessToken || req.user.accessToken,
//       refresh_token: refreshToken || req.user.refreshToken,
//     });

//     // Use the Gmail API to send the email
//     const gmail = google.gmail({
//       version: 'v1',
//       auth: oAuth2Client,
//     });

//     const messageParts = [
//       `From: ${from}`,
//       `To: ${to}`,
//       `Subject: ${subject}`,
//       `MIME-Version: 1.0`,
//       `Content-Type: text/html; charset=utf-8`,
//       `Content-Transfer-Encoding: 7bit`,
//       `X-No-Cache: ${messageId}`,
//       `X-Schedule-Id: ${scheduleId}`,
//       `X-Message-Id: ${messageId}`,
//       `X-User-Email: ${to}`,
//       '',
//       `<html><body><img src="${trackingLink}" width="1" xlink:href="${trackingLink}" height="1">${message}</body></html>`,
//     ];

//     const encodedMessage = Buffer.from(messageParts.join('\n')).toString('base64');

//     const messageToSend = {
//       raw: encodedMessage,
//       threadId: sendType === 'rich text' && threadId ? threadId : null,
//     };

//     const result = await gmail.users.messages.send({
//       userId: 'me',
//       requestBody: messageToSend,
//     });

//     const emailDetails = {
//       threadId: result.data.threadId,
//       messageSentDate: result.headers.date,
//       from,
//       to,
//       id: result.data.id,
//       messageId,
//       scheduleId,
//     };

//     parentPort ? parentPort.postMessage({ message: 'sent', data: emailDetails }) : null;
//     return emailDetails;
//   } catch (error) {
//     console.error(error);
//     parentPort.postMessage({ message: 'Error sending email', error });
//   }
// };

// module.exports = sendMail;


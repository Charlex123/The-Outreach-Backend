
const path = require('path');
const campaign = require('../../model/campaignSchema');
const { getGeolocationInfo } = require('../../utils');
const moment = require('moment');
const updateViewEmails = async (trackingId, email, geolocationInfo) => {
  try {
    const data = await campaign.findOne({ trackingId: trackingId })
    const index =  data.untrackedMails.findIndex((item) => item.to === email)
    if(data){
     if(index !== -1){
       const emailDetails =  data.untrackedMails.splice(index,1)
       if(emailDetails.length>0){
        let  newData = JSON.parse(JSON.stringify(emailDetails[0]))
        newData.country = geolocationInfo.country || ""
        newData.clickCount = 1
        newData.region = geolocationInfo.region || ""
        newData.city = geolocationInfo.city || ""
        newData.latitude = geolocationInfo.latitude || ""
        newData.longitude = geolocationInfo.longitude || ""
        newData.firstOpen = moment(Date.now()).format()
        newData.lastOpen = moment(Date.now()).format()
        newData.opened = true
        data.viewEmails.push(newData)
        //remove from untrackedMails
        untrackedMails = data.untrackedMails.filter((item) => item.to !== email)
        data.untrackedMails = untrackedMails
        await data.save()
       }else{
        throw new Error("Email not found")
       }
     }else{
      const index =  data.viewEmails.findIndex((item) => item.to === email)
      if(index==-1){
        throw new Error("Email not found")
      }else{
        untrackedMails = data.untrackedMails.filter((item) => item.to !== email)
        data.untrackedMails = untrackedMails
          data.viewEmails[index].clickCount+=1
          data.viewEmails[index].lastOpen= moment(Date.now()).format()
          await data.save()
        
      }
     }
  
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

const Emailtracking = (app) => {
  app.get('/trackmail', async (req, res) => {
    try {
      const { trackingId, email, scheduleId, messageId } = req.query;
      const geolocationInfo = await getGeolocationInfo(req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress);
      
      const data = await updateViewEmails(trackingId, email, scheduleId, messageId, geolocationInfo);

      if (data) {
        res.status(200).sendFile(path.resolve(process.cwd(), 'public', 'bg.gif'));
      } else {
        res.status(200).sendFile(path.resolve(process.cwd(), 'public', 'bg.gif'));
      }
    } catch (error) {
      console.error(error.message);
      res.status(200).sendFile(path.resolve(process.cwd(), 'public', 'bg.gif'));
    }
  });
};

module.exports = { Emailtracking };


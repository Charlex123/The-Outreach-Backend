require("express");
const asyncHandler = require("express-async-handler");
const clickedCampaign = require('../model/clickedCampaign');
const CampaignSchema = require('../model/campaignSchema');
const User = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();

const clickedCampaigns = asyncHandler(async (req, res) => {
  try {
      
    const user_AppKey = req.params.userAppKey;
    const email_ID = req.params.email_Id;
    const redurllink = req.params.redlinkurl;
    console.log('user p', user_AppKey)
    console.log('user red link', redurllink)
    
    const verifyuserdata = await User.findOne({userAppKey: user_AppKey});

    console.log('user p', verifyuserdata)

      if (verifyuserdata) {
        verifyuserdata.verified = true;
        
        const verifiedUser = await verifyuserdata.save();
        const _id = verifiedUser._id;
        const email = verifiedUser.email;

        const clickedcampaign_ = await clickedCampaign.create({
          userId: _id,
          emailId: email_ID,
          emailaddress: email,
        });

        await clickedcampaign_.save();
        const count = await CampaignSchema.countDocuments({emailaddress: email,emailId:email_ID});

        const updateclickedcampain = await CampaignSchema.update({'useremail':from,'emailaddress':email,'emailId':email_ID},{$set: {Opens: count}});
        updateclickedcampain.save();

        if ( redurllink.startsWith('http') ) {
          res.redirect(`${redurllink}`);
        } else {
          res.redirect(`https://${redurllink}`);
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



module.exports = { clickedCampaigns };

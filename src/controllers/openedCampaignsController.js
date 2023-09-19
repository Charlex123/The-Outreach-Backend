require("express");
const asyncHandler = require("express-async-handler");
const openedCampaign = require('../model/openedCampaign');
const CampaignSchema = require('../model/campaignSchema');
const User = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();

const openedCampaigns = asyncHandler(async (req, res) => {
  try {
      
    const user_AppKey = req.params.userAppKey;
    const email_ID = req.params.email_Id;
    console.log('user p', user_AppKey)
    
    const verifyuserdata = await User.findOne({userAppKey: user_AppKey});

    console.log('user p', verifyuserdata)

      if (verifyuserdata) {
        verifyuserdata.verified = true;
        
        const verifiedUser = await verifyuserdata.save();
        const _id = verifiedUser._id;
        const email = verifiedUser.email;

        const openedcampaign_ = await openedCampaign.create({
          userId: _id,
          emailId: email_ID,
          emailaddress: email,
        });

        await openedcampaign_.save();

        const count = await CampaignSchema.countDocuments({emailaddress: email,emailId:email_ID});

        const updateopencampain = await CampaignSchema.updateOne({'useremail':from,'emailaddress':email,'emailId':email_ID},{$set: {Opens: count}});
        updateopencampain.save();

        } else {
          res.status(404);
          throw new Error("User Not Found");
        }
  }catch (error) {
    console.log('server error',error);
    // res.status(500).json({ message: error.message });
  }
  
});



module.exports = { openedCampaigns };

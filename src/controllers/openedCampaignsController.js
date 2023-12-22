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
    const campaign_Id = req.params.campaignId;
    
    const verifyuserdata = await User.findOne({userAppKey: user_AppKey});

    console.log('user p', verifyuserdata)

      if (verifyuserdata) {
        verifyuserdata.verified = true;
        
        const verifiedUser = await verifyuserdata.save();
        const _id = verifiedUser._id;
        const email = verifiedUser.email;

        const openedcampaign_ = await openedCampaign.create({
          userId: _id,
          campaignId: campaign_Id,
        });

        await openedcampaign_.save();

        const count = await CampaignSchema.countDocuments({campaignId: campaign_Id});

        const updateopencampain = await CampaignSchema.updateOne({'campaignId':campaign_Id},{$set: {Opens: count}});
        
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

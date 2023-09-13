require("express");
const asyncHandler = require("express-async-handler");
const OpenCampaign = require('../model/openedCampaign');
const User = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();

const getOpenCampaignCount = asyncHandler(async (req, res) => {
  try {
      
      const user_appkey = req.body.userappkey;

      const verifyuserdata = await User.findOne({userAppKey: user_appkey});
      if (verifyuserdata) {
        verifyuserdata.verified = true;
        
        const verifiedUser = await verifyuserdata.save();
        
        const _id = verifiedUser._id;
        const googleId = verifiedUser.googleId;
        const email = verifiedUser.email;
        const userAppKey = verifiedUser.userAppKey;
        const accessToken = verifiedUser.accessToken;
        const refreshToken = verifiedUser.refreshToken;

        const count = await OpenCampaign.countDocuments({emailaddress: email});
        console.log('Document count with filter:', count);
          res.json({opencampaigncount: count });
        } else {
                  
        }
  }catch (error) {
    console.log('server error',error);
    // res.status(500).json({ message: error.message });
  }
  
});


module.exports = { getOpenCampaignCount };

require("express");
const asyncHandler = require("express-async-handler");
const Campaign = require('../model/campaignSchema');
const dotenv = require('dotenv');
dotenv.config();

const checkfirstmailCampaign = asyncHandler(async (req, res) => {
  try {
      
      const email_ = req.body.email;

      res.json({ message: email_ });
      // const verifyuser = await Campaign.findOne({email: email_});

      // if (verifyuser) {
      //   verifyuser.verified = true;
        
      //   const verifiedUser = await verifyuser.save();
      //   const _id = verifiedUser._id;
      //   const googleId = verifiedUser.googleId;
      //   const email = verifiedUser.email;
      //   const userAppKey = verifiedUser.userAppKey;
      //   const accessToken = verifiedUser.accessToken;

      //     res.json({
      //       _id: verifiedUser._id,
      //       googleId: verifiedUser.googleId,
      //       email: verifiedUser.email,
      //       accessToken: verifiedUser.accessToken,
      //       userAppKey: verifiedUser.userAppKey
      //     });
      //   } else {
      //     res.status(404);
      //     throw new Error("User Not Found");
      //   }
  }catch (error) {
    console.log('server error',error);
    // res.status(500).json({ message: error.message });
  }
  
});


module.exports = { checkfirstmailCampaign };

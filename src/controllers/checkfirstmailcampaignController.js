require("express");
const asyncHandler = require("express-async-handler");
const Campaign = require('../model/campaignSchema');
const dotenv = require('dotenv');
dotenv.config();

const checkfirstmailCampaign = asyncHandler(async (req, res) => {
  try {
      
      const email_ = req.body.email;

      const firstmail = await Campaign.findOne({emailaddress: email_});
      if (firstmail) {
          res.json({
            "message":"false"
          });
        } else {
          res.json({"message":"true"});        
        }
  }catch (error) {
    console.log('server error',error);
    // res.status(500).json({ message: error.message });
  }
  
});


module.exports = { checkfirstmailCampaign };

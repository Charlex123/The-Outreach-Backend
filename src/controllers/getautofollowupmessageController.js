require("express");
const asyncHandler = require("express-async-handler");
const AutoFollowUpMessage = require('../model/autofollowupMessageSchema');
const dotenv = require('dotenv');
dotenv.config();
const getAutoFollowUpMessage = asyncHandler(async (req, res) => {
  try {
      const email_ = req.body.email;
      const verifyafm = await AutoFollowUpMessage.find({
        email: email_
      },
      {
        autofollowupsubject: 1,_id: 0
      });
      if (verifyafm) {
          verifyafm.verified = true;
          res.json({afMessage: verifyafm});
        } else {
          res.json({ message: "User Not Found" });
          // throw new Error("User Not Found");
        }
  }catch (error) {
    // console.log('server error',error);
  }
  
});



module.exports = { getAutoFollowUpMessage };

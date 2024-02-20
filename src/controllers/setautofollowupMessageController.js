require("express");
const asyncHandler = require("express-async-handler");
const AutoFollowUpMessage = require('../model/autofollowupMessageSchema');
const User = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();

const setAutoFollowUpMessage = asyncHandler(async (req, res) => {
  try {
      const email_ = req.body.email;
      const afMessage = req.body.autofollowupmessage;
      const afSubject = req.body.autofollowupsubject;
      const verifyuser = await User.findOne({email: email_});
      if (verifyuser) {
        verifyuser.verified = true;
        const verifiedUser = await verifyuser.save();
        const _id = verifiedUser._id;
        const setAFM = await AutoFollowUpMessage.create({
            userId: _id,
            email: email_,
            autofollowupsubject: afSubject,
            autofollowupmessage: afMessage,
        })
        
        if(setAFM) {
            res.json({message: "auto followup message set successfully"});
        }

        } else {
          res.json({ message: "User Not Found" });
          // throw new Error("User Not Found");
        }
  }catch (error) {
    // console.log('server error',error);
    res.json({ message: "User Not Found" });
  }
  
});



module.exports = { setAutoFollowUpMessage };

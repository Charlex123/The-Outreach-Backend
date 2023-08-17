require("express");
const asyncHandler = require("express-async-handler");
const User = require('../model/user');
const dotenv = require('dotenv');
dotenv.config();

const verifyUser = asyncHandler(async (req, res) => {
  try {
      
      const email_ = req.body.email;

      const verifyuser = await User.findOne({email: email_});

      if (verifyuser) {
        verifyuser.verified = true;
        
        const verifiedUser = await verifyuser.save();
        const _id = verifiedUser._id;
        const googleId = verifiedUser.googleId;
        const email = verifiedUser.email;
        const userAppKey = verifiedUser.userAppKey;
        const accessToken = verifiedUser.accessToken;

          res.json({
            _id: verifiedUser._id,
            googleId: verifiedUser.googleId,
            email: verifiedUser.email,
            accessToken: verifiedUser.accessToken,
            userAppKey: verifiedUser.userAppKey
          });
        } else {
          res.status(404);
          throw new Error("User Not Found");
        }
  }catch (error) {
    console.log('server error',error);
    // res.status(500).json({ message: error.message });
  }
  
});


const verifyUserData = asyncHandler(async (req, res) => {
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

          res.json({
            _id: verifiedUser._id,
            googleId: verifiedUser.googleId,
            email: verifiedUser.email,
            accessToken: verifiedUser.accessToken,
            userAppKey: verifiedUser.userAppKey
          });
        } else {
          res.status(404);
          throw new Error("User Not Found");
        }
  }catch (error) {
    console.log('server error',error);
    // res.status(500).json({ message: error.message });
  }
  
});


module.exports = { verifyUser, verifyUserData };

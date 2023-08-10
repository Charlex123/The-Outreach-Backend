import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Referral from "../models/referralModel.js";
import Assets from "../models/assetsModel.js";
import generateToken from "../utils/generateToken.js";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {v4 as uuidv4} from "uuid";
import sgTransport from "nodemailer-sendgrid-transport";
dotenv.config();


// async..await is not allowed in global scope, must use a wrapper
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "palegor.com",
    port: 587,
    auth: {
      user: process.env.AUTH_EMAIL, // generated ethereal user
      pass: process.env.AUTH_PASS, // generated ethereal password
    }
  });

  // var options = {
  //   auth: {
  //     api_user: process.env.AUTH_USRER,
  //     api_key: process.env.AUTH_PASS
  //   }
  // }
  
  // var client = nodemailer.createTransport(sgTransport(options));
  
  // var email = {
  //   from: 'awesome@bar.com',
  //   to: 'mr.walrus@foo.com',
  //   subject: 'Hello',
  //   text: 'Hello world',
  //   html: '<b>Hello world</b>'
  // };
  
  // client.sendMail(email, function(err, info){
  //     if (err ){
  //       console.log(err);
  //     }
  //     else {
  //       console.log('Message sent: ' + info.response);
  //     }
  // });

  // transporter.verify((error, success) => {
  //   if(error) {
  //    console.log(error) 
  //   }else {
  //     console.log("ready for message");
  //     console.log(success);
  //   }
  // })

  
  const sendverificationMail = (_id,username,emailCode,email) => {
      
    const currentUrl = "http://localhost:5000/";
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Confirm Your Email",
      html: `<div><p>Hello ${username}, you have signed up with PALEGO, the best crypto trading bot. Thank you for tusting us with you funds and we will not disappoint</p>
      <p>Confirm your email with the link below to have access to our platform <br/>
        <a href=${currentUrl+"user/verify/"+_id+"/"+emailCode}>Confirm Email</a>
      </p>
      </div>`,
    }
    
    const sender = transporter.sendMail(mailOptions);
    if(sender){
      console.log("Message sent: %s", sender.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(sender));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
  }


  const verificationSuccess = (_id,username,email) => {
      
    const currentUrl = "http://localhost:5000/";
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Email Verificaton Success",
      html: `<div><p>Hello ${username}, you have signed up with PALEGO, the best crypto trading bot. Thank you for tusting us with you funds and we will not disappoint</p>
      <p>Confirm your email with the link below to have access to our platform <br/>
        <a href=${currentUrl+"user/verify/"+_id+"/"+emailCode}>Confirm Email</a>
      </p>
      </div>`,
    }
    
    const sender = transporter.sendMail(mailOptions);
    if(sender){
      console.log("Message sent: %s", sender.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(sender));
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
  }
  

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // get user id
    const userid = user._id;
    //check if user has a referral
    const referral = await Referral.find({ sponsorId: user._id });
    const getrefsponsor = await Referral.find({ userId: user._id });
    const asset = await Assets.find({ userId: user._id });
    // Map documents returned by `data` events
   
    if(referral.length != 0 && asset.length != 0 && getrefsponsor.length !=0) {
      const sponsorid = getrefsponsor[0].sponsorId;
      console.log(sponsorid)
      if(sponsorid) {
        const getsponsor = await User.find({_id:sponsorid});
        const upline = getsponsor[0].username;
        const noofDirectDownlines = await Referral.countDocuments({sponsorId: userid});
        // const getdownlinesId = await Referral.find(user._id).populate({
        //   path:"refId", model:"referrals"
        // });
            res.status(201).json({
              _id: user._id,
              username: user.username,
              email: user.email,
              level: user.level,
              tpin: user.tpin,
              status: user.status,
              activated: user.activated,
              sponsorId: sponsorid,
              directdownlines: referral,
              asset: asset,
              noofdirectdownlines: noofDirectDownlines,
              sponsor: upline,
              trxwalletaddressbase58: user.trxwalletaddressbase58,
              trxwalletaddresshex:user.trxwalletaddresshex,
              bscwalletaddress: user.bscwalletaddress,
              isAdmin: user.isAdmin,
              pic: user.pic,
              token: generateToken(user._id)
            });
      }
      
    }else if(referral.length != 0 && getrefsponsor.length != 0 && asset.length === 0) {
      const sponsorid = getrefsponsor[0].sponsorId;
      if(sponsorid) {
        const getsponsor = await User.find({_id:sponsorid});
        const upline = getsponsor[0].username;
        const noofDirectDownlines = await Referral.countDocuments({sponsorId: userid});
        // const followedUsers = await User.find({ _id: { $in: followedIDs } });
        // const getusersuplines = await User.find(user._id).populate({
        //   path:"refId", model:"referrals"
        // });
            res.status(201).json({
              _id: user._id,
              username: user.username,
              email: user.email,
              level: user.level,
              tpin: user.tpin,
              status: user.status,
              activated: user.activated,
              sponsorId: sponsorid,
              directdownlines: referral,
              noofdirectdownlines: noofDirectDownlines,
              sponsor: upline,
              trxwalletaddressbase58: user.trxwalletaddressbase58,
              trxwalletaddresshex:user.trxwalletaddresshex,
              bscwalletaddress: user.bscwalletaddress,
              isAdmin: user.isAdmin,
              pic: user.pic,
              token: generateToken(user._id)
            });
      }
      
    }else if(referral.length != 0 && asset.length != 0) {
     
      const noofDirectDownlines = await Referral.countDocuments({sponsorId: userid});
      const secondgenDownlineIds = referral.map(key => (
        key.userId
      ));
      
      const secondgenDownlines = await Referral.find().where('sponsorId').in(secondgenDownlineIds);
      // const getusersuplines = await User.find(user._id).populate({
      //   path:"refId", model:"referrals"
      // });
          res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            level: user.level,
            tpin: user.tpin,
            status: user.status,
            asset: asset,
            activated: user.activated,
            directdownlines: referral,
            nofodirectdownlines: noofDirectDownlines,
            trxwalletaddressbase58: user.trxwalletaddressbase58,
            trxwalletaddresshex:user.trxwalletaddresshex,
            bscwalletaddress: user.bscwalletaddress,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
          });
    
  }else if(referral.length != 0 && asset.length === 0) {
     
        const noofDirectDownlines = await Referral.countDocuments({sponsorId: userid});
        // const getusersuplines = await User.find(user._id).populate({
        //   path:"refId", model:"referrals"
        // });
        const secondgenDownlineIds = referral.map(key => (
          key.userId
        ));
        if(secondgenDownlineIds.length != 0) {
          const secondgenDownlines = await Referral.find().where('sponsorId').in(secondgenDownlineIds);
          const noofsecondgenDownlines = secondgenDownlineIds.length;

          const thirdgenDownlineIds = secondgenDownlines.map(key =>(
            key.userId
          ))

          if(thirdgenDownlineIds.length != 0) {
            const thirdgenDownlines = await Referral.find().where('sponsorId').in(thirdgenDownlineIds);
            const noofthirdgenDownlines = thirdgenDownlineIds.length;

            res.status(201).json({
              _id: user._id,
              username: user.username,
              email: user.email,
              level: user.level,
              tpin: user.tpin,
              status: user.status,
              activated: user.activated,
              directdownlines: referral,
              nofodirectdownlines: noofDirectDownlines,
              secondgenDownlines: secondgenDownlines,
              noofDirectDownlines: noofsecondgenDownlines,
              thirdgenDownlines: thirdgenDownlines,
              noofthirdgenDownlines: noofthirdgenDownlines,
              trxwalletaddressbase58: user.trxwalletaddressbase58,
              trxwalletaddresshex:user.trxwalletaddresshex,
              bscwalletaddress: user.bscwalletaddress,
              isAdmin: user.isAdmin,
              pic: user.pic,
              token: generateToken(user._id),
            });
          }

          res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            level: user.level,
            tpin: user.tpin,
            status: user.status,
            activated: user.activated,
            directdownlines: referral,
            nofodirectdownlines: noofDirectDownlines,
            secondgenDownlines: secondgenDownlines,
            noofDirectDownlines: noofsecondgenDownlines,
            trxwalletaddressbase58: user.trxwalletaddressbase58,
            trxwalletaddresshex:user.trxwalletaddresshex,
            bscwalletaddress: user.bscwalletaddress,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
          });
        }
        
            res.status(201).json({
              _id: user._id,
              username: user.username,
              email: user.email,
              level: user.level,
              tpin: user.tpin,
              status: user.status,
              activated: user.activated,
              directdownlines: referral,
              nofodirectdownlines: noofDirectDownlines,
              trxwalletaddressbase58: user.trxwalletaddressbase58,
              trxwalletaddresshex:user.trxwalletaddresshex,
              bscwalletaddress: user.bscwalletaddress,
              isAdmin: user.isAdmin,
              pic: user.pic,
              token: generateToken(user._id),
            });
      
    }else if(referral.length === 0 && asset.length != 0) {
            res.status(201).json({
              _id: user._id,
              username: user.username,
              email: user.email,
              level: user.level,
              tpin: user.tpin,
              status: user.status,
              activated: user.activated,
              asset: asset,
              trxwalletaddressbase58: user.trxwalletaddressbase58,
              trxwalletaddresshex:user.trxwalletaddresshex,
              bscwalletaddress: user.bscwalletaddress,
              isAdmin: user.isAdmin,
              pic: user.pic,
              token: generateToken(user._id),
            });
      
    }else {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        level: user.level,
        tpin: user.tpin,
        status: user.status,
        activated: user.activated,
        asset: asset,
        isAdmin: user.isAdmin,
        trxwalletaddressbase58: user.trxwalletaddressbase58,
        trxwalletaddresshex:user.trxwalletaddresshex,
        bscwalletaddress: user.bscwalletaddress,
        pic: user.pic,
        token: generateToken(user._id),
      });
    }
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});


//@description     Register new user
//@route           POST /api/users/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { 
    username, 
    email, 
    password,
    level,
    tpin, 
    status,
    bscwalletaddress,
    bscwalletprivatekey,
    trxwalletaddressbase58,
    trxwalletaddresshex,
    trxwalletprivatekey, pic 
  } = req.body;

  const userExists = await User.findOne({ email });
  const usernameExists = await User.findOne({ username });
  
  if (usernameExists) {
    res.status(404);
    throw new Error("Username already exists");
  }
  if (userExists) {
    res.status(404);
    throw new Error("User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    level,
    tpin,
    status,
    bscwalletaddress,
    bscwalletprivatekey,
    trxwalletaddressbase58,
    trxwalletaddresshex,
    trxwalletprivatekey,
    emailcode: uuidv4(),
    pic
  });

  if (user) {

    const sponsorId = req.body.sponsorId;
    if(sponsorId) {

      const { sponsorId, refBonus, totalrefBonus, withdrawnRefBonus } = req.body;
      const userId = user._id;
      const ref = await Referral.create({
        sponsorId,userId,refBonus,totalrefBonus,withdrawnRefBonus
      });

      if(ref) {
        const addrefId = User.updateOne(
          {_id:user._id}, 
          {refId: ref._id },
          {multi:true}, 
            function(err, numberAffected){  
            });
        if(addrefId) {

        }
        
      }
      
      
    }else {

    }
    const _id = user._id;
    const username = user.username;
    const emailCode = user.emailcode;
    const email = user.email;
    const verifystatus = user.verified;

    if(verifystatus === false) {
      sendverificationMail(_id,username,emailCode,email);
    }
    
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});


const addAssets = asyncHandler(async (req, res) => {
  const { 
    amount,
    assetdailyprofitratio,
    assettype,
    userId,
    status,
    totalwithdrawals,
    shortassetaddress,
    assetaddress,
    dailyprofit,
    minassetduration,
    profitamount,
    assetaddtime 
  } = req.body;

  
  const asset = await Assets.create({
    amount,
    assetdailyprofitratio,
    assettype,
    userId,
    status,
    totalwithdrawals,
    shortassetaddress,
    assetaddress,
    dailyprofit,
    minassetduration,
    profitamount,
    assetaddtime
  });

  if (asset) {
 
    res.status(201).json({
       amount: asset.amount,
       assetdailyprofitratio: asset.assetdailyprofitratio,
       shortaddress: asset.shortassetaddress,
       assetaddress: asset.assetaddress,
       assettype: asset.assettype,
       userid: asset.userId,
       status: asset.status,
       dailyprofit: asset.dailyprofit,
       minassetduration: asset.minassetduration,
       profitamount: asset.profitamount,
       assetaddress
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});


const assetDetails = asyncHandler(async (req, res) => {
  const { 
    userid
  } = req.body;
  const asset = await Assets.find({ userId: userid });
  if (asset) {
    res.status(201).json({
       asset
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});


// @desc    GET user profile
// @route   GET /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.pic = req.body.pic || user.pic;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      pic: updatedUser.pic,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});


const updateTransactionPin = asyncHandler(async (req, res) => {
  const userid = req.body.userid;
  const user = await User.findById(userid);
  if (user) {
    user.tpin = req.body.tpin;
    
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      tpin: updatedUser.tpin,
      pic: updatedUser.pic,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});


const updateAssetWithdrawalStatus = asyncHandler(async (req, res) => {
  const { 
    assetid
  } = req.body;
  const asset = await Assets.findById(assetid);
  if (asset) {
    asset.status = req.body.status;
    
    const updatedAsset = await asset.save();
    console.log(updatedAsset)
    res.json({
      _id: updatedAsset._id,
      status: updatedAsset.status,
    });
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});


const resetPassword = asyncHandler(async (req, res) => {
    const userid = req.body.userid;
    const user = await User.findById(userid);
    if (user) {
      user.password = req.body.newpassword;
      
      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        pic: updatedUser.pic,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User Not Found");
    }
});



const verifyUser = asyncHandler(async (req, res) => {
  const verifyuser = await User.findById(req.user._id);

  if (verifyuser) {
    verifyuser.verified = true;
    
    const verifiedUser = await verifyuser.save();
    const _id = verifiedUser._id;
    const username = verifiedUser.username;
    const email = verifiedUser.email;

      verificationSuccess(_id, username, email);
      res.json({
        _id: verifiedUser._id,
        username: verifiedUser.username,
        email: verifiedUser.email,
        pic: verifiedUser.pic,
        isAdmin: verifiedUser.isAdmin,
        token: generateToken(verifiedUser._id),
      });
    } else {
      res.status(404);
      throw new Error("User Not Found");
    }
});


const resendverificationMail = asyncHandler(async (req, res) => {
  const resendmailuser = await User.findById(req.user._id);

  if (resendmailuser) {
    if(resendmailuser.verified === false) {
    
        const _id = resendmailuser._id;
        const username = resendmailuser.username;
        const emailCode = resendmailuser.emailcode;
        const email = resendmailuser.email;

        sendverificationMail(_id,username,emailCode,email);

        res.json({
          _id: resendmailuser._id,
          username: resendmailuser.username,
          email: resendmailuser.email,
          pic: resendmailuser.pic,
          isAdmin: resendmailuser.isAdmin,
          token: generateToken(resendmailuser._id),
        });
      }else {
        res.json({
          _id: resendmailuser._id,
          username: resendmailuser.username,
          email: resendmailuser.email,
          pic: resendmailuser.pic,
          isAdmin: resendmailuser.isAdmin,
          token: generateToken(resendmailuser._id),
        });
      }
  } else {
    res.status(404);
    throw new Error("User Not Found");
  }
});

export { authUser, updateUserProfile, registerUser, verifyUser, assetDetails, resendverificationMail, resetPassword, addAssets, updateTransactionPin, updateAssetWithdrawalStatus };
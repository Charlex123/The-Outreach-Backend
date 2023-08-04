const dotenv =  require ("dotenv");
dotenv.config();
const  merge  = require ("lodash.merge");
//making sure NODE_ENV is set, defult is "developement"
// process.env.NODE_ENV = process.env.NODE_ENV || "developement";
//set stage
const stage = process.env.STAGE || "local";
let envConfig;
//dynamically require each config depending on the stage we are in
if (stage === "production") {
  //set config to production
  envConfig = require("./prod");
} else if (stage === "testing") {
  envConfig = require("./testing");
} else {
  envConfig = require("./local");
}
// export along with marge
module.exports=merge(
  {
    stage,
    "refresh-secret": process.env.refresh_secret,
    "client_id": process.env.client_id,
    "project_id":process.env.project_id,
    "auth_uri":process.env.auth_uri,
    "token_uri":process.env.token_uri,
    "auth_provider_x509_cert_url":process.env.auth_provider_x509_cert_url,
    "client_secret":process.env.client_secret,
    "redirect_uris":process.env.redirect_uris,
    "javascript_origins":process.env.javascript_origins,
    appSecret:"blablabluethisismysecretkey"
  },
  envConfig
);


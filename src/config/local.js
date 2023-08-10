const dotenv = require ("dotenv");
dotenv.config();
module.exports = {
DATABASE_URL:process.env.DEVELOPMENT_DATABASE_URL,
redirect_uris:process.env.DEVELOPMENT_REDIRECT_URIS,
DEVELOPMENT_URL_BACKEND:process.env.DEVELOPMENT_URL_BACKEND,
redirect_uris:process.env.DEVELOPMENT_REDIRECT_URIS,
FRONTEND_URL:process.env.DEVELOPMENT_URL_FRONTEND,
appSecret:process.env.DEVELOPMENT_APP_SECRET,
port:process.env.DEVELOPMENT_PORT,
TRACKING_URL:process.env.DEVELOPMENT_TRACKING_URL,
};
// console.log('local ', FRONTEND_URL)
console.log("running local mode");

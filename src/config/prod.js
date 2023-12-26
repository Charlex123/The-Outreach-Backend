
const dotenv = require ("dotenv");
dotenv.config()
module.exports = {
DATABASE_URL:process.env.DATABASE_URL,
redirect_uris:process.env.redirect_uris,
BACKEND_URL:process.env.PRODUCTION_URL_BACKEND,
FRONTEND_URL:process.env.PRODUCTION_URL_FRONTEND,
appSecret:process.env.PRODUCTION_APP_SECRET,
port:process.env.PRODUCTION_PORT,
TRACKING_URL:process.env.PRODUCTION_TRACKING_URL,
};

console.log("running production mode");

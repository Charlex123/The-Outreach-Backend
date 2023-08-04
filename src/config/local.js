const dotenv = require ("dotenv");
dotenv.config();
module.exports = {
DATABASE_URL:process.env.DEVELOPEMENT_DATABASE_URL,
redirect_uris:process.env.DEVELOPEMENT_REDIRECT_URIS,
DEVELOPMENT_URL_BACKEND:process.env.DEVELOPEMENT_URL_BACKEND,
redirect_uris:process.env.DEVELOPEMENT_REDIRECT_URIS,
FRONTEND_URL:process.env.DEVELOPEMENT_URL_FRONTEND,
appSecret:process.env.DEVELOPEMENT_APP_SECRET,
port:process.env.DEVELOPEMENT_PORT,
TRACKING_URL:process.env.DEVELOPEMENT_TRACKING_URL,
};

// console.log("running local mode");

const callnextrunRoute = require('express').Router();
const { callNextRun } = require('../controllers/callnextrunController');
callnextrunRoute.get('/:callnextrun',callNextRun);

module.exports=callnextrunRoute;
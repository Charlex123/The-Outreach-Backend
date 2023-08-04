const Joi = require('joi');

const JobValidator = (jobs) => {

const stageSchema = Joi.object({
  condition: Joi.string().valid('No Reply', 'No Open', 'No Click', 'Everyone').default('Everyone'),
  sendType: Joi.string().valid('plain text', 'rich text').default('plain text'),
  duration: Joi.string(),
  message: Joi.string()
});

const trackingSchema = Joi.object({
  isOpened: Joi.boolean().default(false),
  isClicked: Joi.boolean().default(false)
});

const speedSchema = Joi.object({
  mailsPerDay: Joi.string().required(),
  delay: Joi.string().required()
});

const scheduleSchema = Joi.object({
  start: Joi.string().required(),
  end: Joi.string().required(),
  timezone: Joi.string().required(),
  days: Joi.array().items(Joi.string().valid('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun')).required(),
  speed: speedSchema.required(),
  repeat: Joi.string().required()
});

const jobSchema = Joi.object({
  userId: Joi.string().required(),
  emailList: Joi.array().items(Joi.string()).required(),
  tracking: trackingSchema.required(),
  action: Joi.string().valid('send', 'draft').default('draft').required(),
  autofollowup: Joi.array().items(stageSchema),
  schedule: scheduleSchema.required(),
  interval: Joi.string().required(),
  email: Joi.array().items(Joi.any()),
  subject: Joi.string(),
  message: Joi.string(),
  lastRun: Joi.date(),
  nextRun: Joi.date(),
  trackingId: Joi.string(),
  trackingLink: Joi.string(),
  trackmail: Joi.array().items(Joi.any())
});

const options = {
    errors: {
      wrap: {
        label: "",
        array: "",
      },
    },
  };

return jobSchema.validate(jobs, options);
};


module.exports = JobValidator;

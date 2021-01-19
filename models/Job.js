const { Schema, model } = require("mongoose");
const Joi = require("joi");
Joi.ObjectId = require("joi-objectid")(Joi);

const jobSchema = new Schema(
  {
    customer: {
      _id: {
        type: String,
        minlength: 24,
        maxlength: 24,
        required: true,
      },
      name: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 255,
        required: true,
      },
    },
    serviceProvider: {
      type: Schema.Types.ObjectId,
      ref: "service_provider",
    },
    service: {
      _id: {
        type: String,
        minlength: 24,
        maxlength: 24,
        required: true,
      },
      name: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true,
      },
    },
    status: {
      type: String,
      minlength: 3,
      maxlength: 25,
      default: "pending",
    },
    stars: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      minlength: 3,
      maxlength: 1024,
    },
    description: {
      type: String,
      minlength: 3,
      maxlength: 1024,
    },
    hourlyRate: {
      type: Number,
      min: 0,
      max: 1000000,
    },
    applicants: [{ type: Schema.Types.ObjectId, ref: "service_provider" }],
  },
  { timestamps: true }
);

const validateNewJob = (job) => {
  const schema = Joi.object({
    customerId: Joi.ObjectId().required(),
    serviceId: Joi.ObjectId().required(),
    serviceProviderId: Joi.ObjectId(),
    description: Joi.string().min(3).max(1024),
    hourlyRate: Joi.string().min(0).max(1000000),
  });
  return schema.validate(job);
};

const validateJobApplication = (job) => {
  const schema = Joi.object({
    serviceProviderId: Joi.ObjectId().required(),
  });
  return schema.validate(job);
};

const validateReview = (job) => {
  const schema = Joi.object({
    stars: Joi.number().min(1).max(5).required(),
    comment: Joi.string().min(5).max(1024),
  });
  return schema.validate(job);
};

exports.Job = model("job", jobSchema);
exports.validateNewJob = validateNewJob;
exports.validateReview = validateReview;
exports.validateJobApplication = validateJobApplication;

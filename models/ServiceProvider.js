const { Schema, model } = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const jwt = require("jsonwebtoken");
const config = require("config");

const serviceProviderSchema = new Schema({
  name: {
    type: String,
    trim: true,
    minlength: 3,
    maxlength: 255,
    required: true,
  },
  phone: {
    type: String,
    minlength: 8,
    maxlength: 50,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    minlength: 5,
    maxlength: 255,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    maxlength: 512,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  profilePicture: {
    type: String,
    minlength: 10,
    maxlength: 1024,
  },
  aboutMe: {
    type: String,
    minlength: 10,
    maxlength: 1024,
  },

  servicesOffered: [
    new Schema({
      name: {
        type: String,
        trim: true,
        min: 3,
        max: 255,
        required: true,
      },
      jobs: [
        {
          status: {
            type: String,
            minlength: 5,
            maxlength: 50,
          },
          review: {
            type: String,
            minlength: 3,
            maxlength: 1024,
          },
          stars: {
            type: Number,
            min: 0,
            max: 5,
          },
        },
      ],
      isActive: {
        type: Boolean,
        default: false,
      },
      stars: {
        type: Number,
        default: 0,
        min: 0,
      },
      reviews: {
        type: Number,
        default: 0,
        min: 0,
      },
    }),
  ],
});

serviceProviderSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, config.get("jwt_secret"));
};

const validateServiceProvider = (serviceProvider) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    phone: Joi.string().min(8).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(512),
  });

  return schema.validate(serviceProvider);
};

const validateAddingService = (serviceProvider) => {
  const schema = Joi.object({
    serviceIds: Joi.array().min(1).max(3).required(),
  });

  return schema.validate(serviceProvider);
};

const ServiceProvider = model("service_provider", serviceProviderSchema);
exports.ServiceProvider = ServiceProvider;
exports.validateServiceProvider = validateServiceProvider;
exports.validateAddingService = validateAddingService;

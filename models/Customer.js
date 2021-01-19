const { Schema, model } = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 256,
      minlength: 5,
    },
    phone: {
      type: String,
      maxlength: 20,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 512,
      required: true,
    },
    isGold: {
      type: Boolean,
      default: false,
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
  },
  { timestamps: true }
);

customerSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }), config.get("jwt_secret");
};

const validateCustomer = (customer) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email(),
    phone: Joi.string().min(9).max(15).required(),
  });

  return schema.validate(customer);
};

exports.validateCustomer = validateCustomer;
exports.Customer = model("customer", customerSchema);

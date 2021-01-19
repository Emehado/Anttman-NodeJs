const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const { Schema, model } = require("mongoose");

const rentalSchema = new Schema({
  customer: {
    type: new Schema({
      name: {
        type: String,
        trim: true,
        required: true,
        minlength: 3,
        maxlength: 256,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
      phone: {
        type: String,
        trim: true,
        required: true,
        minlength: 8,
        maxlength: 20,
      },
    }),
    required: true,
  },
  movie: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 256,
        trim: true,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 255,
      },
    }),
    required: true,
  },
  dateOut: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  dateReturned: {
    type: Date,
  },
  rentalFee: {
    type: Number,
    min: 0,
  },
});

const Rental = model("rental", rentalSchema);

const validateRent = (rental) => {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });
  return schema.validate(rental);
};
exports.Rental = Rental;
exports.validateRent = validateRent;

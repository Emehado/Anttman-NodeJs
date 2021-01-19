const { Schema, model } = require("mongoose");
const Joi = require("joi");
const { serviceCategorySchema } = require("./ServiceCategory");

const movieSchema = new Schema({
  title: {
    type: String,
    minlength: 3,
    maxlength: 255,
    trim: true,
    required: true,
  },
  genre: {
    type: serviceCategorySchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true,
  },
});

const movieValidation = (movie) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    genreId: Joi.string().required(),
    numberInStock: Joi.number().integer().min(0).required(),
    dailyRentalRate: Joi.number().min(0).integer().required(),
  });
  return schema.validate(movie);
};
const Movie = model("movie", movieSchema);
exports.Movie = Movie;
exports.movieValidation = movieValidation;

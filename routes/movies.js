const express = require("express");
const router = express.Router();
const { Movie, movieValidation } = require("../models/Movie");
const { ServiceCategory } = require("../models/ServiceCategory");



router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");
  res.send(movies);
});


router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const movie = await Movie.findById(id);
  if (!movie) return res.status(404).send("Movie not found");
  res.send(movie);
});


router.post("/", async (req, res) => {
  const { title, numberInStock, genreId, dailyRentalRate } = req.body;

  const { error } = movieValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movieExist = await Movie.find({ title });
  if (movieExist.length > 0) return res.status(400).send("Movie already exist");

  const genre = await ServiceCategory.findById(genreId);
  if (!genre) return res.status(404).send("Invalid genre");

  const movie = new Movie({
    title,
    numberInStock,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    dailyRentalRate,
  });
  const addMovie = await movie.save();
  res.send(addMovie);
});

/**
 * PUT route to update a movie
 */

router.put("/", async (req, res) => {});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const deleteMovie = await Movie.findByIdAndDelete(id);
  res.send(deleteMovie);
});

module.exports = router;

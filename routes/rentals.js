const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const debug = require("debug")("vidre:server");
const Fawn = require("fawn");
const { validateRent, Rental } = require("../models/Rental");
const { Movie } = require("../models/Movie");
const router = express.Router();
Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const rentals = await Rental.find();
  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const rental = await Rental.findById(id).sort("-dateOut");
    res.send(rental);
  } catch (e) {
    debug(e);
  }
});

router.post("/", async (req, res) => {
  const { customerId, movieId } = req.body;
  const { error } = validateRent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(400).send("Invalid customer");
  console.log(customer);

  const movie = await Movie.findById(movieId);
  if (!movie) return res.status(400).send("Invalid movie");
  if (movie.numberInStock === 0)
    return res.status(400).send("Movie out of stock!");

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: `${customer.firstname} ${customer.lastname}`,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  const task = Fawn.Task();
  await task
    .save(rental)
    .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
    .run();
  res.send(rental);
});

module.exports = router;

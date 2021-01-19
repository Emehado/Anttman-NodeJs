const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { ServiceCategory, validateServiceCategory } = require("../models/ServiceCategory");
const validateId = require("../middlewares/validateId");

router.get("/", async (req, res) => {
  const genres = await ServiceCategory.find({});
  res.send(genres);
});

router.get("/:id", validateId, async (req, res) => {
  const id = req.params.id;

  const genre = await ServiceCategory.findById(id);

  if (!genre) return res.status(404).send("resource not found");
  res.send(genre);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateServiceCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new ServiceCategory({
    name: req.body.name,
  });
  const saveGenre = await genre.save();
  res.send(saveGenre);
});

module.exports = router;

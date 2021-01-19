const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateId = require("../middlewares/validateId");
const _ = require("lodash");
const { User, validateUser } = require("../models/Users");
const validatePassword = require("../middlewares/validatePassword");
const router = express.Router();

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.post("/", [validatePassword, auth, admin], async (req, res) => {
  const { firstname, lastname, email, password, isAdmin } = req.body;
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExist = await User.findOne({ email });
  if (emailExist) return res.status(400).send("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    firstname,
    lastname,
    email,
    password: hashedPassword,
    isAdmin,
  });
  await user.save();
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "firstname", "lastname", "email", "isAdmin"]));
});

router.put("/:id", [auth, validateId, admin], async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email } = req.body;

  let { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(id);
  if (!user) return res.status(404).send("User not found");

  user.firstname = firstname;
  user.lastname = lastname;
  user.email = email;

  await user.save();
  res.send(_.pick(user, ["_id", "firstname", "lastname", "email"]));
});

router.delete("/:id", [auth, validateId, admin], async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id);
  if (!user) return res.status(404).send("user not found");

  const deleteUser = await User.findByIdAndRemove(id);
  res.send(deleteUser);
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { User } = require("../models/Users");
const { ServiceProvider } = require("../models/ServiceProvider");
const { Customer } = require("../models/Customer");
const bcrypt = require("bcrypt");

router.post("/user/signin", async (req, res) => {
  const { email, password } = req.body;

  const { error } = validateEmailLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ error: "Invalid email or password!" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid email or password!" });

  const token = user.generateAuthToken();

  res.header("x-auth-token", token).send(token);
});

router.post("/customer/signin", async (req, res) => {
  const { phone, password } = req.body;

  const { error } = validatePhoneLogin(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const customer = await Customer.findOne({ phone });
  if (!customer)
    return res.status(400).json({ error: "Invalid phone or password!" });

  const validPassword = await bcrypt.compare(password, customer.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid phone or password!" });

  const token = customer.generateAuthToken();

  res.header("x-auth-token", token).send(token);
});

router.post("/serviceprovider/signin", async (req, res) => {
  const { phone, password } = req.body;

  const { error } = validatePhoneLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const serviceProvider = await ServiceProvider.findOne({ phone });
  if (!serviceProvider)
    return res.status(400).json({ error: "Invalid phone or password!" });

  const validPassword = await bcrypt.compare(
    password,
    serviceProvider.password
  );
  if (!validPassword)
    return res.status(400).json({ error: "Invalid phone or password!" });

  const token = serviceProvider.generateAuthToken();

  res.header("x-auth-token", token).send(token);
});

const validateEmailLogin = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(512).required(),
  });
  return schema.validate(user);
};

const validatePhoneLogin = (user) => {
  const schema = Joi.object({
    phone: Joi.string().min(8).max(20).required(),
    password: Joi.string().min(6).max(512).required(),
  });
  return schema.validate(user);
};

module.exports = router;

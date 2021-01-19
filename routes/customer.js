const express = require("express");
const { Customer, validateCustomer } = require("../models/Customer");
const router = express.Router();
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateId = require("../middlewares/validateId");
const bcrypt = require("bcrypt");
const validatePassword = require("../middlewares/validatePassword");

router.get("/", auth, async (req, res) => {
  const customers = await Customer.find().select("-password");
  res.send(customers);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const customer = await Customer.findById(id).select("-password");
  if (!customer) return res.status(404).send("Customer not found");
  res.send(customer);
});

router.post("/", validatePassword, async (req, res) => {
  const { name, phone, email, password } = req.body;

  const { error } = await validateCustomer(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const phoneExist = await Customer.findOne({ phone });
  if (phoneExist) return res.status(400).json({ error: `phone already exist` });

  const hashedPasword = await bcrypt.hash(password, 10);

  const newCustomer = new Customer({
    name,
    phone,
    email,
    password: hashedPasword,
  });
  const saveCustomer = await newCustomer.save();

  res.send(saveCustomer);
});

router.put("/:id", [auth, validateId], async (req, res) => {
  const { error } = await validateCustomer(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const id = req.params.id;
  const { name, email, phone } = req.body;

  const updateCustomer = await Customer.findByIdAndUpdate(
    id,
    {
      name,
      email,
      phone,
    },
    { new: true }
  );

  if (!updateCustomer) return res.status(404).send("Customer ID not found");
  res.send(updateCustomer);
});

router.delete("/:id", [auth, validateId, admin], async (req, res) => {
  const { id } = req.params;

  const deleteCustomer = await Customer.findByIdAndDelete(id);
  if (!deleteCustomer)
    return res.status(404).json({ error: "Customer not  found" });

  res.status(200).send(deleteCustomer);
});

module.exports = router;

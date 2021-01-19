const express = require("express");
const router = express.Router();
const {
  ServiceProvider,
  validateServiceProvider,
  validateAddingService,
} = require("../models/ServiceProvider");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validateId = require("../middlewares/validateId");
const validatePassword = require("../middlewares/validatePassword");
const { ServiceCategory } = require("../models/ServiceCategory");
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  //Fetch and return all service Providers
  const serviceProviders = await ServiceProvider.find();
  res.send(serviceProviders);
});

router.get("/:id", validateId, async (req, res) => {
  //fetch service by ID
  const { id } = req.params;
  const serviceProvider = await ServiceProvider.findById(id);
  if (!serviceProvider) return res.status(404).send("Resource not found");

  res.send(serviceProvider);
});

router.post("/", validatePassword, async (req, res) => {
  const { name, phone, email, password, aboutMe } = req.body;

  //validating req.body
  let { error } = validateServiceProvider(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //ensure phone number doest already exist
  const serviceProviderPhoneExist = await ServiceProvider.findOne({ phone });
  if (serviceProviderPhoneExist)
    return res.status(400).send(`${phone} already exist`);

  //if email was provided ensure it doesnt already exist
  if (email) {
    const serviceProviderEmailExist = await ServiceProvider.findOne({ email });
    if (serviceProviderEmailExist)
      return res.status(400).send(`${email} already exist`);
  }

  //hashing password
  const hashedPassword = await bcrypt.hash(password, 10);

  //creating an instance of a new user
  const serviceProvider = new ServiceProvider({
    name,
    email,
    phone,
    password: hashedPassword,
    aboutMe,
  });

  //saving the user to database
  const saveServiceProvider = await serviceProvider.save();

  //return saved user
  res.send(saveServiceProvider);
});

/*
POST ROUTE FOR ADDING SERVICES TO A SERVICE PROVIDER
 */
router.post("/service/:id", validateId, async (req, res) => {
  const { id } = req.params;
  const { serviceIds } = req.body;

  //validating req.body
  const { error } = validateAddingService(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //fetching service category for the serviceId
  const serviceCategory = await ServiceCategory.find({
    "services._id": { $in: serviceIds },
  });
  if (serviceCategory.length > 1)
    return res
      .status(400)
      .send("Cant process different service categories at once");
  if (serviceCategory.length < 1)
    return res.status(404).send("service not found");

  //ensure service ID exists in service category. Return a 404 otherwise
  const services = serviceCategory[0].services.filter(({ _id }) =>
    serviceIds.includes(_id.toString())
  );
  if (services.length !== serviceIds.length)
    return res.status(404).send("service not found");

  //ensuring service provider does not exceed maximum (three) servicesOffered
  const { servicesOffered } = await ServiceProvider.findById(id).select(
    "servicesOffered -_id"
  );
  if (servicesOffered.length + serviceIds.length > 3)
    return res.status(400).send("Maximum services offered is 3");

  //ensuring services offered does not duplicate
  const repeatingServices = servicesOffered.filter((service) =>
    serviceIds.includes(service._id.toString())
  );
  if (repeatingServices.length > 0)
    return res.status(400).send("service duplicate error");

  //Updating services offered and return updated document
  const updateServiceProvider = await ServiceProvider.findByIdAndUpdate(
    id,
    { $push: { servicesOffered: services } },
    { new: true }
  ).select("servicesOffered -_id");

  //updating the number of services providers in service category
  serviceIds.map(
    async (id) =>
      await ServiceCategory.findOneAndUpdate(
        { "services._id": id },
        { $inc: { "services.$.numberOfServiceProviders": 1 } }
      )
  );
  res.send(updateServiceProvider);
});

router.put("/:id", [auth, validateId], async (req, res) => {
  let updateServiceProvider;
  const { id } = req.params;
  const { name, phone, email, aboutMe } = req.body;

  const { error } = validateServiceProvider(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //ensure provided id matches a service provider account
  const serviceProvider = await ServiceProvider.findById(id);
  if (!serviceProvider)
    return res.status(404).send("Service Provider not found");

  //ensure phone number with a different account(id) doesnt already exist
  const serviceProviderPhoneExist = await ServiceProvider.findOne({
    $and: [{ _id: { $ne: id } }, { phone }],
  });
  if (serviceProviderPhoneExist)
    return res.status(400).send(`${phone} already exist`);

  //ensure email doesnt already exist with a different account (id)
  const serviceProviderEmailExist = await ServiceProvider.findOne({
    $and: [{ _id: { $ne: id } }, { email }],
  });
  if (serviceProviderEmailExist)
    return res.status(400).send(`${email} already exist`);

  updateServiceProvider = await ServiceProvider.findByIdAndUpdate(
    id,
    { name, email, phone, aboutMe },
    { new: true }
  );

  res.send(updateServiceProvider);
});

/*
PUT ROUTE FOR UPDATING SERVICE PROVIDER Profile Picture
 */

router.put("/profilepicture/:id", async (req, res) => {
  const { id } = req.params;
  const { url } = req.body;
  const { profilePicture } = await ServiceProvider.findByIdAndUpdate(
    id,
    { profilePicture: url },
    { new: true }
  );
  if (profilePicture) res.status(404).send("Service provider not found");
  res.send(profilePicture);
});

/*
PUT ROUTE FOR UPDATING SERVICE PROVIDER SERVICE STATE (active OR inactive)
 */
router.put("/service/:id/:serviceId", [auth, validateId], async (req, res) => {
  const { id, serviceId } = req.params;
  const { isActive } = req.body;

  //updating service status if service provider and service exist
  const { servicesOffered } = await ServiceProvider.findOneAndUpdate(
    {
      _id: id,
      "servicesOffered._id": serviceId,
    },
    { "servicesOffered.$.isActive": isActive },
    { new: true }
  );
  if (!servicesOffered)
    return res.status(404).send("Service Provider not found");

  res.send(servicesOffered);
});

router.delete("/:id", [auth, validateId, admin], async (req, res) => {
  const { id } = req.params;
  const deleteServiceProvider = await ServiceProvider.findByIdAndDelete(id);
  if (!deleteServiceProvider) return res.status(404).send("Resource not found");
  res.send(deleteServiceProvider);
});

router.delete("/service/:id", [auth, validateId], async (req, res) => {
  const { id } = req.params;
  const deleteService = await ServiceProvider.findOneAndDelete({
    "servicesOffered._id": id,
  });
  if (deleteService) return res.status(404).send("Service not found");

  res.send(deleteService);
});

module.exports = router;

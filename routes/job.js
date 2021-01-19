const express = require("express");
const router = express.Router();
const {
  validateNewJob,
  Job,
  validateJobApplication,
  validateReview,
} = require("../models/Job");
const { Customer } = require("../models/Customer");
const validateId = require("../middlewares/validateId");
const { ServiceCategory } = require("../models/ServiceCategory");
const auth = require("../middlewares/auth");
const { ServiceProvider } = require("../models/ServiceProvider");

router.get("/", async (req, res) => {
  const jobs = await Job.find()
    .populate("serviceProvider")
    .populate("applicants");
  res.send(jobs);
});

router.get("/:id", [auth, validateId], async (req, res) => {
  const { id } = req.params;

  const job = await Job.findById(id);
  if (!job) return res.status(404).send("Job not found!");

  res.send(job);
});

router.post("/", async (req, res) => {
  const { error } = validateNewJob(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { customerId, serviceId, description, hourlyRate } = req.body;

  const customer = await Customer.findById(customerId);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const service = await ServiceCategory.findOne({ "services._id": serviceId });
  if (!service) return res.status(404).json({ error: "Service not found" });

  const newJob = new Job({
    customer: {
      _id: customer._id,
      name: customer.name,
    },
    service: {
      _id: service._id,
      name: service.name,
    },
    description,
    hourlyRate: hourlyRate || 0,
  });
  await newJob.save();
  res.send(newJob);
});

/**
 * ROUTE FOR SERVICE PROVIDERS TO APPLY FOR JOBS
 */
router.put("/apply/:id", [auth, validateId], async (req, res) => {
  const { id: jobId } = req.params;
  const { serviceProviderId } = req.body;

  const { error } = validateJobApplication(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: "job not found" });

  const serviceProvider = await ServiceProvider.findById(serviceProviderId);
  if (!serviceProvider)
    return res.status(404).json({ error: "service provider not found" });

  const applicantExist = job.applicants.includes(serviceProviderId);
  if (applicantExist)
    return res
      .status(400)
      .json({ error: "You have already applied to this job" });

  job.applicants.push(serviceProviderId);
  await job.save();
  res.send(job);
});

/**
 * ROUTE FOR CUSTOMER TO SELECT AN APPLICANT (SERVICE PROVIDER)
 */
router.put("/hire/:id", [auth, validateId], async (req, res) => {
  const { id: jobId } = req.params;

  const { serviceProviderId } = req.body;

  const { error } = validateJobApplication(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ error: "job not found" });

  const serviceProvider = await ServiceProvider.findById(serviceProviderId);
  if (!serviceProvider)
    return res.status(404).json({ error: "service provider not found" });

  if (
    job.serviceProvider &&
    job.serviceProvider._id.toString() === serviceProviderId
  )
    return res.status(400).json({ error: "Applicant already hired" });

  job.serviceProvider = serviceProviderId;
  job.status = "in-progress";
  await job.save();

  res.send(job);
});

/**
 * PUT ROUTER TO (REVIEW) RATE AND COMMENT SERVICE PROVIDER BY CUSTOMER
 */

router.put("/review/:id", [auth, validateId], async (req, res) => {
  const { id: jobId } = req.params;
  const { stars, comment } = req.body;

  const { error } = validateReview(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const reviewJob = await Job.findByIdAndUpdate(
    jobId,
    { stars, comment },
    { new: true }
  );
  if (!reviewJob) return res.status(400).json({ error: "Job not found!" });

  res.send(reviewJob);
});

router.delete("/:id", [auth, validate], async () => {
  const { id } = req.params;

  const deleteJob = await Job.findByIdAndDelete(id);
  if (!deleteJob) return res.status(404).json({ error: "Job not found" });

  res.send(deleteJob);
});
module.exports = router;

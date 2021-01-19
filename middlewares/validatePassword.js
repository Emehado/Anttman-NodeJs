const Joi = require("joi");
module.exports = (req, res, next) => {
  const schema = Joi.object({
    password: Joi.string().min(6).max(512).required(),
  });

  const { error } = schema.validate({ password: req.body.password });
  if (error) return res.status(400).json({ error: error.details[0].message });

  next();
};

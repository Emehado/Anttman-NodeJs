const Joi = require('joi')
module.exports = (req, res, next) => {
    const {name} = req.body;

    const schema = Joi.object({name: Joi.string().min(3).max(255).required()})
    const {error} = schema.validate({name})
    if (error) return res.status(400).send('Invalid name supplied')

    next()
}


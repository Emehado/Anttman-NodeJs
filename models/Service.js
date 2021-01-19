// const {Schema, model} = require('mongoose')
// const Joi = require('Joi');
// Joi.objectId = require('joi-objectid')(Joi);
//
//
//
// const Service = model('service', serviceSchema);
//
// const validateService = (service) => {
//     const schema = Joi.object({
//         name: Joi.string().min(3).max(255).trim(true).required(),
//         serviceCategoryId: Joi.objectId().required()
//     })
//     return schema.validate(service)
// }
//
// exports.Service = Service;
// exports.serviceSchema = serviceSchema;
// exports.validateService = validateService;

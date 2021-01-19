const {Schema, model} = require("mongoose");
const Joi = require("joi");

const serviceCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 255,
        required: true,
    },
    icon: {
      type: String,
      minlength: 3,
      maxlength: 255,
      trim: true,
      required: true
    },
    services: [{
        type: new Schema({
            name: {
                type: String,
                trim: true,
                minlength: 3,
                maxlength: 255,
                required: true,
            },
            numberOfServiceProviders: {
                type: Number,
                min: 0,
                default: 0
            },
        }),
    }],
});

const validateServiceCategory = (category) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
        services: Joi.array().min(1).max(20)
    });
    return schema.validate(category);
};

const validateAddService = (service) => {
    const schema = Joi.object({
        name: Joi.string().min(3).max(255).required(),
    });
    return schema.validate(service);
};
const ServiceCategory = model("service_category", serviceCategorySchema);
exports.ServiceCategory = ServiceCategory;
exports.serviceCategorySchema = serviceCategorySchema;
exports.validateServiceCategory = validateServiceCategory;
exports.validateAddService = validateAddService;

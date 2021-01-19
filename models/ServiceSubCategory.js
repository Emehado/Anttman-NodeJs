const {Schema, model} = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi)
const  {serviceCategorySchema} = require('./ServiceCategory')


const serviceSubCategorySchema = new Schema({
    name: {
        type: String,
        trim: true,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    numberOfServiceProviders: {
        type: Number,
        min: 0,
        default: 0
    },
    parentCategory: {
        type: new Schema({
            name: {
                type: String,
                required: true,
                trim: true,
                minlength: 3,
                maxlength: 255
            }
        }),
        required:  true
    }
})

const ServiceSubCategory = model('service_subcategory', serviceSubCategorySchema)

const validateServiceSubCategory = (serviceSubCategory) => {
    const schema = Joi.object({
        name: Joi.string().trim(true).max(255).min(3).required(),
        numberOfServiceProviders: Joi.number().min(0),
        serviceCategoryId: Joi.objectId().required()
    })
    return schema.validate(serviceSubCategory)
}


exports.serviceSubCategorySchema = serviceSubCategorySchema;
exports.validateServiceSubCategory = validateServiceSubCategory;
exports.ServiceSubCategory = ServiceSubCategory;
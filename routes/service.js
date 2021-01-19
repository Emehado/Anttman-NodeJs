// const express = require('express');
// const router = express.Router()
// const {Service, validateService} = require('../models/Service');
// const {ServiceSubCategory} = require('../models/ServiceSubCategory')
// const auth = require('../middlewares/auth')
// const validateId = require('../middlewares/validateId')
// const validateName = require('../middlewares/validateName')
// const admin = require('../middlewares/admin')
//
// router.get('/', async (req, res) => {
//     const services = await Service.find();
//     res.send(services);
// })
//
// router.post('/', auth, async (req, res) => {
//     const {name, parentSubCategoryId} = req.body;
//
//     const {error} = validateService(req.body)
//     if (error) return res.status(400).send(error.details[0].message)
//
//     const serviceExist = await Service.findOne({name});
//     if (serviceExist) return res.status(400).send(`${name} already exist`)
//
//     const parentSubCategory = await ServiceSubCategory.findById(parentSubCategoryId);
//     if (!parentSubCategory) return res.status(404).send('sub category not found')
//
//     const service = new Service({
//         name,
//         parentSubCategory: {
//             _id: parentSubCategory._id,
//             name: parentSubCategory.name,
//             parentCategory: parentSubCategory.parentCategory
//         }
//     })
//
//     const saveService = await service.save()
//
//     res.send(saveService)
// })
//
// router.put('/:id', [auth, validateId, validateName], async (req, res) => {
//     const {id} = req.params;
//     const {name} = req.body;
//
//     const serviceNameExist = await Service.findOne({name})
//     if (serviceNameExist) return res.status(400).send(`${name} already exist`)
//
//     const updateService = await Service.findByIdAndUpdate(id, {name}, {new: true})
//     if (!updateService) return res.status(404).send('Resource not found')
//
//     res.send(updateService)
//
// })
//
// router.delete('/:id', [auth, validateId, admin], async (req, res) => {
//     const {id} = req.params;
//
//     const deleteService = await Service.findByIdAndDelete(id);
//     if (!deleteService) return res.status(404).send('Resource not found')
//
//     res.send(deleteService)
// })
//
// module.exports = router;
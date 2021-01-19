// const express = require('express');
// const router = express.Router();
// const {ServiceCategory} = require('../models/ServiceCategory')
// const {validateServiceSubCategory, ServiceSubCategory} = require('../models/ServiceSubCategory')
// const validateId = require('../middlewares/validateId')
// const validateName = require('../middlewares/validateName')
// const auth = require('../middlewares/auth')
// const admin = require('../middlewares/admin')
// const mongoose = require('mongoose')
//
// router.get('/', async (req, res) => {
//     const serviceSubCategory = await ServiceSubCategory.find();
//     res.send(serviceSubCategory)
// })
//
//
// router.post('/', auth, async (req, res) => {
//     const {name, serviceCategoryId} = req.body;
//
//     const {error} = validateServiceSubCategory(req.body);
//     if (error) return res.status(400).send(error.details[0].message)
//
//     const serviceSubCategoryExist = await ServiceSubCategory.findOne({name})
//     if (serviceSubCategoryExist) return res.status(400).send(`${name} exist already`)
//
//     const parentCategory = await ServiceCategory.findById(serviceCategoryId)
//     if (!parentCategory) return res.status(404).send('Parent category not found')
//
//     //starting a session to create a transaction
//     const session = await ServiceSubCategory.startSession();
//     await session.withTransaction(async () => {
//        const serviceSubCategory =  new ServiceSubCategory({
//            _id: mongoose.Types.ObjectId(),
//             name,
//             parentCategory: {
//                 _id: parentCategory._id,
//                 name: parentCategory.name
//             }
//         }, {session: session})
//         await serviceSubCategory.save()
//         throw Error('bad something happened')
//         await ServiceCategory.findByIdAndUpdate(serviceCategoryId, {$inc: {numberOfServices: 1}}).session(session)
//
//     })
//
//
//     res.send('done')
// })
//
// router.put('/:id', [auth, validateId, validateName], async (req, res) => {
//     const {name} = req.body;
//     const {id} = req.params;
//
//     const serviceSubCategoryExist = await ServiceSubCategory.findOne({name})
//     if (serviceSubCategoryExist) return res.status(400).send(`${name} already exist`)
//
//     const serviceSubCategory = await ServiceSubCategory.findById(id);
//     if (!serviceSubCategory) return res.status(404).send('Resource not found')
//
//     serviceSubCategory.name = name;
//     const updatedServiceSubCategory = await serviceSubCategory.save()
//
//     res.send(updatedServiceSubCategory)
//
// })
//
//
// router.delete('/:id', [auth, validateId, admin], async (req, res) => {
//     const {id} = req.params;
//
//     const deleteServiceSubCategory = await ServiceSubCategory.findByIdAndDelete(id)
//     if (!deleteServiceSubCategory) return res.status(404).send('Resource not found');
//
//     res.send(deleteServiceSubCategory)
// })
// module.exports = router;
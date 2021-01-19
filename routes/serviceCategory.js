const express = require('express');
const router = express.Router();
const {ServiceCategory, validateServiceCategory, validateAddService} = require('../models/ServiceCategory')
const auth = require('../middlewares/auth')
const admin = require('../middlewares/admin')
const validateId = require('../middlewares/validateId')

router.get('/', async (req, res) => {
    const serviceCategories = await ServiceCategory.find()
    res.send(serviceCategories);
})

router.get('/:id', async (req, res) => {
    const {id} = req.params;
    const serviceCategories = await ServiceCategory.findById(id)
    res.send(serviceCategories);
})

router.post('/', [auth, admin], async (req, res) => {
    const {name, services} = req.body;
    const {error} = validateServiceCategory(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    const serviceCategoryExist = await ServiceCategory.findOne({name})
    if (serviceCategoryExist) return res.status(400).send(`${name} already exist`)

    const serviceCategory = new ServiceCategory({
        name,
        services
    });
    await serviceCategory.save();

    res.send(serviceCategory)
})

router.post('/service/:id', [auth, validateId, admin], async (req, res) => {
    const {id} = req.params;
    const {name} = req.body;

    const {error} = validateAddService(req.body);
    if (error) return res.status(400).send(error.details[0].message)

    const serviceCategory = await ServiceCategory.findById(id);
    if(!serviceCategory) return res.status(404).send('resource not found')
    const services = serviceCategory.services
    
    const serviceExist = services.some(service => service.name === name)
    if (serviceExist) return res.status(400).send(`${name} service already exist in this category`)
    const addService = await ServiceCategory.findByIdAndUpdate(id, {$push: {services: {name}}}, {new: true})
    res.send(addService);
})

router.put('/:id', [auth, validateId], async (req, res) => {
    const {name} = req.body;
    const {id} = req.params;

    const serviceCategory = await ServiceCategory.findById(id);
    if (!serviceCategory) return res.status(404).send('resource not found')

    if (serviceCategory.name !== name) {
        const nameExist = await ServiceCategory.findOne({name})
        if (nameExist) return res.status(400).send(`${name} already exist`)
        serviceCategory.name = name;
    }


    const updatedServiceCategory = await serviceCategory.save()
    res.send(updatedServiceCategory)
})

router.put('/service/:id', [auth, validateId], async (req, res) => {
    const {id} = req.params;
    const {name} = req.body;

    const serviceCategories = await ServiceCategory.findOne({"services._id": id})
    console.log(serviceCategories)
    if (!serviceCategories) return res.status(404).send('resource not found')
    const nameExist = serviceCategories.services.some(service => service.name === name)
    if (nameExist) return res.status(400).send(`${name} already exist`)

    const updateService = await ServiceCategory.findOneAndUpdate({"services._id": id}, {"services.$.name": name}, {new: true})


    res.send(updateService)
})

router.delete('/:id', [auth, validateId, admin], async (req, res) => {
    const {id} = req.params;

    const deleteServiceCategory = await ServiceCategory.findByIdAndDelete(id)
    if (!deleteServiceCategory) return res.status(404).send(`resource not found`)

    res.send(deleteServiceCategory);
})

router.delete('/service/:id', [auth, validateId, admin], async (req, res) => {
    const {id} = req.params;

    const deleteService = await ServiceCategory.findOneAndUpdate({"services._id": id}, {$pull: {services: {_id: id}}})
    if (!deleteService) return res.status(404).send('resource not found')

    res.send(deleteService)
})

module.exports = router;
const express = require('express');
const {
   getAttractions,
   getAttraction,
   createAttraction,
   updateAttraction,
   deleteAttraction,
   getAttractionsInRadius,
   attractionPhotoUpload
} = require('../controllers/attractions');

const Attraction = require('../models/Attraction');

// Takes in the model and any populate
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const productRouter = require('./products');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:attractionId/products', productRouter);

router.route('/radius/:zipcode/:distance')
   .get(getAttractionsInRadius);

router
   .route('/:id/photos')
   .put(protect, attractionPhotoUpload);

router
   .route('/')
   .get(advancedResults(Attraction, 'products'), getAttractions)
   .post(protect, createAttraction);

router
   .route('/:id')
   .get(getAttraction)
   .put(protect, updateAttraction)
   .delete(protect, deleteAttraction);

module.exports = router;
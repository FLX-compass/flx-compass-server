const express = require('express');
const {
   getAttractions,
   getAttraction,
   createAttraction,
   updateAttraction,
   deleteAttraction,
   getAttractionsInRadius
} = require('../controllers/attractions');

// Include other resource routers
const productRouter = require('./products');

const router = express.Router();

// Re-route into other resource routers
router.use('/:attractionId/products', productRouter);

router.route('/radius/:zipcode/:distance')
   .get(getAttractionsInRadius);

router
   .route('/')
   .get(getAttractions)
   .post(createAttraction);

router
   .route('/:id')
   .get(getAttraction)
   .put(updateAttraction)
   .delete(deleteAttraction);

module.exports = router;
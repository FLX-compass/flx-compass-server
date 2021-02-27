const express = require('express');
const {
   getAttractions,
   getAttraction,
   createAttraction,
   updateAttraction,
   deleteAttraction,
   getAttractionsInRadius,
   attractionPhotoUpload,
   likeAttraction,
   bookmarkAttraction,
   unLikeAttraction,
   unBookmarkAttraction
} = require('../controllers/attractions');

const Attraction = require('../models/Attraction');

// Takes in the model and any populate
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const productRouter = require('./products');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:attractionId/products', protect, productRouter);

router.route('/radius/:zipcode/:distance')
   .get(getAttractionsInRadius);

router
   .route('/:id/photos')
   .put(protect, authorize('publisher', 'admin'), attractionPhotoUpload);

router
   .route('/')
   .get(advancedResults(Attraction, 'products'), getAttractions)
   .post(protect, authorize('publisher', 'admin'), createAttraction);

router
   .route('/:id')
   .get(protect, getAttraction)
   .put(protect, authorize('publisher', 'admin'), updateAttraction)
   .delete(protect, authorize('publisher', 'admin'), deleteAttraction);

router
   .route('/like/:id')
   .put(protect, authorize('user', 'publisher', 'admin'), likeAttraction);

router
   .route('/bookmark/:id')
   .put(protect, authorize('user', 'publisher', 'admin'), bookmarkAttraction);

router
   .route('/unlike/:id')
   .put(protect, authorize('user', 'publisher', 'admin'), unLikeAttraction);

router
   .route('/unbookmark/:id')
   .put(protect, authorize('user', 'publisher', 'admin'), unBookmarkAttraction);

module.exports = router;
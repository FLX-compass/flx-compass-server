const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    getAllEvents,
    getAllEventsWithCategory,
    getEventByCoordinates,
    getEventById,
    createEvent,
    deleteEvent,
    eventPhotoUpload,
    bookmarkEvent,
    unbookmarkEvent,
    likeEvent,
    unlikeEvent,
    updateEvent,
    getEventsInRadiusWithZip,
    getEventsInRadiusWithLongLat
} = require('../controllers/events')

const Event = require('../models/Event');

const hpp = require('hpp')

const advancedResults = require('../middleware/advancedResults');

const {
    protect,
    authorize
} = require('../middleware/auth')

router.
route('/getAll')
    .get(advancedResults(Event,'product'),getAllEvents)

router.
route('getAllCategory/:category')
    .get(getAllEventsWithCategory)

router.
route('/:id')
    .get(getEventById)
    .put(protect, authorize('publisher', 'admin'), updateEvent)
    .delete(protect, authorize('publisher', 'admin'), deleteEvent)
router.
route('/getByCoords')
    .get(protect, authorize('user', 'publisher', 'admin'), getEventByCoordinates)

router.
route('/create')
    .post(protect, authorize('publisher', 'admin'), createEvent)


router.
route('/updatePhoto/:id')
    .put(protect, authorize('publisher', 'admin'), eventPhotoUpload)

router.
route('/like/:id')
    .put(protect, authorize('user', 'publisher', 'admin'), likeEvent)

router.
route('/unlike/:id')
    .put(protect, authorize('user', 'publisher', 'admin'), unlikeEvent)

router.
route('/bookmark/:id')
    .put(protect, authorize('user', 'publisher', 'admin'), bookmarkEvent)

router.
route('/unbookmark/:id')
    .put(protect, authorize('user', 'publisher', 'admin'), unbookmarkEvent)

router.
route('/radiusZip/:zipcode/:distance')
    .get(getEventsInRadiusWithZip);

router.
route('/radius/:lng/:lat/:zip')
    .get(getEventsInRadiusWithLongLat);

module.exports = router;
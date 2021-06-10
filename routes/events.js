const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {
    getAllEvents,
    getEventByCoordinates,
    getEventById,
    createEvent,
    deleteEvent,
    eventPhotoUpload,
    bookmarkEvent,
    unbookmarkEvent,
    likeEvent,
    unlikeEvent,
    updateEvent
} = require('../controllers/events')

const hpp = require('hpp')

const {
    protect,
    authorize
} = require('../middleware/auth')

router.
route('/getAll')
    .get(getAllEvents)

router.
route('/:id')
    .get(protect, authorize('publisher', 'admin'), getEventById)
    .put(protect, authorize('publisher', 'admin'), updateEvent)
    .delete(protect, authorize('publisher', 'admin'), deleteEvent)
router.
route('/getByCoords')
    .get(protect, authorize('user', 'publisher', 'admin'), getEventByCoordinates)

router.
route('/create')
    .post(protect, authorize('publisher', 'admin'), createEvent)
    

router.
route('/updatePhoto')
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

module.exports = router;
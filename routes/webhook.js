const express = require('express');


const {
    searchEvents
} = require('../controllers/ticketmaster');

const router = express.Router({
    mergeParams: true
});

const {
    protect,
    authorize
} = require('../middleware/auth');

// router.use(protect);
// router.use(authorize('admin'));

router
    .route('/ticketmaster')
    .get(searchEvents)

module.exports = router;
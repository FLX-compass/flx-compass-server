const express = require('express');
const {
   getAttractions,
   getAttraction,
   createAttraction,
   updateAttraction,
   deleteAttraction
} = require('../controllers/attractions');

const router = express.Router();

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
const express = require('express');
const {
   getProducts,
   getProduct,
   addProduct,
   updateProduct,
   deleteProduct
} = require('../controllers/products');

const Product = require('../models/Product');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
   .route('/')
   .get(advancedResults(Product, {
      path: 'attraction',
      select: 'name slug'
   }), getProducts)
   .post(protect, authorize('publisher', 'admin'), addProduct);

router
   .route('/:id')
   .get(getProduct)
   .put(protect, authorize('publisher', 'admin'), updateProduct)
   .delete(protect, authorize('publisher', 'admin'), deleteProduct);

module.exports = router;
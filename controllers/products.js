const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');

// @desc    Get All Products
// @route   GET /api/v2/products
// @route   GET /api/v2/attractions/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
   let query;

   if(req.params.attractionId) {
      query = Product.find({ attraction: req.params.attractionId });
   } else {
      query = Product.find().populate({
         path: 'attraction',
         select: 'name slug'
      });
   }

   const products = await query;

   res.status(200).json({
      success: true,
      count: products.length,
      data: products
   });
});
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Product = require('../models/Product');
const Attraction = require('../models/Attraction');

// @desc    Get All Products
// @route   GET /api/v2/products
// @route   GET /api/v2/attractions/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
   if(req.params.attractionId) {
      const products = await Product.find({ attraction: req.params.attractionId });

      return res.status(200).json({
         success: true,
         count: products.length,
         data: products
      })
   } else {
      res.status(200).json(res.advancedResults);
   }
});

// @desc    Get Single Product
// @route   GET /api/v2/products/:ID
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
   const product = await Product.findById(req.params.id).populate({
      path: 'attraction',
      select: 'name slug'
   });

   if(!product) {
      return next(new ErrorResponse(`No course with an ID of ${req.params.id}`), 404);
   }

   res.status(200).json({
      success: true,
      data: product
   });
});

// @desc    Create Product
// @route   POST /api/v2/attractions/:attractionID/products
// @access  Private
exports.addProduct = asyncHandler(async (req, res, next) => {
   req.body.attraction = req.params.attractionId;
   const attraction = await Attraction.findById(req.params.attractionId);

   if(!attraction) {
      return next(
         new ErrorResponse(`No attraction with an ID of ${req.body.attractionId}`, 
         404)
      );
   }

   const product = await Product.create(req.body);

   res.status(200).json({
      success: true,
      data: product
   });
});

// @desc    Update Product
// @route   PUT /api/v2/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
   let product = await Product.findById(req.params.id);

   if(!product) {
      return next(
         new ErrorResponse(`No product with an ID of ${req.body.id}`, 
         400)
      );
   }

   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
   });

   res.status(200).json({
      success: true,
      data: product
   });
});

// @desc    Delete Product
// @route   DELETE /api/v2/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
   const product = await Product.findById(req.params.id);

   if(!product) {
      return next(
         new ErrorResponse(`No product with an ID of ${req.body.id}`, 
         404)
      );
   }

   await product.remove();

   res.status(200).json({
      success: true,
      data: []
   });
});
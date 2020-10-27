const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Attraction = require('../models/Attraction');


// @desc    Get All Attractions
// @route   GET /api/v2/attractions
// @access  Public
exports.getAttractions = asyncHandler(async (req, res, next) => {
      let query;

      // Copy req.query
      const reqQuery = { ...req.query };

      // Fields to exclude
      const removeFields = ['select', 'sort', 'page', 'limit'];

      // Loop over removeFields and remove from reqQuery
      removeFields.forEach(param => delete reqQuery[param]);

      // Create query string
      let queryStr = JSON.stringify(reqQuery);

      // Create operators ($gt, $gte, $lt, $lte, $in)
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

      // Finding resource
      query = Attraction.find(JSON.parse(queryStr)).populate('products');

      // SELECT FIELDS
      if(req.query.select) {
         const fields = req.query.select.split(',').join(' ');
         query = query.select(fields);
      }

      // SORT
      if(req.query.sort) {
         const sortBy = req.query.sort.split(',').join(' ');
         query = query.sort(sortBy);
      } else {
         query = query.sort('name');
      }

      // Pagination, set page default and limit default after ||
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 1000;
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit; 
      const total = await Attraction.countDocuments();

      query = query.skip(startIndex).limit(limit);

      // Executing query
      const attractions = await query;

      // Pagination result
      const pagination = {};

      if(endIndex < total) {
         pagination.next = {
            page: page + 1,
            limit
         }
      }

      if(startIndex > 0) {
         pagination.prev = {
            page: page - 1,
            limit
         }
      }

      res
         .status(200)
         .json({ success: true, count: attractions.length, pagination, data: attractions });
});

// @desc    Get Single Attraction
// @route   GET /api/v2/attractions/:id
// @access  Public
exports.getAttraction = asyncHandler(async (req, res, next) => {
      const attraction = await Attraction.findById(req.params.id);
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }
      res
         .status(200)
         .json({ success: true, data: attraction });
});

// @desc    Create Attraction
// @route   POST /api/v2/attractions
// @access  Private
exports.createAttraction = asyncHandler(async (req, res, next) => {
      const attraction = await Attraction.create(req.body);

      res.status(201).json({
         success: true,
         data: attraction
      });
});

// @desc    Update Attraction
// @route   PUT /api/v2/attractions/:id
// @access  Private
exports.updateAttraction = asyncHandler(async (req, res, next) => {
      const attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
      });
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }
      res
         .status(200)
         .json({ success: true, data: attraction });   
});

// @desc    Delete Attraction
// @route   DELETE /api/v2/attractions/:id
// @access  Private
exports.deleteAttraction = asyncHandler(async (req, res, next) => {
      const attraction = await Attraction.findById(req.params.id);
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }
      attraction.remove();
      res
         .status(200)
         .json({ success: true, data: {} });   
});

// @desc    Get Attractiosns within radious
// @route   GET /api/v2/attractions/radius/:zipcode/:distance
// @access  Public
exports.getAttractionsInRadius = asyncHandler(async (req, res, next) => {
   const { zipcode, distance } = req.params;
   
   // Get lat/lng from geocoder
   const loc = await geocoder.geocode(zipcode);
   const lat = await loc[0].latitude;
   const lng = await loc[0].longitude;

   // Calc radius in radians
   // Divide distance by radius of earth
   // Earth radius 3,963 mi / 6,378 km
   const radius = distance / 3963;

   const attractions = await Attraction.find({
      location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
   });

   res.status(200).json({
      success: true,
      count: attractions.length,
      data: attractions
   });
});
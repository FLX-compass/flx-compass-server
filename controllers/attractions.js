const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Attraction = require('../models/Attraction');
const { truncate } = require('fs');


// @desc    Get All Attractions
// @route   GET /api/v2/attractions
// @access  Public
exports.getAttractions = asyncHandler(async (req, res, next) => {
   res.status(200).json(res.advancedResults);
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
   // Add user to req.body
   req.body.user = req.user.id;

   // Check for published Attraction
   const publishedAttraction = await Attraction.findOne({ user: req.user.id });

   // if user is not admin, can only create one Attraction
   if(publishedAttraction && req.user.role !== 'admin') {
      return next(new ErrorResponse(`The user with ID ${req.user.id} has already published one Attraction`, 400));
   }

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
      let attraction = await Attraction.findById(req.params.id);

      // check for attraction
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }

      // Make sure user has proper permissions
      if(attraction.user.toString() !== req.user.id && req.user.role !== 'admin'){
         return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this attraction`, 404));
      }

      // Update
      attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
      });

      res
         .status(200)
         .json({ success: true, data: attraction });   
});

// @desc    Delete Attraction
// @route   DELETE /api/v2/attractions/:id
// @access  Private
exports.deleteAttraction = asyncHandler(async (req, res, next) => {
      const attraction = await Attraction.findById(req.params.id);

      // Make sure attraction exists
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }

      // Make sure user has proper permissions
      if(attraction.user.toString() !== req.user.id && req.user.role !== 'admin'){
         return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this attraction`, 404));
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

// @desc    Upload photo
// @route   PUT /api/v2/attractions/:id/photo
// @access  Private
exports.attractionPhotoUpload = asyncHandler(async (req, res, next) => {
   const attraction = await Attraction.findById(req.params.id);
   if(!attraction) {
      return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
   }

   // Make sure user has proper permissions
   if(attraction.user.toString() !== req.user.id && req.user.role !== 'admin'){
      return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a photo to this attraction`, 404));
   }
   
   if(!req.files) {
      return next(
         new ErrorResponse(`Please upload a file`, 400)
      );
   }
   const file = req.files.file;

   // Image validation
   if(!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse('Please upload an image file.', 400))
   }

   // Check file size
   if(file.size > process.env.MAX_FILE_UPLOAD) {
      return next(new ErrorResponse(`Please upload an image file size less than ${process.env.MAX_FILE_UPLOAD}.`, 400))
   }

   // Create custom filename
   file.name = `photo_${attraction._id}${path.parse(file.name).ext}`;

   // Move to uploads folder
   file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if(err) {
         console.error(err);
         return next(
            new ErrorResponse(`Problem with file upload`, 500)
         );
      }
   await Attraction.findByIdAndUpdate(req.params.id, { photo: file.name });

   res.status(200).json({
      success: true,
      data: file.name
   })
   });
});
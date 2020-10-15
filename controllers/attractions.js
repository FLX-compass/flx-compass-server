const ErrorResponse = require('../utils/errorResponse');
const Attraction = require('../models/Attraction');

// @desc    Get All Attractions
// @route   GET /api/v2/attractions
// @access  Public
exports.getAttractions = async (req, res, next) => {
   try {
      const attractions = await Attraction.find();
      res.status(200).json({ success: true, count: attractions.length, data: attractions });
   } catch (err) {
      next(err);
   }
}

// @desc    Get Single Attraction
// @route   GET /api/v2/attractions/:id
// @access  Public
exports.getAttraction = async (req, res, next) => {
   try {
      const attraction = await Attraction.findById(req.params.id);
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }
      res.status(200).json({ success: true, data: attraction });
   } catch (err) {
      next(err);
   }
}

// @desc    Create Attraction
// @route   POST /api/v2/attractions
// @access  Private
exports.createAttraction = async (req, res, next) => {
   try {
      const attraction = await Attraction.create(req.body);

      res.status(201).json({
         success: true,
         data: attraction
      });
   } catch (err) {
      next(err);
   }
}

// @desc    Update Attraction
// @route   PUT /api/v2/attractions/:id
// @access  Private
exports.updateAttraction = async (req, res, next) => {
   try {
      const attraction = await Attraction.findByIdAndUpdate(req.params.id, req.body, {
         new: true,
         runValidators: true
      });
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }
      res.status(200).json({ success: true, data: attraction });   
   } catch (err) {
      next(err);
   }  
};

// @desc    Delete Attraction
// @route   DELETE /api/v2/attractions/:id
// @access  Private
exports.deleteAttraction = async (req, res, next) => {
   try {
      const attraction = await Attraction.findByIdAndDelete(req.params.id);
      if(!attraction) {
         return next(new ErrorResponse(`Attraction not found with ID of ${req.params.id}`, 404));
      }
      res.status(200).json({ success: true, data: {} });   
   } catch (err) {
      next(err);
   } 
}
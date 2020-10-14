const Attraction = require('../models/Attraction');

// @desc    Get All Attractions
// @route   GET /api/v2/attractions
// @access  Public
exports.getAttractions = async (req, res, next) => {
   try {
      const attractions = await Attraction.find();
      res.status(200).json({ success: true, data: attractions });
   } catch (err) {
      res.status(400).json({ success: false });
   }
}

// @desc    Get Single Attraction
// @route   GET /api/v2/attractions/:id
// @access  Public
exports.getAttraction = async (req, res, next) => {
   try {
      const attraction = await Attraction.findById(req.params.id);
      if(!attraction) {
         return res.status(400).json({ success: false });
      }
      res.status(200).json({ success: true, data: attraction });
   } catch (err) {
      res.status(400).json({ success: false });
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
      res.status(400).json({success: false});
   }
}

// @desc    Update Attraction
// @route   PUT /api/v2/attractions/:id
// @access  Private
exports.updateAttraction = (req, res, next) => {
   res.status(200).json({ success: true, data: `Update attraction ${req.params.id}` });
}

// @desc    Delete Attraction
// @route   DELETE /api/v2/attractions/:id
// @access  Private
exports.deleteAttraction = (req, res, next) => {
   res.status(200).json({ success: true, data: `Delete attraction ${req.params.id}` });
}
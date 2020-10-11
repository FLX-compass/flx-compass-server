// @desc    Get All Attractions
// @route   GET /api/v2/attractions
// @access  Public
exports.getAttractions = (req, res, next) => {
   res.status(200).json({ success: true, data: "Show all attractions" });
}

// @desc    Get Single Attraction
// @route   GET /api/v2/attractions/:id
// @access  Public
exports.getAttraction = (req, res, next) => {
   res.status(200).json({ success: true, data: `Get attraction ${req.params.id}` });
}

// @desc    Create Attraction
// @route   POST /api/v2/attractions
// @access  Private
exports.createAttraction = (req, res, next) => {
   res.status(200).json({ success: true, data: "Create new attractions" });
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
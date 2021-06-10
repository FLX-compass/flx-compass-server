const path = require('path')
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const Events = require('../models/Event');


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @desc Get All Events
 * @route GET /api/v2/events/getAll
 * @access Public 
 */
exports.getAllEvents = async (req, res, next) => {
    let event = await Events.find({});
    if(!event){
        return next(new ErrorResponse(`No events found`, 404));
    }

    res.json({
        success: true,
        data: event
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 * 
 * @desc Get Event by Id
 * @route GET /api/v2/event/:id
 * @access Public
 */

exports.getEventById = async (req, res, next) => {
    const id = req.params.id;
    let event = await Events.findById(id);
    if(!event){
        return next(new ErrorResponse(`No events found by id ${id}`, 404));
    }

    res.json({
        success: true,
        data: event
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 * 
 * @desc Get Event by coordinates
 * @route GET /api/v2/event/getEventByCoords
 * @access Public
 */
exports.getEventByCoordinates = async (req, res, next) => {
    let lat = req.query.lat;
    let long = req.query.long;

    let event = await Events.find({latitude: lat, longitude: long});
    if(!event){
        return next(new ErrorResponse(`No events found at coordinates ${lat}, ${long}`, 404));
    }

    res.json({
        success: true,
        data: event
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 * 
 * @desc Create event
 * @route POST /api/v2/event/
 * @access Private
 */
exports.createEvent = async (req, res, next) => {

    let data = req.body;

    let event = await Events.create(data);
    if(!event){
        return next(new ErrorResponse(`No events found at coordinates ${lat}, ${long}`, 404));
    }

    res.status(201).json({
        success: true,
        data: event
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 * 
 * @desc Delete event by id
 * @route DELETE /api/v2/event/:id
 * @access Private
 */
exports.deleteEvent = async(req, res) => {
    const id = req.params.id;
    let event = await Events.findById(id);

    if(!event){
        return next(new ErrorResponse(`No events found with id ${id}`, 404));
    }

    event.remove()

    res.json({success: true, data: {}})
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 * 
 * @desc Upload event photo
 * @route PUT /api/v2/event/updatePhoto/:id
 * @access Private
 */
exports.eventPhotoUpload = async (req, res, next) => {
    const id = req.params.id;
    const event = await Events.findById(id);
    if(!event) {
       return next(new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404));
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
 
 
    let photos = event.photos;
 
    console.log("photos[0]", photos[0]);
 
    photos = photos? photos.length === 1 && photos[0] === 'no-photo.jpg'? [] : photos: [];
 
    // Create custom filename
    file.name = `photo_${attraction._id}_${photos.length+1}${path.parse(file.name).ext}`;
 
    // Move to uploads folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
       if(err) {
          console.error(err);
          return next(
             new ErrorResponse(`Problem with file upload`, 500)
          );
       }
    
    // check if photos array is default array or empty. if the value is default array or undefined, set it to []
    // add photo
 
    await Events.findByIdAndUpdate(id, { photos: [...photos, file.name] });
 
    res.status(200).json({
       success: true,
       data: file.name
    })
    });
 };

 /**
  * 
  * @param {*} req 
  * @param {*} res 
  * @returns 
  * @desc Bookmark event
  * @route PUT /api/v2/event/bookmark/:id
  * @access Private
  */
 exports.bookmarkEvent = async (req, res) =>{
    let event = await Events.findById(req.params.id);

    // check for attraction
    if(!event) {
       return next(new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404));
    }
 
    // Check if the post has already been bookmarked
    if(event.bookmarks.filter(bookmark => bookmark.toString() === req.user._id.toString()).length > 0) {
       return next(new ErrorResponse(`Event already bookmarked`, 404));
    }
 
    // Update
    event = await Events
       .findByIdAndUpdate(
          req.params.id, 
          { bookmarks: [...event.bookmarks, req.user._id]},
          {
             new: true,
             runValidators: true
          });
 
    res
       .status(200)
       .json({ success: true, data: event.bookmarks });
 }


  /**
  * 
  * @param {*} req 
  * @param {*} res 
  * @returns 
  * @desc Unbookmark event
  * @route PUT /api/v2/event/unbookmark/:id
  * @access Private
  */
 exports.unbookmarkEvent = async (req, res) =>{
    const id = req.params.id;
    let event = await Events.findById(id);

    // check for attraction
    if(!event) {
       return next(new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404));
    }
 
 
    // Update
    event = await Events
       .findByIdAndUpdate(
          id, 
          { bookmarks: event.bookmarks.filter(
             bookmark => bookmark.toString() !== req.user._id.toString())},
          {
             new: true,
             runValidators: true
          });
 
    res
       .status(200)
       .json({ success: true, data: event.bookmarks });

}

 /**
  * 
  * @param {*} req 
  * @param {*} res 
  * @returns 
  * @desc Like event
  * @route PUT /api/v2/event/like/:id
  * @access Private
  */
exports.likeEvent = async (req, res) =>{
    const id = req.params.id;
    let event = await Events.findById(id);

    
    if(!event) {
       return next(new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404));
    }
 
    // Check if the post has already been liked
    if(event.likes.filter(like => like.toString() === req.user._id.toString()).length > 0) {
       return next(new ErrorResponse(`Event already liked`, 404));
    }
 
    // Update
    event = await Events
       .findByIdAndUpdate(
          id, 
          { likes: [...attraction.likes, req.user._id]},
          {
             new: true,
             runValidators: true
          });
 
    res
       .status(200)
       .json({ success: true, data: event.likes });

}

 /**
  * 
  * @param {*} req 
  * @param {*} res 
  * @returns 
  * @desc Unlike event
  * @route PUT /api/v2/event/unlike/:id
  * @access Private
  */
exports.unlikeEvent = async (req, res) =>{

    const id = req.params.id

    let event = await Events.findById(id);

    // check for attraction
    if(!event) {
       return next(new ErrorResponse(`Event not found with ID of ${req.params.id}`, 404));
    }
 
    // Update
    event = await Events
       .findByIdAndUpdate(
          id, 
          {
             likes: event.likes.filter(
                like => like.toString() !== req.user._id.toString()
             )
          },
          {
             new: true,
             runValidators: true
          });
 
    res
       .status(200)
       .json({ success: true, data: event.likes });  
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @desc Update event
 * @api PUT /api/v2/event/:id
 * @returns 
 */
exports.updateEvent = async (req, res, next) => {
   const id = req.params.id;
   let event = await Events.findById(id);

   
   if(!event) {
      return next(new ErrorResponse(`Event not found with ID of ${id}`, 404));
   }

   event = await Events.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
   });

   res
      .status(200)
      .json({ success: true, data: event });  
}
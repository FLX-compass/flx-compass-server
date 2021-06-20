const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// @desc    Register User
// @route   POST /api/v2/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
   const { name, email, password, role } = req.body;

   // Create user
   const user = await User.create({
      name,
      email,
      password,
      role
   });

   sendTokenResponse(user, 200, res);
});

// @desc    Login User
// @route   POST /api/v2/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
   const { email, password } = req.body;

   // Validate email & password
   if(!email || !password) {
      return next(new ErrorResponse('Please provide email and password to login', 400));
   }

   // Check for user
   const user = await User.findOne({ email }).select('+password');

   if(!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
   }

   // Check if password matches encrypted password
   const isMatch = await user.matchPassword(password);

   if(!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
   }

   sendTokenResponse(user, 200, res);
});



// @desc    Get current logged in user
// @route   POST /api/v2/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
   const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
   }

   const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
   });

   res.status(200).json({ 
      success: true,
      data: user
    });
});

// @desc    Log user out / clear cookie
// @route   GET /api/v2/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
   res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
   });

   res.status(200).json({ 
      success: true,
      data: {}
    });
});


// @desc    Update user details
// @route   PUT /api/v2/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user.id);

   res.status(200).json({ 
      success: true,
      data: user
    });
});

// @desc    Update password
// @route   PUT /api/v2/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
   const user = await User.findById(req.user.id).select('+password');

   // Check current password
   if(!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
   }

   user.password = req.body.newPassword;
   await user.save();

   sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/v2/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
   console.log('hitting forgot password'.yellow.bold)
   const user = await User.findOne({ email: req.body.email });
   console.log(user)

   // Check for user
   if(!user){
      return next(new ErrorResponse('No user with that email', 404));
   }

   // Get password reset token
   const resetToken = user.getResetPasswordToken();
   console.log(resetToken)

   await user.save({ validateBeforeSave: false });

   // Create reset URL
   const resetUrl = `${req.protocol}://${req.get('host')}/api/v2/auth/resetpassword/${resetToken}`;

   const message = `Someone has requested to reset your password.  Please go to \n\n ${resetUrl}`;
    
   try {

      await sendEmail({
         email: user.email,
         subject: 'Password reset token',
         message: message
      })
      res.status(200).json({ success: true, data: 'Email sent' });

   } catch (error) {
      console.error(error);
   
      if (error.response) {
         console.error(error.response.body)
      }
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      return next(new ErrorResponse('Email could not be sent', 500));
   }
});

// @desc    Reset password
// @route   PUT /api/v2/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
   // Get hashed token
   const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

   const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
   });

   if(!user) {
      return next(new ErrorResponse('Invalid token', 400));
   }

   // Set new password
   user.password = req.body.password;
   user.resetPasswordToken = undefined;
   user.resetPasswordExpire = undefined;
   await user.save();

   sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
   // Create token
   const token = user.getSignedJwtToken();

   const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true
   };

   if(process.env.NODE_ENV === 'product') {
      options.secure = true;
   }

   res
      .status(statusCode)
      .cookie('token', token, options)
      .json({
         success: true,
         token
      });
};
const User = require( '../models/User' );
const crypto = require( 'crypto' );
const { validationResult } = require( 'express-validator' );

// @desc    Register user
// @route   POST /register
// @access  Public
const register = async ( req, res, next ) => {
  try {
    // Check for validation errors
    const errors = validationResult( req );
    if ( !errors.isEmpty() ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      } );
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne( { email } );
    if ( existingUser ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'User already exists with this email'
      } );
    }

    // Create user
    const user = await User.create( {
      name,
      email,
      password
    } );

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save( { validateBeforeSave: false } );

    // TODO: Send verification email
    console.log( `Email verification token for ${ email }: ${ verificationToken }` );

    sendTokenResponse( user, 201, res, 'User registered successfully. Please check your email for verification.' );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Login user
// @route   POST /login
// @access  Public
const login = async ( req, res, next ) => {
  try {
    const errors = validationResult( req );
    if ( !errors.isEmpty() ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      } );
    }

    const { email, password } = req.body;

    // Check for user and include password
    const user = await User.findOne( { email } ).select( '+password' );

    if ( !user ) {
      return res.status( 401 ).json( {
        success: false,
        error: 'Invalid credentials'
      } );
    }

    // Check if account is active
    if ( !user.isActive ) {
      return res.status( 401 ).json( {
        success: false,
        error: 'Account has been deactivated'
      } );
    }

    // Check if account is locked
    if ( user.isLocked() ) {
      return res.status( 423 ).json( {
        success: false,
        error: 'Account temporarily locked due to too many failed login attempts'
      } );
    }

    // Check if password matches
    const isMatch = await user.matchPassword( password );

    if ( !isMatch ) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status( 401 ).json( {
        success: false,
        error: 'Invalid credentials'
      } );
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();

    sendTokenResponse( user, 200, res, 'Login successful' );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Get current logged in user
// @route   GET /me
// @access  Private
const getMe = async ( req, res, next ) => {
  try {
    const user = await User.findById( req.user.id );

    if ( !user ) {
      return res.status( 404 ).json( {
        success: false,
        error: 'User not found'
      } );
    }

    res.status( 200 ).json( {
      success: true,
      data: user
    } );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Update user profile
// @route   PUT /profile
// @access  Private
const updateProfile = async ( req, res, next ) => {
  try {
    const errors = validationResult( req );
    if ( !errors.isEmpty() ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      } );
    }

    const fieldsToUpdate = {};

    if ( req.body.name ) fieldsToUpdate.name = req.body.name;
    if ( req.body.email ) fieldsToUpdate.email = req.body.email;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status( 200 ).json( {
      success: true,
      data: user,
      message: 'Profile updated successfully'
    } );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Change password
// @route   PUT /change-password
// @access  Private
const changePassword = async ( req, res, next ) => {
  try {
    const errors = validationResult( req );
    if ( !errors.isEmpty() ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      } );
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById( req.user.id ).select( '+password' );

    // Check current password
    const isMatch = await user.matchPassword( currentPassword );
    if ( !isMatch ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Current password is incorrect'
      } );
    }

    user.password = newPassword;
    await user.save();

    res.status( 200 ).json( {
      success: true,
      message: 'Password changed successfully'
    } );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Verify email
// @route   PUT /verify-email/:token
// @access  Public
const verifyEmail = async ( req, res, next ) => {
  try {
    const verificationToken = crypto
      .createHash( 'sha256' )
      .update( req.params.token )
      .digest( 'hex' );

    const user = await User.findOne( {
      emailVerificationToken: verificationToken,
      emailVerificationExpires: { $gt: Date.now() }
    } );

    if ( !user ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Invalid or expired verification token'
      } );
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status( 200 ).json( {
      success: true,
      message: 'Email verified successfully'
    } );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Forgot password
// @route   POST /forgot-password
// @access  Public
const forgotPassword = async ( req, res, next ) => {
  try {
    const errors = validationResult( req );
    if ( !errors.isEmpty() ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      } );
    }

    const user = await User.findOne( { email: req.body.email } );

    if ( !user ) {
      return res.status( 404 ).json( {
        success: false,
        error: 'User not found'
      } );
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save( { validateBeforeSave: false } );

    // TODO: Send password reset email
    console.log( `Password reset token for ${ user.email }: ${ resetToken }` );

    res.status( 200 ).json( {
      success: true,
      message: 'Password reset email sent'
    } );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Reset password
// @route   PUT /reset-password/:token
// @access  Public
const resetPassword = async ( req, res, next ) => {
  try {
    const errors = validationResult( req );
    if ( !errors.isEmpty() ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Validation failed',
        details: errors.array()
      } );
    }

    const resetPasswordToken = crypto
      .createHash( 'sha256' )
      .update( req.params.token )
      .digest( 'hex' );

    const user = await User.findOne( {
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }
    } );

    if ( !user ) {
      return res.status( 400 ).json( {
        success: false,
        error: 'Invalid or expired reset token'
      } );
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokenResponse( user, 200, res, 'Password reset successful' );
  } catch ( error ) {
    next( error );
  }
};

// @desc    Logout user
// @route   POST /logout
// @access  Private
const logout = async ( req, res, next ) => {
  try {
    res.status( 200 ).json( {
      success: true,
      message: 'Logged out successfully'
    } );
  } catch ( error ) {
    next( error );
  }
};

// Get token from model, create response
const sendTokenResponse = ( user, statusCode, res, message ) => {
  const token = user.getSignedJwtToken();

  res.status( statusCode ).json( {
    success: true,
    message,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      avatar: user.avatar
    }
  } );
};

module.exports = {
  register,
  login,
  getProfile: getMe, // Alias for route consistency
  updateProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken: login, // Use login logic for token refresh
  logout
};
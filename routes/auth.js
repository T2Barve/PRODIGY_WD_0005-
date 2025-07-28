const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticateToken, createActionLimiter } = require('../middleware/auth');

const router = express.Router();

// Rate limiters
const loginLimiter = createActionLimiter(15 * 60 * 1000, 5, 'Too many login attempts');
const registerLimiter = createActionLimiter(60 * 60 * 1000, 3, 'Too many registration attempts');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('careerGoal')
    .optional()
    .isIn(['Full Stack Developer', 'Data Scientist', 'Product Manager', 'UX/UI Designer', 'DevOps Engineer', 'Mobile Developer'])
    .withMessage('Invalid career goal')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    user.getAuthTokenPayload(),
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to generate verification token
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register new user
router.post('/register', registerLimiter, registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, careerGoal, education } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists with this email',
        error: 'USER_EXISTS'
      });
    }

    // Create verification token
    const emailVerificationToken = generateVerificationToken();

    // Create new user
    const user = new User({
      name,
      email,
      password,
      careerGoal: careerGoal || 'Full Stack Developer',
      education: education || {},
      emailVerificationToken,
      isEmailVerified: false // Set to true for demo, false for production
    });

    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    // TODO: Send verification email in production
    // await sendVerificationEmail(user.email, emailVerificationToken);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        careerGoal: user.careerGoal,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: 'REGISTRATION_ERROR'
    });
  }
});

// Login user
router.post('/login', loginLimiter, loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        message: 'Invalid email or password',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Update last active
    user.stats.lastActive = new Date();
    await user.save();

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        careerGoal: user.careerGoal,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        profilePicture: user.profilePicture,
        stats: user.stats
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: 'LOGIN_ERROR'
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        careerGoal: req.user.careerGoal,
        education: req.user.education,
        isEmailVerified: req.user.isEmailVerified,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        preferences: req.user.preferences,
        stats: req.user.stats,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get user profile',
      error: 'PROFILE_ERROR'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  body('careerGoal')
    .optional()
    .isIn(['Full Stack Developer', 'Data Scientist', 'Product Manager', 'UX/UI Designer', 'DevOps Engineer', 'Mobile Developer'])
    .withMessage('Invalid career goal')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['name', 'careerGoal', 'education', 'preferences'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: 'UPDATE_ERROR'
    });
  }
});

// Request password reset
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success message for security
    if (!user) {
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // TODO: Send reset email in production
    // await sendPasswordResetEmail(user.email, resetToken);

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: 'Failed to process password reset request',
      error: 'RESET_ERROR'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
        error: 'INVALID_TOKEN'
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      message: 'Failed to reset password',
      error: 'RESET_ERROR'
    });
  }
});

// Verify email
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res.status(400).json({
        message: 'Invalid verification token',
        error: 'INVALID_TOKEN'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    res.json({
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      message: 'Failed to verify email',
      error: 'VERIFICATION_ERROR'
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const newToken = generateToken(req.user);

    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      message: 'Failed to refresh token',
      error: 'REFRESH_ERROR'
    });
  }
});

// Logout (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Update last active
    req.user.stats.lastActive = new Date();
    await req.user.save();

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      message: 'Logout failed',
      error: 'LOGOUT_ERROR'
    });
  }
});

module.exports = router;
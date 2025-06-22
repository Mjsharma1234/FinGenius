const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { setSession, deleteSession } = require('../config/redis');
const { authenticateToken } = require('../middleware/auth');

// Mock user database (replace with actual MongoDB models)
let users = [];

// Register User
router.post('/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('firstName').isString().isLength({ min: 1 }).withMessage('First name is required'),
    body('lastName').isString().isLength({ min: 1 }).withMessage('Last name is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = users.find(user => user.email === email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'A user with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const newUser = {
        id: uuidv4(),
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        isPremium: false,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        preferences: {
          currency: 'USD',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            sms: false
          }
        },
        profile: {
          avatar: null,
          bio: '',
          location: '',
          phone: ''
        }
      };

      users.push(newUser);

      // Create session
      const sessionId = uuidv4();
      const sessionData = {
        userId: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isPremium: newUser.isPremium,
        role: newUser.role
      };

      await setSession(sessionId, sessionData);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: newUser.id,
          email: newUser.email,
          sessionId: sessionId
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: userWithoutPassword,
          token: token,
          sessionId: sessionId
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: 'Internal server error'
      });
    }
  }
);

// Login User
router.post('/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isString().withMessage('Password is required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user
      const user = users.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Create session
      const sessionId = uuidv4();
      const sessionData = {
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isPremium: user.isPremium,
        role: user.role
      };

      await setSession(sessionId, sessionData);

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          sessionId: sessionId
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Update last login
      user.lastLoginAt = new Date().toISOString();
      user.updatedAt = new Date().toISOString();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token: token,
          sessionId: sessionId
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: 'Internal server error'
      });
    }
  }
);

// Logout User
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    try {
      const sessionId = req.user.sessionId;

      // Delete session from Redis
      await deleteSession(sessionId);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        error: 'Logout failed',
        message: 'Internal server error'
      });
    }
  }
);

// Get Current User
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      const user = users.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User does not exist'
        });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        error: 'Failed to get user',
        message: 'Internal server error'
      });
    }
  }
);

// Update User Profile
router.put('/profile',
  authenticateToken,
  [
    body('firstName').optional().isString().isLength({ min: 1 }).withMessage('First name must not be empty'),
    body('lastName').optional().isString().isLength({ min: 1 }).withMessage('Last name must not be empty'),
    body('phone').optional().isString().withMessage('Phone must be a string'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('bio').optional().isString().withMessage('Bio must be a string')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const user = users.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User does not exist'
        });
      }

      // Update user profile
      const { firstName, lastName, phone, location, bio } = req.body;
      
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.profile.phone = phone;
      if (location) user.profile.location = location;
      if (bio) user.profile.bio = bio;

      user.updatedAt = new Date().toISOString();

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: 'Internal server error'
      });
    }
  }
);

// Change Password
router.put('/change-password',
  authenticateToken,
  [
    body('currentPassword').isString().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;

      const user = users.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'User does not exist'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: 'Invalid password',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedNewPassword;
      user.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Failed to change password',
        message: 'Internal server error'
      });
    }
  }
);

// Forgot Password
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email } = req.body;

      const user = users.find(u => u.email === email.toLowerCase());
      if (!user) {
        // Don't reveal if user exists or not
        return res.json({
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent'
        });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // In a real application, you would:
      // 1. Save the reset token to the database
      // 2. Send an email with the reset link
      // 3. Use a proper email service like SendGrid or AWS SES

      console.log('Password reset token:', resetToken);

      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        error: 'Failed to process forgot password request',
        message: 'Internal server error'
      });
    }
  }
);

// Reset Password
router.post('/reset-password',
  [
    body('token').isString().withMessage('Reset token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { token, newPassword } = req.body;

      // Verify reset token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        return res.status(400).json({
          error: 'Invalid token',
          message: 'Reset token is invalid or expired'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedNewPassword;
      user.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(400).json({
          error: 'Invalid token',
          message: 'Reset token is invalid or expired'
        });
      }

      console.error('Reset password error:', error);
      res.status(500).json({
        error: 'Failed to reset password',
        message: 'Internal server error'
      });
    }
  }
);

// Refresh Token
router.post('/refresh',
  authenticateToken,
  async (req, res) => {
    try {
      const sessionId = req.user.sessionId;
      const sessionData = {
        userId: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        isPremium: req.user.isPremium,
        role: req.user.role
      };

      // Extend session
      await setSession(sessionId, sessionData);

      // Generate new JWT token
      const token = jwt.sign(
        {
          userId: req.user.id,
          email: req.user.email,
          sessionId: sessionId
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          token: token,
          sessionId: sessionId
        }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        error: 'Failed to refresh token',
        message: 'Internal server error'
      });
    }
  }
);

module.exports = router; 
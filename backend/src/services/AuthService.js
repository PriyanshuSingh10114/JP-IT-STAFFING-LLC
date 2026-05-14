/**
 * Authentication Service
 * Handles user authentication, JWT tokens, and security
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Generate JWT token
   */
  static generateToken(userId, expiresIn = '7d') {
    try {
      return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn,
        algorithm: 'HS256',
      });
    } catch (error) {
      logger.error('Error generating token:', error);
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async loginUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare passwords
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = this.generateToken(user._id);

      return {
        success: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          automationEnabled: user.automationEnabled,
        },
        token,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-password -linkedinPassword -gmailRefreshToken -openaiApiKey');
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password -linkedinPassword -gmailRefreshToken -openaiApiKey');

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  static async changePassword(userId, oldPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const isOldPasswordValid = await user.comparePassword(oldPassword);
      if (!isOldPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      logger.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Update LinkedIn credentials
   */
  static async updateLinkedInCredentials(userId, linkedinEmail, linkedinPassword) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          linkedinEmail,
          linkedinPassword, // Should be encrypted in production
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'LinkedIn credentials updated',
      };
    } catch (error) {
      logger.error('Error updating LinkedIn credentials:', error);
      throw error;
    }
  }

  /**
   * Update Gmail refresh token
   */
  static async updateGmailRefreshToken(userId, refreshToken) {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { gmailRefreshToken: refreshToken },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'Gmail credentials updated',
      };
    } catch (error) {
      logger.error('Error updating Gmail refresh token:', error);
      throw error;
    }
  }

  /**
   * Update API keys
   */
  static async updateApiKeys(userId, apiKeys) {
    try {
      const updateData = {};

      if (apiKeys.openaiApiKey) {
        updateData.openaiApiKey = apiKeys.openaiApiKey;
      }
      if (apiKeys.hunterApiKey) {
        updateData.hunterApiKey = apiKeys.hunterApiKey;
      }
      if (apiKeys.apolloApiKey) {
        updateData.apolloApiKey = apiKeys.apolloApiKey;
      }

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        message: 'API keys updated',
      };
    } catch (error) {
      logger.error('Error updating API keys:', error);
      throw error;
    }
  }
}

module.exports = AuthService;

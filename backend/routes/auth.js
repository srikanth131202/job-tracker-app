/**
 * Authentication Routes
 * Handles Google OAuth login and logout
 */

const express = require('express');
const passport = require('passport');
const router = express.Router();

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth login
 * @access  Public
 */
router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  accessType: 'offline',
  prompt: 'consent'
}));

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback handler
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirect to frontend with user info
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard?auth=success`);
  }
);

/**
 * @route   GET /api/auth/login
 * @desc    Check if user is logged in
 * @access  Private
 */
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar
      }
    });
  }
  res.json({ success: false, user: null });
});

/**
 * @route   GET /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      preferences: req.user.preferences,
      lastSyncAt: req.user.lastSyncAt
    }
  });
});

/**
 * @route   PUT /api/auth/preferences
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/preferences', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  try {
    const { syncEnabled, syncInterval, emailFilters } = req.body;

    req.user.preferences.syncEnabled = syncEnabled ?? req.user.preferences.syncEnabled;
    req.user.preferences.syncInterval = syncInterval ?? req.user.preferences.syncInterval;
    req.user.preferences.emailFilters = emailFilters ?? req.user.preferences.emailFilters;

    await req.user.save();

    res.json({
      success: true,
      preferences: req.user.preferences
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

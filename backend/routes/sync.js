/**
 * Sync Routes
 * Handle Gmail synchronization operations
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const { triggerManualSync, getSyncStatus, toggleSync } = require('../services/syncService');

/**
 * @route   POST /api/sync/trigger
 * @desc    Trigger manual Gmail sync for authenticated user
 * @access  Private
 */
router.post('/trigger', isAuthenticated, async (req, res) => {
  try {
    const result = await triggerManualSync(req.user._id);

    res.json({
      success: true,
      message: 'Sync completed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sync/status
 * @desc    Get sync status for authenticated user
 * @access  Private
 */
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const status = await getSyncStatus(req.user._id);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/sync/toggle
 * @desc    Toggle sync enabled/disabled for user
 * @access  Private
 */
router.post('/toggle', isAuthenticated, async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Enabled must be a boolean'
      });
    }

    const result = await toggleSync(req.user._id, enabled);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/sync/preview
 * @desc    Preview job-related emails without saving (for testing)
 * @access  Private
 */
router.get('/preview', isAuthenticated, async (req, res) => {
  try {
    const { fetchEmails } = require('../services/gmailService');
    const { getValidAccessToken } = require('../services/gmailService');

    // Get valid access token
    const accessToken = await getValidAccessToken(req.user);

    // Fetch recent job-related emails
    const emails = await fetchEmails(
      accessToken,
      'subject:(job OR application OR interview OR hiring OR recruiter)',
      10
    );

    res.json({
      success: true,
      data: {
        count: emails.length,
        emails: emails.map(e => ({
          id: e.id,
          subject: e.subject,
          from: e.from,
          date: e.date,
          snippet: e.snippet
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

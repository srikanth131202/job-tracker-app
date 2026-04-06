/**
 * Sync Service
 * Handles background synchronization of Gmail emails with job applications
 */

const User = require('../models/User');
const JobApplication = require('../models/JobApplication');
const { fetchJobRelatedEmails, getValidAccessToken, createLabel } = require('./gmailService');
const { parseEmailContent } = require('./aiParserService');

/**
 * Sync Gmail for a single user
 * @param {Object} user - User document
 * @returns {Object} Sync results
 */
const syncUserGmail = async (user) => {
  try {
    console.log(`🔄 Syncing Gmail for user: ${user.email}`);

    // Get valid access token
    let accessToken;
    try {
      accessToken = await getValidAccessToken(user);
    } catch (error) {
      console.error(`Token refresh failed for ${user.email}:`, error.message);
      return {
        success: false,
        error: 'Token refresh failed',
        newApplications: 0,
        updatedApplications: 0
      };
    }

    // Fetch job-related emails since last sync
    const sinceDate = user.lastSyncAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const emails = await fetchJobRelatedEmails(accessToken, sinceDate);

    console.log(`📧 Found ${emails.length} job-related emails for ${user.email}`);

    let newApplications = 0;
    let updatedApplications = 0;

    // Process each email
    for (const email of emails) {
      try {
        // Check if application already exists
        const existingApplication = await JobApplication.findOne({
          userId: user._id,
          'emailSource.messageId': email.id
        });

        if (existingApplication) {
          // Update existing application if status might have changed
          const updated = await updateApplicationIfChanged(existingApplication, email, user);
          if (updated) {
            updatedApplications++;
          }
        } else {
          // Create new application
          await createApplicationFromEmail(user, email);
          newApplications++;
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error.message);
      }
    }

    // Update last sync time
    user.lastSyncAt = new Date();
    await user.save();

    console.log(`✅ Sync completed for ${user.email}: ${newApplications} new, ${updatedApplications} updated`);

    return {
      success: true,
      newApplications,
      updatedApplications,
      totalEmails: emails.length
    };
  } catch (error) {
    console.error(`Sync error for ${user.email}:`, error.message);
    return {
      success: false,
      error: error.message,
      newApplications: 0,
      updatedApplications: 0
    };
  }
};

/**
 * Create a new job application from email
 * @param {Object} user - User document
 * @param {Object} email - Parsed email object
 * @returns {Object} Created application
 */
const createApplicationFromEmail = async (user, email) => {
  // Parse email content with AI
  const parsedData = await parseEmailContent(email.body, email.subject);

  const application = await JobApplication.create({
    userId: user._id,
    company: parsedData.company,
    role: parsedData.role,
    status: parsedData.status,
    appliedDate: parsedData.date,
    lastUpdated: new Date(),
    emailSource: {
      messageId: email.id,
      threadId: email.threadId,
      from: email.from,
      subject: email.subject,
      snippet: email.snippet,
      receivedAt: email.date
    },
    interviewDetails: parsedData.interviewDetails,
    location: parsedData.location,
    salary: parsedData.salary,
    jobUrl: parsedData.jobUrl,
    notes: parsedData.notes,
    aiParsed: true,
    rawEmailContent: email.body
  });

  return application;
};

/**
 * Update application if status has changed
 * @param {Object} application - Existing application
 * @param {Object} email - Email object
 * @param {Object} user - User document
 * @returns {boolean} Whether application was updated
 */
const updateApplicationIfChanged = async (application, email, user) => {
  // Parse email to check for status changes
  const parsedData = await parseEmailContent(email.body, email.subject);

  let hasChanges = false;
  const updates = {};

  // Check for status change
  if (parsedData.status !== application.status) {
    updates.status = parsedData.status;
    hasChanges = true;
  }

  // Update interview details if newly scheduled
  if (parsedData.interviewDetails.scheduled && !application.interviewDetails.scheduled) {
    updates.interviewDetails = parsedData.interviewDetails;
    hasChanges = true;
  }

  if (hasChanges) {
    updates.lastUpdated = new Date();
    await JobApplication.findByIdAndUpdate(application._id, { $set: updates });
    return true;
  }

  return false;
};

/**
 * Sync Gmail for all users who have sync enabled
 * @returns {Object} Aggregate sync results
 */
const syncGmailForAllUsers = async () => {
  try {
    // Find all users with sync enabled
    const users = await User.find({
      'preferences.syncEnabled': true,
      googleToken: { $exists: true }
    });

    console.log(`🔄 Starting sync for ${users.length} users`);

    const results = {
      totalUsers: users.length,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalNewApplications: 0,
      totalUpdatedApplications: 0,
      details: []
    };

    // Sync each user
    for (const user of users) {
      const syncResult = await syncUserGmail(user);
      results.details.push({
        userId: user._id,
        email: user.email,
        ...syncResult
      });

      if (syncResult.success) {
        results.successfulSyncs++;
        results.totalNewApplications += syncResult.newApplications;
        results.totalUpdatedApplications += syncResult.updatedApplications;
      } else {
        results.failedSyncs++;
      }
    }

    console.log('🔄 Overall sync results:', {
      successfulSyncs: results.successfulSyncs,
      failedSyncs: results.failedSyncs,
      newApplications: results.totalNewApplications,
      updatedApplications: results.totalUpdatedApplications
    });

    return results;
  } catch (error) {
    console.error('Error in syncGmailForAllUsers:', error.message);
    throw error;
  }
};

/**
 * Manual sync trigger for a specific user
 * @param {string} userId - User ID
 * @returns {Object} Sync results
 */
const triggerManualSync = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.googleToken) {
    throw new Error('Gmail not connected');
  }

  return syncUserGmail(user);
};

/**
 * Get sync status for user
 * @param {string} userId - User ID
 * @returns {Object} Sync status
 */
const getSyncStatus = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    syncEnabled: user.preferences.syncEnabled,
    syncInterval: user.preferences.syncInterval,
    lastSyncAt: user.lastSyncAt,
    gmailConnected: !!user.googleToken
  };
};

/**
 * Toggle sync for user
 * @param {string} userId - User ID
 * @param {boolean} enabled - Enable/disable sync
 * @returns {Object} Updated sync status
 */
const toggleSync = async (userId, enabled) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.preferences.syncEnabled = enabled;
  await user.save();

  return {
    syncEnabled: user.preferences.syncEnabled,
    message: enabled ? 'Sync enabled' : 'Sync disabled'
  };
};

module.exports = {
  syncUserGmail,
  syncGmailForAllUsers,
  triggerManualSync,
  getSyncStatus,
  toggleSync,
  createApplicationFromEmail,
  updateApplicationIfChanged
};

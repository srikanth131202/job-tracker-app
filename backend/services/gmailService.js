/**
 * Gmail Service
 * Handles all Gmail API interactions for fetching and parsing emails
 */

const { google } = require('googleapis');
const User = require('../models/User');

/**
 * Get Gmail API client with OAuth2 authentication
 * @param {string} accessToken - Google OAuth access token
 * @returns {Object} Gmail API client
 */
const getGmailClient = (accessToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Fetch emails from Gmail inbox
 * @param {string} accessToken - Google OAuth access token
 * @param {string} query - Gmail search query
 * @param {number} maxResults - Maximum number of emails to fetch
 * @returns {Array} Array of email messages
 */
const fetchEmails = async (accessToken, query = '', maxResults = 100) => {
  try {
    const gmail = getGmailClient(accessToken);

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: Math.min(maxResults, 500) // Gmail API limit
    });

    const messages = response.data.messages || [];

    // Fetch full message details
    const emailDetails = await Promise.all(
      messages.map(async (message) => {
        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'full'
          });
          return parseEmailMessage(fullMessage.data);
        } catch (error) {
          console.error(`Error fetching message ${message.id}:`, error.message);
          return null;
        }
      })
    );

    return emailDetails.filter(email => email !== null);
  } catch (error) {
    console.error('Error fetching emails:', error.message);

    // Handle token expiration
    if (error.message.includes('invalid_grant') || error.message.includes('Token has been expired')) {
      throw new Error('TOKEN_EXPIRED');
    }

    throw error;
  }
};

/**
 * Parse raw Gmail message into structured format
 * @param {Object} message - Raw Gmail message object
 * @returns {Object} Parsed email data
 */
const parseEmailMessage = (message) => {
  const headers = message.payload.headers;
  const parts = message.payload.parts || [message.payload];

  // Extract email body
  let body = '';
  let htmlBody = '';

  const findBody = (parts) => {
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.mimeType === 'text/html' && part.body.data) {
        htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
      } else if (part.parts) {
        findBody(part.parts);
      }
    }
  };

  findBody(parts);

  // Extract specific headers
  const getHeader = (name) => {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  };

  return {
    id: message.id,
    threadId: message.threadId,
    from: getHeader('from'),
    to: getHeader('to'),
    subject: getHeader('subject'),
    date: new Date(getHeader('date')),
    snippet: message.snippet,
    body: body || htmlBody || message.snippet,
    htmlBody: htmlBody,
    labels: message.labelIds
  };
};

/**
 * Search for job-related emails in Gmail
 * @param {string} accessToken - Google OAuth access token
 * @param {Date} sinceDate - Fetch emails since this date
 * @returns {Array} Array of job-related emails
 */
const fetchJobRelatedEmails = async (accessToken, sinceDate = null) => {
  // Job-related search queries
  const jobQueries = [
    'subject:(job OR application OR interview OR hiring OR recruiter OR "career opportunity")',
    'subject:(application received OR your application OR "thank you for applying")',
    'subject:(interview OR "next steps" OR "we\'d like to interview")',
    'subject:(offer OR "we are pleased" OR congratulations)',
    'subject:(rejected OR "not moving forward" OR "thank you for your interest")',
    'from:(linkedin.com OR indeed.com OR glassdoor.com OR monster.com OR ziprecruiter.com)',
    'from:(lever.co OR greenhouse.io OR workable.com OR icims.com)'
  ];

  let query = `(${jobQueries.join(' OR ')})`;

  // Add date filter if provided
  if (sinceDate) {
    const dateStr = sinceDate.toISOString().split('T')[0];
    query += ` after:${dateStr}`;
  }

  // Exclude spam and trash
  query += ' -in:spam -in:trash';

  return fetchEmails(accessToken, query, 200);
};

/**
 * Refresh Google OAuth token using refresh token
 * @param {string} refreshToken - Google OAuth refresh token
 * @returns {Object} New token information
 */
const refreshAuthToken = async (refreshToken) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  return {
    accessToken: credentials.access_token,
    expiryDate: credentials.expiry_date
  };
};

/**
 * Get valid access token for user (refreshes if expired)
 * @param {Object} user - User document
 * @returns {string} Valid access token
 */
const getValidAccessToken = async (user) => {
  const tokenExpiry = new Date(user.tokenExpiry);
  const now = new Date();

  // Refresh token if it expires within 5 minutes
  if (tokenExpiry < new Date(now.getTime() + 5 * 60 * 1000)) {
    if (!user.refreshToken) {
      throw new Error('No refresh token available');
    }

    const newTokens = await refreshAuthToken(user.refreshToken);
    user.googleToken = newTokens.accessToken;
    user.tokenExpiry = newTokens.expiryDate;
    await user.save();

    return newTokens.accessToken;
  }

  return user.googleToken;
};

/**
 * Create Gmail label for job applications
 * @param {string} accessToken - Google OAuth access token
 * @param {string} labelName - Name of the label to create
 * @returns {Object} Created or existing label
 */
const createLabel = async (accessToken, labelName) => {
  try {
    const gmail = getGmailClient(accessToken);

    // Check if label exists
    const existingLabels = await gmail.users.labels.list({ userId: 'me' });
    const existingLabel = existingLabels.data.labels.find(
      label => label.name === labelName
    );

    if (existingLabel) {
      return existingLabel;
    }

    // Create new label
    const response = await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: labelName,
        labelListVisibility: 'labelShow',
        messageListVisibility: 'show'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating label:', error.message);
    throw error;
  }
};

/**
 * Add label to Gmail message
 * @param {string} accessToken - Google OAuth access token
 * @param {string} messageId - Gmail message ID
 * @param {string} labelId - Gmail label ID
 */
const addLabelToMessage = async (accessToken, messageId, labelId) => {
  try {
    const gmail = getGmailClient(accessToken);

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId]
      }
    });
  } catch (error) {
    console.error('Error adding label to message:', error.message);
  }
};

module.exports = {
  getGmailClient,
  fetchEmails,
  fetchJobRelatedEmails,
  parseEmailMessage,
  refreshAuthToken,
  getValidAccessToken,
  createLabel,
  addLabelToMessage
};

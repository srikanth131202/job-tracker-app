/**
 * Services Index
 * Central export for all services
 */

const gmailService = require('./gmailService');
const aiParserService = require('./aiParserService');
const syncService = require('./syncService');

module.exports = {
  gmailService,
  aiParserService,
  syncService
};

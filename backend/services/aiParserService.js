/**
 * AI Email Parser Service
 * Uses OpenAI to extract structured job application data from emails
 */

const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * System prompt for AI email parsing
 */
const SYSTEM_PROMPT = `You are an expert job application parser. Your task is to extract structured information from job application related emails.

Extract the following fields:
- company: The name of the company
- role: The job title/position
- status: One of "Applied", "Interview", "Offer", "Rejected", or "Withdrawn"
- date: The date of application or email (ISO format YYYY-MM-DD)
- location: Job location (default to "Remote" if not specified)
- interviewDetails: If interview is mentioned, extract date, time, type (Phone/Video/Onsite/Technical/HR), and any notes
- salary: If mentioned, extract min, max, and currency
- jobUrl: Any job posting URL mentioned
- notes: Any additional relevant information

Status determination rules:
- "Applied": Application confirmation, "we received your application"
- "Interview": Interview invitation, scheduling, or any interview-related communication
- "Offer": Job offer, "we are pleased to offer", "congratulations"
- "Rejected": Rejection email, "not moving forward", "thank you for your interest"
- "Withdrawn": Application withdrawn by candidate

Return ONLY valid JSON in this exact format:
{
  "company": "Company Name",
  "role": "Job Title",
  "status": "Applied|Interview|Offer|Rejected|Withdrawn",
  "date": "YYYY-MM-DD",
  "location": "Location or Remote",
  "interviewDetails": {
    "scheduled": false,
    "date": null,
    "time": null,
    "type": null,
    "notes": null
  },
  "salary": {
    "min": null,
    "max": null,
    "currency": "USD"
  },
  "jobUrl": null,
  "notes": ""
}`;

/**
 * Parse email content using OpenAI
 * @param {string} emailContent - The email body/content to parse
 * @param {string} emailSubject - The email subject line
 * @returns {Object} Parsed job application data
 */
const parseEmailContent = async (emailContent, emailSubject = '') => {
  try {
    const inputText = `Subject: ${emailSubject}\n\nEmail Content:\n${emailContent}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: inputText }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const parsedData = JSON.parse(response.choices[0].message.content);

    // Validate and normalize the parsed data
    return normalizeParsedData(parsedData, emailContent, emailSubject);
  } catch (error) {
    console.error('Error parsing email with AI:', error.message);

    // Fallback to basic parsing
    return fallbackParse(emailContent, emailSubject);
  }
};

/**
 * Normalize AI parsed data to ensure consistent format
 * @param {Object} parsedData - Raw parsed data from AI
 * @param {string} emailContent - Original email content
 * @param {string} emailSubject - Email subject
 * @returns {Object} Normalized parsed data
 */
const normalizeParsedData = (parsedData, emailContent, emailSubject) => {
  const normalized = {
    company: parsedData.company || extractCompanyFromEmail(emailContent, emailSubject),
    role: parsedData.role || extractRoleFromEmail(emailContent, emailSubject),
    status: validateStatus(parsedData.status) || 'Applied',
    date: parsedData.date || extractDateFromEmail(emailContent, emailSubject),
    location: parsedData.location || 'Remote',
    interviewDetails: {
      scheduled: parsedData.interviewDetails?.scheduled || false,
      date: parsedData.interviewDetails?.date || null,
      time: parsedData.interviewDetails?.time || null,
      type: validateInterviewType(parsedData.interviewDetails?.type),
      notes: parsedData.interviewDetails?.notes || null
    },
    salary: {
      min: parsedData.salary?.min || null,
      max: parsedData.salary?.max || null,
      currency: parsedData.salary?.currency || 'USD'
    },
    jobUrl: parsedData.jobUrl || extractUrlFromEmail(emailContent),
    notes: parsedData.notes || ''
  };

  // Set interview scheduled flag if date exists
  if (normalized.interviewDetails.date) {
    normalized.interviewDetails.scheduled = true;
  }

  return normalized;
};

/**
 * Validate status value
 * @param {string} status - Status to validate
 * @returns {string|null} Validated status or null
 */
const validateStatus = (status) => {
  const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
  if (status && validStatuses.includes(status)) {
    return status;
  }
  return null;
};

/**
 * Validate interview type
 * @param {string} type - Interview type to validate
 * @returns {string|null} Validated type or null
 */
const validateInterviewType = (type) => {
  const validTypes = ['Phone', 'Video', 'Onsite', 'Technical', 'HR', 'Other'];
  if (type && validTypes.includes(type)) {
    return type;
  }

  // Map common variations
  if (type) {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('phone')) return 'Phone';
    if (typeLower.includes('video') || typeLower.includes('zoom') || typeLower.includes('google meet')) return 'Video';
    if (typeLower.includes('onsite') || typeLower.includes('in-person') || typeLower.includes('office')) return 'Onsite';
    if (typeLower.includes('technical') || typeLower.includes('coding') || typeLower.includes('assessment')) return 'Technical';
    if (typeLower.includes('hr') || typeLower.includes('recruiter') || typeLower.includes('screening')) return 'HR';
  }

  return null;
};

/**
 * Fallback parsing when AI fails
 * @param {string} emailContent - Email content
 * @param {string} emailSubject - Email subject
 * @returns {Object} Basic parsed data
 */
const fallbackParse = (emailContent, emailSubject) => {
  const fullText = `${emailSubject} ${emailContent}`.toLowerCase();

  // Determine status from keywords
  let status = 'Applied';
  if (fullText.includes('interview')) {
    status = 'Interview';
  } else if (fullText.includes('offer') || fullText.includes('pleased') || fullText.includes('congratulation')) {
    status = 'Offer';
  } else if (fullText.includes('reject') || fullText.includes('not moving forward') || fullText.includes('no longer considering')) {
    status = 'Rejected';
  }

  return {
    company: extractCompanyFromEmail(emailContent, emailSubject),
    role: extractRoleFromEmail(emailContent, emailSubject) || 'Unknown Role',
    status,
    date: extractDateFromEmail(emailContent, emailSubject),
    location: 'Remote',
    interviewDetails: {
      scheduled: fullText.includes('interview'),
      date: null,
      time: null,
      type: null,
      notes: null
    },
    salary: {
      min: null,
      max: null,
      currency: 'USD'
    },
    jobUrl: extractUrlFromEmail(emailContent),
    notes: ''
  };
};

/**
 * Extract company name from email
 * @param {string} emailContent - Email content
 * @param {string} emailSubject - Email subject
 * @returns {string} Company name
 */
const extractCompanyFromEmail = (emailContent, emailSubject) => {
  const fullText = `${emailSubject} ${emailContent}`;

  // Common patterns for company mentions
  const patterns = [
    /at\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.|!)/g,
    /with\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.|!)/g,
    /from\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.|!)/g,
    /team\s+at\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.|!)/g,
    /([A-Z][A-Za-z0-9]+(?:\s[A-Z][A-Za-z0-9]+)*\s*(?:Inc|LLC|Ltd|Corp|Corporation|Company|Technologies|Labs|IO|AI))/g
  ];

  for (const pattern of patterns) {
    const matches = fullText.match(pattern);
    if (matches && matches.length > 0) {
      // Clean up the match
      let company = matches[0].replace(pattern, '$1').trim();
      if (company && company.length > 1 && company.length < 50) {
        return company;
      }
    }
  }

  // Try to extract from email address
  const emailPattern = /from[:\s]+[^\n]*?<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i;
  const emailMatch = emailContent.match(emailPattern);
  if (emailMatch) {
    const domain = emailMatch[1].split('@')[1];
    const companyFromDomain = domain.split('.')[0];
    if (companyFromDomain && companyFromDomain.length > 2) {
      return companyFromDomain.charAt(0).toUpperCase() + companyFromDomain.slice(1);
    }
  }

  return 'Unknown Company';
};

/**
 * Extract job role from email
 * @param {string} emailContent - Email content
 * @param {string} emailSubject - Email subject
 * @returns {string} Job role
 */
const extractRoleFromEmail = (emailContent, emailSubject) => {
  const fullText = `${emailSubject} ${emailContent}`;

  // Patterns for role extraction
  const patterns = [
    /position[:\s]+([^\n\.!?]+)/gi,
    /role[:\s]+([^\n\.!?]+)/gi,
    /title[:\s]+([^\n\.!?]+)/gi,
    /for the role of\s+([^\n\.!?]+)/gi,
    /for the position of\s+([^\n\.!?]+)/gi,
    /as a\s+([A-Za-z\s]+?)(?:\s|,|\.|!)/gi,
    /as an\s+([A-Za-z\s]+?)(?:\s|,|\.|!)/gi
  ];

  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match && match.length > 0) {
      let role = match[0].replace(pattern, '$1').trim();
      if (role && role.length > 2 && role.length < 100) {
        return role;
      }
    }
  }

  return null;
};

/**
 * Extract date from email
 * @param {string} emailContent - Email content
 * @param {string} emailSubject - Email subject
 * @returns {string} Date in ISO format
 */
const extractDateFromEmail = (emailContent, emailSubject) => {
  // Try to find explicit dates
  const datePatterns = [
    /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
    /(\d{4}[\/-]\d{1,2}[\/-]\d{1,2})/,
    /(\w+\s+\d{1,2},?\s+\d{4})/
  ];

  for (const pattern of datePatterns) {
    const match = emailContent.match(pattern);
    if (match) {
      const date = new Date(match[1]);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
  }

  // Default to today
  return new Date().toISOString().split('T')[0];
};

/**
 * Extract URL from email
 * @param {string} emailContent - Email content
 * @returns {string|null} URL if found
 */
const extractUrlFromEmail = (emailContent) => {
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/i;
  const match = emailContent.match(urlPattern);

  if (match) {
    return match[1];
  }

  return null;
};

/**
 * Batch parse multiple emails
 * @param {Array} emails - Array of email objects
 * @returns {Array} Array of parsed application data
 */
const batchParseEmails = async (emails) => {
  const results = [];

  for (const email of emails) {
    try {
      const parsed = await parseEmailContent(email.body, email.subject);
      results.push({
        email,
        parsed
      });
    } catch (error) {
      console.error(`Error parsing email ${email.id}:`, error.message);
      results.push({
        email,
        parsed: fallbackParse(email.body, email.subject)
      });
    }
  }

  return results;
};

module.exports = {
  parseEmailContent,
  batchParseEmails,
  fallbackParse,
  normalizeParsedData
};

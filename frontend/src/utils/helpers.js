/**
 * Utility Functions
 */

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
};

/**
 * Get status badge class
 */
export const getStatusClass = (status) => {
  const classes = {
    Applied: 'status-applied',
    Interview: 'status-interview',
    Offer: 'status-offer',
    Rejected: 'status-rejected',
    Withdrawn: 'status-withdrawn'
  };
  return classes[status] || 'status-applied';
};

/**
 * Get status color for charts
 */
export const getStatusColor = (status) => {
  const colors = {
    Applied: '#3B82F6',
    Interview: '#F59E0B',
    Offer: '#10B981',
    Rejected: '#EF4444',
    Withdrawn: '#9CA3AF'
  };
  return colors[status] || '#6B7280';
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Extract domain from email
 */
export const extractDomain = (email) => {
  if (!email) return '';
  const match = email.match(/@(.+)$/);
  return match ? match[1] : email;
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Download file from blob
 */
export const downloadFile = (data, filename) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Group applications by status
 */
export const groupByStatus = (applications) => {
  return applications.reduce((acc, app) => {
    const status = app.status || 'Applied';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(app);
    return acc;
  }, {});
};

/**
 * Sort applications by date
 */
export const sortByDate = (applications, field = 'appliedDate', order = 'desc') => {
  return [...applications].sort((a, b) => {
    const dateA = new Date(a[field]);
    const dateB = new Date(b[field]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

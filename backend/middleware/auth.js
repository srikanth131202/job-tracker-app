/**
 * Authentication Middleware
 * Protects routes that require authentication
 */

/**
 * Check if user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({
    success: false,
    message: 'Authentication required'
  });
};

/**
 * Check if user owns the resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isOwner = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const userId = req.params.userId || req.body.userId;

  if (userId && userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this resource'
    });
  }

  next();
};

module.exports = {
  isAuthenticated,
  isOwner
};

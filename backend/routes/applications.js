/**
 * Application Routes
 * CRUD operations for job applications
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const JobApplication = require('../models/JobApplication');

/**
 * @route   GET /api/applications
 * @desc    Get all applications for authenticated user
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { status, company, search, sortBy = 'appliedDate', order = 'desc', page = 1, limit = 20 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    if (company) {
      query.company = new RegExp(company, 'i');
    }

    if (search) {
      query.$or = [
        { company: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch applications
    const applications = await JobApplication.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await JobApplication.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/applications/stats
 * @desc    Get application statistics for dashboard
 * @access  Private
 */
router.get('/stats', isAuthenticated, async (req, res) => {
  try {
    const stats = await JobApplication.getStats(req.user._id);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/applications/:id
 * @desc    Get single application by ID
 * @access  Private
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   POST /api/applications
 * @desc    Create new application manually
 * @access  Private
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { company, role, status, appliedDate, location, jobUrl, notes, tags } = req.body;

    // Validate required fields
    if (!company || !role) {
      return res.status(400).json({
        success: false,
        message: 'Company and role are required'
      });
    }

    const application = await JobApplication.create({
      userId: req.user._id,
      company,
      role,
      status: status || 'Applied',
      appliedDate: appliedDate || new Date(),
      location: location || 'Remote',
      jobUrl,
      notes: notes || '',
      tags: tags || [],
      lastUpdated: new Date(),
      aiParsed: false
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PUT /api/applications/:id
 * @desc    Update application
 * @access  Private
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { company, role, status, appliedDate, location, jobUrl, notes, tags, interviewDetails } = req.body;

    // Find application and verify ownership
    let application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update fields
    if (company !== undefined) application.company = company;
    if (role !== undefined) application.role = role;
    if (status !== undefined) application.status = status;
    if (appliedDate !== undefined) application.appliedDate = appliedDate;
    if (location !== undefined) application.location = location;
    if (jobUrl !== undefined) application.jobUrl = jobUrl;
    if (notes !== undefined) application.notes = notes;
    if (tags !== undefined) application.tags = tags;
    if (interviewDetails !== undefined) application.interviewDetails = interviewDetails;

    application.lastUpdated = new Date();
    await application.save();

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/applications/:id/status
 * @desc    Update application status only
 * @access  Private
 */
router.patch('/:id/status', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const application = await JobApplication.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id
      },
      {
        $set: {
          status,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/applications/:id
 * @desc    Delete application
 * @access  Private
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const application = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/applications/companies/list
 * @desc    Get unique list of companies for filter dropdown
 * @access  Private
 */
router.get('/companies/list', isAuthenticated, async (req, res) => {
  try {
    const companies = await JobApplication.distinct('company', {
      userId: req.user._id
    });

    res.json({
      success: true,
      data: companies.sort()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * @route   GET /api/applications/export
 * @desc    Export applications as JSON
 * @access  Private
 */
router.get('/export', isAuthenticated, async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id })
      .sort({ appliedDate: -1 })
      .select('-rawEmailContent -__v');

    res.json({
      success: true,
      data: applications,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

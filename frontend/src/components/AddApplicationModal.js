/**
 * Add/Edit Application Modal
 * Form for creating or editing job applications
 */

import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const AddApplicationModal = ({ isOpen, onClose, application, onSave }) => {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    location: 'Remote',
    jobUrl: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        role: application.role || '',
        status: application.status || 'Applied',
        appliedDate: application.appliedDate ? new Date(application.appliedDate).toISOString().split('T')[0] : '',
        location: application.location || 'Remote',
        jobUrl: application.jobUrl || '',
        notes: application.notes || ''
      });
    } else {
      resetForm();
    }
  }, [application, isOpen]);

  const resetForm = () => {
    setFormData({
      company: '',
      role: '',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      location: 'Remote',
      jobUrl: '',
      notes: ''
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }
    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        ...(application && { _id: application._id })
      });
      resetForm();
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application ? 'Edit Application' : 'Add Application'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={`input-field ${errors.company ? 'border-red-500' : ''}`}
            placeholder="e.g., Google, Microsoft"
          />
          {errors.company && (
            <p className="mt-1 text-sm text-red-500">{errors.company}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`input-field ${errors.role ? 'border-red-500' : ''}`}
            placeholder="e.g., Software Engineer, Product Manager"
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-500">{errors.role}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Applied Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="appliedDate"
              value={formData.appliedDate}
              onChange={handleChange}
              className={`input-field ${errors.appliedDate ? 'border-red-500' : ''}`}
            />
            {errors.appliedDate && (
              <p className="mt-1 text-sm text-red-500">{errors.appliedDate}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Remote, San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job URL
            </label>
            <input
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              className="input-field"
              placeholder="https://..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Add any notes about this application..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
          >
            {application ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddApplicationModal;

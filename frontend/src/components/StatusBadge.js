/**
 * Status Badge Component
 * Displays job application status with appropriate styling
 */

import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Applied: { label: 'Applied', class: 'status-applied' },
    Interview: { label: 'Interview', class: 'status-interview' },
    Offer: { label: 'Offer', class: 'status-offer' },
    Rejected: { label: 'Rejected', class: 'status-rejected' },
    Withdrawn: { label: 'Withdrawn', class: 'status-withdrawn' }
  };

  const config = statusConfig[status] || statusConfig.Applied;

  return (
    <span className={`status-badge ${config.class}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;

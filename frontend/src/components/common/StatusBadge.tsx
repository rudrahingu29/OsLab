import React from 'react';
import Badge from './Badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toUpperCase();

  let variant: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info' = 'neutral';

  switch (normalized) {
    case 'NEW':
      variant = 'info';
      break;
    case 'READY':
      variant = 'primary';
      break;
    case 'RUNNING':
    case 'ACTIVE':
    case 'COMPLETED':
      variant = 'success';
      break;
    case 'WAITING':
    case 'BLOCKED':
    case 'WARNING':
      variant = 'warning';
      break;
    case 'TERMINATED':
    case 'IDLE':
      variant = 'neutral';
      break;
    case 'ERROR':
    case 'FAILED':
      variant = 'danger';
      break;
    default:
      variant = 'neutral';
  }

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
};

export default StatusBadge;

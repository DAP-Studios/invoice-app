import React from 'react';
import './Badge.css';

interface BadgeProps {
  status: 'Paid' | 'Pending' | 'Draft';
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
  const getClassName = () => {
    switch (status) {
      case 'Paid': return 'status-badge status-paid';
      case 'Pending': return 'status-badge status-pending';
      case 'Draft': return 'status-badge status-draft';
      default: return 'status-badge';
    }
  };

  return (
    <span className={getClassName()}>
      {status}
    </span>
  );
};

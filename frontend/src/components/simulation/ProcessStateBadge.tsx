import React from 'react';
import Badge from '../common/Badge';

interface ProcessStateBadgeProps {
  state: 'NEW' | 'READY' | 'RUNNING' | 'BLOCKED' | 'WAITING' | 'TERMINATED' | string;
}

const colorMap: Record<string, string> = {
  NEW: 'var(--color-info)',
  READY: 'var(--color-process-ready)',
  RUNNING: 'var(--color-process-running)',
  BLOCKED: 'var(--color-process-blocked)',
  WAITING: 'var(--color-process-blocked)',
  TERMINATED: 'var(--color-process-terminated)',
};

const ProcessStateBadge: React.FC<ProcessStateBadgeProps> = ({ state }) => {
  const upperState = state.toUpperCase();
  const color = colorMap[upperState] || 'var(--color-text-muted)';
  return <Badge color={color}>{upperState}</Badge>;
};

export default ProcessStateBadge;

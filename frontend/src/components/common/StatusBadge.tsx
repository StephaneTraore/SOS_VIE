import React from 'react';
import { AlertStatus, AlertPriority, AlertType } from '../../types';
import { statusLabels, statusColors, priorityLabels, priorityColors, alertTypeLabels, alertTypeColors, alertTypeIcons } from '../../utils/helpers';

export function StatusBadge({ status }: { status: AlertStatus }) {
  const color = statusColors[status];
  return (
    <span className="badge" style={{ background: color + '20', color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {statusLabels[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: AlertPriority }) {
  const color = priorityColors[priority];
  return (
    <span className="badge" style={{ background: color + '20', color }}>
      {priority === 'critical' && '⚡ '}
      {priorityLabels[priority]}
    </span>
  );
}

export function TypeBadge({ type }: { type: AlertType }) {
  const color = alertTypeColors[type];
  return (
    <span className="badge" style={{ background: color + '18', color }}>
      {alertTypeIcons[type]} {alertTypeLabels[type]}
    </span>
  );
}

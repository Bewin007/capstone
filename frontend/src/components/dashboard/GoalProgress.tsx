import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { Goal } from '../../types';

interface GoalProgressProps {
  goal: Goal;
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goal }) => {
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <strong>{goal.icon} {goal.name}</strong>
          <div className="text-muted small">
            ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
          </div>
        </div>
        <span className="badge bg-primary">
          {Math.min(percentage, 100).toFixed(0)}%
        </span>
      </div>
      <ProgressBar
        now={Math.min(percentage, 100)}
        variant="primary"
        className="mb-2"
      />
      <div className="text-muted small">
        ${remaining.toFixed(2)} to go
      </div>
    </div>
  );
};

export default GoalProgress;

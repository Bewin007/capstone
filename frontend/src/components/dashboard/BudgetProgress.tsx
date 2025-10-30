import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { Budget } from '../../types';

interface BudgetProgressProps {
  budget: Budget;
}

const BudgetProgress: React.FC<BudgetProgressProps> = ({ budget }) => {
  const percentage = (budget.spentAmount / budget.targetAmount) * 100;
  const remaining = budget.targetAmount - budget.spentAmount;

  let variant = 'success';
  if (percentage >= 100) variant = 'danger';
  else if (percentage >= budget.alertThreshold) variant = 'warning';

  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div>
          <strong>{budget.category.icon} {budget.name}</strong>
          <div className="text-muted small">
            ${budget.spentAmount.toFixed(2)} / ${budget.targetAmount.toFixed(2)}
          </div>
        </div>
        <span className={`badge bg-${variant}`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <ProgressBar
        now={Math.min(percentage, 100)}
        variant={variant}
        className="mb-2"
      />
      <div className="text-muted small">
        {remaining > 0 ? `$${remaining.toFixed(2)} remaining` : 'Budget exceeded!'}
      </div>
    </div>
  );
};

export default BudgetProgress;

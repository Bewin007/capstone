import React from 'react';
import { Card } from 'react-bootstrap';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  variant: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, variant }) => {
  return (
    <Card className={`border-${variant} h-100`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className={`text-${variant} mb-0`}>{value}</h3>
          </div>
          <div className="fs-1">{icon}</div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StatsCard;

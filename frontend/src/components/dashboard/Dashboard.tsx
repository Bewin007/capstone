import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { expenseService } from '../../services/expenseService';
import { budgetService } from '../../services/budgetService';
import { goalService } from '../../services/goalService';
import { ExpenseSummary, Budget, Goal } from '../../types';
import StatsCard from './StatsCard';
import BudgetProgress from './BudgetProgress';
import GoalProgress from './GoalProgress';
import RecentExpenses from './RecentExpenses';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, budgetsData, goalsData] = await Promise.all([
        expenseService.getExpenseSummary({ period: 'month' }),
        budgetService.getBudgets({ status: 'active' }),
        goalService.getGoals({ status: 'active' }),
      ]);

      setSummary(summaryData);
      setBudgets(budgetsData);
      setGoals(goalsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="text-center mt-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <h2 className="mb-4">Dashboard</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <StatsCard
            title="Total Income"
            value={`$${summary?.totalIncome.toFixed(2) || '0.00'}`}
            icon="💰"
            variant="success"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatsCard
            title="Total Expenses"
            value={`$${summary?.totalExpense.toFixed(2) || '0.00'}`}
            icon="💸"
            variant="danger"
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatsCard
            title="Net Balance"
            value={`$${summary?.netBalance.toFixed(2) || '0.00'}`}
            icon="📊"
            variant={summary && summary.netBalance >= 0 ? 'success' : 'danger'}
          />
        </Col>
        <Col md={3} className="mb-3">
          <StatsCard
            title="Transactions"
            value={summary?.transactionCount.toString() || '0'}
            icon="📝"
            variant="info"
          />
        </Col>
      </Row>

      <Row>
        {/* Active Budgets */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Active Budgets</h5>
            </Card.Header>
            <Card.Body>
              {budgets.length > 0 ? (
                budgets.slice(0, 5).map((budget) => (
                  <BudgetProgress key={budget._id} budget={budget} />
                ))
              ) : (
                <p className="text-muted text-center">No active budgets</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Active Goals */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="bg-white">
              <h5 className="mb-0">Financial Goals</h5>
            </Card.Header>
            <Card.Body>
              {goals.length > 0 ? (
                goals.slice(0, 5).map((goal) => (
                  <GoalProgress key={goal._id} goal={goal} />
                ))
              ) : (
                <p className="text-muted text-center">No active goals</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Expenses */}
      <Row>
        <Col md={12}>
          <RecentExpenses />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;

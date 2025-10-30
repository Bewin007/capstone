import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Alert,
  ProgressBar,
  Badge,
} from 'react-bootstrap';
import { format } from 'date-fns';
import { goalService } from '../services/goalService';
import { categoryService } from '../services/categoryService';
import { Goal, Category, GoalFormData } from '../types';

const Goals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [contributionAmount, setContributionAmount] = useState(0);
  const [contributionNote, setContributionNote] = useState('');
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    type: 'savings',
    targetAmount: 0,
    targetDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [goalsData, categoriesData] = await Promise.all([
        goalService.getGoals(),
        categoryService.getCategories(),
      ]);
      setGoals(goalsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (goal?: Goal) => {
    if (goal) {
      setSelectedGoal(goal);
      setFormData({
        name: goal.name,
        description: goal.description,
        type: goal.type,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: format(new Date(goal.targetDate), 'yyyy-MM-dd'),
        priority: goal.priority,
        linkedCategory: goal.linkedCategory?._id,
        icon: goal.icon,
        color: goal.color,
        notes: goal.notes,
      });
    } else {
      setSelectedGoal(null);
      setFormData({
        name: '',
        type: 'savings',
        targetAmount: 0,
        targetDate: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedGoal(null);
    setError('');
  };

  const handleShowContributeModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setContributionAmount(0);
    setContributionNote('');
    setShowContributeModal(true);
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;

    try {
      await goalService.addContribution(selectedGoal._id, contributionAmount, contributionNote);
      await loadData();
      setShowContributeModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add contribution');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (selectedGoal) {
        await goalService.updateGoal(selectedGoal._id, formData);
      } else {
        await goalService.createGoal(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.deleteGoal(id);
        await loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete goal');
      }
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
      <Row className="mb-4">
        <Col>
          <h2>Financial Goals</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Create Goal
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {goals.length > 0 ? (
          goals.map((goal) => {
            const percentage = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <Col md={6} lg={4} key={goal._id} className="mb-4">
                <Card className="h-100" style={{ borderLeft: `4px solid ${goal.color}` }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">
                          {goal.icon} {goal.name}
                        </h5>
                        <Badge bg={goal.status === 'active' ? 'success' : goal.status === 'completed' ? 'primary' : 'secondary'}>
                          {goal.status}
                        </Badge>
                        <Badge bg="info" className="ms-1">
                          {goal.priority}
                        </Badge>
                      </div>
                      <Badge bg="primary" className="fs-6">
                        {Math.min(percentage, 100).toFixed(0)}%
                      </Badge>
                    </div>

                    {goal.description && (
                      <p className="text-muted small mb-2">{goal.description}</p>
                    )}

                    <div className="mb-3">
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>${goal.currentAmount.toFixed(2)}</span>
                        <span>${goal.targetAmount.toFixed(2)}</span>
                      </div>
                      <ProgressBar
                        now={Math.min(percentage, 100)}
                        variant="primary"
                      />
                    </div>

                    <div className="text-muted small mb-3">
                      <div>Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}</div>
                      <div className="text-primary fw-bold">
                        ${remaining.toFixed(2)} to go
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleShowContributeModal(goal)}
                        disabled={goal.status === 'completed'}
                      >
                        Add Funds
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleShowModal(goal)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(goal._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col>
            <Card>
              <Card.Body className="text-center text-muted">
                No goals found. Create your first financial goal to start saving!
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedGoal ? 'Edit Goal' : 'Create Goal'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Goal Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                <option value="savings">Savings</option>
                <option value="debt_repayment">Debt Repayment</option>
                <option value="investment">Investment</option>
                <option value="purchase">Purchase</option>
                <option value="emergency_fund">Emergency Fund</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={formData.priority || 'medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Icon (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.icon || ''}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🎯"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Color (Optional)</Form.Label>
                  <Form.Control
                    type="color"
                    value={formData.color || '#007bff'}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {selectedGoal ? 'Update' : 'Create'} Goal
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Contribute Modal */}
      <Modal show={showContributeModal} onHide={() => setShowContributeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Contribution</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleContribute}>
            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(parseFloat(e.target.value))}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Note (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={contributionNote}
                onChange={(e) => setContributionNote(e.target.value)}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowContributeModal(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Add Contribution
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Goals;

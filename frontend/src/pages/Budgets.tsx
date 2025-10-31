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
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { Budget, Category, BudgetFormData } from '../types';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    category: '',
    targetAmount: 0,
    period: 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsData, categoriesData] = await Promise.all([
        budgetService.getBudgets(),
        categoryService.getCategories('expense'),
      ]);
      setBudgets(budgetsData);
      setFilteredBudgets(budgetsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filter when budgets or statusFilter changes
    if (statusFilter === 'all') {
      setFilteredBudgets(budgets);
    } else {
      setFilteredBudgets(budgets.filter(budget => budget.status === statusFilter));
    }
  }, [budgets, statusFilter]);

  const handleShowModal = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        name: budget.name,
        category: budget.category._id,
        targetAmount: budget.targetAmount,
        period: budget.period,
        startDate: format(new Date(budget.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(budget.endDate), 'yyyy-MM-dd'),
        isRecurring: budget.isRecurring,
        recurringConfig: budget.recurringConfig,
        alertThreshold: budget.alertThreshold,
        notes: budget.notes,
      });
    } else {
      setEditingBudget(null);
      setFormData({
        name: '',
        category: '',
        targetAmount: 0,
        period: 'monthly',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(new Date().setMonth(new Date().getMonth() + 1)), 'yyyy-MM-dd'),
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingBudget) {
        await budgetService.updateBudget(editingBudget._id, formData);
      } else {
        await budgetService.createBudget(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save budget');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await budgetService.deleteBudget(id);
        await loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete budget');
      }
    }
  };

  const getStatusVariant = (budget: Budget) => {
    const percentage = (budget.spentAmount / budget.targetAmount) * 100;
    if (percentage >= 100) return 'danger';
    if (percentage >= budget.alertThreshold) return 'warning';
    return 'success';
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
          <h2>Budgets</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Create Budget
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filter Section */}
      <Row className="mb-4">
        <Col md={6} lg={4}>
          <Card>
            <Card.Body>
              <Form.Group>
                <Form.Label className="fw-bold">Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Budgets ({budgets.length})</option>
                  <option value="active">Active ({budgets.filter(b => b.status === 'active').length})</option>
                  <option value="completed">Completed ({budgets.filter(b => b.status === 'completed').length})</option>
                  <option value="exceeded">Exceeded ({budgets.filter(b => b.status === 'exceeded').length})</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {filteredBudgets.length > 0 ? (
          filteredBudgets.map((budget) => {
            const percentage = (budget.spentAmount / budget.targetAmount) * 100;
            const remaining = budget.targetAmount - budget.spentAmount;

            return (
              <Col md={6} lg={4} key={budget._id} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="mb-1">
                          {budget.category.icon} {budget.name}
                        </h5>
                        <Badge bg={budget.status === 'active' ? 'success' : 'secondary'}>
                          {budget.status}
                        </Badge>
                        {budget.isRecurring && (
                          <Badge bg="info" className="ms-1">
                            Recurring
                          </Badge>
                        )}
                      </div>
                      <Badge bg={getStatusVariant(budget)}>
                        {Math.min(percentage, 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>${budget.spentAmount.toFixed(2)}</span>
                        <span>${budget.targetAmount.toFixed(2)}</span>
                      </div>
                      <ProgressBar
                        now={Math.min(percentage, 100)}
                        variant={getStatusVariant(budget)}
                      />
                    </div>

                    <div className="text-muted small mb-3">
                      <div>Period: {budget.period}</div>
                      <div>
                        {format(new Date(budget.startDate), 'MMM dd, yyyy')} -{' '}
                        {format(new Date(budget.endDate), 'MMM dd, yyyy')}
                      </div>
                      {remaining > 0 ? (
                        <div className="text-success fw-bold">
                          ${remaining.toFixed(2)} remaining
                        </div>
                      ) : (
                        <div className="text-danger fw-bold">
                          Budget exceeded by ${Math.abs(remaining).toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1"
                        onClick={() => handleShowModal(budget)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(budget._id)}
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
                {budgets.length === 0
                  ? 'No budgets found. Create your first budget to start tracking your spending.'
                  : `No ${statusFilter === 'all' ? '' : statusFilter} budgets found.`
                }
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBudget ? 'Edit Budget' : 'Create Budget'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Budget Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
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
              <Form.Label>Period</Form.Label>
              <Form.Select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                required
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Alert Threshold (%)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="100"
                value={formData.alertThreshold || 80}
                onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
              />
              <Form.Text className="text-muted">
                Get notified when spending reaches this percentage
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Enable Recurring Budget"
                checked={formData.isRecurring || false}
                onChange={(e) => setFormData({
                  ...formData,
                  isRecurring: e.target.checked,
                  recurringConfig: e.target.checked ? {
                    frequency: 'monthly',
                    autoRenew: true,
                  } : undefined,
                })}
              />
              <Form.Text className="text-muted">
                Automatically create new budget periods
              </Form.Text>
            </Form.Group>

            {formData.isRecurring && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Recurring Frequency</Form.Label>
                  <Form.Select
                    value={formData.recurringConfig?.frequency || 'monthly'}
                    onChange={(e) => setFormData({
                      ...formData,
                      recurringConfig: {
                        frequency: e.target.value as 'weekly' | 'monthly' | 'yearly',
                        autoRenew: formData.recurringConfig?.autoRenew || false,
                      },
                    })}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Auto-renew budget"
                    checked={formData.recurringConfig?.autoRenew || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      recurringConfig: {
                        frequency: formData.recurringConfig?.frequency || 'monthly',
                        autoRenew: e.target.checked,
                      },
                    })}
                  />
                  <Form.Text className="text-muted">
                    Automatically renew when period ends
                  </Form.Text>
                </Form.Group>
              </>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingBudget ? 'Update' : 'Create'} Budget
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Budgets;

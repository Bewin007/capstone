import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  Modal,
  Form,
  Alert,
} from 'react-bootstrap';
import { format } from 'date-fns';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { Expense, Category, ExpenseFormData } from '../types';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getExpenses(),
        categoryService.getCategories(),
      ]);
      setExpenses(expensesData.data);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        type: expense.type,
        amount: expense.amount,
        description: expense.description,
        category: expense.category._id,
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
        merchant: expense.merchant,
        notes: expense.notes,
      });
    } else {
      setEditingExpense(null);
      setFormData({
        type: 'expense',
        amount: 0,
        description: '',
        category: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense._id, formData);
      } else {
        await expenseService.createExpense(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        await loadData();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete expense');
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
          <h2>Expenses & Income</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Add Transaction
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th className="text-end">Amount</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                    <td>
                      <div>{expense.description}</div>
                      {expense.merchant && (
                        <small className="text-muted">{expense.merchant}</small>
                      )}
                    </td>
                    <td>
                      {expense.category.icon} {expense.category.name}
                    </td>
                    <td>
                      <Badge bg={expense.type === 'income' ? 'success' : 'danger'}>
                        {expense.type}
                      </Badge>
                    </td>
                    <td className={`text-end fw-bold ${expense.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                    </td>
                    <td className="text-end">
                      <Button
                        variant="sm"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(expense)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(expense._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingExpense ? 'Edit Transaction' : 'Add Transaction'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {categories
                  .filter((c) => c.type === formData.type || c.type === 'both')
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Merchant (Optional)</Form.Label>
              <Form.Control
                type="text"
                value={formData.merchant || ''}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingExpense ? 'Update' : 'Add'} Transaction
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Expenses;

import React, { useEffect, useState, useRef } from 'react';
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
  ButtonGroup,
  Dropdown,
} from 'react-bootstrap';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { expenseService } from '../services/expenseService';
import { categoryService } from '../services/categoryService';
import { exportService } from '../services/exportService';
import { importService } from '../services/importService';
import { Expense, Category, ExpenseFormData } from '../types';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  // Export states
  const [exportFilters, setExportFilters] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    type: '',
    category: '',
  });

  const [formData, setFormData] = useState<ExpenseFormData>({
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getCategories();
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.type) params.type = filters.type;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const expensesData = await expenseService.getExpenses(params);
      setExpenses(expensesData.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const setDateRange = (range: 'today' | 'week' | 'month' | 'year' | 'all') => {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = format(now, 'yyyy-MM-dd');
        break;
      case 'week':
        start = format(new Date(now.setDate(now.getDate() - 7)), 'yyyy-MM-dd');
        end = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'month':
        start = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        end = format(endOfMonth(new Date()), 'yyyy-MM-dd');
        break;
      case 'year':
        start = format(startOfYear(new Date()), 'yyyy-MM-dd');
        end = format(endOfYear(new Date()), 'yyyy-MM-dd');
        break;
      case 'all':
        start = end = '';
        break;
    }

    setFilters({ ...filters, startDate: start, endDate: end });
  };

  const handleExport = async () => {
    if (!exportFilters.startDate || !exportFilters.endDate) {
      setError('Please select start and end dates for export');
      return;
    }

    try {
      setLoading(true);
      await exportService.exportExpenses(
        exportFilters.startDate,
        exportFilters.endDate,
        exportFilters.type,
        exportFilters.category
      );
      setSuccess('Expenses exported successfully!');
      setShowExportModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await importService.importExpensesFromCSV(file);
      setSuccess(`Imported ${result.data.imported} transactions. ${result.data.failed} failed.`);
      await loadExpenses();
      setShowImportModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import expenses');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      await loadExpenses();
      handleCloseModal();
      setSuccess('Transaction saved successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await expenseService.deleteExpense(id);
        await loadExpenses();
        setSuccess('Transaction deleted successfully!');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  if (loading && expenses.length === 0) {
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
          <ButtonGroup className="me-2">
            <Button variant="success" onClick={() => setShowImportModal(true)}>
              📥 Import CSV
            </Button>
            <Button variant="info" onClick={() => setShowExportModal(true)}>
              📤 Export
            </Button>
          </ButtonGroup>
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Add Transaction
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={2}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Dropdown as={ButtonGroup} className="w-100">
                <Button variant="outline-secondary" onClick={() => loadExpenses()}>
                  Apply Filters
                </Button>
                <Dropdown.Toggle split variant="outline-secondary" />
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => setDateRange('today')}>Today</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange('week')}>Last 7 Days</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange('month')}>This Month</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange('year')}>This Year</Dropdown.Item>
                  <Dropdown.Item onClick={() => setDateRange('all')}>All Time</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
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
                  <td colSpan={6} className="text-center text-muted py-4">
                    No transactions found for the selected filters
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

      {/* Export Modal */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export Expenses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Start Date *</Form.Label>
              <Form.Control
                type="date"
                value={exportFilters.startDate}
                onChange={(e) => setExportFilters({ ...exportFilters, startDate: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>End Date *</Form.Label>
              <Form.Control
                type="date"
                value={exportFilters.endDate}
                onChange={(e) => setExportFilters({ ...exportFilters, endDate: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Type (Optional)</Form.Label>
              <Form.Select
                value={exportFilters.type}
                onChange={(e) => setExportFilters({ ...exportFilters, type: e.target.value })}
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category (Optional)</Form.Label>
              <Form.Select
                value={exportFilters.category}
                onChange={(e) => setExportFilters({ ...exportFilters, category: e.target.value })}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleExport} disabled={loading}>
            {loading ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Modal */}
      <Modal show={showImportModal} onHide={() => setShowImportModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Import Expenses from CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>CSV Format:</strong><br />
            Your CSV should have these columns: Date, Type, Description, Category, Amount, Merchant (optional), Notes (optional)
          </Alert>
          <Form.Group>
            <Form.Label>Select CSV File</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleImport}
            />
          </Form.Group>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Expenses;

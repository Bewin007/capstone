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
  Badge,
  Table,
} from 'react-bootstrap';
import { categoryService } from '../services/categoryService';
import { Category } from '../types';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    icon: string;
    color: string;
    type: 'expense' | 'income' | 'both';
  }>({
    name: '',
    icon: '📁',
    color: '#6c757d',
    type: 'expense',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        icon: '📁',
        color: '#6c757d',
        type: 'expense',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, formData);
      } else {
        await categoryService.createCategory(formData);
      }
      await loadCategories();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert('Cannot delete system categories');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        await loadCategories();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const systemCategories = categories.filter((c) => c.owner === 'system');
  const userCategories = categories.filter((c) => c.owner === 'user');

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
          <h2>Categories</h2>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => handleShowModal()}>
            + Create Category
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* User Categories */}
      <Card className="mb-4">
        <Card.Header className="bg-white">
          <h5 className="mb-0">My Custom Categories</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {userCategories.length > 0 ? (
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Color</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userCategories.map((category) => (
                  <tr key={category._id}>
                    <td className="fs-4">{category.icon}</td>
                    <td>{category.name}</td>
                    <td>
                      <Badge bg={category.type === 'income' ? 'success' : 'danger'}>
                        {category.type}
                      </Badge>
                    </td>
                    <td>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          backgroundColor: category.color,
                          borderRadius: '4px',
                        }}
                      />
                    </td>
                    <td className="text-end">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleShowModal(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(category._id, false)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted p-4">
              No custom categories yet. Create your own!
            </div>
          )}
        </Card.Body>
      </Card>

      {/* System Categories */}
      <Card>
        <Card.Header className="bg-white">
          <h5 className="mb-0">System Categories</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Icon</th>
                <th>Name</th>
                <th>Type</th>
                <th>Color</th>
              </tr>
            </thead>
            <tbody>
              {systemCategories.map((category) => (
                <tr key={category._id}>
                  <td className="fs-4">{category.icon}</td>
                  <td>{category.name}</td>
                  <td>
                    <Badge bg={category.type === 'income' ? 'success' : 'danger'}>
                      {category.type}
                    </Badge>
                  </td>
                  <td>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        backgroundColor: category.color,
                        borderRadius: '4px',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Icon</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Color</Form.Label>
                  <Form.Control
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' | 'both' })}
                required
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Categories;

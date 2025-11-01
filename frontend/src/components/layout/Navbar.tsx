import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import NotificationDropdown from '../common/NotificationDropdown';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        <BSNavbar.Brand as={Link} to="/dashboard" className="fw-bold">
          💰 Wealthwise
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/expenses">Expenses</Nav.Link>
            <Nav.Link as={Link} to="/budgets">Budgets</Nav.Link>
            <Nav.Link as={Link} to="/goals">Goals</Nav.Link>
            <Nav.Link as={Link} to="/bank-accounts">Bank Accounts</Nav.Link>
            <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
            <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <NotificationDropdown />
            <NavDropdown title={user?.name || 'User'} id="user-dropdown" align="end">
              <NavDropdown.Item as={Link} to="/profile">
                Profile Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;

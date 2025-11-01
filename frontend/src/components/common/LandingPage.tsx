import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <Navbar bg="white" expand="lg" className="shadow-sm fixed-top">
        <Container>
          <Navbar.Brand href="#" className="fw-bold text-primary fs-3">
            💰 Wealthwise
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#demo">Demo</Nav.Link>
              <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">
                  Take Control of Your 
                  <span className="text-primary"> Financial Future</span>
                </h1>
                <p className="lead mb-4 text-muted">
                  Wealthwise is a complete financial management solution that helps you track expenses, 
                  set budgets, achieve goals, and make smarter financial decisions with powerful analytics.
                </p>
                <div className="hero-buttons">
                  <Link to="/register" className="btn btn-primary btn-lg me-3">
                    Start Free Trial
                  </Link>
                  <Button variant="outline-primary" size="lg" href="#demo">
                    View Demo
                  </Button>
                </div>
                <div className="hero-stats mt-4">
                  <small className="text-muted">
                    Join thousands of users managing their finances better
                  </small>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="dashboard-preview">
                  <div className="browser-mockup">
                    <div className="browser-bar">
                      <div className="browser-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                    <div className="dashboard-content">
                      <div className="dash-header">
                        <h6 className="mb-0">Financial Dashboard</h6>
                        <small className="text-muted">November 2024</small>
                      </div>
                      <div className="dash-cards">
                        <div className="mini-card income">
                          <small>Total Income</small>
                          <h5>$4,250</h5>
                        </div>
                        <div className="mini-card expense">
                          <small>Total Expenses</small>
                          <h5>$3,180</h5>
                        </div>
                        <div className="mini-card savings">
                          <small>Net Savings</small>
                          <h5>$1,070</h5>
                        </div>
                      </div>
                      <div className="dash-chart">
                        <div className="chart-placeholder">
                          <div className="chart-bars">
                            <div className="bar" style={{height: '60%'}}></div>
                            <div className="bar" style={{height: '80%'}}></div>
                            <div className="bar" style={{height: '45%'}}></div>
                            <div className="bar" style={{height: '90%'}}></div>
                            <div className="bar" style={{height: '70%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5">
        <Container>
          <div className="text-center mb-5">
            <h2 className="fw-bold">Powerful Features for Complete Financial Control</h2>
            <p className="text-muted">Everything you need to manage your money effectively</p>
          </div>
          
          <Row className="g-4">
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span className="fs-1">📊</span>
                  </div>
                  <h5 className="fw-bold">Smart Analytics</h5>
                  <p className="text-muted">
                    Get detailed insights into your spending patterns with interactive charts and reports.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span className="fs-1">💳</span>
                  </div>
                  <h5 className="fw-bold">Bank Integration</h5>
                  <p className="text-muted">
                    Import transactions automatically and categorize them with smart AI-powered suggestions.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span className="fs-1">🎯</span>
                  </div>
                  <h5 className="fw-bold">Goal Tracking</h5>
                  <p className="text-muted">
                    Set financial goals and track your progress with visual milestones and achievements.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span className="fs-1">💰</span>
                  </div>
                  <h5 className="fw-bold">Budget Management</h5>
                  <p className="text-muted">
                    Create budgets, set alerts, and stay on track with intelligent spending notifications.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span className="fs-1">📱</span>
                  </div>
                  <h5 className="fw-bold">Multi-Platform</h5>
                  <p className="text-muted">
                    Access your financial data anywhere with our responsive web app and mobile support.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <span className="fs-1">🔒</span>
                  </div>
                  <h5 className="fw-bold">Secure & Private</h5>
                  <p className="text-muted">
                    Bank-level security with encrypted data storage and secure authentication.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Demo Section */}
      <section id="demo" className="demo-section py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="fw-bold mb-4">Try Wealthwise Today</h2>
              <p className="lead text-muted mb-4">
                Experience the power of intelligent financial management with our demo account.
              </p>
              <div className="demo-credentials p-4 bg-white rounded shadow-sm mb-4">
                <h6 className="fw-bold text-primary mb-3">Demo Credentials</h6>
                <div className="mb-2">
                  <strong>Email:</strong> demo@wealthwise.com
                </div>
                <div className="mb-2">
                  <strong>Password:</strong> demo123
                </div>
                <small className="text-muted">
                  Pre-loaded with sample data to explore all features
                </small>
              </div>
              <div className="demo-buttons">
                <Link to="/login" className="btn btn-primary btn-lg me-3">
                  Try Demo
                </Link>
                <Link to="/register" className="btn btn-outline-primary btn-lg">
                  Create Account
                </Link>
              </div>
            </Col>
            <Col lg={6}>
              <div className="demo-features">
                <div className="d-flex align-items-center mb-3">
                  <span className="text-success me-3 fs-4">✓</span>
                  <span>Complete expense tracking system</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-success me-3 fs-4">✓</span>
                  <span>Interactive budget management</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-success me-3 fs-4">✓</span>
                  <span>Advanced analytics and reporting</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-success me-3 fs-4">✓</span>
                  <span>Goal setting and progress tracking</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-success me-3 fs-4">✓</span>
                  <span>CSV/Excel/PDF export capabilities</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <span className="text-success me-3 fs-4">✓</span>
                  <span>Bank transaction import simulation</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer py-5 bg-dark text-white">
        <Container>
          <Row>
            <Col lg={6}>
              <h5 className="fw-bold mb-3">
                💰 Wealthwise
              </h5>
              <p className="text-muted">
                A complete MERN stack financial management application template 
                demonstrating modern web development practices.
              </p>
            </Col>
            <Col lg={3}>
              <h6 className="fw-bold mb-3">Quick Links</h6>
              <div className="d-flex flex-column">
                <Link to="/login" className="text-muted text-decoration-none mb-2">Login</Link>
                <Link to="/register" className="text-muted text-decoration-none mb-2">Register</Link>
                <a href="#features" className="text-muted text-decoration-none mb-2">Features</a>
                <a href="#demo" className="text-muted text-decoration-none">Demo</a>
              </div>
            </Col>
            <Col lg={3}>
              <h6 className="fw-bold mb-3">Technology</h6>
              <div className="d-flex flex-column">
                <span className="text-muted mb-2">React + TypeScript</span>
                <span className="text-muted mb-2">Node.js + Express</span>
                <span className="text-muted mb-2">MongoDB</span>
                <span className="text-muted">Bootstrap UI</span>
              </div>
            </Col>
          </Row>
          <hr className="my-4" />
          <div className="text-center text-muted">
            <p className="mb-0">
              © 2024 Wealthwise - React Express Template. 
              Built with ❤️ for learning and demonstration.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
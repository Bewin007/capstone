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
import { bankAccountService, BankAccount, AvailableBank, AddBankAccountData } from '../services/bankAccountService';

const BankAccounts: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [availableBanks, setAvailableBanks] = useState<AvailableBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAvailableBanks, setShowAvailableBanks] = useState(false);

  const [formData, setFormData] = useState<AddBankAccountData>({
    bankName: '',
    accountName: '',
    accountNumber: '',
    accountType: 'checking',
    bankUserId: '',
  });

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const response = await bankAccountService.getBankAccounts();
      setBankAccounts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableBanks = async () => {
    try {
      setLoading(true);
      const response = await bankAccountService.getAvailableBanks();
      setAvailableBanks(response.data);
      setShowAvailableBanks(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load available banks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await bankAccountService.addBankAccount(formData);
      setSuccess('Bank account connected successfully!');
      await loadBankAccounts();
      setShowAddModal(false);
      setFormData({
        bankName: '',
        accountName: '',
        accountNumber: '',
        accountType: 'checking',
        bankUserId: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickConnect = async (bank: AvailableBank) => {
    try {
      setLoading(true);
      await bankAccountService.addBankAccount({
        bankName: bank.bankName,
        accountName: bank.accountHolder,
        accountNumber: bank.accountNumber,
        accountType: 'checking',
        bankUserId: bank.bankUserId,
      });
      setSuccess(`Successfully connected to ${bank.bankName}!`);
      await loadBankAccounts();
      setShowAvailableBanks(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (id: string) => {
    try {
      setLoading(true);
      await bankAccountService.syncBankAccount(id);
      setSuccess('Bank account synced successfully!');
      await loadBankAccounts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync bank account');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (window.confirm('Are you sure you want to disconnect this bank account?')) {
      try {
        setLoading(true);
        await bankAccountService.deleteBankAccount(id);
        setSuccess('Bank account disconnected successfully!');
        await loadBankAccounts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to disconnect bank account');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge bg="success">Connected</Badge>;
      case 'disconnected':
        return <Badge bg="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge bg="danger">Error</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  if (loading && bankAccounts.length === 0) {
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
          <h2>Bank Accounts</h2>
          <p className="text-muted">Manage your connected bank accounts for automatic transaction imports</p>
        </Col>
        <Col className="text-end">
          <Button variant="outline-primary" className="me-2" onClick={loadAvailableBanks}>
            🏦 Browse Banks
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Connect Account
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {bankAccounts.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h4 className="text-muted mb-3">No Bank Accounts Connected</h4>
            <p className="text-muted mb-4">
              Connect your bank accounts to automatically import transactions and keep your finances up to date.
            </p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Connect Your First Account
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Bank & Account</th>
                  <th>Account Number</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Last Sync</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bankAccounts.map((account) => (
                  <tr key={account._id}>
                    <td>
                      <div>
                        <strong>{account.bankName}</strong>
                        <br />
                        <small className="text-muted">{account.accountName}</small>
                      </div>
                    </td>
                    <td>
                      <code>****{account.accountNumber.slice(-4)}</code>
                    </td>
                    <td>
                      <Badge bg="info" className="text-capitalize">
                        {account.accountType}
                      </Badge>
                    </td>
                    <td>
                      <strong className="text-success">
                        ${account.balance.toFixed(2)}
                      </strong>
                    </td>
                    <td>{getStatusBadge(account.connectionStatus)}</td>
                    <td>
                      {account.lastSyncDate ? (
                        <small>{format(new Date(account.lastSyncDate), 'MMM dd, yyyy HH:mm')}</small>
                      ) : (
                        <small className="text-muted">Never</small>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleSync(account._id)}
                        disabled={loading}
                      >
                        🔄 Sync
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDisconnect(account._id)}
                        disabled={loading}
                      >
                        Disconnect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Add Account Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Connect Bank Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddAccount}>
            <Form.Group className="mb-3">
              <Form.Label>Bank Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Demo Bank"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., John Doe"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Number *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., 1234567890"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Account Type *</Form.Label>
              <Form.Select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
                required
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit Card</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Bank User ID *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., user123"
                value={formData.bankUserId}
                onChange={(e) => setFormData({ ...formData, bankUserId: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                This is your unique identifier in the bank system (for demo: user123 or user456)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddAccount} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Account'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Available Banks Modal */}
      <Modal show={showAvailableBanks} onHide={() => setShowAvailableBanks(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Available Bank Accounts</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Demo Bank Accounts:</strong><br />
            These are simulated bank accounts available for testing the import functionality.
          </Alert>
          
          {availableBanks.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p>No additional bank accounts available to connect.</p>
              <p>You may have already connected all available demo accounts.</p>
            </div>
          ) : (
            <Table hover>
              <thead>
                <tr>
                  <th>Account Holder</th>
                  <th>Bank</th>
                  <th>Account Number</th>
                  <th>Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {availableBanks.map((bank) => (
                  <tr key={bank.bankUserId}>
                    <td><strong>{bank.accountHolder}</strong></td>
                    <td>{bank.bankName}</td>
                    <td><code>****{bank.accountNumber.slice(-4)}</code></td>
                    <td><strong className="text-success">${bank.balance.toFixed(2)}</strong></td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleQuickConnect(bank)}
                        disabled={loading}
                      >
                        Quick Connect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvailableBanks(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BankAccounts;
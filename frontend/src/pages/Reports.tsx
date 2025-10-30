import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Alert, Table, Badge, Pagination } from 'react-bootstrap';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';
import { analyticsService, TransactionData } from '../services/analyticsService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  const [trendPeriod, setTrendPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [comparisonMonths, setComparisonMonths] = useState(12);

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [incomeExpenseComparison, setIncomeExpenseComparison] = useState<any>(null);
  const [monthlyComparison, setMonthlyComparison] = useState<any[]>([]);
  const [topMerchants, setTopMerchants] = useState<any[]>([]);

  // Transactions pagination states
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const transactionsPerPage = 10;

  useEffect(() => {
    loadAllData();
  }, [dateRange, trendPeriod, comparisonMonths]);

  useEffect(() => {
    loadTransactions();
  }, [dateRange, currentPage]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load data with error handling
      const results = await Promise.allSettled([
        analyticsService.getOverview(dateRange.startDate, dateRange.endDate),
        analyticsService.getSpendingTrends(trendPeriod, dateRange.startDate, dateRange.endDate),
        analyticsService.getCategoryBreakdown('expense', dateRange.startDate, dateRange.endDate),
        analyticsService.getIncomeExpenseComparison(dateRange.startDate, dateRange.endDate),
        analyticsService.getMonthlyComparison(comparisonMonths),
        analyticsService.getTopMerchants(10, dateRange.startDate, dateRange.endDate),
      ]);

      // Check for errors
      const errors = results.filter((r) => r.status === 'rejected');
      if (errors.length > 0) {
        console.error('Some analytics failed to load:', errors);
        setError('Some data failed to load. Displaying available information.');
      }

      // Set data from successful results
      if (results[0].status === 'fulfilled') setOverview(results[0].value);
      if (results[1].status === 'fulfilled') setTrends(results[1].value);
      if (results[2].status === 'fulfilled') setCategoryBreakdown(results[2].value);
      if (results[3].status === 'fulfilled') setIncomeExpenseComparison(results[3].value);
      if (results[4].status === 'fulfilled') setMonthlyComparison(results[4].value);
      if (results[5].status === 'fulfilled') setTopMerchants(results[5].value);

      console.log(results)
    } catch (err: any) {
      console.error('Critical error loading analytics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const result = await analyticsService.getTransactions(
        currentPage,
        transactionsPerPage,
        dateRange.startDate,
        dateRange.endDate
      );
      setTransactions(result.data);
      setTotalPages(result.pagination.pages);
      setTotalTransactions(result.pagination.total);
    } catch (err: any) {
      console.error('Error loading transactions:', err);
    }
  };

  const setQuickDateRange = (range: 'month' | 'quarter' | 'year' | 'all') => {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'month':
        start = format(startOfMonth(now), 'yyyy-MM-dd');
        end = format(endOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'quarter':
        start = format(subMonths(now, 3), 'yyyy-MM-dd');
        end = format(now, 'yyyy-MM-dd');
        break;
      case 'year':
        start = format(startOfYear(now), 'yyyy-MM-dd');
        end = format(now, 'yyyy-MM-dd');
        break;
      case 'all':
        start = format(subMonths(now, 120), 'yyyy-MM-dd'); // 10 years
        end = format(now, 'yyyy-MM-dd');
        break;
    }

    setDateRange({ startDate: start, endDate: end });
  };

  if (loading && !overview) {
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
          <h2>Reports & Insights</h2>
        </Col>
      </Row>

      {error && (
        <Alert variant={error.includes('Some data failed') ? 'warning' : 'danger'} onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-primary" onClick={() => setQuickDateRange('month')}>
                  This Month
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setQuickDateRange('quarter')}>
                  Last 3 Months
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setQuickDateRange('year')}>
                  This Year
                </button>
                <button className="btn btn-sm btn-outline-primary" onClick={() => setQuickDateRange('all')}>
                  All Time
                </button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Overview Cards */}
      {overview && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6 className="text-muted">Total Income</h6>
                <h3 className="text-success">${overview.summary.totalIncome.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6 className="text-muted">Total Expenses</h6>
                <h3 className="text-danger">${overview.summary.totalExpenses.toFixed(2)}</h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6 className="text-muted">Net Balance</h6>
                <h3 className={overview.summary.balance >= 0 ? 'text-success' : 'text-danger'}>
                  ${overview.summary.balance.toFixed(2)}
                </h3>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h6 className="text-muted">Transactions</h6>
                <h3 className="text-primary">{overview.summary.transactionCount}</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Monthly Comparison - Historical View */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Historical Trends (Last {comparisonMonths} Months)</h5>
              <Form.Select
                style={{ width: '150px' }}
                value={comparisonMonths}
                onChange={(e) => setComparisonMonths(parseInt(e.target.value))}
              >
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
                <option value="24">Last 24 Months</option>
                <option value="36">Last 36 Months</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {monthlyComparison && monthlyComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#28a745" strokeWidth={2} name="Income" />
                    <Line type="monotone" dataKey="expense" stroke="#dc3545" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="net" stroke="#007bff" strokeWidth={2} name="Net Savings" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No historical data available for the selected period.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Spending Trends */}
      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Income vs Expenses Trend</h5>
              <Form.Select
                style={{ width: '120px' }}
                value={trendPeriod}
                onChange={(e) => setTrendPeriod(e.target.value as any)}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </Form.Select>
            </Card.Header>
            <Card.Body>
              {trends && trends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="income" fill="#28a745" name="Income" />
                    <Bar dataKey="expense" fill="#dc3545" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No transaction data available for the selected period.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Income vs Expense Summary */}
        <Col md={4}>
          {incomeExpenseComparison && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <small className="text-muted">Income</small>
                  <h4 className="text-success">${incomeExpenseComparison.income.total.toFixed(2)}</h4>
                  <small>{incomeExpenseComparison.income.count} transactions</small>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Expenses</small>
                  <h4 className="text-danger">${incomeExpenseComparison.expense.total.toFixed(2)}</h4>
                  <small>{incomeExpenseComparison.expense.count} transactions</small>
                </div>
                <hr />
                <div className="mb-3">
                  <small className="text-muted">Net Savings</small>
                  <h4 className={incomeExpenseComparison.netSavings >= 0 ? 'text-success' : 'text-danger'}>
                    ${incomeExpenseComparison.netSavings.toFixed(2)}
                  </h4>
                </div>
                <div>
                  <small className="text-muted">Savings Rate</small>
                  <h4 className="text-primary">{incomeExpenseComparison.savingsRate}%</h4>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Category Breakdown and Top Merchants */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Spending by Category</h5>
            </Card.Header>
            <Card.Body>
              {categoryBreakdown && categoryBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.name}: ${entry.percentage}%`}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3">
                    {categoryBreakdown.slice(0, 5).map((cat, idx) => (
                      <div key={idx} className="d-flex justify-content-between mb-2">
                        <span>
                          {cat.icon} {cat.name}
                        </span>
                        <span>
                          <Badge bg="secondary">{cat.percentage}%</Badge>
                          <strong className="ms-2">${cat.total.toFixed(2)}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No expense data available for the selected period.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Merchants</h5>
            </Card.Header>
            <Card.Body>
              {topMerchants && topMerchants.length > 0 ? (
                <Table hover size="sm">
                  <thead>
                    <tr>
                      <th>Merchant</th>
                      <th className="text-end">Transactions</th>
                      <th className="text-end">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMerchants.map((merchant, idx) => (
                      <tr key={idx}>
                        <td>{merchant.merchant}</td>
                        <td className="text-end">{merchant.count}</td>
                        <td className="text-end text-danger">
                          <strong>${merchant.total.toFixed(2)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No merchant data available for the selected period.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Transactions List */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">All Transactions</h5>
              <Badge bg="secondary">{totalTransactions} total</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              {transactions && transactions.length > 0 ? (
                <>
                  <Table hover responsive className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>{format(new Date(transaction.date), 'MMM dd, yyyy')}</td>
                          <td>
                            <div>{transaction.description}</div>
                            {transaction.merchant && (
                              <small className="text-muted">{transaction.merchant}</small>
                            )}
                          </td>
                          <td>
                            {transaction.category.icon} {transaction.category.name}
                          </td>
                          <td>
                            <Badge bg={transaction.type === 'income' ? 'success' : 'danger'}>
                              {transaction.type}
                            </Badge>
                          </td>
                          <td className={`text-end fw-bold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="d-flex justify-content-center p-3">
                      <Pagination>
                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} />

                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          // Show first, last, current, and pages around current
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Pagination.Item
                                key={page}
                                active={page === currentPage}
                                onClick={() => setCurrentPage(page)}
                              >
                                {page}
                              </Pagination.Item>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <Pagination.Ellipsis key={page} disabled />;
                          }
                          return null;
                        })}

                        <Pagination.Next onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted py-5">
                  <p>No transactions found for the selected period.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;

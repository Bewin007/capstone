import React, { useEffect, useState } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { expenseService } from '../../services/expenseService';
import { Expense } from '../../types';
import { format } from 'date-fns';

const RecentExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentExpenses();
  }, []);

  const loadRecentExpenses = async () => {
    try {
      const response = await expenseService.getExpenses({ limit: 10 });
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to load recent expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <Card>
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Recent Transactions</h5>
        <Link to="/expenses" className="btn btn-sm btn-primary">View All</Link>
      </Card.Header>
      <Card.Body className="p-0">
        {expenses.length > 0 ? (
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
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td>{format(new Date(expense.date), 'MMM dd, yyyy')}</td>
                  <td>
                    <div>{expense.description}</div>
                    {expense.merchant && (
                      <small className="text-muted">{expense.merchant}</small>
                    )}
                  </td>
                  <td>
                    <span>
                      {expense.category.icon} {expense.category.name}
                    </span>
                  </td>
                  <td>
                    <Badge bg={expense.type === 'income' ? 'success' : 'danger'}>
                      {expense.type}
                    </Badge>
                  </td>
                  <td className={`text-end fw-bold ${expense.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {expense.type === 'income' ? '+' : '-'}${expense.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center text-muted p-4">No recent transactions</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecentExpenses;

import React, { useEffect, useState } from 'react';
import { Dropdown, Badge, ListGroup } from 'react-bootstrap';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ limit: 10 });
      setNotifications(data.data);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="text-white position-relative">
        🔔
        {unreadCount > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.7rem' }}
          >
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '350px', maxHeight: '500px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-sm btn-link text-decoration-none p-0"
              onClick={handleMarkAllAsRead}
              disabled={loading}
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length > 0 ? (
          <ListGroup variant="flush">
            {notifications.map((notification) => (
              <ListGroup.Item
                key={notification._id}
                className={`${!notification.isRead ? 'bg-light' : ''} cursor-pointer`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2">
                      <strong className="small">{notification.title}</strong>
                      <Badge bg={getPriorityColor(notification.priority)} className="small">
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="mb-1 small text-muted">{notification.message}</p>
                    <small className="text-muted">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </small>
                  </div>
                  {!notification.isRead && (
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#007bff',
                      }}
                    />
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <div className="text-center text-muted py-4">
            <p>No notifications</p>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationDropdown;

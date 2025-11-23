import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';

export default function AdminDashboard(){
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);
  const [content, setContent] = useState({ faqs: '', contactInfo: '' });
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, companiesRes, statsRes, logsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/companies'),
        api.get('/admin/stats'),
        api.get('/admin/logs')
      ]);
      setUsers(usersRes.data);
      setCompanies(companiesRes.data);
      setStats(statsRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.post('/admin/users/approve', { userId, action: 'approve' });
      loadData();
    } catch (err) {
      alert('Error approving user');
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await api.post('/admin/users/approve', { userId, action: 'remove' });
      loadData();
    } catch (err) {
      alert('Error removing user');
    }
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      await api.put('/admin/companies/verify', { companyId, verified: true });
      loadData();
    } catch (err) {
      alert('Error verifying company');
    }
  };

  const handleDeactivateCompany = async (companyId) => {
    try {
      await api.put('/admin/companies/deactivate', { companyId, active: false });
      loadData();
    } catch (err) {
      alert('Error deactivating company');
    }
  };

  const handlePublishResults = async (testId) => {
    try {
      await api.post('/admin/publish-results', { testId });
      alert('Results published successfully');
    } catch (err) {
      alert('Error publishing results');
    }
  };

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>

      <div className="tabs">
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>Users</button>
        <button onClick={() => setActiveTab('companies')} className={activeTab === 'companies' ? 'active' : ''}>Companies</button>
        <button onClick={() => setActiveTab('content')} className={activeTab === 'content' ? 'active' : ''}>Content</button>
        <button onClick={() => setActiveTab('notifications')} className={activeTab === 'notifications' ? 'active' : ''}>Notifications</button>
        <button onClick={() => setActiveTab('stats')} className={activeTab === 'stats' ? 'active' : ''}>Statistics</button>
        <button onClick={() => setActiveTab('logs')} className={activeTab === 'logs' ? 'active' : ''}>Logs</button>
      </div>

      {activeTab === 'users' && (
        <div className="card">
          <h3>User Management</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    {u.role !== 'admin' && (
                      <>
                        <button onClick={() => handleApproveUser(u._id)}>Approve</button>
                        <button onClick={() => handleRemoveUser(u._id)}>Remove</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'companies' && (
        <div className="card">
          <h3>Company Management</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.verified ? 'Yes' : 'No'}</td>
                  <td>{c.active ? 'Yes' : 'No'}</td>
                  <td>
                    <button onClick={() => handleVerifyCompany(c._id)}>Verify</button>
                    <button onClick={() => handleDeactivateCompany(c._id)}>
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="card">
          <h3>Content Management</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.put('/admin/content', content);
              alert('Content updated successfully');
            } catch (err) {
              alert('Error updating content');
            }
          }}>
            <textarea
              placeholder="FAQs"
              value={content.faqs}
              onChange={(e) => setContent({...content, faqs: e.target.value})}
              rows="10"
            />
            <textarea
              placeholder="Contact Information"
              value={content.contactInfo}
              onChange={(e) => setContent({...content, contactInfo: e.target.value})}
              rows="5"
            />
            <button type="submit">Update Content</button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <h3>Global Notifications</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.post('/admin/notifications', { message: content.faqs, type: 'announcement' });
              alert('Notification sent');
            } catch (err) {
              alert('Error sending notification');
            }
          }}>
            <textarea
              placeholder="Notification Message"
              value={content.faqs}
              onChange={(e) => setContent({...content, faqs: e.target.value})}
              rows="3"
              required
            />
            <button type="submit">Send Notification</button>
          </form>
          <h4>Recent Notifications</h4>
          <ul>
            {notifications.map(notif => (
              <li key={notif._id}>
                {notif.message} - {new Date(notif.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="card">
          <h3>Platform Statistics</h3>
          <div className="stats-grid">
            <div>Total Users: {stats.totalUsers}</div>
            <div>Total Companies: {stats.totalCompanies}</div>
            <div>Total Jobs: {stats.totalJobs}</div>
            <div>Total Applications: {stats.totalApplications}</div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <h3>Audit Logs</h3>
          <ul>
            {logs.map(log => (
              <li key={log._id}>
                {log.createdAt}: {log.action} by {log.userId?.name} - {JSON.stringify(log.details)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

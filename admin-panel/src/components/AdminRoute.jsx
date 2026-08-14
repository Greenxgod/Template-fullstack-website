import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await axios.get('/api/auth/me', {
          withCredentials: true
        });
        
        if (response.data.success && response.data.data.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container" style={{ maxWidth: '600px', marginTop: '50px' }}>
        <div className="card">
          <h2>Access Denied</h2>
          <p style={{ marginTop: '10px', color: '#dc3545' }}>
            You do not have permission to access this page. Admin privileges required.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

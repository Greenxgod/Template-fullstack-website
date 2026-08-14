import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '600px', margin: '50px auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Dashboard</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Welcome, {user?.username}!</h3>
          <p style={{ color: '#666', marginTop: '10px' }}>
            You have successfully logged in. This is your protected dashboard.
          </p>
        </div>

        <div style={{ 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h4 style={{ marginBottom: '10px' }}>User Information:</h4>
          <p><strong>ID:</strong> {user?.id}</p>
          <p><strong>Username:</strong> {user?.username}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

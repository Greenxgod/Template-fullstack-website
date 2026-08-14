import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" style={{ background: '#2c3e50' }}>
      <Link to="/" className="navbar-brand" style={{ color: 'white' }}>
        🔐 Admin Panel
      </Link>
      
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            <span style={{ color: '#bdc3c7' }}>
              {user?.username} ({user?.role})
            </span>
            <Link to="/users" style={{ color: 'white' }}>Users</Link>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

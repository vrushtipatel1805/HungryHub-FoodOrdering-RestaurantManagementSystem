import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  const adminRoles = ['admin', 'super_admin', 'manager', 'staff'];
  if (!user || user.name === 'Guest' || !adminRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;

}

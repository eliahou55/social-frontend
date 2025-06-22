import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


interface Payload { exp: number }   // on ne lit que la date d’expiration

function isTokenValid() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const { exp } = jwtDecode<Payload>(token);
    return exp * 1000 > Date.now(); // pas expiré
  } catch {
    return false;
  }
}

export default function PrivateRoute() {
  return isTokenValid() ? <Outlet /> : <Navigate to="/login" replace />;
}

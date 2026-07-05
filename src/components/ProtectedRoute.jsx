import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const sessionString = localStorage.getItem('mp_session');
  let session = null;
  try {
    session = sessionString ? JSON.parse(sessionString) : null;
  } catch (e) {
    console.error("Error parsing mp_session:", e);
  }

  if (!session || !session.loggedIn) {
    return <Navigate to="/mp/login" replace />;
  }

  return <Outlet />;
}

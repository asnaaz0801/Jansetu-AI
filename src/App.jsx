import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CitizenPortal from './pages/CitizenPortal';
import { supabase } from './lib/db';
import MpDashboard from './pages/MpDashboard';
import TrackRequest from './pages/TrackRequest';
import SubmitIssue from './pages/SubmitIssue';
import MpLogin from './pages/MpLogin';
import ProtectedRoute from './components/ProtectedRoute';
import MpLayout from './components/MpLayout';
import MpComplaints from './pages/MpComplaints';
import MpComplaintDetails from './pages/MpComplaintDetails';
import MpAnalytics from './pages/MpAnalytics';

function CitizenLayout({ language, setLanguage, fontSize, setFontSize, highContrast, setHighContrast }) {
  return (
    <>
      <Navbar 
        language={language} 
        setLanguage={setLanguage}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </>
  );
}

function MpEntryRedirect() {
  const sessionString = localStorage.getItem('mp_session');
  let session = null;
  try {
    session = sessionString ? JSON.parse(sessionString) : null;
  } catch (e) {
    console.error("Error parsing mp_session in entry redirect:", e);
  }

  if (session && session.loggedIn) {
    return <Navigate to="/mp/dashboard" replace />;
  }
  return <Navigate to="/mp/login" replace />;
}

function SessionManager({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('mp_users')
            .select('*')
            .eq('email', session.user.email.trim().toLowerCase())
            .maybeSingle();

          if (error) {
            console.error("Error fetching MP user data:", error);
            return;
          }

          if (data) {
            const sessionData = {
              loggedIn: true,
              name: data.name,
              email: data.email,
              constituency: data.constituency
            };

            const currentSession = localStorage.getItem('mp_session');
            if (!currentSession || currentSession !== JSON.stringify(sessionData)) {
              localStorage.setItem('mp_session', JSON.stringify(sessionData));
              window.dispatchEvent(new Event('mp_session_change'));

              if (!window.location.pathname.startsWith('/mp/') || window.location.pathname === '/mp/login') {
                navigate('/mp/dashboard');
              }
            }
          } else {
            if (localStorage.getItem('mp_session')) {
              localStorage.removeItem('mp_session');
              window.dispatchEvent(new Event('mp_session_change'));
            }
            if (window.location.pathname === '/mp/login') {
              navigate('/');
            }
          }
        } catch (err) {
          console.error("SessionManager error:", err);
        }
      } else {
        if (localStorage.getItem('mp_session')) {
          localStorage.removeItem('mp_session');
          window.dispatchEvent(new Event('mp_session_change'));
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return children;
}

function App() {
  const [language, setLanguage] = useState('en'); // 'en' | 'hi' | 'mr'
  const [fontSize, setFontSize] = useState(16); // font size in px
  const [highContrast, setHighContrast] = useState(false);
  const [mpSession, setMpSession] = useState(() => {
    try {
      const stored = localStorage.getItem('mp_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Track session changes in localStorage across components/pages
  useEffect(() => {
    const handleSessionChange = () => {
      try {
        const stored = localStorage.getItem('mp_session');
        setMpSession(stored ? JSON.parse(stored) : null);
      } catch {
        setMpSession(null);
      }
    };

    window.addEventListener('mp_session_change', handleSessionChange);
    return () => window.removeEventListener('mp_session_change', handleSessionChange);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('mp_session');
    setMpSession(null);
    window.dispatchEvent(new Event('mp_session_change'));
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <Router>
      <SessionManager>
        <div 
          style={{ fontSize: `${fontSize}px` }}
          className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 ${
            highContrast 
              ? 'bg-[#0f172a] text-[#fef08a] selection:bg-[#fef08a] selection:text-black border-yellow-400' 
              : 'bg-[#F5F5F5] text-slate-800 selection:bg-[#000080] selection:text-white'
          }`}
        >
          <div className="flex-1 flex flex-col">
          <Routes>
            {/* Citizen Routes wrapped in CitizenLayout */}
            <Route element={
              <CitizenLayout 
                language={language}
                setLanguage={setLanguage}
                fontSize={fontSize}
                setFontSize={setFontSize}
                highContrast={highContrast}
                setHighContrast={setHighContrast}
              />
            }>
              <Route path="/" element={
                <CitizenPortal 
                  language={language}
                  fontSize={fontSize}
                  highContrast={highContrast}
                />
              } />
              <Route path="/submit" element={
                <SubmitIssue 
                  language={language}
                  fontSize={fontSize}
                  highContrast={highContrast}
                />
              } />
              <Route path="/track" element={
                <TrackRequest 
                  language={language}
                  fontSize={fontSize}
                  highContrast={highContrast}
                />
              } />
              <Route path="/track/:id" element={
                <TrackRequest 
                  language={language}
                  fontSize={fontSize}
                  highContrast={highContrast}
                />
              } />
            </Route>

            {/* MP Dedicated Entry Redirect Route */}
            <Route path="/mp" element={<MpEntryRedirect />} />

            {/* MP Login Route (No Navbar) */}
            <Route path="/mp/login" element={
              <MpLogin 
                language={language}
                highContrast={highContrast}
              />
            } />

            {/* Protected MP Routes (No Citizen Navbar) */}
            <Route element={<ProtectedRoute />}>
              <Route element={
                <MpLayout 
                  mpSession={mpSession}
                  onLogout={handleLogout}
                  language={language}
                  highContrast={highContrast}
                />
              }>
                <Route path="/mp/dashboard" element={
                  <MpDashboard 
                    language={language}
                    fontSize={fontSize}
                    highContrast={highContrast}
                    mpSession={mpSession}
                    onLogout={handleLogout}
                  />
                } />
                <Route path="/mp/complaints" element={
                  <MpComplaints 
                    highContrast={highContrast}
                  />
                } />
                <Route path="/mp/complaints/:referenceCode" element={
                  <MpComplaintDetails 
                    highContrast={highContrast}
                  />
                } />
                <Route path="/mp/analytics" element={
                  <MpAnalytics 
                    language={language}
                    highContrast={highContrast}
                  />
                } />
              </Route>
            </Route>

            {/* Legacy redirect */}
            <Route path="/dashboard" element={<Navigate to="/mp/dashboard" replace />} />
          </Routes>
          </div>
        </div>
      </SessionManager>
    </Router>
  );
}

export default App;

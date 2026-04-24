import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import { BroadcastProvider } from './context/BroadcastContext';
import Logo from './components/common/Logo';

// Auth pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import CreateAlertPage from './pages/citizen/CreateAlertPage';
import AlertHistoryPage from './pages/citizen/AlertHistoryPage';
import ProfilePage from './pages/citizen/ProfilePage';
import NearbyFacilitiesPage from './pages/citizen/NearbyFacilitiesPage';

// Responder pages
import ResponderDashboard from './pages/responder/ResponderDashboard';
import ActiveAlertsPage from './pages/responder/ActiveAlertsPage';
import MapPage from './pages/responder/MapPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminStatsPage from './pages/admin/AdminStatsPage';
import AdminFacilitiesPage from './pages/admin/AdminFacilitiesPage';

// Service pages
import PoliceDashboard from './pages/police/PoliceDashboard';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import FireDashboard from './pages/fire/FireDashboard';
import ServiceAdminPage from './pages/admin/ServiceAdminPage';

const roleDashboard: Record<string, string> = {
  citizen: '/citizen/dashboard',
  responder: '/responder/dashboard',
  admin: '/admin/dashboard',
  admin_police: '/admin-police/dashboard',
  admin_hospital: '/admin-hospital/dashboard',
  admin_fire: '/admin-fire/dashboard',
  police: '/police/dashboard',
  hospital: '/hospital/dashboard',
  fire: '/fire/dashboard',
};

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 18, background: 'linear-gradient(135deg, #f6f9fc 0%, #e0f7fa 100%)' }}>
      <div style={{ position: 'relative', width: 56, height: 56 }}>
        <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(0,150,199,0.12)', borderTopColor: '#0096C7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo size={44} shadow={false} /></div>
      </div>
      <p style={{ color: '#475569', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>Chargement</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function PrivateRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to={roleDashboard[user.role] || '/'} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && user) {
    return <Navigate to={roleDashboard[user.role] || '/'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
    <Routes location={location}>
      {/* Public */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Citizen routes */}
      <Route path="/citizen/dashboard" element={<PrivateRoute roles={['citizen']}><CitizenDashboard /></PrivateRoute>} />
      <Route path="/citizen/nearby" element={<PrivateRoute roles={['citizen']}><NearbyFacilitiesPage /></PrivateRoute>} />
      <Route path="/citizen/alert" element={<PrivateRoute roles={['citizen']}><CreateAlertPage /></PrivateRoute>} />
      <Route path="/citizen/history" element={<PrivateRoute roles={['citizen']}><AlertHistoryPage /></PrivateRoute>} />
      <Route path="/citizen/profile" element={<PrivateRoute roles={['citizen']}><ProfilePage /></PrivateRoute>} />

      {/* Responder routes */}
      <Route path="/responder/dashboard" element={<PrivateRoute roles={['responder']}><ResponderDashboard /></PrivateRoute>} />
      <Route path="/responder/alerts" element={<PrivateRoute roles={['responder']}><ActiveAlertsPage /></PrivateRoute>} />
      <Route path="/responder/map" element={<PrivateRoute roles={['responder']}><MapPage /></PrivateRoute>} />
      <Route path="/responder/profile" element={<PrivateRoute roles={['responder']}><ProfilePage /></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/alerts" element={<PrivateRoute roles={['admin']}><AdminAlertsPage /></PrivateRoute>} />
      <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><AdminUsersPage /></PrivateRoute>} />
      <Route path="/admin/facilities" element={<PrivateRoute roles={['admin']}><AdminFacilitiesPage /></PrivateRoute>} />
      <Route path="/admin/stats" element={<PrivateRoute roles={['admin']}><AdminStatsPage /></PrivateRoute>} />

      {/* Service Admin routes */}
      <Route path="/admin-police/dashboard" element={<PrivateRoute roles={['admin_police']}><ServiceAdminPage /></PrivateRoute>} />
      <Route path="/admin-police/profile" element={<PrivateRoute roles={['admin_police']}><ProfilePage /></PrivateRoute>} />
      <Route path="/admin-hospital/dashboard" element={<PrivateRoute roles={['admin_hospital']}><ServiceAdminPage /></PrivateRoute>} />
      <Route path="/admin-hospital/profile" element={<PrivateRoute roles={['admin_hospital']}><ProfilePage /></PrivateRoute>} />
      <Route path="/admin-fire/dashboard" element={<PrivateRoute roles={['admin_fire']}><ServiceAdminPage /></PrivateRoute>} />
      <Route path="/admin-fire/profile" element={<PrivateRoute roles={['admin_fire']}><ProfilePage /></PrivateRoute>} />

      {/* Police routes */}
      <Route path="/police/dashboard" element={<PrivateRoute roles={['police']}><PoliceDashboard /></PrivateRoute>} />
      <Route path="/police/incidents" element={<PrivateRoute roles={['police']}><PoliceDashboard /></PrivateRoute>} />
      <Route path="/police/profile" element={<PrivateRoute roles={['police']}><ProfilePage /></PrivateRoute>} />

      {/* Hospital routes */}
      <Route path="/hospital/dashboard" element={<PrivateRoute roles={['hospital']}><HospitalDashboard /></PrivateRoute>} />
      <Route path="/hospital/urgences" element={<PrivateRoute roles={['hospital']}><HospitalDashboard /></PrivateRoute>} />
      <Route path="/hospital/profile" element={<PrivateRoute roles={['hospital']}><ProfilePage /></PrivateRoute>} />

      {/* Fire routes */}
      <Route path="/fire/dashboard" element={<PrivateRoute roles={['fire']}><FireDashboard /></PrivateRoute>} />
      <Route path="/fire/interventions" element={<PrivateRoute roles={['fire']}><FireDashboard /></PrivateRoute>} />
      <Route path="/fire/profile" element={<PrivateRoute roles={['fire']}><ProfilePage /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <BroadcastProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                padding: '12px 16px',
              },
              success: { style: { background: '#f0fff4', color: '#2f855a', border: '1px solid #c6f6d5' } },
              error: { style: { background: '#fff5f5', color: '#c53030', border: '1px solid #feb2b2' } },
            }}
          />
          </BroadcastProvider>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

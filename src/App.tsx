import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Devotions from './pages/Devotions';
import Resources from './pages/Resources';
import Give from './pages/Give';
import Prayer from './pages/Prayer';
import AdminDashboard from './pages/Admin/Dashboard';
import PaymentCallback from './pages/PaymentCallback';
import Login from './pages/Admin/Login';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthenticated(true);
      } else {
        navigate('/login', { replace: true });
      }
      setLoading(false);
    });
  }, [navigate]);

  if (loading) return null;
  return authenticated ? <>{children}</> : null;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - Protected */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<Login />} />
        {/* Payment Callback */}
        <Route path="/payment/callback" element={<PaymentCallback />} />
        {/* Public Routes with Layout */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/devotions" element={<Devotions />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/give" element={<Give />} />
              <Route path="/prayer" element={<Prayer />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
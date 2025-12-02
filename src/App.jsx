import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/Login/LoginForm';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import UpdatePrompt from './components/UpdatePrompt/UpdatePrompt';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Productos from './pages/Productos';
import Pedidos from './pages/Pedidos';
import Marketplace from './pages/Marketplace';
import Social from './pages/Social';
import Proveedores from './pages/Proveedores';
import Compras from './pages/Compras';
import AsistenteIA from './pages/AsistenteIA';
import './styles/global.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <UpdatePrompt />
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Usuarios />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/productos"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Productos />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/pedidos"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Pedidos />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/marketplace"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Marketplace />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/social"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Social />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/proveedores"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Proveedores />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/compras"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Compras />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/asistente"
            element={
              <PrivateRoute>
                <AppLayout>
                  <AsistenteIA />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
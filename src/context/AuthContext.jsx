import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/Auth/login', { email, password });
      
      if (response.data.success) {
        const { token, usuario } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(usuario));
        setUser(usuario);
        return { success: true };
      }
      
      return { 
        success: false, 
        message: response.data.message || 'Error al iniciar sesión' 
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = () => {
    return user?.rol === 'Admin' || user?.esAdmin === true;
  };

  const isLoggedIn = () => {
    return !!user && !!localStorage.getItem('token');
  };

  const canDeleteUser = (targetUserId) => {
    // El usuario puede eliminar su propia cuenta o si es Admin
    if (isAdmin()) return true;
    if (user?.userID === targetUserId) return true;
    return false;
  };

  const canEditUser = (targetUserId) => {
    // El usuario puede editar su perfil o si es Admin
    if (isAdmin()) return true;
    if (user?.userID === targetUserId) return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      isAdmin,            
      isLoggedIn,        
      canDeleteUser,     
      canEditUser,       
      esAdmin: isAdmin() 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};
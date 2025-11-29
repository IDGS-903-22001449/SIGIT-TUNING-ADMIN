import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth(); 
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        
        const userData = JSON.parse(localStorage.getItem('user'));

        if (userData && userData.rol !== 'Admin') {
            setError('Acceso denegado. Esta web es solo para Administradores. Usa la App Android.');
            logout(); 
            setLoading(false); 
            return; 
        }

        navigate('/dashboard'); 
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al iniciar sesión');
    } finally {
      if (error) setLoading(false); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-icon">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#00BCD4" strokeWidth="2"/>
            <path d="M2 17L12 22L22 17" stroke="#00BCD4" strokeWidth="2"/>
            <path d="M2 12L12 17L22 12" stroke="#00BCD4" strokeWidth="2"/>
          </svg>
        </div>
        
        <h1>ADMIN LOGIN</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Aquí se mostrará el mensaje de error si intenta entrar un usuario normal */}
          {error && <div className="error-message" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'VERIFICANDO...' : 'LOG IN'}
          </button>

          <a href="#" className="forgot-password">Forgot password?</a>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
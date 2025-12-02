import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../Icons/Icons';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      logout();
      navigate('/login');
    }
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const menuItems = [
    { path: '/dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
    { path: '/usuarios', icon: Icons.Users, label: 'Usuarios' },
    { path: '/productos', icon: Icons.Package, label: 'Productos' },
    { path: '/pedidos', icon: Icons.ShoppingCart, label: 'Pedidos' },
    { path: '/marketplace', icon: Icons.Store, label: 'Marketplace' },
    { path: '/social', icon: Icons.Activity, label: 'Social' },
    { path: '/proveedores', icon: Icons.Store, label: 'Proveedores' },
    { path: '/compras', icon: Icons.ShoppingCart, label: 'Compras' },
    { path: '/asistente', icon: Icons.Bot, label: 'Asistente IA' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Icons.Package />
        </div>
        <h2>SigitTuning</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="sidebar-icon">
              <item.icon />
            </span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <Icons.LogOut />
          <span>Salir</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
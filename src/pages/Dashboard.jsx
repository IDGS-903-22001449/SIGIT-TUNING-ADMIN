import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProductos: 0,
    totalPedidos: 0,
    totalPublicaciones: 0,
    totalConsultas: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Obtener productos
      const productsRes = await api.get('/Products');
      const productos = productsRes.data.success ? productsRes.data.data : [];

      // Obtener publicaciones sociales
      const socialRes = await api.get('/Social/posts');
      const publicaciones = socialRes.data.success ? socialRes.data.data : [];

      // Obtener consultas IA
      const consultasRes = await api.get('/Assistant/history');
      const consultas = consultasRes.data.success ? consultasRes.data.data : [];

      // Obtener marketplace
      const marketplaceRes = await api.get('/Marketplace/listings');
      const listings = marketplaceRes.data.success ? marketplaceRes.data.data : [];

      setStats({
        totalProductos: productos.length,
        totalPedidos: 0,
        totalPublicaciones: publicaciones.length + listings.length,
        totalConsultas: consultas.length
      });

      // Actividad reciente
      const activities = [
        ...publicaciones.slice(0, 3).map(p => ({
          tipo: 'social',
          icono: Icons.Activity,
          texto: `Nueva publicación: ${p.titulo || p.descripcion?.substring(0, 50)}`,
          fecha: p.fechaPublicacion
        })),
        ...consultas.slice(0, 2).map(c => ({
          tipo: 'consulta',
          icono: Icons.Bot,
          texto: `Consulta IA: ${c.problemaDescrito?.substring(0, 50)}...`,
          fecha: c.fechaConsulta
        })),
        ...listings.slice(0, 2).map(l => ({
          tipo: 'marketplace',
          icono: Icons.Store,
          texto: `Nueva venta en marketplace: ${l.titulo}`,
          fecha: l.fechaPublicacion
        }))
      ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 6);

      setRecentActivity(activities);

    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon products">
            <Icons.Package />
          </div>
          <div className="stat-content">
            <h3>Productos</h3>
            <p className="stat-number">{stats.totalProductos}</p>
            <span className="stat-trend positive">
              <Icons.TrendingUp />
              En inventario
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <Icons.ShoppingCart />
          </div>
          <div className="stat-content">
            <h3>Pedidos</h3>
            <p className="stat-number">{stats.totalPedidos}</p>
            <span className="stat-trend neutral">Total histórico</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon social">
            <Icons.Activity />
          </div>
          <div className="stat-content">
            <h3>Publicaciones</h3>
            <p className="stat-number">{stats.totalPublicaciones}</p>
            <span className="stat-trend positive">
              <Icons.TrendingUp />
              Social + Marketplace
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ai">
            <Icons.Bot />
          </div>
          <div className="stat-content">
            <h3>Consultas IA</h3>
            <p className="stat-number">{stats.totalConsultas}</p>
            <span className="stat-trend positive">
              <Icons.TrendingUp />
              Asistente utilizado
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="recent-orders card">
          <h2>
            <Icons.Activity />
            Actividad Reciente
          </h2>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="empty-state">No hay actividad reciente</p>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className={`activity-icon ${activity.tipo}`}>
                    <activity.icono />
                  </span>
                  <div className="activity-info">
                    <p>{activity.texto}</p>
                    <span className="activity-date">
                      {new Date(activity.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-actions card">
          <h2>
            <Icons.Settings />
            Acciones Rápidas
          </h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => window.location.href = '/productos'}>
              <Icons.Plus />
              <span>Agregar Producto</span>
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/social'}>
              <Icons.Activity />
              <span>Ver Social</span>
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/marketplace'}>
              <Icons.Store />
              <span>Marketplace</span>
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/asistente'}>
              <Icons.Bot />
              <span>Asistente IA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
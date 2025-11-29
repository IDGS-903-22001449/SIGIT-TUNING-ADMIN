import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './AsistenteIA.css';

const AsistenteIA = () => {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    productos: 0
  });

  useEffect(() => {
    fetchConsultas();
  }, []);

  const fetchConsultas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Obteniendo historial de consultas...');
      const response = await api.get('/Assistant/history');
      
      console.log('📊 Respuesta del servidor:', response.data);

      if (response.data.success) {
        const consultasData = response.data.data || [];
        setConsultas(consultasData);
        
        // Calcular estadísticas
        const hoy = consultasData.filter(c => {
          const today = new Date().toDateString();
          return new Date(c.fechaConsulta).toDateString() === today;
        }).length;

        const totalProductos = consultasData.reduce(
          (sum, c) => sum + (c.totalProductosSugeridos || 0), 
          0
        );

        setStats({
          total: consultasData.length,
          hoy: hoy,
          productos: totalProductos
        });

        console.log('✅ Consultas cargadas:', {
          total: consultasData.length,
          hoy,
          productos: totalProductos
        });
      } else {
        throw new Error(response.data.message || 'Error al obtener consultas');
      }
    } catch (error) {
      console.error('❌ Error al obtener consultas:', error);
      setError(error.response?.data?.message || error.message || 'Error al cargar datos');
      
      // Si hay error, mostrar datos vacíos
      setConsultas([]);
      setStats({ total: 0, hoy: 0, productos: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando historial del asistente...</p>
      </div>
    );
  }

  return (
    <div className="asistente-page">
      <div className="page-header">
        <h1 className="page-title">
          <Icons.Bot />
          Asistente IA - Historial de Consultas
        </h1>
        <button className="btn-refresh" onClick={fetchConsultas} disabled={loading}>
          <Icons.Activity />
          Refrescar
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <Icons.Activity />
          <div>
            <strong>Error:</strong> {error}
            <button onClick={fetchConsultas}>Reintentar</button>
          </div>
        </div>
      )}

      <div className="asistente-stats">
        <div className="stat-card-small">
          <Icons.Bot />
          <div>
            <h3>Total Consultas</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Activity />
          <div>
            <h3>Consultas Hoy</h3>
            <p className="stat-number">{stats.hoy}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Package />
          <div>
            <h3>Productos Sugeridos</h3>
            <p className="stat-number">{stats.productos}</p>
          </div>
        </div>
      </div>

      {consultas.length === 0 ? (
        <div className="empty-state-card">
          <Icons.Bot />
          <h3>No hay consultas al asistente IA</h3>
          <p>
            Las consultas de diagnóstico de los usuarios aparecerán aquí.
            {!error && ' Los usuarios deben usar el asistente desde la app móvil.'}
          </p>
          {error && (
            <button className="btn-primary" onClick={fetchConsultas}>
              <Icons.Activity />
              Reintentar
            </button>
          )}
        </div>
      ) : (
        <div className="consultas-list">
          {consultas.map((consulta) => (
            <div key={consulta.consultationID} className="consulta-card">
              <div className="consulta-header">
                <span className="consulta-id">
                  <Icons.Bot />
                  Consulta #{consulta.consultationID}
                </span>
                <span className="consulta-fecha">
                  <Icons.Activity />
                  {new Date(consulta.fechaConsulta).toLocaleString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div className="consulta-content">
                <div className="problema-section">
                  <h4>
                    <Icons.Activity />
                    Problema Descrito:
                  </h4>
                  <p>{consulta.problemaDescrito}</p>
                </div>

                {consulta.imagenURL && (
                  <div className="consulta-imagen">
                    <img 
                      src={consulta.imagenURL} 
                      alt="Imagen del problema" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="respuesta-section">
                  <h4>
                    <Icons.Bot />
                    Respuesta IA:
                  </h4>
                  <p style={{ whiteSpace: 'pre-wrap' }}>
                    {consulta.respuestaIA}
                  </p>
                </div>

                {consulta.totalProductosSugeridos > 0 && (
                  <div className="productos-sugeridos">
                    <Icons.Package />
                    <span className="badge-sugeridos">
                      {consulta.totalProductosSugeridos} productos sugeridos
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AsistenteIA;
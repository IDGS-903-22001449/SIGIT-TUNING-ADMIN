import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Pedidos.css';

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstatus, setFiltroEstatus] = useState('Todos');

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      // 👇 CAMBIA ESTA LÍNEA - USA EL ENDPOINT DE ADMIN
      const response = await api.get('/Orders/admin/all');
      
      if (response.data.success) {
        setPedidos(response.data.data);
        console.log('✅ Pedidos cargados:', response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Error al obtener pedidos:', error);
      alert('Error al cargar pedidos: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstatus = async (orderId, nuevoEstatus, numeroSeguimiento = '') => {
    try {
      const response = await api.put(`/Orders/${orderId}/status`, {
        estatus: nuevoEstatus,
        numeroSeguimiento: numeroSeguimiento || undefined
      });

      if (response.data.success) {
        alert('✅ Estatus actualizado exitosamente');
        fetchPedidos(); // Recargar lista
      }
    } catch (error) {
      console.error('❌ Error al actualizar estatus:', error);
      alert('Error al actualizar el estatus: ' + (error.response?.data?.message || error.message));
    }
  };

  const estatusOpciones = [
    'Todos',
    'Pendiente',
    'Empacando',
    'Enviado',
    'En Tránsito',
    'Entregado',
    'Cancelado'
  ];

  const pedidosFiltrados = filtroEstatus === 'Todos'
    ? pedidos
    : pedidos.filter(p => p.estatus === filtroEstatus);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="pedidos-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Pedidos</h1>
        <button className="btn-refresh" onClick={fetchPedidos}>
          <Icons.Activity />
          Actualizar
        </button>
      </div>

      <div className="filter-tabs">
        {estatusOpciones.map((estatus) => (
          <button
            key={estatus}
            className={`filter-tab ${filtroEstatus === estatus ? 'active' : ''}`}
            onClick={() => setFiltroEstatus(estatus)}
          >
            {estatus}
            {estatus !== 'Todos' && (
              <span className="count">
                {pedidos.filter(p => p.estatus === estatus).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {pedidosFiltrados.length === 0 ? (
        <div className="empty-state-card">
          <Icons.ShoppingCart />
          <h3>No hay pedidos {filtroEstatus !== 'Todos' ? `en estado "${filtroEstatus}"` : ''}</h3>
          <p>Los pedidos de todos los usuarios aparecerán aquí</p>
        </div>
      ) : (
        <div className="pedidos-grid">
          {pedidosFiltrados.map((pedido) => (
            <div key={pedido.orderID} className="pedido-card">
              <div className="pedido-header">
                <span className="pedido-id">
                  <Icons.Package />
                  Pedido #{pedido.orderID}
                </span>
                <span className={`estatus-badge ${pedido.estatus.toLowerCase().replace(' ', '-')}`}>
                  {pedido.estatus}
                </span>
              </div>

              {/* 👇 INFORMACIÓN DEL CLIENTE */}
              <div className="cliente-info">
                <p className="cliente-nombre">
                  <Icons.Users />
                  <strong>{pedido.usuarioNombre || `Usuario #${pedido.userID}`}</strong>
                </p>
                {pedido.usuarioEmail && (
                  <p className="cliente-email">
                    📧 {pedido.usuarioEmail}
                  </p>
                )}
              </div>

              <div className="pedido-info">
                <p>
                  <Icons.Activity />
                  <strong>Fecha:</strong> {new Date(pedido.fechaPedido).toLocaleString('es-MX')}
                </p>
                <p>
                  <Icons.DollarSign />
                  <strong>Total:</strong> ${pedido.total.toFixed(2)} MXN
                </p>
                <p>
                  <Icons.Store />
                  <strong>Dirección:</strong> {pedido.direccionEnvio}
                </p>
                {pedido.numeroSeguimiento && (
                  <p>
                    <Icons.Activity />
                    <strong>Seguimiento:</strong> {pedido.numeroSeguimiento}
                  </p>
                )}
                <p className="productos-count">
                  📦 {pedido.detalles.length} producto(s)
                </p>
              </div>

              <div className="pedido-actions">
                <label>Cambiar estatus:</label>
                <select
                  value={pedido.estatus}
                  onChange={(e) => actualizarEstatus(pedido.orderID, e.target.value)}
                  className="select-estatus"
                >
                  <option value="Pendiente">⏳ Pendiente</option>
                  <option value="Empacando">📦 Empacando</option>
                  <option value="Enviado">🚚 Enviado</option>
                  <option value="En Tránsito">🛣️ En Tránsito</option>
                  <option value="Entregado">✅ Entregado</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              {/* Detalles expandibles */}
              <details className="pedido-detalles">
                <summary>Ver productos ({pedido.detalles.length})</summary>
                <ul>
                  {pedido.detalles.map((detalle) => (
                    <li key={detalle.orderDetailID}>
                      <span className="producto-nombre">{detalle.productoNombre}</span>
                      <span className="producto-cantidad">x{detalle.cantidad}</span>
                      <span className="producto-precio">${detalle.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pedidos;
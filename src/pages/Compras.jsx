import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Proveedores.css'; 

const Compras = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const fetchOrdenes = async () => {
    try {
      const response = await api.get('/PurchaseOrders');
      if (response.data.success) {
        setOrdenes(response.data.data);
      }
    } catch (error) {
      console.error("Error cargando órdenes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecibirTodo = async (orden) => {
    if (!confirm(`¿Confirmar recepción de la orden ${orden.numeroOrden}? \n\nEsto aumentará el STOCK de los productos automáticamente.`)) return;

    try {
      const payload = {
        Items: orden.detalles.map(d => ({
          PurchaseOrderDetailID: d.purchaseOrderDetailID,
          CantidadRecibida: d.cantidad 
        }))
      };

      const response = await api.put(`/PurchaseOrders/${orden.purchaseOrderID}/receive`, payload);
      
      if (response.data.success) {
        alert('✅ Mercancía recibida correctamente. El stock ha sido actualizado.');
        fetchOrdenes();   
      }
    } catch (error) {
      console.error(error);
      alert('Error al recibir la orden: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="proveedores-page">
      <div className="page-header">
        <h1 className="page-title">Historial de Compras</h1>
      </div>

      <div className="table-responsive" style={{backgroundColor: '#1e1e1e', borderRadius: '12px', border: '1px solid #333'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', color: 'white'}}>
          <thead style={{backgroundColor: '#252525'}}>
            <tr>
              <th style={{padding: '15px', textAlign: 'left', color: '#b0b0b0'}}>Orden #</th>
              <th style={{padding: '15px', textAlign: 'left', color: '#b0b0b0'}}>Proveedor</th>
              <th style={{padding: '15px', textAlign: 'left', color: '#b0b0b0'}}>Fecha</th>
              <th style={{padding: '15px', textAlign: 'left', color: '#b0b0b0'}}>Total</th>
              <th style={{padding: '15px', textAlign: 'center', color: '#b0b0b0'}}>Estatus</th>
              <th style={{padding: '15px', textAlign: 'center', color: '#b0b0b0'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.purchaseOrderID} style={{borderBottom: '1px solid #333'}}>
                <td style={{padding: '15px', color: '#00BCD4', fontWeight: 'bold'}}>{orden.numeroOrden}</td>
                <td style={{padding: '15px'}}>{orden.proveedorNombre}</td>
                <td style={{padding: '15px'}}>{new Date(orden.fechaOrden).toLocaleDateString()}</td>
                <td style={{padding: '15px', color: '#4caf50', fontWeight: 'bold'}}>${orden.total.toFixed(2)}</td>
                <td style={{padding: '15px', textAlign: 'center'}}>
                  <span style={{
                      padding: '5px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      backgroundColor: orden.estatus === 'Recibida' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)',
                      color: orden.estatus === 'Recibida' ? '#4caf50' : '#ff9800'
                  }}>
                    {orden.estatus}
                  </span>
                </td>
                <td style={{padding: '15px', textAlign: 'center'}}>
                  {/* Botón visible SOLO si está Pendiente */}
                  {orden.estatus === 'Pendiente' && (
                    <button 
                      className="btn btn-primary" 
                      style={{padding: '6px 12px', fontSize: '0.85rem', width: 'auto', display: 'inline-flex'}}
                      onClick={() => handleRecibirTodo(orden)}
                    >
                      <Icons.Package style={{width: '16px', marginRight: '5px'}}/> Recibir
                    </button>
                  )}
                  {orden.estatus === 'Recibida' && (
                    <span style={{color: '#666', fontSize: '0.9rem'}}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {ordenes.length === 0 && (
            <div style={{textAlign: 'center', padding: '50px', color: '#666'}}>
                <Icons.ShoppingCart style={{width: '50px', height: '50px', marginBottom: '10px', opacity: 0.5}} />
                <p>No hay órdenes de compra registradas.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Compras;
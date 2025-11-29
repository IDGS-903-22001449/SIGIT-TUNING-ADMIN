import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { Icons } from './Icons/Icons';
import '../pages/Proveedores.css'; 

const OrdenCompraModal = ({ supplier, onClose }) => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [linea, setLinea] = useState({ productID: '', cantidad: 1, costo: '' });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/Products');
        if (res.data.success) setProductos(res.data.data);
      } catch (error) {
        console.error("Error cargando productos", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddLine = () => {
    if (!linea.productID) return alert('Selecciona un producto');
    if (!linea.cantidad || linea.cantidad <= 0) return alert('Cantidad inválida');
    if (!linea.costo || linea.costo <= 0) return alert('Costo inválido');

    const prod = productos.find(p => p.productID === parseInt(linea.productID));
    
    const nuevoItem = {
      productID: parseInt(linea.productID),
      nombre: prod.nombre,
      cantidad: parseInt(linea.cantidad),
      costo: parseFloat(linea.costo),
      subtotal: parseInt(linea.cantidad) * parseFloat(linea.costo)
    };

    setCarrito([...carrito, nuevoItem]);
    setLinea({ productID: '', cantidad: 1, costo: '' }); // Limpiar inputs
  };

  const handleConfirmar = async () => {
    if (carrito.length === 0) return alert('Agrega al menos un producto a la orden');

    try {
      // 🔹 ESTRUCTURA EXACTA PARA TU DTO: CreatePurchaseOrderDto
      const payload = {
        SupplierID: supplier.supplierID,
        FechaEntregaEsperada: new Date().toISOString(), // Fecha de hoy como ejemplo
        Notas: "Pedido generado desde Web App",
        Items: carrito.map(item => ({
          ProductID: item.productID,
          Cantidad: item.cantidad,
          PrecioUnitario: item.costo // Tu DTO usa "PrecioUnitario"
        }))
      };

      const res = await api.post('/PurchaseOrders', payload);
      
      if (res.data.success) {
        alert('✅ Orden de compra creada exitosamente');
        onClose(); // Cerrar modal
      }
    } catch (error) {
      console.error(error);
      alert('Error al crear la orden: ' + (error.response?.data?.message || 'Error desconocido'));
    }
  };

  const totalOrden = carrito.reduce((sum, item) => sum + item.subtotal, 0);

  if (loading) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{maxWidth: '800px'}}>
        <div className="modal-header">
          <h2>Nueva Orden a: <span style={{color: '#00BCD4'}}>{supplier.nombre}</span></h2>
          <button className="modal-close" onClick={onClose}><Icons.Close /></button>
        </div>

        {/* Formulario para agregar producto */}
        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
          <div className="form-group">
            <label>Producto</label>
            <select 
              value={linea.productID} 
              onChange={e => setLinea({...linea, productID: e.target.value})}
            >
              <option value="">-- Seleccionar --</option>
              {productos.map(p => (
                <option key={p.productID} value={p.productID}>
                   {p.nombre} (Stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad</label>
            <input type="number" value={linea.cantidad} onChange={e => setLinea({...linea, cantidad: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Costo Unit. ($)</label>
            <input type="number" value={linea.costo} onChange={e => setLinea({...linea, costo: e.target.value})} placeholder="0.00" />
          </div>
          <div className="form-group">
            <button className="btn btn-primary" onClick={handleAddLine} style={{height: '42px', marginTop: '0'}}>
              <Icons.Plus />
            </button>
          </div>
        </div>

        {/* Tabla del carrito */}
        <div className="table-container" style={{maxHeight: '300px', overflowY: 'auto'}}>
            <table style={{width: '100%', color: 'white', borderCollapse: 'collapse'}}>
                <thead style={{background: '#2d2d2d', position: 'sticky', top: 0}}>
                    <tr>
                        <th style={{padding: '10px', textAlign: 'left'}}>Producto</th>
                        <th style={{textAlign: 'center'}}>Cant.</th>
                        <th style={{textAlign: 'right'}}>Costo</th>
                        <th style={{textAlign: 'right'}}>Subtotal</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {carrito.map((item, idx) => (
                        <tr key={idx} style={{borderBottom: '1px solid #333'}}>
                            <td style={{padding: '10px'}}>{item.nombre}</td>
                            <td style={{textAlign: 'center'}}>{item.cantidad}</td>
                            <td style={{textAlign: 'right'}}>${item.costo.toFixed(2)}</td>
                            <td style={{textAlign: 'right', color: '#4caf50'}}>${item.subtotal.toFixed(2)}</td>
                            <td style={{textAlign: 'center'}}>
                                <button className="btn-icon delete" onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))}>
                                    <Icons.Trash />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {carrito.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                Agrega productos a la lista
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer con Total y Botones */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #333'}}>
            <h3 style={{margin: 0}}>Total Orden: <span style={{color: '#00BCD4', fontSize: '1.4rem'}}>${totalOrden.toFixed(2)}</span></h3>
            <div className="modal-actions" style={{margin: 0, border: 'none'}}>
                <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleConfirmar}>
                    <Icons.ShoppingCart /> Confirmar Pedido
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrdenCompraModal;
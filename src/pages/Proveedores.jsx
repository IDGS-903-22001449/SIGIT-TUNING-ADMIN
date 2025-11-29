import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import OrdenCompraModal from '../components/OrdenCompraModal'; 
import './Proveedores.css';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [filterTipo, setFilterTipo] = useState('Todos');

  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedSupplierForOrder, setSelectedSupplierForOrder] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    razonSocial: '',
    rfc: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    tipoProveedor: 'Piezas Terminadas',
    notas: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Suppliers');
      if (response.data.success) {
        setProveedores(response.data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica del CRUD de Proveedores ---

  const handleOpenModal = (proveedor = null) => {
    if (proveedor) {
      setEditingSupplier(proveedor);
      setFormData({
        nombre: proveedor.nombre,
        razonSocial: proveedor.razonSocial || '',
        rfc: proveedor.rfc || '',
        email: proveedor.email || '',
        telefono: proveedor.telefono || '',
        direccion: proveedor.direccion || '',
        ciudad: proveedor.ciudad || '',
        estado: proveedor.estado || '',
        codigoPostal: proveedor.codigoPostal || '',
        tipoProveedor: proveedor.tipoProveedor,
        notas: proveedor.notas || ''
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        nombre: '',
        razonSocial: '',
        rfc: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        estado: '',
        codigoPostal: '',
        tipoProveedor: 'Piezas Terminadas',
        notas: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return alert('El nombre es requerido');

    try {
      if (editingSupplier) {
        const response = await api.put(`/Suppliers/${editingSupplier.supplierID}`, formData);
        if (response.data.success) {
          alert('Proveedor actualizado');
          fetchProveedores();
          handleCloseModal();
        }
      } else {
        const response = await api.post('/Suppliers', formData);
        if (response.data.success) {
          alert('Proveedor creado');
          fetchProveedores();
          handleCloseModal();
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar proveedor?')) return;
    try {
      await api.delete(`/Suppliers/${id}`);
      fetchProveedores();
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  // --- Filtrado ---
  const proveedoresFiltrados = proveedores.filter(prov => {
    const coincideNombre = prov.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           prov.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const coincideTipo = filterTipo === 'Todos' || prov.tipoProveedor === filterTipo;
    return coincideNombre && coincideTipo;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="proveedores-page">
      <div className="page-header">
        <h1 className="page-title">Directorio de Proveedores</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Icons.Plus /> <span>Nuevo Proveedor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="proveedores-stats">
        <div className="stat-card-small">
          <Icons.Store />
          <div>
            <h3>Total</h3>
            <p className="stat-number">{proveedores.length}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Package />
          <div>
            <h3>Piezas</h3>
            <p className="stat-number">{proveedores.filter(p => p.tipoProveedor === 'Piezas Terminadas').length}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Settings />
          <div>
            <h3>Materia Prima</h3>
            <p className="stat-number">{proveedores.filter(p => p.tipoProveedor === 'Materia Prima').length}</p>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="filters-section">
        <div className="search-box">
            <div className="search-icon"><Icons.Search /></div>
            <input 
                type="search" 
                placeholder="Buscar proveedor..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="search-input-full"
            />
        </div>
        
        <div className="filter-tabs">
            {['Todos', 'Piezas Terminadas', 'Materia Prima', 'Ambos'].map(tipo => (
                <button 
                    key={tipo}
                    className={`filter-tab ${filterTipo === tipo ? 'active' : ''}`}
                    onClick={() => setFilterTipo(tipo)}
                >
                    {tipo}
                </button>
            ))}
        </div>
      </div>

      {/* Grid de Tarjetas */}
      {proveedoresFiltrados.length === 0 ? (
        <div className="empty-state">
          <Icons.Store />
          <p>No se encontraron proveedores.</p>
        </div>
      ) : (
        <div className="proveedores-grid">
          {proveedoresFiltrados.map((prov) => (
            <div key={prov.supplierID} className="proveedor-card">
              <div className="card-header">
                <div className="header-top">
                    <div className="avatar-letter">{prov.nombre.charAt(0)}</div>
                    
                    {/* 🛠️ BOTONES DE ACCIÓN (AQUÍ AGREGAMOS EL CARRITO) */}
                    <div className="card-actions">
                        {/* Botón de Hacer Pedido */}
                        <button 
                            className="btn-icon" 
                            style={{color: '#00BCD4', border: '1px solid #00BCD4'}}
                            onClick={() => {
                                setSelectedSupplierForOrder(prov);
                                setOrderModalOpen(true);
                            }}
                            title="Hacer Pedido"
                        >
                            <Icons.ShoppingCart />
                        </button>

                        <button className="btn-icon edit" onClick={() => handleOpenModal(prov)} title="Editar">
                            <Icons.Edit />
                        </button>
                        <button className="btn-icon delete" onClick={() => handleDelete(prov.supplierID)} title="Eliminar">
                            <Icons.Trash />
                        </button>
                    </div>
                </div>
                
                <h3>{prov.nombre}</h3>
                
                <span className={`badge-tipo ${prov.tipoProveedor === 'Piezas Terminadas' ? 'blue' : 'purple'}`}>
                    {prov.tipoProveedor}
                </span>
              </div>
              
              <div className="card-body">
                {prov.rfc && <p><Icons.Activity /> <span>{prov.rfc}</span></p>}
                {prov.email && <p><Icons.Mail /> <span>{prov.email}</span></p>}
                {prov.telefono && <p><Icons.Phone /> <span>{prov.telefono}</span></p>}
                {prov.ciudad && <p><Icons.MapPin /> <span>{prov.ciudad}, {prov.estado}</span></p>}
              </div>
              
              <div className="card-footer">
                  <div className="footer-stat">
                      <Icons.ShoppingCart /> {prov.totalOrdenes || 0} Órdenes
                  </div>
                  <div className="footer-stat">
                      <Icons.DollarSign /> ${prov.totalComprado?.toFixed(2) || '0.00'}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar Proveedor */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button className="modal-close" onClick={handleCloseModal}><Icons.Close /></button>
            </div>

            <form onSubmit={handleSubmit} className="dark-form">
              <div className="form-grid">
                <div className="form-group span-2">
                    <label>Nombre Comercial *</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Razón Social</label>
                    <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>RFC</label>
                    <input type="text" name="rfc" value={formData.rfc} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Tipo *</label>
                    <select name="tipoProveedor" value={formData.tipoProveedor} onChange={handleInputChange}>
                        <option value="Piezas Terminadas">Piezas Terminadas</option>
                        <option value="Materia Prima">Materia Prima</option>
                        <option value="Ambos">Ambos</option>
                        <option value="Servicios">Servicios</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                </div>
                <div className="form-group span-2">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group span-2">
                    <label>Dirección</label>
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Calle, número, colonia" />
                </div>
                <div className="form-group">
                    <label>Ciudad</label>
                    <input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Estado</label>
                    <input type="text" name="estado" value={formData.estado} onChange={handleInputChange} />
                </div>
                <div className="form-group span-2">
                    <label>Notas</label>
                    <textarea name="notas" value={formData.notas} onChange={handleInputChange} rows="2"></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Icons.Save /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {orderModalOpen && (
        <OrdenCompraModal 
            supplier={selectedSupplierForOrder} 
            onClose={() => setOrderModalOpen(false)} 
        />
      )}

    </div>
  );
};

export default Proveedores;
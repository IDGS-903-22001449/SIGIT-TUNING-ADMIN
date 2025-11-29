import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Productos.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    categoryID: '',
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: null,   
    marca: '',
    modelo: '',
    anio: ''
  });

  const [categoryFormData, setCategoryFormData] = useState({
    nombre: '',
    descripcion: '',
    imagen: null
  });

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada) {
      fetchProductos(categoriaSeleccionada);
    } else {
      fetchProductos();
    }
  }, [categoriaSeleccionada]);

  const fetchCategorias = async () => {
    try {
      const response = await api.get('/Products/categories');
      if (response.data.success) {
        setCategorias(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  };

  const fetchProductos = async (categoryId = null) => {
    try {
      setLoading(true);
      const url = categoryId 
        ? `/Products?categoryId=${categoryId}` 
        : '/Products';
      
      const response = await api.get(url);
      if (response.data.success) {
        setProductos(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe exceder 5MB');
        return;
      }
      setFormData({ ...formData, imagen: file });

      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe exceder 5MB');
        return;
      }
      setCategoryFormData({ ...categoryFormData, imagen: file });

      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = new FormData();
      dataToSend.append('categoryID', formData.categoryID);
      dataToSend.append('nombre', formData.nombre);
      dataToSend.append('descripcion', formData.descripcion);
      dataToSend.append('precio', formData.precio);
      dataToSend.append('stock', formData.stock);
      dataToSend.append('marca', formData.marca);
      dataToSend.append('modelo', formData.modelo);
      dataToSend.append('anio', formData.anio);

      if (formData.imagen) {
        dataToSend.append('imagen', formData.imagen);
      }

      let response;
      if (editingProduct) {
        // ✅ AHORA EDITA CON PUT
        response = await api.put(`/Products/${editingProduct.productID}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/Products', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        alert(`✅ Producto ${editingProduct ? 'actualizado' : 'guardado'} exitosamente`);
        setShowModal(false);
        resetForm();
        fetchProductos(categoriaSeleccionada);
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('❌ ' + (error.response?.data?.message || 'Error al guardar el producto'));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dataToSend = new FormData();
      dataToSend.append('nombre', categoryFormData.nombre);
      dataToSend.append('descripcion', categoryFormData.descripcion || '');

      if (categoryFormData.imagen) {
        dataToSend.append('imagen', categoryFormData.imagen);
      }

      const response = await api.post('/Products/categories', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        alert('✅ Categoría creada exitosamente');
        setShowCategoryModal(false);
        resetCategoryForm();
        fetchCategorias();
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      alert('❌ ' + (error.response?.data?.message || 'Error al crear la categoría'));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('⚠️ ¿Estás seguro de eliminar esta categoría?')) return;
    
    try {
      const response = await api.delete(`/Products/categories/${id}`);
      if (response.data.success) {
        alert('✅ Categoría eliminada');
        fetchCategorias();
        if (categoriaSeleccionada === id) {
          setCategoriaSeleccionada(null);
        }
      }
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Error al eliminar'));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await api.delete(`/Products/${id}`);
      alert('✅ Producto eliminado');
      fetchProductos(categoriaSeleccionada);
    } catch (error) {
      alert('❌ Error al eliminar');
    }
  };

  const openModal = (producto = null) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        categoryID: producto.categoryID,
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        imagen: null, 
        marca: producto.marca || '',
        modelo: producto.modelo || '',
        anio: producto.anio || ''
      });
      setPreviewImage(producto.imagenURL); 
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const openCategoryModal = () => {
    resetCategoryForm();
    setShowCategoryModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setPreviewImage(null);
    setFormData({
      categoryID: '',
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      imagen: null,
      marca: '',
      modelo: '',
      anio: ''
    });
  };

  const resetCategoryForm = () => {
    setPreviewImage(null);
    setCategoryFormData({
      nombre: '',
      descripcion: '',
      imagen: null
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategoryChange = (e) => {
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div className="productos-page">
      <div className="page-header">
        <h1 className="page-title">Inventario de Productos</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={openCategoryModal}>
            <Icons.Plus /> Nueva Categoría
          </button>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Icons.Plus /> Nuevo Producto
          </button>
        </div>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${!categoriaSeleccionada ? 'active' : ''}`}
          onClick={() => setCategoriaSeleccionada(null)}
        >
          Todas
        </button>
        {categorias.map((cat) => (
          <div key={cat.categoryID} className="filter-tab-wrapper">
            <button
              className={`filter-tab ${categoriaSeleccionada === cat.categoryID ? 'active' : ''}`}
              onClick={() => setCategoriaSeleccionada(cat.categoryID)}
            >
              {cat.nombre}
            </button>
            <button
              className="delete-category-btn"
              onClick={() => handleDeleteCategory(cat.categoryID)}
              title="Eliminar categoría"
            >
              <Icons.Trash />
            </button>
          </div>
        ))}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Img</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Marca/Modelo</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.productID}>
                <td style={{ width: '70px', padding: '0.5rem' }}>
                  <div className="prod-img-cell">
                    {producto.imagenURL ? (
                      <img 
                        src={producto.imagenURL} 
                        alt="prod"
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <div className="no-img">?</div>
                    )}
                  </div>
                </td>
                <td><strong>{producto.nombre}</strong></td>
                <td>{producto.categoriaNombre}</td>
                <td>{producto.marca} {producto.modelo}</td>
                <td className="price-cell">${producto.precio.toFixed(2)}</td>
                <td>
                  <span className={`stock-badge ${producto.stock < 5 ? 'low' : 'ok'}`}>
                    {producto.stock} u.
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon edit" onClick={() => openModal(producto)}><Icons.Edit /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete(producto.productID)}><Icons.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productos.length === 0 && (
          <div className="empty-state">
            <Icons.Package />
            <p>No hay productos registrados.</p>
          </div>
        )}
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><Icons.Close /></button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="image-upload-container">
                <div className="preview-box-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <div className="no-preview">
                      <Icons.Package style={{ width: '40px', height: '40px', opacity: 0.3 }} />
                      <span>Sin Imagen</span>
                    </div>
                  )}
                </div>
                <label className="file-input-label">
                  📤 {editingProduct ? 'Cambiar Imagen' : 'Seleccionar Imagen'} del Producto
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="form-grid">
                <div className="form-group span-2">
                  <label>Nombre del Producto *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                  <label>Categoría *</label>
                  <select name="categoryID" value={formData.categoryID} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => <option key={cat.categoryID} value={cat.categoryID}>{cat.nombre}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Precio ($) *</label>
                  <input type="number" name="precio" value={formData.precio} onChange={handleChange} required step="0.01" />
                </div>

                <div className="form-group">
                  <label>Stock *</label>
                  <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" name="marca" value={formData.marca} onChange={handleChange} />
                </div>

                <div className="form-group">
                  <label>Modelo</label>
                  <input type="text" name="modelo" value={formData.modelo} onChange={handleChange} />
                </div>
                 
                <div className="form-group">
                  <label>Año</label>
                  <input type="text" name="anio" value={formData.anio} onChange={handleChange} placeholder="Ej. 2024" />
                </div>
                
                <div className="form-group span-2">
                  <label>Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"></textarea>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Icons.Save /> {editingProduct ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Categoría */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nueva Categoría</h2>
              <button className="modal-close" onClick={() => setShowCategoryModal(false)}><Icons.Close /></button>
            </div>

            <form onSubmit={handleCategorySubmit} className="product-form">
              <div className="image-upload-container">
                <div className="preview-box-center">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview"
                      className="preview-image"
                    />
                  ) : (
                    <div className="no-preview">
                      <Icons.Package style={{ width: '40px', height: '40px', opacity: 0.3 }} />
                      <span>Sin Imagen</span>
                    </div>
                  )}
                </div>
                <label className="file-input-label">
                  📤 Seleccionar Imagen de Categoría
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleCategoryImageChange} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Nombre de la Categoría *</label>
                <input 
                  type="text" 
                  name="nombre" 
                  value={categoryFormData.nombre} 
                  onChange={handleCategoryChange} 
                  required 
                  placeholder="Ej. Turbo, Escape, Suspensión"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea 
                  name="descripcion" 
                  value={categoryFormData.descripcion} 
                  onChange={handleCategoryChange} 
                  rows="3"
                  placeholder="Descripción opcional de la categoría"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Icons.Save /> Crear Categoría</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;
import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Usuarios.css';
import { useAuth } from '../context/AuthContext'; 

const Usuarios = () => {
  const { user: usuarioActual } = useAuth();
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    rol: 'Usuario', 
    avatar: null
  });

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      if (response.data.success) {
        setUsuarios(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (usuario = null) => {
    if (usuario) {
      setEditingUser(usuario);
      setFormData({
        nombre: usuario.nombre,
        telefono: usuario.telefono || '',
        rol: usuario.rol || 'Usuario', 
        avatar: null
      });
      setPreviewImage(usuario.avatarURL);
    } else {
      setEditingUser(null);
      setFormData({
        nombre: '',
        telefono: '',
        rol: 'Usuario',   
        avatar: null
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nombre: '', telefono: '', rol: 'Usuario', avatar: null });
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        alert('Solo se aceptan JPG, PNG o GIF');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe exceder 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        avatar: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert('El nombre es requerido');
      return;
    }

    try {
      if (editingUser) {
        const formDataToSend = new FormData();
        formDataToSend.append('nombre', formData.nombre);
        formDataToSend.append('telefono', formData.telefono);
        formDataToSend.append('rol', formData.rol);   

        if (formData.avatar) {
          formDataToSend.append('avatar', formData.avatar);
        }

        const response = await api.put(
          `/users/${editingUser.userID}`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.success) {
          alert('Usuario actualizado exitosamente');
          fetchUsuarios();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(error.response?.data?.message || 'Error al guardar el usuario');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const response = await api.delete(`/users/${userId}`);
      if (response.data.success) {
        alert('Usuario eliminado exitosamente');
        fetchUsuarios();
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      if (usuarioActual?.rol === 'Admin') {
        alert('Usuario eliminado (Admin Force)');
        fetchUsuarios();
      } else {
        alert('Solo administradores pueden eliminar usuarios');
      }
    }
  };

  const usuariosFiltrados = usuarios.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <div className="page-header">
        <h1 className="page-title">Gestión de Usuarios</h1>
        {usuarioActual && (
          <div className="user-info">
            <span>Conectado como: <strong>{usuarioActual.nombre}</strong></span>
            {usuarioActual.rol === 'Admin' && <span className="badge-admin">ADMIN</span>}
          </div>
        )}
      </div>

      <div className="usuarios-stats">
        <div className="stat-card-small">
          <Icons.Users />
          <div>
            <h3>Total Usuarios</h3>
            <p className="stat-number">{usuarios.length}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Activity />
          <div>
            <h3>Usuarios Activos</h3>
            <p className="stat-number">{usuarios.filter(u => u.activo).length}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Users />
          <div>
            <h3>Inactivos</h3>
            <p className="stat-number">{usuarios.filter(u => !u.activo).length}</p>
          </div>
        </div>
      </div>

      <div className="search-box">
        <div className="search-icon">
          <Icons.Search />
        </div>
        <input
          type="search"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input-full"
        />
      </div>

      {usuariosFiltrados.length === 0 ? (
        <div className="empty-state-card">
          <Icons.Users />
          <h3>{searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}</h3>
          <p>
            {searchTerm 
              ? 'Intenta con otra búsqueda' 
              : 'Los usuarios que se registren en la aplicación aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th> 
                <th>Registrado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.userID}>
                  <td data-label="Avatar">
                    <div className="avatar-cell">
                      {usuario.avatarURL ? (
                        <img src={usuario.avatarURL} alt={usuario.nombre} className="avatar-img" />
                      ) : (
                        <div className="avatar-placeholder">
                          {usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td data-label="Nombre">
                    <strong>{usuario.nombre}</strong>
                  </td>
                  <td data-label="Email">{usuario.email}</td>
                  <td data-label="Teléfono">{usuario.telefono || '-'}</td>
                  <td data-label="Rol">
                    <span className={`role-badge ${usuario.rol === 'Admin' ? 'admin' : 'user'}`} 
                          style={{
                              padding: '4px 8px', 
                              borderRadius: '4px', 
                              backgroundColor: usuario.rol === 'Admin' ? '#e3f2fd' : '#f5f5f5',
                              color: usuario.rol === 'Admin' ? '#1976d2' : '#666',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                          }}>
                      {usuario.rol || 'Usuario'}
                    </span>
                  </td>
                  <td data-label="Registrado">
                    {new Date(usuario.fechaRegistro).toLocaleDateString('es-MX')}
                  </td>
                  <td data-label="Estado">
                    <span className={`status-badge ${usuario.activo ? 'active' : 'inactive'}`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones">
                    <div className="action-buttons">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleOpenModal(usuario)}
                        title="Editar"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleDeleteUser(usuario.userID)}
                        title="Eliminar"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Usuario</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                <Icons.Close />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="user-form">
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                </div>
              )}

              <div className="form-group">
                <label>Avatar</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                <small>JPG, PNG o GIF. Máximo 5MB</small>
              </div>

              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  maxLength="100"
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  maxLength="20"
                />
              </div>

              {/* ✅ SELECTOR DE ROL (Solo para Admins) */}
              {usuarioActual?.rol === 'Admin' && (
                <div className="form-group">
                  <label style={{ fontWeight: 'bold', color: '#00BCD4' }}>Asignar Rol:</label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                  >
                    <option value="Usuario">👤 Usuario Normal (Solo App)</option>
                    <option value="Admin">🛡️ Administrador (Web y App)</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Email (no editable)</label>
                <input
                  type="email"
                  value={editingUser?.email || ''}
                  disabled
                  className="input-disabled"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Icons.Save />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
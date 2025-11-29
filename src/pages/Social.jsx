import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Social.css';

const Social = () => {
  const [posts, setPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('aprobadas'); // 'aprobadas' o 'pendientes'

  useEffect(() => {
    fetchPosts();
    fetchPendingPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/Social/posts');
      if (response.data.success) {
        setPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingPosts = async () => {
    try {
      const response = await api.get('/Social/posts/pendientes');
      if (response.data.success) {
        setPendingPosts(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener posts pendientes:', error);
    }
  };

  const aprobarPost = async (postId) => {
    if (!confirm('¿Aprobar esta publicación?')) return;

    try {
      const response = await api.post(`/Social/posts/${postId}/aprobar`);
      if (response.data.success) {
        alert('✅ Publicación aprobada');
        fetchPosts();
        fetchPendingPosts();
      }
    } catch (error) {
      console.error('Error al aprobar:', error);
      alert('Error al aprobar la publicación');
    }
  };

  const rechazarPost = async (postId) => {
    if (!confirm('¿Rechazar esta publicación? Se eliminará permanentemente.')) return;

    try {
      const response = await api.post(`/Social/posts/${postId}/rechazar`);
      if (response.data.success) {
        alert('❌ Publicación rechazada');
        fetchPendingPosts();
      }
    } catch (error) {
      console.error('Error al rechazar:', error);
      alert('Error al rechazar la publicación');
    }
  };

  const deletePost = async (postId) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      const response = await api.delete(`/Social/posts/${postId}`);
      if (response.data.success) {
        alert('Publicación eliminada');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
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
    <div className="social-page">
      <h1 className="page-title">Red Social - Panel Admin</h1>

      <div className="social-stats">
        <div className="stat-card-small">
          <Icons.Activity />
          <div>
            <h3>Publicaciones Aprobadas</h3>
            <p className="stat-number">{posts.length}</p>
          </div>
        </div>
        <div className="stat-card-small" style={{ background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' }}>
          <Icons.Activity />
          <div>
            <h3>Pendientes de Aprobación</h3>
            <p className="stat-number">{pendingPosts.length}</p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Activity />
          <div>
            <h3>Total Likes</h3>
            <p className="stat-number">
              {posts.reduce((sum, p) => sum + p.totalLikes, 0)}
            </p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Activity />
          <div>
            <h3>Total Comentarios</h3>
            <p className="stat-number">
              {posts.reduce((sum, p) => sum + p.totalComentarios, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'aprobadas' ? 'active' : ''}`}
          onClick={() => setActiveTab('aprobadas')}
        >
          Publicaciones Aprobadas ({posts.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          Pendientes de Aprobación ({pendingPosts.length})
        </button>
      </div>

      {/* Contenido según el tab activo */}
      {activeTab === 'pendientes' ? (
        // PUBLICACIONES PENDIENTES
        pendingPosts.length === 0 ? (
          <div className="empty-state-card">
            <Icons.Activity />
            <h3>No hay publicaciones pendientes</h3>
            <p>Todas las publicaciones han sido revisadas</p>
          </div>
        ) : (
          <div className="posts-grid">
            {pendingPosts.map((post) => (
              <div key={post.postID} className="post-card pending-post">
                <div className="pending-badge">⏳ PENDIENTE</div>
                <div className="post-header">
                  <div className="post-user">
                    <div className="user-avatar-small">
                      {post.usuarioNombre.charAt(0)}
                    </div>
                    <div>
                      <h4>{post.usuarioNombre}</h4>
                      <span className="post-time">{post.tiempoTranscurrido}</span>
                    </div>
                  </div>
                </div>

                {post.titulo && <h3 className="post-title">{post.titulo}</h3>}
                {post.descripcion && <p className="post-description">{post.descripcion}</p>}

                {post.imagenURL && (
                  <div className="post-image">
                    <img src={post.imagenURL} alt="Post" />
                  </div>
                )}

                <div className="post-actions">
                  <button 
                    className="btn-approve"
                    onClick={() => aprobarPost(post.postID)}
                  >
                    <Icons.Activity />
                    Aprobar
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => rechazarPost(post.postID)}
                  >
                    <Icons.Trash />
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // PUBLICACIONES APROBADAS
        posts.length === 0 ? (
          <div className="empty-state-card">
            <Icons.Activity />
            <h3>No hay publicaciones aprobadas</h3>
            <p>Las publicaciones aprobadas aparecerán aquí</p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <div key={post.postID} className="post-card">
                <div className="post-header">
                  <div className="post-user">
                    <div className="user-avatar-small">
                      {post.usuarioNombre.charAt(0)}
                    </div>
                    <div>
                      <h4>{post.usuarioNombre}</h4>
                      <span className="post-time">{post.tiempoTranscurrido}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-delete-post"
                    onClick={() => deletePost(post.postID)}
                    title="Eliminar publicación"
                  >
                    <Icons.Trash />
                  </button>
                </div>

                {post.titulo && <h3 className="post-title">{post.titulo}</h3>}
                {post.descripcion && <p className="post-description">{post.descripcion}</p>}

                {post.imagenURL && (
                  <div className="post-image">
                    <img src={post.imagenURL} alt="Post" />
                  </div>
                )}

                <div className="post-stats">
                  <span>
                    <Icons.Activity />
                    {post.totalLikes} likes
                  </span>
                  <span>
                    <Icons.Activity />
                    {post.totalComentarios} comentarios
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Social;
// Constantes de la aplicación
export const ESTATUS_PEDIDOS = [
  'Pendiente',
  'Empacando',
  'Enviado',
  'En Tránsito',
  'Entregado',
  'Cancelado'
];

export const ESTATUS_COLORES = {
  'Pendiente': { bg: 'rgba(255, 152, 0, 0.2)', color: '#FF9800' },
  'Empacando': { bg: 'rgba(33, 150, 243, 0.2)', color: '#2196F3' },
  'Enviado': { bg: 'rgba(156, 39, 176, 0.2)', color: '#9C27B0' },
  'En Tránsito': { bg: 'rgba(103, 58, 183, 0.2)', color: '#673AB7' },
  'Entregado': { bg: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50' },
  'Cancelado': { bg: 'rgba(244, 67, 54, 0.2)', color: '#F44336' }
};

export const API_ENDPOINTS = {
  PRODUCTS: '/Products',
  CATEGORIES: '/Products/categories',
  ORDERS: '/Orders',
  USERS: '/Users',
  SOCIAL: '/Social/posts',
  MARKETPLACE: '/Marketplace/listings',
  ASSISTANT: '/Assistant/history'
};

export const MESSAGES = {
  SUCCESS: {
    PRODUCT_CREATED: 'Producto creado exitosamente',
    PRODUCT_UPDATED: 'Producto actualizado exitosamente',
    PRODUCT_DELETED: 'Producto eliminado exitosamente',
    ORDER_UPDATED: 'Pedido actualizado exitosamente',
    POST_DELETED: 'Publicación eliminada exitosamente'
  },
  ERROR: {
    GENERIC: 'Ocurrió un error. Por favor intenta nuevamente',
    NETWORK: 'Error de conexión. Verifica tu internet',
    UNAUTHORIZED: 'No tienes permisos para realizar esta acción'
  },
  CONFIRM: {
    DELETE_PRODUCT: '¿Estás seguro de eliminar este producto?',
    DELETE_POST: '¿Estás seguro de eliminar esta publicación?',
    LOGOUT: '¿Estás seguro de cerrar sesión?'
  }
};
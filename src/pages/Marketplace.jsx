import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Icons } from '../components/Icons/Icons';
import './Marketplace.css';

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconImage = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEstatus, setFilterEstatus] = useState('Activa');
  
  // Modal de Detalles
  const [showDetails, setShowDetails] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  
  // Modal de Ofertas y Pagos
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [bidsForListing, setBidsForListing] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  
  // Modal de Completar Venta (Método de Pago)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBidForPayment, setSelectedBidForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/Marketplace/listings?includePending=true');
      if (response.data.success) {
        setListings(response.data.data);
      }
    } catch (error) {
      console.error('Error al obtener listados:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNCIONES DE MODERACIÓN (Admin) ---
  const handleApprove = async (id) => {
    if (!window.confirm('¿Aprobar esta publicación? Será visible en la App.')) return;
    try {
        await api.put(`/Marketplace/listings/${id}/approve`);
        alert('✅ Publicación aprobada');
        if (selectedListing && selectedListing.listingID === id) {
            closeDetails();
        }
        fetchListings();
    } catch (error) {
        console.error(error);
        alert('Error al aprobar. Verifica que seas Admin.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('¿Rechazar esta publicación?')) return;
    try {
        await api.put(`/Marketplace/listings/${id}/reject`);
        alert('🚫 Publicación rechazada');
        if (selectedListing && selectedListing.listingID === id) {
            closeDetails();
        }
        fetchListings();
    } catch (error) {
        console.error(error);
        alert('Error al rechazar');
    }
  };

  // --- FUNCIONES DE OFERTAS Y VENTAS ---
  const handleViewBids = async (listing) => {
    setSelectedListing(listing);
    setLoadingBids(true);
    setShowBidsModal(true);
    
    try {
      const response = await api.get(`/Marketplace/listings/${listing.listingID}/bids`);
      if (response.data.success) {
        setBidsForListing(response.data.data);
      }
    } catch (error) {
      console.error('Error al cargar ofertas:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al cargar ofertas: ${errorMsg}\n\n${error.response?.status === 403 ? 'Verifica que tengas permisos de administrador o seas el vendedor.' : ''}`);
      setShowBidsModal(false);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleInitiatePayment = (bid) => {
    setSelectedBidForPayment(bid);
    setShowPaymentModal(true);
    setShowBidsModal(false);
  };

  const handleCompleteSale = async () => {
    if (!paymentMethod || !paymentReference) {
      alert('Por favor completa todos los campos');
      return;
    }

    if (!window.confirm('¿Confirmar que el pago ha sido recibido y completar la venta?')) return;

    setProcessingPayment(true);
    try {
      await api.post(`/Marketplace/listings/${selectedListing.listingID}/complete-sale`, {
        compradorID: selectedBidForPayment.compradorID,
        metodoPago: paymentMethod,
        referenciaTransaccion: paymentReference
      });
      
      alert('✅ Venta completada exitosamente');
      setShowPaymentModal(false);
      setPaymentMethod('');
      setPaymentReference('');
      setSelectedBidForPayment(null);
      fetchListings();
    } catch (error) {
      console.error('Error al completar venta:', error);
      alert('Error al completar la venta: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  // --- FUNCIONES DE DETALLES ---
  const handleViewDetails = (listing) => {
      setSelectedListing(listing);
      setShowDetails(true);
  };

  const closeDetails = () => {
      setShowDetails(false);
      setSelectedListing(null);
  };

  const closeBidsModal = () => {
    setShowBidsModal(false);
    setBidsForListing([]);
    setSelectedListing(null);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentMethod('');
    setPaymentReference('');
    setSelectedBidForPayment(null);
    setShowBidsModal(true); // Volver al modal de ofertas
  };

  const filteredListings = listings.filter(l => l.estatus === filterEstatus);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="page-header">
        <h1 className="page-title">Marketplace - Administración</h1>
      </div>

      {/* Estadísticas */}
      <div className="marketplace-stats">
        <div className="stat-card-small">
          <Icons.Store />
          <div>
            <h3>Total</h3>
            <p className="stat-number">{listings.length}</p>
          </div>
        </div>
        <div className="stat-card-small" style={{borderColor: '#ff9800'}}>
          <Icons.Eye />
          <div>
            <h3>Pendientes</h3>
            <p className="stat-number" style={{color: '#ff9800'}}>
              {listings.filter(l => l.estatus === 'Pendiente').length}
            </p>
          </div>
        </div>
        <div className="stat-card-small">
          <Icons.Activity />
          <div>
            <h3>Activas</h3>
            <p className="stat-number">
              {listings.filter(l => l.estatus === 'Activa').length}
            </p>
          </div>
        </div>
      </div>

      {/* Pestañas de Filtro */}
      <div className="filter-tabs">
        <button 
            className={`filter-tab ${filterEstatus === 'Activa' ? 'active' : ''}`}
            onClick={() => setFilterEstatus('Activa')}
        >
            <Icons.Store style={{width: '16px', marginRight: '5px'}}/>
            Publicadas
        </button>
        <button 
            className={`filter-tab ${filterEstatus === 'Pendiente' ? 'active' : ''}`}
            onClick={() => setFilterEstatus('Pendiente')}
            style={filterEstatus === 'Pendiente' ? {backgroundColor: '#ff9800', borderColor: '#ff9800', color: 'black'} : {color: '#ff9800', borderColor: '#ff9800'}}
        >
            <Icons.Eye style={{width: '16px', marginRight: '5px'}}/>
            Por Revisar ({listings.filter(l => l.estatus === 'Pendiente').length})
        </button>
      </div>

      {filteredListings.length === 0 ? (
        <div className="empty-state-card">
          <Icons.Store />
          <h3>No hay publicaciones {filterEstatus.toLowerCase()}s</h3>
          <p>Cambia el filtro para ver otras</p>
        </div>
      ) : (
        <div className="listings-grid">
          {filteredListings.map((listing) => (
            <div key={listing.listingID} className="listing-card">
              <div className="listing-image">
                  {listing.imagenURL ? (
                    <img src={listing.imagenURL} alt={listing.titulo} />
                  ) : (
                    <div className="no-image-placeholder"><IconImage /></div>
                  )}
                  
                  <div className="listing-overlay">
                    {listing.estatus === 'Pendiente' ? (
                        <div className="admin-actions">
                            <button className="btn-action approve" onClick={() => handleApprove(listing.listingID)} title="Aprobar">
                                <IconCheck />
                            </button>
                            <button className="btn-action reject" onClick={() => handleReject(listing.listingID)} title="Rechazar">
                                <Icons.Trash />
                            </button>
                            <button className="btn-view-small" onClick={() => handleViewDetails(listing)} title="Ver">
                                <Icons.Eye />
                            </button>
                        </div>
                    ) : (
                        <div style={{display: 'flex', gap: '10px'}}>
                          <button className="btn-view" onClick={() => handleViewDetails(listing)}>
                              <Icons.Eye /> Ver
                          </button>
                          {listing.totalOfertas > 0 && (
                            <button className="btn-view" onClick={() => handleViewBids(listing)} style={{backgroundColor: '#ff9800'}}>
                              <Icons.DollarSign /> Ofertas ({listing.totalOfertas})
                            </button>
                          )}
                        </div>
                    )}
                  </div>
              </div>
              
              <div className="listing-content">
                <h3>{listing.titulo}</h3>
                <div className="listing-vendedor">
                    <span>{listing.vendedorNombre}</span>
                </div>
                
                <div className="listing-prices">
                  <div>
                    <span className="price-label">Precio:</span>
                    <span className="price current">${listing.precioActual.toFixed(2)}</span>
                  </div>
                </div>

                <div className="listing-footer">
                  <span className="offers-count">
                    <Icons.DollarSign /> {listing.totalOfertas} ofertas
                  </span>
                  <span className={`status ${listing.estatus.toLowerCase()}`}>
                    {listing.estatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {showDetails && selectedListing && (
        <div className="modal-overlay" onClick={closeDetails}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '600px'}}>
                <div className="modal-header">
                    <h2>Detalles</h2>
                    <button className="modal-close" onClick={closeDetails}><Icons.Close /></button>
                </div>
                
                <div className="listing-detail-view">
                    <div className="detail-image-container">
                        {selectedListing.imagenURL ? (
                            <img src={selectedListing.imagenURL} alt={selectedListing.titulo} />
                        ) : (
                            <div className="no-image-placeholder big"><IconImage /></div>
                        )}
                    </div>
                    
                    <div className="detail-info">
                        <h3>{selectedListing.titulo}</h3>
                        <p className="detail-price">${selectedListing.precioActual.toFixed(2)} <span className="currency">USD</span></p>
                        
                        <div className="detail-specs">
                            <div className="spec-item"><strong>Marca:</strong> {selectedListing.marca || 'N/A'}</div>
                            <div className="spec-item"><strong>Modelo:</strong> {selectedListing.modelo || 'N/A'}</div>
                            <div className="spec-item"><strong>Año:</strong> {selectedListing.anio || 'N/A'}</div>
                            <div className="spec-item"><strong>Km:</strong> {selectedListing.kilometraje ? `${selectedListing.kilometraje} km` : 'N/A'}</div>
                        </div>

                        <div className="detail-description">
                            <h4>Descripción</h4>
                            <p>{selectedListing.descripcion}</p>
                        </div>

                        {selectedListing.modificaciones && (
                            <div className="detail-mods">
                                <h4>Modificaciones</h4>
                                <p>{selectedListing.modificaciones}</p>
                            </div>
                        )}

                        <div className="detail-seller">
                            <h4>Vendedor</h4>
                            <p>{selectedListing.vendedorNombre}</p>
                        </div>

                        {selectedListing.estatus === 'Pendiente' && (
                            <div className="modal-actions" style={{marginTop: '20px', justifyContent: 'space-between'}}>
                                <button className="btn btn-secondary" onClick={() => handleReject(selectedListing.listingID)}>
                                    Rechazar
                                </button>
                                <button className="btn btn-primary" onClick={() => handleApprove(selectedListing.listingID)}>
                                    Aprobar Publicación
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL DE OFERTAS */}
      {showBidsModal && selectedListing && (
        <div className="modal-overlay" onClick={closeBidsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <div className="modal-header">
              <h2>Ofertas - {selectedListing.titulo}</h2>
              <button className="modal-close" onClick={closeBidsModal}><Icons.Close /></button>
            </div>
            
            <div style={{padding: '20px', maxHeight: '70vh', overflowY: 'auto'}}>
              {loadingBids ? (
                <div style={{textAlign: 'center', padding: '40px'}}>
                  <div className="spinner"></div>
                </div>
              ) : bidsForListing.length === 0 ? (
                <div className="empty-state-card">
                  <Icons.DollarSign />
                  <h3>No hay ofertas aún</h3>
                </div>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                  {bidsForListing
                    .filter(bid => bid.estatus === 'Aceptada')
                    .map(bid => (
                    <div key={bid.bidID} className="bid-card" style={{
                      background: 'rgba(76, 175, 80, 0.1)',
                      border: '1px solid #4caf50',
                      borderRadius: '12px',
                      padding: '15px'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px'}}>
                        <div>
                          <h3 style={{margin: '0 0 5px 0'}}>{bid.compradorNombre}</h3>
                          <span className="status" style={{background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50'}}>
                            ACEPTADA
                          </span>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <p style={{fontSize: '24px', fontWeight: 'bold', color: '#4caf50', margin: 0}}>
                            ${bid.montoOferta.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      {bid.mensaje && (
                        <p style={{
                          background: 'rgba(255,255,255,0.05)', 
                          padding: '10px', 
                          borderRadius: '8px',
                          fontStyle: 'italic',
                          fontSize: '14px',
                          marginTop: '10px'
                        }}>
                          "{bid.mensaje}"
                        </p>
                      )}

                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleInitiatePayment(bid)}
                        style={{
                          width: '100%', 
                          marginTop: '15px',
                          background: '#4caf50',
                          color: 'white'
                        }}
                      >
                        💳 Completar Venta y Procesar Pago
                      </button>
                    </div>
                  ))}
                  
                  {bidsForListing.filter(bid => bid.estatus === 'Pendiente').length > 0 && (
                    <>
                      <h4 style={{marginTop: '20px', color: 'var(--text-secondary)'}}>Pendientes</h4>
                      {bidsForListing
                        .filter(bid => bid.estatus === 'Pendiente')
                        .map(bid => (
                        <div key={bid.bidID} className="bid-card" style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '15px'
                        }}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <div>
                              <h3 style={{margin: '0 0 5px 0'}}>{bid.compradorNombre}</h3>
                              <span className="status pendiente">PENDIENTE</span>
                            </div>
                            <p style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0}}>
                              ${bid.montoOferta.toFixed(2)}
                            </p>
                          </div>
                          {bid.mensaje && (
                            <p style={{
                              background: 'rgba(255,255,255,0.05)', 
                              padding: '10px', 
                              borderRadius: '8px',
                              fontStyle: 'italic',
                              fontSize: '14px',
                              marginTop: '10px'
                            }}>
                              "{bid.mensaje}"
                            </p>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGO */}
      {showPaymentModal && selectedBidForPayment && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h2>💳 Completar Venta</h2>
              <button className="modal-close" onClick={closePaymentModal}><Icons.Close /></button>
            </div>
            
            <div style={{padding: '20px'}}>
              <div style={{
                background: 'rgba(76, 175, 80, 0.1)',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>Comprador:</span>
                  <strong>{selectedBidForPayment.compradorNombre}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>Monto oferta:</span>
                  <strong>${selectedBidForPayment.montoOferta.toFixed(2)}</strong>
                </div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <span>Comisión (15%):</span>
                  <strong style={{color: '#ff9800'}}>-${(selectedBidForPayment.montoOferta * 0.15).toFixed(2)}</strong>
                </div>
                <hr style={{border: '1px solid var(--border)', margin: '10px 0'}} />
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px'}}>
                  <span>Total a recibir:</span>
                  <strong style={{color: '#4caf50'}}>${(selectedBidForPayment.montoOferta * 0.85).toFixed(2)}</strong>
                </div>
              </div>

              <div style={{marginBottom: '15px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Método de Pago *
                </label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'white'
                  }}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Stripe">Tarjeta (Stripe)</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                  Referencia / ID Transacción *
                </label>
                <input 
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Ej: TRX123456, pago en efectivo, etc."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'white'
                  }}
                />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button 
                  className="btn btn-secondary" 
                  onClick={closePaymentModal}
                  disabled={processingPayment}
                  style={{flex: 1}}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCompleteSale}
                  disabled={processingPayment || !paymentMethod || !paymentReference}
                  style={{flex: 2, background: '#4caf50'}}
                >
                  {processingPayment ? 'Procesando...' : '✅ Confirmar Venta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
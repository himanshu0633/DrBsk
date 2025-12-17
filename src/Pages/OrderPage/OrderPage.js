import React, { useEffect, useState, useCallback } from 'react';
import './OrderPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../components/AxiosInstance';
import CustomLoader from '../../components/CustomLoader';
import { useNavigate } from 'react-router-dom';

// Add a default image import
import noImage from '../../assets/no-image.png';

function paymentStatusLabel(status) {
  if (!status) return 'Unknown';
  if (status === 'captured') return 'Paid';
  if (status === 'failed') return 'Failed';
  if (status === 'authorized') return 'Authorized';
  if (status === 'created') return 'Created';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function refundStatusLabel(refundInfo) {
  if (!refundInfo) return 'No Refund';
  if (!refundInfo.refundId && refundInfo.status === 'none') return 'No Refund';
  if (!refundInfo.refundId) return 'No Refund';

  const status = refundInfo.status;
  if (status === 'processed') return 'Refund Processed';
  if (status === 'failed') return 'Refund Failed';
  if (status === 'pending') return 'Refund Pending';
  if (status === 'initiated') return 'Refund Initiated';
  if (status === 'none') return 'No Refund';
  return `Refund ${status}`;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getEstimatedRefundDays(refundInfo) {
  if (!refundInfo || !refundInfo.estimatedSettlement) return null;
  const now = new Date();
  const settlement = new Date(refundInfo.estimatedSettlement);
  const diffTime = settlement - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Should be settled';
  if (diffDays === 1) return 'Expected tomorrow';
  return `Expected in ${diffDays} days`;
}

// Function to get product image URL
const getProductImage = (item) => {
  if (!item) return noImage;
  
  // Check 1: If media exists directly in item
  if (item.media && Array.isArray(item.media) && item.media.length > 0) {
    const firstImage = item.media.find(mediaItem => 
      mediaItem.type === 'image' || 
      mediaItem.url.includes('.jpg') || 
      mediaItem.url.includes('.png') || 
      mediaItem.url.includes('.jpeg')
    );
    if (firstImage && firstImage.url) {
      return firstImage.url;
    }
  }
  
  // Check 2: If populated product has media
  if (item.productId && item.productId.media && Array.isArray(item.productId.media)) {
    const firstImage = item.productId.media.find(mediaItem => 
      mediaItem.type === 'image' || 
      mediaItem.url.includes('.jpg') || 
      mediaItem.url.includes('.png') || 
      mediaItem.url.includes('.jpeg')
    );
    if (firstImage && firstImage.url) {
      return firstImage.url;
    }
  }
  
  return noImage;
};

// Function to get product name
const getProductName = (item) => {
  if (!item) return 'Unknown Product';
  
  // Check if populated product has name
  if (item.productId && item.productId.name) {
    return item.productId.name;
  }
  
  // Check if item has name directly
  return item.name || 'Unknown Product';
};

// Function to get product ID
const getProductId = (item) => {
  if (!item) return null;
  
  if (item.productId && item.productId._id) {
    return item.productId._id;
  }
  
  if (item.productId && typeof item.productId === 'string') {
    return item.productId;
  }
  
  if (item._id) {
    return item._id;
  }
  
  return null;
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userEmail = userData?.email;

  const fetchLivePaymentStatus = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/paymentStatus/${orderId}`);
      return response.data.paymentInfo;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }, []);

  const fetchRefundStatus = useCallback(async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/orders/${orderId}/refund-status`);
      return response.data.refundInfo;
    } catch (error) {
      console.error('Error fetching refund status:', error);
      return null;
    }
  }, []);

  // Guest orders link function
  const linkGuestOrders = useCallback(async () => {
    if (!userData.email || !userData._id) return;

    try {
      const response = await axiosInstance.post('/api/orders/link-guest-orders', {
        email: userData.email,
        userId: userData._id
      });
      
      if (response.data.linkedCount > 0) {
        console.log(`✅ Linked ${response.data.linkedCount} guest orders`);
        fetchOrdersByEmail();
      }
    } catch (error) {
      console.error('Error linking guest orders:', error);
    }
  }, [userData.email, userData._id]);

  // Email से orders fetch function
  const fetchOrdersByEmail = useCallback(async () => {
    setLoading(true);
    try {
      // Guest orders link
      await linkGuestOrders();

      // User ID से try
      if (userData._id) {
        try {
          const response = await axiosInstance.get(`/api/orders/user/${userData._id}`);
          if (response.data.orders && response.data.orders.length > 0) {
            const ordersWithLiveStatus = await Promise.all(
              response.data.orders.map(async (order) => {
                const paymentInfo = await fetchLivePaymentStatus(order._id);
                const refundInfo = await fetchRefundStatus(order._id);
                return {
                  ...order,
                  paymentInfo: paymentInfo || order.paymentInfo,
                  refundInfo: refundInfo || order.refundInfo || { status: 'none' }
                };
              })
            );
            
            const sortedOrders = ordersWithLiveStatus.sort((a, b) => 
              new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            setOrders(sortedOrders);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('No orders found by userId, trying email...');
        }
      }

      // Email से orders fetch
      const response = await axiosInstance.get(`/api/orders/email/${userEmail}`);
      
      const ordersData = response.data.orders || [];
      
      // Filter current user orders
      const userOrders = ordersData.filter(order => {
        const orderEmail = order.email || order.userEmail;
        return orderEmail && orderEmail.toLowerCase() === userEmail.toLowerCase();
      });
      
      const ordersWithLiveStatus = await Promise.all(
        userOrders.map(async (order) => {
          const paymentInfo = await fetchLivePaymentStatus(order._id);
          const refundInfo = await fetchRefundStatus(order._id);

          return {
            ...order,
            paymentInfo: paymentInfo || order.paymentInfo,
            refundInfo: refundInfo || order.refundInfo || { status: 'none' }
          };
        })
      );
      
      const sortedOrders = ordersWithLiveStatus.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userData._id, userEmail, fetchLivePaymentStatus, fetchRefundStatus, linkGuestOrders]);

  const fetchOrdersSilently = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/orders/by-email/${userEmail}`);
      const ordersData = response.data.orders || [];
      
      const ordersWithLiveStatus = await Promise.all(
        ordersData.map(async (order) => {
          const paymentInfo = await fetchLivePaymentStatus(order._id);
          const refundInfo = await fetchRefundStatus(order._id);
          return {
            ...order,
            paymentInfo: paymentInfo || order.paymentInfo,
            refundInfo: refundInfo || order.refundInfo || { status: 'none' }
          };
        })
      );
      
      const sortedOrders = ordersWithLiveStatus.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders silently:', error);
    }
  }, [userEmail, fetchLivePaymentStatus, fetchRefundStatus]);

  // Authentication check
  useEffect(() => {
    const checkAuthAndLinkOrders = async () => {
      if (!userData.email) {
        navigate('/login');
        return;
      }
      
      setIsAuthenticated(true);
      
      // Guest orders link
      if (userData._id) {
        try {
          const linkResponse = await axiosInstance.post('/api/orders/link-guest-orders', {
            email: userData.email,
            userId: userData._id
          });
          
          if (linkResponse.data.linkedCount > 0) {
            console.log(`✅ Auto-linked ${linkResponse.data.linkedCount} guest orders`);
          }
        } catch (error) {
          console.error('Auto-linking guest orders failed:', error);
        }
      }
    };

    checkAuthAndLinkOrders();
  }, [navigate, userData]);

  // Initial fetch and periodic updates
  useEffect(() => {
    if (userEmail) {
      fetchOrdersByEmail();

      const interval = setInterval(() => {
        fetchOrdersSilently();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userEmail, fetchOrdersByEmail, fetchOrdersSilently]);

  const openOrderDetails = async (order) => {
    try {
      const paymentInfo = await fetchLivePaymentStatus(order._id);
      const refundInfo = await fetchRefundStatus(order._id);

      setSelectedOrder({
        ...order,
        paymentInfo: paymentInfo || order.paymentInfo,
        refundInfo: refundInfo || order.refundInfo || { status: 'none' }
      });
    } catch (error) {
      console.error('Error fetching latest order data:', error);
      setSelectedOrder(order);
    }
    setShowModal(true);
  };

  const handleProductClick = (item) => {
    const productId = getProductId(item);
    if (productId) {
      setShowModal(false);
      setSelectedOrder(null);
      navigate(`/ProductPage/${productId}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const closeOrderDetails = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (isAuthenticated === null) return null;

  return (
    <>
      <Header />
      <div className="order-page-container">
        {/* Mobile Sidebar Toggle */}
        <button className="mobile-sidebar-toggle" onClick={toggleSidebar}>
          <span className="toggle-icon">☰</span>
          Menu
        </button>

        <div className="order-layout">
          {/* Sidebar */}
          <aside className={`order-sidebar ${sidebarOpen ? 'active' : ''}`}>
            <div className="sidebar-header">
              <button className="mobile-close-sidebar" onClick={toggleSidebar}>×</button>
              <div className="user-avatar">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-info">
                <h3>Hello {userData?.name || 'User'}</h3>
                <p>Welcome to your account</p>
              </div>
            </div>
            <nav className="sidebar-nav">
              <button 
                className="nav-item" 
                onClick={() => navigate('/EditProfile')}
              >
                <span className="nav-icon">👤</span>
                <span className="nav-text">My Profile</span>
              </button>
              <button 
                className="nav-item active" 
                onClick={() => navigate('/OrderPage')}
              >
                <span className="nav-icon">📦</span>
                <span className="nav-text">My Orders</span>
                {orders.length > 0 && (
                  <span className="order-count">{orders.length}</span>
                )}
              </button>
              <button 
                className="nav-item logout" 
                onClick={handleLogout}
              >
                <span className="nav-icon">🚪</span>
                <span className="nav-text">Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="order-content">
            <div className="order-card">
              <div className="order-header">
                <h2>My Orders</h2>
                <p className="user-email-display">Email: {userEmail}</p>
              </div>

              {loading ? (
                <CustomLoader />
              ) : (
                <div className="orders-container">
                  {/* Desktop Table View */}
                  <div className="desktop-view">
                    <div className="orders-table">
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Order ID</th>
                            <th>Product(s)</th>
                            <th>Image</th>
                            <th>Date</th>
                            <th>Order Status</th>
                            <th>Payment Status</th>
                            <th>Refund Status</th>
                            <th>Total</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length > 0 ? (
                            orders.map((order, index) => (
                              <tr key={order._id}>
                                <td>{index + 1}</td>
                                <td>{order._id.slice(-8)}</td>
                                <td>
                                  <div className="product-names-container">
                                    {order.items && order.items.length > 0
                                      ? order.items.map((item, idx) => {
                                          const productName = getProductName(item);
                                          const productId = getProductId(item);
                                          const quantity = item.quantity || 1;
                                          const variant = item.variant || item.sku || null;
                                          
                                          return (
                                            <div key={`${productId || idx}-${idx}`} className="product-name-item">
                                              <div className="product-info-tooltip">
                                                <span 
                                                  className="clickable-product-name"
                                                  onClick={() => productId && handleProductClick(item)}
                                                >
                                                  {productName}
                                                  {quantity > 1 && (
                                                    <span className="product-quantity">×{quantity}</span>
                                                  )}
                                                </span>
                                                {variant && (
                                                  <span className="tooltip-text">
                                                    {productName}
                                                    <br />
                                                    <strong>Variant:</strong> {variant}
                                                    <br />
                                                    <strong>Qty:</strong> {quantity}
                                                    {item.price && (
                                                      <>
                                                        <br />
                                                        <strong>Price:</strong> ₹{item.price}
                                                      </>
                                                    )}
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {variant && !variant.includes(productName) && (
                                                <span className="product-badge">
                                                  {variant.length > 12 ? variant.substring(0, 12) + '...' : variant}
                                                </span>
                                              )}
                                              
                                              {idx < order.items.length - 1 && (
                                                <span className="product-separator">, </span>
                                              )}
                                            </div>
                                          );
                                        })
                                      : <span className="no-items-text">No items</span>
                                    }
                                  </div>
                                </td>
                                <td>
                                  {order.items && order.items.length > 0 && (
                                    <div 
                                      className="product-thumbnail"
                                      onClick={() => {
                                        const productId = getProductId(order.items[0]);
                                        if (productId) {
                                          navigate(`/ProductPage/${productId}`);
                                        }
                                      }}
                                    >
                                      <img 
                                        src={getProductImage(order.items[0])} 
                                        alt="Product" 
                                        className="thumbnail-img"
                                        onError={(e) => {
                                          e.target.src = noImage;
                                        }}
                                      />
                                      {order.items.length > 1 && (
                                        <span className="more-items-count">+{order.items.length - 1}</span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="date-cell">{formatDate(order.createdAt)}</td>
                                <td>
                                  <span className={`status-badge ${order.status.toLowerCase()}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge ${order.paymentInfo?.status?.toLowerCase() || 'unknown'}`}>
                                    {order.paymentInfo
                                      ? paymentStatusLabel(order.paymentInfo.status)
                                      : 'Unknown'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`status-badge ${order.refundInfo?.status?.toLowerCase() || 'none'}`}>
                                    {refundStatusLabel(order.refundInfo)}
                                  </span>
                                  {order.refundInfo && order.refundInfo.refundId && getEstimatedRefundDays(order.refundInfo) && (
                                    <div className="refund-estimate">
                                      <small>{getEstimatedRefundDays(order.refundInfo)}</small>
                                    </div>
                                  )}
                                </td>
                                <td className="total-amount-cell">₹{order.totalAmount}</td>
                                <td>
                                  <button
                                    className="view-details-btn"
                                    onClick={() => openOrderDetails(order)}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="10">
                                <div className="no-orders">
                                  <p>No orders found.</p>
                                  <button 
                                    className="shop-now-btn"
                                    onClick={() => navigate('/')}
                                  >
                                    Shop Now
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Card View */}
                  <div className="mobile-view">
                    {orders.length > 0 ? (
                      orders.map((order, index) => (
                        <div key={order._id} className="mobile-order-card">
                          <div className="mobile-order-header">
                            <div className="mobile-order-info">
                              <span className="mobile-order-id">Order #{order._id.slice(-8)}</span>
                              <span className="mobile-order-date">{formatDate(order.createdAt)}</span>
                            </div>
                            <span className={`mobile-order-status ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="mobile-order-content">
                            {/* Product Image */}
                            {order.items && order.items.length > 0 && (
                              <div className="mobile-product-image">
                                <div 
                                  className="mobile-thumbnail-container"
                                  onClick={() => {
                                    const productId = getProductId(order.items[0]);
                                    if (productId) {
                                      navigate(`/ProductPage/${productId}`);
                                    }
                                  }}
                                >
                                  <img 
                                    src={getProductImage(order.items[0])} 
                                    alt="Product" 
                                    className="mobile-thumbnail-img"
                                    onError={(e) => {
                                      e.target.src = noImage;
                                    }}
                                  />
                                  {order.items.length > 1 && (
                                    <span className="mobile-more-items">+{order.items.length - 1}</span>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            {/* Product Name */}
                            <div className="mobile-product-details">
                              <h4 className="mobile-product-title">Products:</h4>
                              <div className="mobile-products-list">
                                {order.items && order.items.length > 0
                                  ? order.items.map((item, idx) => {
                                      const productName = getProductName(item);
                                      const productId = getProductId(item);
                                      const quantity = item.quantity || 1;
                                      const variant = item.variant || item.sku || null;
                                      
                                      return (
                                        <div key={`mobile-${productId || idx}`} className="mobile-product-item">
                                          <div 
                                            className="mobile-product-name"
                                            onClick={() => productId && handleProductClick(item)}
                                          >
                                            {productName}
                                            {quantity > 1 && (
                                              <span className="mobile-product-quantity"> ×{quantity}</span>
                                            )}
                                          </div>
                                          {variant && (
                                            <div className="mobile-product-variant">
                                              {variant.length > 20 ? variant.substring(0, 20) + '...' : variant}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })
                                  : <span className="mobile-no-items">No items</span>
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className="mobile-order-footer">
                            <div className="mobile-footer-left">
                              <div className="mobile-total-amount">
                                Total: <span className="mobile-amount">₹{order.totalAmount}</span>
                              </div>
                              <div className="mobile-payment-status">
                                <span className={`mobile-status-badge ${order.paymentInfo?.status?.toLowerCase() || 'unknown'}`}>
                                  {order.paymentInfo ? paymentStatusLabel(order.paymentInfo.status) : 'Unknown'}
                                </span>
                                {order.refundInfo?.status && order.refundInfo.status !== 'none' && (
                                  <span className={`mobile-refund-badge ${order.refundInfo.status}`}>
                                    {refundStatusLabel(order.refundInfo)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              className="mobile-view-details-btn"
                              onClick={() => openOrderDetails(order)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="mobile-no-orders">
                        <p>No orders found.</p>
                        <button 
                          className="mobile-shop-now-btn"
                          onClick={() => navigate('/')}
                        >
                          Shop Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>Order Details</h3>
                <p>Order #{selectedOrder._id.slice(-8)}</p>
                <p className="modal-email">Email: {selectedOrder.email || selectedOrder.userEmail}</p>
              </div>
              <button className="modal-close" onClick={closeOrderDetails}>×</button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              <div className="modal-grid">
                {/* Left Column - Order Info & Shipping */}
                <div className="modal-left-column">
                  {/* Order Information */}
                  <div className="modal-section order-info-section">
                    <h4>Order Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Order Date</span>
                        <span className="info-value">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Order Status</span>
                        <span className={`info-value status ${selectedOrder.status.toLowerCase()}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Order ID</span>
                        <span className="info-value order-id">{selectedOrder._id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="modal-section payment-info-section">
                    <h4>Payment Information</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Payment Status</span>
                        <span className={`info-value payment-status ${selectedOrder.paymentInfo?.status?.toLowerCase() || 'unknown'}`}>
                          {selectedOrder.paymentInfo ? paymentStatusLabel(selectedOrder.paymentInfo.status) : 'Unknown'}
                        </span>
                      </div>
                      {selectedOrder.paymentInfo?.paymentId && (
                        <div className="info-item">
                          <span className="info-label">Payment ID</span>
                          <span className="info-value payment-id">{selectedOrder.paymentInfo.paymentId}</span>
                        </div>
                      )}
                      {selectedOrder.paymentInfo?.amount && (
                        <div className="info-item">
                          <span className="info-label">Amount Paid</span>
                          <span className="info-value amount">₹{selectedOrder.paymentInfo.amount / 100}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Refund Information */}
                  {selectedOrder.refundInfo && selectedOrder.refundInfo.status !== 'none' && (
                    <div className="modal-section refund-info-section">
                      <h4>Refund Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="info-label">Refund Status</span>
                          <span className={`info-value refund-status ${selectedOrder.refundInfo.status}`}>
                            {refundStatusLabel(selectedOrder.refundInfo)}
                          </span>
                        </div>
                        {selectedOrder.refundInfo.refundId && (
                          <div className="info-item">
                            <span className="info-label">Refund ID</span>
                            <span className="info-value refund-id">{selectedOrder.refundInfo.refundId}</span>
                          </div>
                        )}
                        {selectedOrder.refundInfo.estimatedSettlement && (
                          <div className="info-item">
                            <span className="info-label">Estimated Settlement</span>
                            <span className="info-value settlement-date">
                              {getEstimatedRefundDays(selectedOrder.refundInfo)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  <div className="modal-section shipping-section">
                    <h4>Shipping Address</h4>
                    <div className="shipping-info">
                      <p className="shipping-address">{selectedOrder.address}</p>
                      <p className="shipping-phone">
                        <strong>Phone:</strong> {selectedOrder.phone}
                      </p>
                      {selectedOrder.deliveryInstructions && (
                        <p className="delivery-instructions">
                          <strong>Instructions:</strong> {selectedOrder.deliveryInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Items & Summary */}
                <div className="modal-right-column">
                  {/* Items Ordered */}
                  <div className="modal-section items-section">
                    <h4>Items Ordered</h4>
                    <div className="modal-items">
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <div key={index} className="modal-item">
                          <div 
                            className="modal-item-image"
                            onClick={() => handleProductClick(item)}
                          >
                            <img 
                              src={getProductImage(item)} 
                              alt={getProductName(item)}
                              onError={(e) => {
                                e.target.src = noImage;
                              }}
                            />
                          </div>
                          <div className="modal-item-details">
                            <h5 
                              className="modal-item-name"
                              onClick={() => handleProductClick(item)}
                            >
                              {getProductName(item)}
                            </h5>
                            <div className="modal-item-info">
                              <span className="modal-item-quantity">Qty: {item.quantity || 1}</span>
                              <span className="modal-item-price">₹{item.price || 0} each</span>
                            </div>
                            {item.variant && (
                              <div className="modal-item-variant">
                                Variant: {item.variant}
                              </div>
                            )}
                            <div className="modal-item-total">
                              Total: ₹{(item.price || 0) * (item.quantity || 1)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="modal-section summary-section">
                    <h4>Order Summary</h4>
                    <div className="modal-summary">
                      <div className="modal-summary-row">
                        <span>Subtotal:</span>
                        <span>₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                      </div>
                      <div className="modal-summary-row">
                        <span>Shipping:</span>
                        <span className={selectedOrder.shippingCharge > 0 ? 'shipping-fee' : 'free-shipping'}>
                          {selectedOrder.shippingCharge > 0 ? `₹${selectedOrder.shippingCharge}` : 'FREE'}
                        </span>
                      </div>
                      <div className="modal-summary-row">
                        <span>Tax:</span>
                        <span>₹{selectedOrder.taxAmount || '0.00'}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="modal-summary-row discount">
                          <span>Discount:</span>
                          <span className="discount-amount">-₹{selectedOrder.discount}</span>
                        </div>
                      )}
                      <div className="modal-summary-divider"></div>
                      <div className="modal-summary-row total">
                        <span>Total Amount:</span>
                        <span>₹{selectedOrder.totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button 
                  className="modal-btn close-btn"
                  onClick={closeOrderDetails}
                >
                  Close
                </button>
                <button 
                  className="modal-btn print-btn"
                  onClick={() => window.print()}
                >
                  Print Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}

export default OrderPage;
import React, { useEffect, useState } from 'react';
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

// Function to get product image URL - UPDATED
const getProductImage = (item) => {
  if (!item) return noImage;
  
  // Check 1: If media exists directly in item (from order creation)
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

// Function to get product name - UPDATED
const getProductName = (item) => {
  if (!item) return 'Unknown Product';
  
  // Check if populated product has name
  if (item.productId && item.productId.name) {
    return item.productId.name;
  }
  
  // Check if item has name directly
  return item.name || 'Unknown Product';
};

// Function to get product ID - NEW
const getProductId = (item) => {
  if (!item) return null;
  
  // Check if item has productId directly (populated)
  if (item.productId && item.productId._id) {
    return item.productId._id;
  }
  
  // Check if item has productId as string
  if (item.productId && typeof item.productId === 'string') {
    return item.productId;
  }
  
  // Check if item has _id (for non-populated items)
  if (item._id) {
    return item._id;
  }
  
  return null;
};
// --- Add these below state declarations and above return() ---

const handleCancelOrder = () => {
  console.log("Cancel order clicked");
  // TODO: Add cancel order API logic
};

const handleShareOrder = () => {
  console.log("Share order clicked");
  navigator.share
    ? navigator.share({
        title: "Order Details",
        text: "Check my order details",
        url: window.location.href
      })
    : alert("Share not supported on this device");
};

const getPaymentMethodIcon = (method) => {
  switch (method?.toLowerCase()) {
    case 'upi':
      return '📱';
    case 'card':
      return '💳';
    case 'netbanking':
      return '🏦';
    case 'wallet':
      return '👛';
    default:
      return '💰';
  }
};

const handleSupportRequest = () => {
  console.log("Support request clicked");
  alert("Our support team will contact you soon.");
};

const handleExportOrder = () => {
  console.log("Export clicked");
  window.print(); // temporary export
};

const handleAddNote = () => {
  console.log("Add note clicked");
  alert("Note feature coming soon.");
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const userId = userData?._id;

  // Authentication check
  useEffect(() => {
    if (!userData._id) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, userData]);

  // Initial fetch and periodic updates
  useEffect(() => {
    if (userId) {
      fetchOrders();

      // Update every 30 seconds to check for payment/refund status changes
      const interval = setInterval(() => {
        fetchOrdersSilently();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [userId]);

  const fetchLivePaymentStatus = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/paymentStatus/${orderId}`);
      return response.data.paymentInfo;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  };

  const fetchRefundStatus = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/orders/${orderId}/refund-status`);
      return response.data.refundInfo;
    } catch (error) {
      console.error('Error fetching refund status:', error);
      return null;
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/orders/${userId}`);
      const ordersWithLiveStatus = await Promise.all(
        (response.data.orders || []).map(async (order) => {
          // Fetch live payment status
          const paymentInfo = await fetchLivePaymentStatus(order._id);

          // Fetch live refund status for all orders
          const refundInfo = await fetchRefundStatus(order._id);

          return {
            ...order,
            paymentInfo: paymentInfo || order.paymentInfo,
            refundInfo: refundInfo || order.refundInfo || { status: 'none' }
          };
        })
      );
      setOrders(ordersWithLiveStatus);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersSilently = async () => {
    try {
      const response = await axiosInstance.get(`/api/orders/${userId}`);
      const ordersWithLiveStatus = await Promise.all(
        (response.data.orders || []).map(async (order) => {
          // Fetch live payment status
          const paymentInfo = await fetchLivePaymentStatus(order._id);

          // Fetch live refund status for all orders
          const refundInfo = await fetchRefundStatus(order._id);

          return {
            ...order,
            paymentInfo: paymentInfo || order.paymentInfo,
            refundInfo: refundInfo || order.refundInfo || { status: 'none' }
          };
        })
      );
      setOrders(ordersWithLiveStatus);
    } catch (error) {
      console.error('Error fetching orders silently:', error);
    }
  };

  const openOrderDetails = async (order) => {
    // Fetch the most recent data before showing modal
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

  // Function to handle product click - NEW
  const handleProductClick = (item) => {
    const productId = getProductId(item);
    if (productId) {
      // Close modal if open
      setShowModal(false);
      setSelectedOrder(null);
      
      // Navigate to product page
      navigate(`/ProductPage/${productId}`);
    } else {
      console.error('Product ID not found for item:', item);
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

  if (isAuthenticated === null) return null;

  return (
    <>
      <Header />
      <div className="order-page-container">
        <div className="order-layout">
          {/* Sidebar */}
          <aside className="order-sidebar">
            <div className="sidebar-header">
              <h3>Hello {userData?.name}</h3>
              <p>Welcome to your account</p>
            </div>
            <nav className="sidebar-nav">
              <a className="nav-item" onClick={() => navigate('/EditProfile')}>
                My Profile
              </a>
              <a className="nav-item active" onClick={() => navigate('/OrderPage')}>
                My Orders
              </a>
              <a className="nav-item logout" onClick={handleLogout}>
                Logout
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="order-content">
            <div className="order-card">
              <div className="order-header">
                <h2>My Orders</h2>
              </div>

              {loading ? (
                <CustomLoader />
              ) : (
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
    {order.items && Array.isArray(order.items) && order.items.length > 0
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
                  style={{ 
                    cursor: productId ? 'pointer' : 'default',
                    textDecoration: 'none'
                  }}
                >
                  {productName}
                  {quantity > 1 && (
                    <span className="product-quantity" title={`Quantity: ${quantity}`}>
                      ×{quantity}
                    </span>
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
                <span className="product-badge" title={`Variant: ${variant}`}>
                  {variant.length > 12 ? variant.substring(0, 12) + '...' : variant}
                </span>
              )}
              
              {idx < order.items.length - 1 && (
                <span className="product-separator">, </span>
              )}
            </div>
          );
        })
      : (
        <div className="no-items-text">
          <span className="text-muted">No items</span>
        </div>
      )
    }
  </div>
</td>
                            <td>
                              {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                                <div 
                                  className="product-thumbnail"
                                  onClick={() => {
                                    const productId = getProductId(order.items[0]);
                                    if (productId) {
                                      navigate(`/ProductPage/${productId}`);
                                    }
                                  }}
                                  style={{ 
                                    cursor: getProductId(order.items[0]) ? 'pointer' : 'default'
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
                            <td>{formatDate(order.createdAt)}</td>
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
                            <td>₹{order.totalAmount}</td>
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
                          <td colSpan="10" style={{ textAlign: 'center', padding: '40px' }}>
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
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Order Details Modal */}
{showModal && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeOrderDetails}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0' }}>Order Details</h3>
                <p style={{ margin: '5px 0 0 0', color: '#666' }}>Order #{selectedOrder._id.slice(-8)}</p>
              </div>
              <button onClick={closeOrderDetails} style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}>×</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Left Column */}
                <div>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Order Information</h4>
                    <div>
                      <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                      <p><strong>Status:</strong> {selectedOrder.status}</p>
                      <p><strong>Total:</strong> ₹{selectedOrder.totalAmount}</p>
                    </div>
                  </div>

                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Shipping Address</h4>
                    <p>{selectedOrder.address}</p>
                    {selectedOrder.deliveryInstructions && (
                      <p><strong>Instructions:</strong> {selectedOrder.deliveryInstructions}</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Items Ordered</h4>
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #dee2e6' }}>
                        <img src={getProductImage(item)} alt={getProductName(item)} style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '10px', borderRadius: '4px' }} />
                        <div>
                          <p style={{ margin: '0', fontWeight: 'bold' }}>{getProductName(item)}</p>
                          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
                            ₹{item.price} × {item.quantity} = ₹{(item.price || 0) * (item.quantity || 0)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Order Summary</h4>
                    <div>
                      <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subtotal:</span>
                        <span>₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                      </p>
                      <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Shipping:</span>
                        <span>{selectedOrder.shippingCharge > 0 ? `₹${selectedOrder.shippingCharge}` : 'FREE'}</span>
                      </p>
                      <p style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tax:</span>
                        <span>₹{selectedOrder.taxAmount || '0.00'}</span>
                      </p>
                      {selectedOrder.discount > 0 && (
                        <p style={{ display: 'flex', justifyContent: 'space-between', color: '#28a745' }}>
                          <span>Discount:</span>
                          <span>-₹{selectedOrder.discount}</span>
                        </p>
                      )}
                      <hr style={{ margin: '10px 0' }} />
                      <p style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <span>Total:</span>
                        <span>₹{selectedOrder.totalAmount}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button onClick={closeOrderDetails} style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Close
                </button>
                <button onClick={() => window.print()} style={{
                  padding: '10px 20px',
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Print
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
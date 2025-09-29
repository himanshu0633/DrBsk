import React, { useEffect, useState } from 'react';
import './OrderPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../components/AxiosInstance';
import CustomLoader from '../../components/CustomLoader';
import { useNavigate } from 'react-router-dom';

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
                <h2>Loading Orders...</h2>
              ) : (
                <div className="orders-table">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Order ID</th>
                        <th>Product(s)</th>
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
                              {order.items && Array.isArray(order.items)
                                ? order.items.map(item => item.name || 'Unknown Product').join(', ')
                                : 'No items'
                              }
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
                          <td colSpan="9" style={{ textAlign: 'center' }}>
                            No orders found.
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
        <div className="modal-overlay" onClick={closeOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder._id.slice(-8)}</h3>
              <button className="modal-close" onClick={closeOrderDetails}>×</button>
            </div>

            <div className="modal-body">
              {/* Order Information */}
              <div className="details-section">
                <h4>Order Information</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`status-badge ${selectedOrder.status.toLowerCase()}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Order Date:</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Amount:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span>{selectedOrder.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Address:</span>
                    <span>{selectedOrder.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Razorpay Order ID:</span>
                    <span>{selectedOrder.razorpayOrderId}</span>
                  </div>
                </div>

                {selectedOrder.cancelReason && (
                  <div className="cancellation-info">
                    <h5>Cancellation Details</h5>
                    <p><strong>Reason:</strong> {selectedOrder.cancelReason}</p>
                    {selectedOrder.cancelledAt && (
                      <p><strong>Cancelled on:</strong> {formatDate(selectedOrder.cancelledAt)}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Information */}
              <div className="details-section">
                <h4>Payment Information</h4>
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Payment ID:</span>
                    <span>{selectedOrder.paymentInfo?.paymentId || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Status:</span>
                    <span className={`status-badge ${selectedOrder.paymentInfo?.status?.toLowerCase() || 'unknown'}`}>
                      {selectedOrder.paymentInfo
                        ? paymentStatusLabel(selectedOrder.paymentInfo.status)
                        : 'Unknown'}
                    </span>
                  </div>
                  {selectedOrder.paymentInfo?.method && (
                    <div className="detail-item">
                      <span className="detail-label">Payment Method:</span>
                      <span>{selectedOrder.paymentInfo.method}</span>
                    </div>
                  )}
                  {selectedOrder.paymentInfo?.updatedAt && (
                    <div className="detail-item">
                      <span className="detail-label">Payment Updated:</span>
                      <span>{formatDate(selectedOrder.paymentInfo.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Information - Only show if refund exists */}
              {selectedOrder.refundInfo && selectedOrder.refundInfo.refundId && (
                <div className="details-section refund-section">
                  <h4>Refund Information</h4>
                  <div className="refund-status-card">
                    <div className="refund-header">
                      <span className={`status-badge ${selectedOrder.refundInfo.status?.toLowerCase() || 'unknown'}`}>
                        {refundStatusLabel(selectedOrder.refundInfo)}
                      </span>
                      <span className="refund-amount">₹{selectedOrder.refundInfo.amount}</span>
                    </div>

                    <div className="refund-details">
                      <div className="detail-row">
                        <span>Refund ID:</span>
                        <span>{selectedOrder.refundInfo.refundId}</span>
                      </div>
                      <div className="detail-row">
                        <span>Refund Reason:</span>
                        <span>{selectedOrder.refundInfo.reason}</span>
                      </div>
                      <div className="detail-row">
                        <span>Processing Speed:</span>
                        <span className="capitalize">{selectedOrder.refundInfo.speed}</span>
                      </div>
                      <div className="detail-row">
                        <span>Initiated:</span>
                        <span>{formatDate(selectedOrder.refundInfo.initiatedAt)}</span>
                      </div>
                      {selectedOrder.refundInfo.processedAt && (
                        <div className="detail-row">
                          <span>Processed:</span>
                          <span>{formatDate(selectedOrder.refundInfo.processedAt)}</span>
                        </div>
                      )}
                      {selectedOrder.refundInfo.estimatedSettlement && (
                        <div className="detail-row settlement-info">
                          <span>Expected Settlement:</span>
                          <span>
                            {formatDate(selectedOrder.refundInfo.estimatedSettlement)}
                            <small className="settlement-note">
                              ({getEstimatedRefundDays(selectedOrder.refundInfo)})
                            </small>
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedOrder.refundInfo.notes && (
                      <div className="refund-notes">
                        <strong>Note:</strong> {selectedOrder.refundInfo.notes}
                      </div>
                    )}

                    <div className="refund-timeline">
                      <h5>Refund Timeline</h5>
                      <div className="timeline-item completed">
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <span>Refund Initiated</span>
                          <small>{formatDate(selectedOrder.refundInfo.initiatedAt)}</small>
                        </div>
                      </div>
                      {selectedOrder.refundInfo.processedAt && (
                        <div className="timeline-item completed">
                          <div className="timeline-marker"></div>
                          <div className="timeline-content">
                            <span>Refund Processed</span>
                            <small>{formatDate(selectedOrder.refundInfo.processedAt)}</small>
                          </div>
                        </div>
                      )}
                      <div className={`timeline-item ${selectedOrder.refundInfo.status === 'processed' ? 'active' : 'pending'}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content">
                          <span>Amount Credited to Account</span>
                          <small>
                            {selectedOrder.refundInfo.estimatedSettlement
                              ? formatDate(selectedOrder.refundInfo.estimatedSettlement)
                              : 'Pending'}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Information */}
              <div className="details-section">
                <h4>Items Ordered</h4>
                <div className="items-list">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-details">
                        <h5>{item.name || 'Unknown Product'}</h5>
                        <p>Product ID: {item.productId || 'N/A'}</p>
                        <div className="item-price-qty">
                          <span>₹{item.price || 0} × {item.quantity || 0}</span>
                          <span className="item-total">₹{(item.price || 0) * (item.quantity || 0)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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


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
  if (status === 'refunded') return 'Refunded';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?._id;

  // Authentication check
  useEffect(() => {
    if (!userData) {
      navigate('/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate, userData]);

  // Fetch user's orders
  // useEffect(() => {
  //   if (userId) fetchOrders();
  // }, [userId]);


  useEffect(() => {
    const interval = setInterval(() => {
      if (userId) fetchOrders();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [userId]);


  // const fetchOrders = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axiosInstance.get(`/api/orders/${userId}`);
  //     setOrders(response.data.orders || []);
  //   } catch (error) {
  //     console.error('Error fetching orders:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // Handle logout

  const fetchLivePaymentStatus = async (orderId) => {
    try {
      const response = await axiosInstance.get(`/api/paymentStatus/${orderId}`);
      return response.data.paymentInfo; // This is your live payment status
    } catch (error) {
      console.error('Error fetching payment status:', error);
      // Return a default payment info object instead of null
      return {
        status: 'pending',
        amount: 0,
        paymentId: null
      };
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/orders/${userId}`);
      const ordersWithLiveStatus = await Promise.all(
        (response.data.orders || []).map(async (order) => {
          // Fetch live payment status for each order
          const paymentInfo = await fetchLivePaymentStatus(order._id);
          return {
            ...order,
            paymentInfo, // override with live Razorpay status
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


  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
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
                {/* <div className="search-bar">
                  <input type="text" placeholder="Search orders..." />
                  <button className="search-button">Search</button>
                </div> */}
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
                        <th>Date</th>
                        <th>Order Status</th>
                        <th>Payment Status</th>
                        <th>Total</th>
                        <th>Phone</th>
                        {/* <th>Action</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length > 0 ? (
                        orders.map((order, index) => (
                          <tr key={order._id}>
                            <td>{index + 1}</td>
                            <td>{order._id}</td>
                            <td>{order.items.map(item => item.name).join(', ')}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className={`status-badge ${order.status.toLowerCase()}`}>
                                {order.status}
                              </span>
                            </td>
                            <td>
                              {order.paymentInfo && order.paymentInfo.status
                                ? paymentStatusLabel(order.paymentInfo.status)
                                : 'Pending'}
                            </td>
                            <td>₹{order.totalAmount}</td>
                            <td>{order.phone}</td>
                            {/* <td>
                              {order.status === 'Pending' && (
                                <button
                                  className="pay-now-button"
                                  onClick={() => handlePayNow(order._id, order.totalAmount)}
                                >
                                  Pay Now
                                </button>
                              )}
                            </td> */}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center' }}>
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
      <Footer />
    </>
  );
};

export default OrderPage;

import React, { useEffect, useState } from 'react';
import './OrderPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../components/AxiosInstance';
import CustomLoader from '../../components/CustomLoader';
import { useNavigate } from 'react-router-dom';

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  // Get userId from sessionStorage
  const userData = JSON.parse(localStorage.getItem('userData'));
  const userId = userData?._id;
  const navigate = useNavigate();


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/api/orders/${userId}`);
      setOrders(response.data.orders); // Adjust according to your API response structure
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setIsAuthenticated(true);
    } else {
      // window.location.href = '/login';
          navigate('/login')
    }
  }, []);

  if (isAuthenticated === null) return null;


  return (
    <>
      <Header />
      <div className="order-page-container">
        <div className="order-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="sidebar-header">
              <h3>Hello User</h3>
              <p>Welcome to your account</p>
            </div>
            <nav className="sidebar-nav">
              <a className="nav-item" href="http://localhost:3000/EditProfile">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                My Profile
              </a>
              <a className="nav-item active" href="http://localhost:3000/OrderPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H3V6h18v13z" />
                </svg>
                My Orders
              </a>
              {/* <a className="nav-item" href="http://localhost:3000/PatientsPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                Patients
              </a>
              <a className="nav-item" href="http://localhost:3000/NotificationsPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                Notifications
              </a>
              <a className="nav-item" href="ConsultationsPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
                </svg>
                Consultations
              </a> */}
              <a className="nav-item" href="#">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
                Need Help?
              </a>
              <a className="nav-item logout" href="#">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                Logout
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="order-content">
            <div className="order-card">
              <div className="order-header">
                <h2>My Orders</h2>
                <div className="search-bar">
                  <input type="text" placeholder="Search orders..." />
                  <button className="search-button">
                    <svg viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 
                               16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 
                               5.91 16 9.5 16c1.61 0 3.09-.59 
                               4.23-1.57l.27.28v.79l5 4.99 
                               L20.49 19l-4.99-5zm-6 0C7.01 14 
                               5 11.99 5 9.5S7.01 5 9.5 5 
                               14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </button>
                </div>
              </div>
              {loading ? <CustomLoader /> : (<div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Order ID</th>
                      <th>Product(s)</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Phone</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order, index) => (
                      <tr key={order._id || index}>
                        <td>{index + 1}</td>
                        <td>{order._id}</td>
                        <td>
                          {order.items.map(item => item.name).join(', ')}
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>₹{order.totalAmount}</td>
                        <td>{order.phone}</td>

                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>
                          No orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>)}

            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderPage;

// import React, { useEffect, useState } from 'react';
// import './OrderPage.css';
// import Header from '../../components/Header/Header';
// import Footer from '../../components/Footer/Footer';
// import axiosInstance from '../../components/AxiosInstance';
// import CustomLoader from '../../components/CustomLoader';
// import { useNavigate } from 'react-router-dom';

// const OrderPage = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(null);

//   // Get userId from sessionStorage
//   const userData = JSON.parse(localStorage.getItem('userData'));
//   const userId = userData?._id;
//   const navigate = useNavigate();


//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const response = await axiosInstance.get(`/api/orders/${userId}`);
//       setOrders(response.data.orders); // Adjust according to your API response structure
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     const userData = localStorage.getItem('userData');
//     if (userData) {
//       setIsAuthenticated(true);
//     } else {
//       // window.location.href = '/login';
//       navigate('/login')
//     }
//   }, []);

//   if (isAuthenticated === null) return null;

//   const handleLogout = (e) => {
//     e.preventDefault();
//     console.log('Logging out...');
//     localStorage.removeItem('userData');
//     navigate('/login')
//   };


//   return (
//     <>
//       <Header />
//       <div className="order-page-container">
//         <div className="order-layout">
//           {/* Sidebar */}
//           <aside className="order-sidebar">
//             <div className="sidebar-header">
//               <h3>Hello {userData?.name}</h3>
//               <p>Welcome to your account</p>
//             </div>
//             <nav className="sidebar-nav">
//               <a className="nav-item" onClick={() => navigate('/EditProfile')}>
//                 <svg className="nav-icon" viewBox="0 0 24 24">
//                   <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
//                 </svg>
//                 My Profile
//               </a>
//               <a className="nav-item active" onClick={() => navigate('/OrderPage')}>
//                 <svg className="nav-icon" viewBox="0 0 24 24">
//                   <path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H3V6h18v13z" />
//                 </svg>
//                 My Orders
//               </a>
//               <a className="nav-item logout" onClick={handleLogout}>
//                 <svg className="nav-icon" viewBox="0 0 24 24">
//                   <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
//                 </svg>
//                 Logout
//               </a>
//             </nav>
//           </aside>

//           {/* Main Content */}
//           <main className="order-content">
//             <div className="order-card">
//               <div className="order-header">
//                 <h2>My Orders</h2>
//                 <div className="search-bar">
//                   <input type="text" placeholder="Search orders..." />
//                   <button className="search-button">
//                     <svg viewBox="0 0 24 24">
//                       <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 
//                                16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 
//                                5.91 16 9.5 16c1.61 0 3.09-.59 
//                                4.23-1.57l.27.28v.79l5 4.99 
//                                L20.49 19l-4.99-5zm-6 0C7.01 14 
//                                5 11.99 5 9.5S7.01 5 9.5 5 
//                                14 7.01 14 9.5 11.99 14 9.5 14z" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//               {loading ? <CustomLoader /> : (<div className="orders-table">
//                 <table className=''>
//                   <thead>
//                     <tr>
//                       <th>#</th>
//                       <th>Order ID</th>
//                       <th>Product(s)</th>
//                       <th>Date</th>
//                       <th>Status</th>
//                       <th>Total</th>
//                       <th>Phone</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {orders.map((order, index) => (
//                       <tr key={order._id || index}>
//                         <td>{index + 1}</td>
//                         <td>{order._id}</td>
//                         <td>
//                           {order.items.map(item => item.name).join(', ')}
//                         </td>
//                         <td>{new Date(order.createdAt).toLocaleDateString()}</td>
//                         <td>
//                           <span className={`status-badge ${order.status.toLowerCase()}`}>
//                             {order.status}
//                           </span>
//                         </td>
//                         <td>₹{order.totalAmount}</td>
//                         <td>{order.phone}</td>

//                       </tr>
//                     ))}
//                     {orders.length === 0 && (
//                       <tr>
//                         <td colSpan="5" style={{ textAlign: 'center' }}>
//                           No orders found.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>

//                 </table>
//               </div>)}

//             </div>
//           </main>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default OrderPage;



// // 2:
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


  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/orders/${userId}`);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/login');
  };

  // Razorpay payment
  const triggerRazorpayPayment = (razorpayOrderId, amount) => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded.');
      return;
    }

    const options = {
      key: 'rzp_live_hgk55iUzVRpKZ1', // Your Razorpay Key ID
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Dr BSK Healthcare',
      description: 'Payment for Order',
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          await axiosInstance.post('/api/payment/success', {
            orderId: razorpayOrderId,
            paymentDetails: response
          });
          alert('Payment successful!');
          fetchOrders(); // Refresh orders
        } catch (error) {
          console.error('Error saving payment details:', error);
          alert('Payment successful but saving failed. Contact support.');
        }
      },
      prefill: {
        name: userData?.name,
        email: userData?.email,
        contact: userData?.phone
      },
      theme: {
        color: '#F37254'
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Create Razorpay order & pay
  const handlePayNow = async (orderId, totalAmount) => {
    try {
      const response = await axiosInstance.post('/razorpay/createOrder', {
        userId,
        totalAmount
      });
      const { razorpayOrderId } = response.data;
      triggerRazorpayPayment(razorpayOrderId, totalAmount);
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      alert('Failed to initiate payment.');
    }
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
                <div className="search-bar">
                  <input type="text" placeholder="Search orders..." />
                  <button className="search-button">Search</button>
                </div>
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
                        <th>Status</th>
                        <th>Total</th>
                        <th>Phone</th>
                        <th>Action</th>
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
                            <td>₹{order.totalAmount}</td>
                            <td>{order.phone}</td>
                            <td>
                              {order.status === 'Pending' && (
                                <button
                                  className="pay-now-button"
                                  onClick={() => handlePayNow(order._id, order.totalAmount)}
                                >
                                  Pay Now
                                </button>
                              )}
                            </td>
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

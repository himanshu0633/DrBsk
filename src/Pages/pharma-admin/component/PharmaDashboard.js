// import React, { useEffect, useState } from 'react'
// import axiosInstance from '../../../components/AxiosInstance';
// import CustomLoader from '../../../components/CustomLoader';

// const PharmaDashboard = () => {
//   const [totalUsers, setTotalUsers] = useState(0);
//   const [totalOrders, setTotalOrders] = useState(0);
//   const [totalProducts, setTotalProducts] = useState(0);
//   const [loading, setLoading] = useState(true);

//   const fetchTotalUsers = async () => {
//     try {
//       const response = await axiosInstance.get('/admin/count');
//       console.log("API Response of users", response.data);
//       setTotalUsers(response.data);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const fetchTotalOrders = async () => {
//     try {
//       const response = await axiosInstance.get('/api/totalOrdercount');
//       console.log("API Response of orders", response.data);
//       setTotalOrders(response.data);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//   };
//   const fetchTotalProducts = async () => {
//     try {
//       const response = await axiosInstance.get('/user/totalProductcount');
//       console.log("API Response of products", response.data);
//       setTotalProducts(response.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   useEffect(() => {
//     fetchTotalUsers();
//     fetchTotalOrders();
//     fetchTotalProducts();
//     setLoading(false);
//   }, []);

//   return (
//     <div className="dashboard-container">
//       {loading ? <CustomLoader /> : (<div>
//         <h2 className='fontSize25sml'>Dashboard</h2>
//         <div className="stats-container">
//           <div className="stat-card">
//             <h3>Total Users</h3>
//             <p>{totalUsers.totalAdmins}</p>
//           </div>
//           <div className="stat-card">
//             <h3>Total Products</h3>
//             <p>{totalProducts.total}</p>
//           </div>
//           <div className="stat-card">
//             <h3>Total Orders</h3>
//             <p>{totalOrders.totalOrders}</p>
//           </div>
//         </div>
//       </div>)}
//     </div>
//   )
// }

// export default PharmaDashboard



// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../components/AxiosInstance';
// import CustomLoader from '../../../components/CustomLoader';
// import { Line, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// const PharmaDashboard = () => {
//   const [totalUsers, setTotalUsers] = useState({ totalAdmins: 0, createdDates: [] });
//   const [totalOrders, setTotalOrders] = useState({ totalOrders: 0 });
//   const [totalProducts, setTotalProducts] = useState({ total: 0 });
//   const [loading, setLoading] = useState(true);

//     const groupUsersByDate = (createdDates) => {
//     const dateMap = {};

//     createdDates.forEach(({ createdAt }) => {
//       const date = new Date(createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
//       dateMap[date] = (dateMap[date] || 0) + 1;
//     });

//     // Sort by date
//     const sortedDates = Object.keys(dateMap).sort();

//     return {
//       labels: sortedDates,
//       counts: sortedDates.map(date => dateMap[date])
//     };
//   };

//   const fetchTotalUsers = async () => {
//     try {
//       const response = await axiosInstance.get('/admin/count');
//       console.log("API Response of users", response.data);
//       setTotalUsers(response.data);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const fetchTotalOrders = async () => {
//     try {
//       const response = await axiosInstance.get('/api/totalOrdercount');
//       setTotalOrders(response.data);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//   };

//   const fetchTotalProducts = async () => {
//     try {
//       const response = await axiosInstance.get('/user/totalProductcount');
//       setTotalProducts(response.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       await fetchTotalUsers();
//       await fetchTotalOrders();
//       await fetchTotalProducts();
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   const { labels: lineLabels, counts: lineCounts } = groupUsersByDate(totalUsers.createdDates || []);

//   const lineChartData = {
//     labels: lineLabels,
//     datasets: [{
//       label: 'Users Signed Up',
//       data: lineCounts,
//       fill: false,
//       borderColor: 'blue',
//       tension: 0.3
//     }]
//   };


//   // Prepare data for Bar Chart
//   const barChartData = {
//     labels: ['Users', 'Orders', 'Products'],
//     datasets: [{
//       label: 'Totals',
//       data: [totalUsers.totalAdmins, totalOrders.totalOrders, totalProducts.total],
//       backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)']
//     }]
//   };

//   return (
//     <div className="dashboard-container">
//       {loading ? <CustomLoader /> : (
//         <div>
//           <h2 className='fontSize25sml'>Dashboard</h2>
//           <div className="stats-container1">
//             <div className="stat-card"><h3>Total Users</h3><p>{totalUsers.totalAdmins}</p></div>
//             <div className="stat-card"><h3>Total Products</h3><p>{totalProducts.total}</p></div>
//             <div className="stat-card"><h3>Total Orders</h3><p>{totalOrders.totalOrders}</p></div>
//           </div>

//           <div className='overflow-x-auto'>
//             <div className='d-flex justify-content-between flex-wrap smlWidth500 '>
//               <div style={{ maxWidth: '600px', marginTop: '40px' }}>
//                 <h3>User Signup Over Time</h3>
//                 <Line data={lineChartData} className='chartWidth' />
//               </div>
//               <div style={{ maxWidth: '600px', marginTop: '40px' }}>
//                 <h3>Total Comparison</h3>
//                 <Bar data={barChartData} className='chartWidth' />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PharmaDashboard;


// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../components/AxiosInstance';
// import CustomLoader from '../../../components/CustomLoader';
// import { Line, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend
// } from 'chart.js';

// // Icons
// import { FiUsers, FiPackage, FiShoppingCart, FiTrendingUp } from 'react-icons/fi';
// import { BsGraphUp, BsBarChart } from 'react-icons/bs';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// const PharmaDashboard = () => {
//   const [totalUsers, setTotalUsers] = useState({ totalAdmins: 0, createdDates: [] });
//   const [totalOrders, setTotalOrders] = useState({ totalOrders: 0 });
//   const [totalProducts, setTotalProducts] = useState({ total: 0 });
//   const [loading, setLoading] = useState(true);

//   const groupUsersByDate = (createdDates) => {
//     const dateMap = {};

//     createdDates.forEach(({ createdAt }) => {
//       const date = new Date(createdAt).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric'
//       });
//       dateMap[date] = (dateMap[date] || 0) + 1;
//     });

//     const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
//     return {
//       labels: sortedDates,
//       counts: sortedDates.map(date => dateMap[date])
//     };
//   };

//   const fetchTotalUsers = async () => {
//     try {
//       const response = await axiosInstance.get('/admin/count');
//       setTotalUsers(response.data);
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const fetchTotalOrders = async () => {
//     try {
//       const response = await axiosInstance.get('/api/totalOrdercount');
//       setTotalOrders(response.data);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     }
//   };

//   const fetchTotalProducts = async () => {
//     try {
//       const response = await axiosInstance.get('/user/totalProductcount');
//       setTotalProducts(response.data);
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       await fetchTotalUsers();
//       await fetchTotalOrders();
//       await fetchTotalProducts();
//       setLoading(false);
//     };
//     fetchData();
//   }, []);

//   const { labels: lineLabels, counts: lineCounts } = groupUsersByDate(totalUsers.createdDates || []);

//   // Chart data and options
//   const lineChartData = {
//     labels: lineLabels,
//     datasets: [{
//       label: 'Users Signed Up',
//       data: lineCounts,
//       fill: true,
//       backgroundColor: 'rgba(79, 70, 229, 0.1)',
//       borderColor: 'rgba(79, 70, 229, 1)',
//       borderWidth: 2,
//       tension: 0.4,
//       pointBackgroundColor: 'rgba(79, 70, 229, 1)',
//       pointRadius: 4,
//       pointHoverRadius: 6
//     }]
//   };

//   const lineChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'top',
//         labels: {
//           font: {
//             size: 14
//           }
//         }
//       },
//       tooltip: {
//         backgroundColor: 'rgba(0, 0, 0, 0.7)',
//         titleFont: {
//           size: 16
//         },
//         bodyFont: {
//           size: 14
//         },
//         padding: 12,
//         displayColors: false
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: 'rgba(0, 0, 0, 0.05)'
//         },
//         ticks: {
//           font: {
//             size: 12
//           }
//         }
//       },
//       x: {
//         grid: {
//           display: false
//         },
//         ticks: {
//           font: {
//             size: 12
//           }
//         }
//       }
//     }
//   };

//   const barChartData = {
//     labels: ['Users', 'Orders', 'Products'],
//     datasets: [{
//       label: 'Totals',
//       data: [totalUsers.totalAdmins, totalOrders.totalOrders, totalProducts.total],
//       backgroundColor: [
//         'rgba(79, 70, 229, 0.7)',
//         'rgba(236, 72, 153, 0.7)',
//         'rgba(16, 185, 129, 0.7)'
//       ],
//       borderColor: [
//         'rgba(79, 70, 229, 1)',
//         'rgba(236, 72, 153, 1)',
//         'rgba(16, 185, 129, 1)'
//       ],
//       borderWidth: 1,
//       borderRadius: 6
//     }]
//   };

//   const barChartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         display: false
//       },
//       tooltip: {
//         backgroundColor: 'rgba(0, 0, 0, 0.7)',
//         titleFont: {
//           size: 16
//         },
//         bodyFont: {
//           size: 14
//         },
//         padding: 12
//       }
//     },
//     scales: {
//       y: {
//         beginAtZero: true,
//         grid: {
//           color: 'rgba(0, 0, 0, 0.05)'
//         },
//         ticks: {
//           font: {
//             size: 12
//           }
//         }
//       },
//       x: {
//         grid: {
//           display: false
//         },
//         ticks: {
//           font: {
//             size: 12
//           }
//         }
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {loading ? (
//         <CustomLoader />
//       ) : (
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Pharmacy Dashboard</h1>
//                 <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
//               </div>
//               <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
//                 {new Date().toLocaleDateString('en-US', {
//                   weekday: 'long',
//                   month: 'long',
//                   day: 'numeric',
//                   year: 'numeric'
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Users</p>
//                   <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalUsers.totalAdmins}</h3>
//                   <div className="flex items-center mt-3">
//                     <FiTrendingUp className="text-green-500 mr-1" />
//                     <span className="text-green-600 text-sm font-medium">12% from last month</span>
//                   </div>
//                 </div>
//                 <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
//                   <FiUsers size={24} />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Products</p>
//                   <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalProducts.total}</h3>
//                   <div className="flex items-center mt-3">
//                     <FiTrendingUp className="text-green-500 mr-1" />
//                     <span className="text-green-600 text-sm font-medium">8% from last month</span>
//                   </div>
//                 </div>
//                 <div className="p-3 rounded-lg bg-pink-50 text-pink-600">
//                   <FiPackage size={24} />
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Orders</p>
//                   <h3 className="text-3xl font-bold text-gray-800 mt-2">{totalOrders.totalOrders}</h3>
//                   <div className="flex items-center mt-3">
//                     <FiTrendingUp className="text-green-500 mr-1" />
//                     <span className="text-green-600 text-sm font-medium">15% from last month</span>
//                   </div>
//                 </div>
//                 <div className="p-3 rounded-lg bg-green-50 text-green-600">
//                   <FiShoppingCart size={24} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Charts Section */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center">
//                   <BsGraphUp className="text-indigo-600 mr-3 text-xl" />
//                   <h3 className="text-lg font-semibold text-gray-800">User Signup Trend</h3>
//                 </div>
//                 <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium">Last 30 Days</span>
//               </div>
//               <div className="h-80">
//                 <Line
//                   data={lineChartData}
//                   options={lineChartOptions}
//                 />
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//               <div className="flex items-center justify-between mb-5">
//                 <div className="flex items-center">
//                   <BsBarChart className="text-green-600 mr-3 text-xl" />
//                   <h3 className="text-lg font-semibold text-gray-800">System Overview</h3>
//                 </div>
//                 <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">Current Stats</span>
//               </div>
//               <div className="h-80">
//                 <Bar
//                   data={barChartData}
//                   options={barChartOptions}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Recent Activity */}
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <h3 className="text-lg font-semibold text-gray-800 mb-5">Recent Activity</h3>
//             <div className="space-y-4">
//               <div className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
//                 <div className="bg-indigo-100 p-2 rounded-full mr-4 mt-1">
//                   <FiUsers className="text-indigo-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-800">New admin user registered</p>
//                   <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
//                 </div>
//               </div>
//               <div className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
//                 <div className="bg-green-100 p-2 rounded-full mr-4 mt-1">
//                   <FiShoppingCart className="text-green-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-800">5 new orders received</p>
//                   <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
//                 </div>
//               </div>
//               <div className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0">
//                 <div className="bg-pink-100 p-2 rounded-full mr-4 mt-1">
//                   <FiPackage className="text-pink-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-800">3 new products added</p>
//                   <p className="text-xs text-gray-500 mt-1">Yesterday</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PharmaDashboard;




import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import CustomLoader from '../../../components/CustomLoader';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Stack,
  Divider
} from '@mui/material';

import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PharmaDashboard = () => {
  const [totalUsers, setTotalUsers] = useState({ totalAdmins: 0, createdDates: [] });
  const [totalOrders, setTotalOrders] = useState({ totalOrders: 0 });
  const [totalProducts, setTotalProducts] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);

  const groupUsersByDate = (createdDates) => {
    const dateMap = {};
    createdDates.forEach(({ createdAt }) => {
      const date = new Date(createdAt).toISOString().split('T')[0];
      dateMap[date] = (dateMap[date] || 0) + 1;
    });
    const sortedDates = Object.keys(dateMap).sort();
    return {
      labels: sortedDates,
      counts: sortedDates.map(date => dateMap[date])
    };
  };

  const fetchTotalUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/count');
      setTotalUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchTotalOrders = async () => {
    try {
      const response = await axiosInstance.get('/api/totalOrdercount');
      setTotalOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchTotalProducts = async () => {
    try {
      const response = await axiosInstance.get('/user/totalProductcount');
      setTotalProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchTotalUsers();
      await fetchTotalOrders();
      await fetchTotalProducts();
      setLoading(false);
    };
    fetchData();
  }, []);

  const { labels: lineLabels, counts: lineCounts } = groupUsersByDate(totalUsers.createdDates || []);

  const lineChartData = {
    labels: lineLabels,
    datasets: [{
      label: 'Users Signed Up',
      data: lineCounts,
      fill: false,
      borderColor: '#1976d2',
      backgroundColor: '#1976d2',
      tension: 0.3
    }]
  };

  const barChartData = {
    labels: ['Users', 'Orders', 'Products'],
    datasets: [{
      label: 'Totals',
      data: [totalUsers.totalAdmins, totalOrders.totalOrders, totalProducts.total],
      backgroundColor: ['#42a5f5', '#ef5350', '#66bb6a']
    }]
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Paper elevation={4} sx={{ display: 'flex', alignItems: 'center', p: 2, borderLeft: `6px solid ${color}`, height: '100%' }}>
      <Box mr={2}>{icon}</Box>
      <Box>
        <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
        <Typography variant="h5" fontWeight="bold">{value}</Typography>
      </Box>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 5, backgroundColor: '#f9f9fb', borderRadius: 2 }}>
      {loading ? (
        <CustomLoader />
      ) : (
        <>
          <Typography
            variant="h4"
            gutterBottom
            className='fontSize25sml'
            sx={{
              fontWeight: 700,
              color: 'black',
              mb: 4,
            }}
          >
            Pharma Admin Dashboard
          </Typography>

          {/* Stat Cards */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<GroupIcon fontSize="large" color="primary" />}
                title="Total Users"
                value={totalUsers.totalAdmins}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<InventoryIcon fontSize="large" sx={{ color: '#388e3c' }} />}
                title="Total Products"
                value={totalProducts.total}
                color="#66bb6a"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                icon={<ShoppingCartIcon fontSize="large" sx={{ color: '#d32f2f' }} />}
                title="Total Orders"
                value={totalOrders.totalOrders}
                color="#ef5350"
              />
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>User Signups Over Time</Typography>
                <Divider sx={{ mb: 2 }} />
                <Line data={lineChartData} />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Total Comparison</Typography>
                <Divider sx={{ mb: 2 }} />
                <Bar data={barChartData} />
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default PharmaDashboard;



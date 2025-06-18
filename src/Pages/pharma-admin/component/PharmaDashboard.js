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

//   const groupUsersByDate = (createdDates) => {
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



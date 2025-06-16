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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const PharmaDashboard = () => {
  const [totalUsers, setTotalUsers] = useState({ totalAdmins: 0, createdDates: [] });
  const [totalOrders, setTotalOrders] = useState({ totalOrders: 0 });
  const [totalProducts, setTotalProducts] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);

    const groupUsersByDate = (createdDates) => {
    const dateMap = {};

    createdDates.forEach(({ createdAt }) => {
      const date = new Date(createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
      dateMap[date] = (dateMap[date] || 0) + 1;
    });

    // Sort by date
    const sortedDates = Object.keys(dateMap).sort();

    return {
      labels: sortedDates,
      counts: sortedDates.map(date => dateMap[date])
    };
  };

  const fetchTotalUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/count');
      console.log("API Response of users", response.data);
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
      borderColor: 'blue',
      tension: 0.3
    }]
  };


  // Prepare data for Bar Chart
  const barChartData = {
    labels: ['Users', 'Orders', 'Products'],
    datasets: [{
      label: 'Totals',
      data: [totalUsers.totalAdmins, totalOrders.totalOrders, totalProducts.total],
      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)']
    }]
  };

  return (
    <div className="dashboard-container">
      {loading ? <CustomLoader /> : (
        <div>
          <h2 className='fontSize25sml'>Dashboard</h2>
          <div className="stats-container1">
            <div className="stat-card"><h3>Total Users</h3><p>{totalUsers.totalAdmins}</p></div>
            <div className="stat-card"><h3>Total Products</h3><p>{totalProducts.total}</p></div>
            <div className="stat-card"><h3>Total Orders</h3><p>{totalOrders.totalOrders}</p></div>
          </div>

          <div className='overflow-x-auto'>
            <div className='d-flex justify-content-between flex-wrap smlWidth500 '>
              <div style={{ maxWidth: '600px', marginTop: '40px' }}>
                <h3>User Signup Over Time</h3>
                <Line data={lineChartData} className='chartWidth' />
              </div>
              <div style={{ maxWidth: '600px', marginTop: '40px' }}>
                <h3>Total Comparison</h3>
                <Bar data={barChartData} className='chartWidth' />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmaDashboard;




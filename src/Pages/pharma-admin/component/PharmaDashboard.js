import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../components/AxiosInstance';

const PharmaDashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

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
      console.log("API Response of orders", response.data);
      setTotalOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const fetchTotalProducts = async () => {
    try {
      const response = await axiosInstance.get('/user/totalProductcount');
      console.log("API Response of products", response.data);
      setTotalProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchTotalUsers();
    fetchTotalOrders();
    fetchTotalProducts();
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{totalUsers.totalAdmins}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{totalProducts.total}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{totalOrders.totalOrders}</p>
        </div>
      </div>
    </div>
  )
}

export default PharmaDashboard

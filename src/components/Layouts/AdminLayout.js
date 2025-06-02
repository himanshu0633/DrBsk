import React from 'react';
import { Outlet } from 'react-router-dom';
import Admin from '../Admin/Admin';
import '../Admin/Admin.css';

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <Admin />
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;

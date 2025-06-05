
import '../pharma.css';
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Package,
    Image,
    Settings,
    Menu,
    X,
} from 'lucide-react';
import '../../../components/Admin/Admin.css';

const PharmaSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className=''>
            <div className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-content">
                    <h4 className="admin-sidebar-title">
                        <span className="logo-part">Admin</span> Panel
                    </h4>
                    <nav className="admin-nav">
                        <NavLink to="/pharma-admin/dashboard" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <LayoutDashboard className="nav-icon" size={20} />
                            <span className="nav-text">Dashboard</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/Category" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Users className="nav-icon" size={20} />
                            <span className="nav-text">Category</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/subCategory" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Users className="nav-icon" size={20} />
                            <span className="nav-text">Sub Category</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/products" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Package className="nav-icon" size={20} />
                            <span className="nav-text">Products</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/orders" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Package className="nav-icon" size={20} />
                            <span className="nav-text">Orders</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/banner" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Image className="nav-icon" size={20} />
                            <span className="nav-text">Banner</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/user" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Users className="nav-icon" size={20} />
                            <span className="nav-text">User</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/wholesale" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Users className="nav-icon" size={20} />
                            <span className="nav-text">Wholesale User</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/prescriptions" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Users className="nav-icon" size={20} />
                            <span className="nav-text">Prescriptions</span>
                        </NavLink>
                        <NavLink to="/pharma-admin/settings" className="admin-nav-link" onClick={() => setIsOpen(false)}>
                            <Settings className="nav-icon" size={20} />
                            <span className="nav-text">Settings</span>
                        </NavLink>
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default PharmaSidebar

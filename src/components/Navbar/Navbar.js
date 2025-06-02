import React, { useEffect, useState } from 'react';
import './Navbar.css';
import { Phone, Mail, Smartphone, ChevronDown, Menu } from 'lucide-react';
import axiosInstance from '../AxiosInstance';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [categoryName, setCategoryName] = useState([]);
  const [subcategoryName, setSubCategoryName] = useState([]);

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/user/allcategories`);
      console.log("Fetched categories:", response);
      setCategoryName(response?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    fetchSubCategories();
  }, [])

  const fetchSubCategories = async () => {
    try {
      const response = await axiosInstance.get(`/user/allSubcategories`);
      console.log("Fetched subCategories:", response);
      setSubCategoryName(response?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div >
      <div className="top-nav">
        {/* Mobile Menu Button (hidden on desktop) */}
        <input type="checkbox" id="mobile-menu" className="mobile-menu-checkbox" />
        <label htmlFor="mobile-menu" className="mobile-menu-button">
          <Menu size={24} />
        </label>

        {/* Left Section */}
        <div className="nav-left">
          {categoryName?.map((item, i) => {
            return (
              <div key={item._id}>
                <div className="nav-item" key={item.id}>
                  <span>{item.name} <ChevronDown size={14} className="dropdown-icon" /></span>
                  {subcategoryName.map((subItem, i) => {
                    return (
                      <div className="dropdown" key={subItem.id}>
                        <Link to={`/fever`} >{subItem.name}</Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

        </div>

        {/* Right Section */}
        <div className="nav-right">
          <a href="Phone" style={{ textDecoration: 'none' }}> <div className="get-app">
            <Smartphone size={16} className="icon" />
            <span>Get the App</span>
          </div></a>
          <div className="phone">
            <Phone size={16} className="icon" />
            <span>+91 1234567890</span>
          </div>
          <div className="email">
            <Mail size={16} className="icon" />
            <span>support@example.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;





import React, { useState, useEffect } from 'react';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import logo from '../../logo/logo1.jpg';
import './Head.css'
import { NavLink } from 'react-router-dom';

const Head = () => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className='logodivWidth'>
          <div className="logo">
            <a href="/"><img src={logo} alt="BSK Pharma Logo" /></a>
          </div>
        </div>

        <div className="header-buttons">
          <a href="FranchiseBanner">
            <ClipboardList size={16} /> Franchise Inquiry
          </a>
          <NavLink
            to="/homepage"
            onClick={() => {
              console.log("Navigating to homepage...");
              setMobileMenuActive(false);
            }}
          >
            <ShoppingCart size={16} /> Buy Medicines
          </NavLink>
        </div>

        <div className={`hamburger ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuActive ? 'active' : ''}`}>
        <button className="close-menu-btn" onClick={toggleMobileMenu}>
          ✕
        </button>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/aboutus">About Us</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/store">Stores</NavLink>
        <NavLink to="/contactus">Contact</NavLink>

        <div className="mobile-buttons">
          <a href="franchisee-enquiry.html"><ClipboardList size={16} /> Franchise Inquiry</a>
          <NavLink
            to="/homepage"
            onClick={() => {
              console.log("Navigating to homepage...");
              setMobileMenuActive(false);
            }}
          >
            <ShoppingCart size={16} /> Buy Medicines
          </NavLink>
        </div>
      </div>

      <div className={`overlay ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}></div>
    </>
  );
};

export default Head
import React, { useState, useEffect } from 'react';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import logo from '../../logo/logo1.jpg';
import './Head.css'

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
        <div className="logo">
          <a href="Landing"><img src={logo} alt="DavaIndia Logo" /></a>
        </div>

        <div className="header-buttons">
          <a href="FranchiseBanner">
            <ClipboardList size={16} /> Franchise Inquiry
          </a>
          <a href="http://localhost:3000/">
            <ShoppingCart size={16} /> Buy Medicines
          </a>
        </div>

        <div className={`hamburger ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuActive ? 'active' : ''}`}>
        <a href="#">Home</a>
        <a href="#">About Us</a>
        <a href="#">Products</a>
        <a href="#">Stores</a>
        <a href="#">Contact</a>
        <div className="mobile-buttons">
          <a href="franchisee-enquiry.html">
            <ClipboardList size={16} /> Franchise Inquiry
          </a>
          <a href="index.html">
            <ShoppingCart size={16} /> Buy Medicines
          </a>
        </div>
      </div>

      <div className={`overlay ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}></div>
    </>
  );
};

export default Head
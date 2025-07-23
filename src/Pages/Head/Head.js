import React, { useState, useEffect } from 'react';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import logo from '../../logo/logo1.jpg';
import './Head.css'
import { NavLink, useNavigate } from 'react-router-dom';

const Head = () => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

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
        {/* <div className='logodivWidth'>
          <div className="logo">
            <a href="/"><img src={logo} alt="BSK Pharma Logo" /></a>
          </div>
        </div> */}
        <a className='logo_size' href="/">
          <img src={logo} alt="Logo" className="logo" />
        </a>

        <div className="header-buttons">
          <a className='text-light' onClick={() => navigate('/wholesaleInquiry')} > <ClipboardList size={16} /> WholeSale Inquiry</a>
          <a className='text-light' onClick={() => {
            navigate('/homepage')
            setMobileMenuActive(false);
          }}>  <ShoppingCart size={16} /> Buy Medicines</a>
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
        <a onClick={() => navigate('/')}>Home</a>
        <a onClick={() => navigate('/aboutus')}>About Us</a>
        <a onClick={() => navigate('/products')}>Products</a>
        <a onClick={() => navigate('/store')}>Stores</a>
        <a onClick={() => navigate('/contactus')}>Contact</a>

        <div className="mobile-buttons">
          <a className='text-light' onClick={() => navigate('/wholesaleInquiry')} > <ClipboardList size={16} /> WholeSale Inquiry</a>
          <a className='text-light' onClick={() => {
            navigate('/homepage')
            setMobileMenuActive(false);
          }}>  <ShoppingCart size={16} /> Buy Medicines</a>
        </div>

      </div>

      <div className={`overlay ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}></div>
    </>
  );
};

export default Head
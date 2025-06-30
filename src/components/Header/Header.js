import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import '../../App.css';
import logo from '../../logo/logo1.jpg';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const cartItems = useSelector((state) => state.app.data);
  const cartCount = cartItems.length;
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef(null);
  const [showInput, setShowInput] = useState(false);
  const [pincode, setPincode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [currentPincode, setCurrentPincode] = useState('');

  // Get userData from sessionStorage
  const storedUser = sessionStorage.getItem('userData');
  const userData = storedUser ? JSON.parse(storedUser) : null;

  // Listen for screen resize events
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    console.log("Current state:", showDropdown);
    setShowDropdown(!showDropdown);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Logging out...');
    sessionStorage.clear();
    window.location.href = '/login';
  };

  const handleDivClick = () => {
    setShowInput(true);
  };

  const handleInputChange = (e) => {
    setPincode(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`);
      const data = await res.json();

      if (data.length > 0) {
        const location = data[0].display_name;
        setLocationName(`${location}`);
        setCurrentPincode(pincode);
      } else {
        setLocationName("Location not found");
        setCurrentPincode(pincode);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocationName("Error fetching location");
      setCurrentPincode(pincode);
    }

    setShowInput(false);
    setPincode('');
  };

  return (
    <div>
      <header className="header-container">
        <div className="">
          <div className='header1'>
            <a className='logo_size' href="/">
              <img src={logo} alt="Logo" className="logo" />
            </a>
            <div className='headerLocationHideLgScreen flexProp'>
              <div className='position_relative'>
                <div className="location-box order_4" onClick={handleDivClick}>
                  <span className="location-icon">📍</span>
                  <span className="pincode">{currentPincode}</span>
                  <span className="location-name">{locationName}</span>
                  <span className="dropdown-icon">▼</span>
                </div>
                {showInput && (
                  <form onSubmit={handleSubmit} className='pincodeUi'>
                    <h2 className='chooseLocationHead'>Choose Location</h2>
                    <div className='borderlocation'></div>
                    <h2 className='pincodeLabel'>Enter Pincode:</h2>
                    <input
                      type="text"
                      placeholder="Enter pincode"
                      value={pincode}
                      onChange={handleInputChange}
                      className='pincodeInput'
                    />
                    <button type="submit" className='submitBtnForm'>Submit</button>
                  </form>
                )}
              </div>

              {userData?.type === "wholesalePartner" ? null : <a href="/Prescription" className="no-decoration order_5">
                <div className="upload-box">
                  <span className="upload-icon">📄</span>
                  <span className="location-name">Upload Prescription</span>
                </div>
              </a>}
            </div>
            <div className='navbarIconFlex'>
              <Link to="/cart" className="cart-link">
                <ShoppingCart size={30} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              <div className="signin-dropdown-wrapper" ref={dropdownRef}>

                {/* without login don't show sign in button  */}
                {/* {userData ? <div className="signin-btn" onClick={toggleDropdown}>
                  <div className="signin-icon">👤</div>
                  <span className='margin_left_8'>Sign In</span>
                </div> : null} */}

                <div className="signin-btn" onClick={toggleDropdown}>
                  <div className="signin-icon">👤</div>
                  <span className='margin_left_8'>Sign In</span>
                </div>
                {showDropdown && userData && (
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="/EditProfile">
                      <span className="dropdown-icon">👤</span> My Profile
                    </a>
                    <a className="dropdown-item" href="/OrderPage">
                      <span className="dropdown-icon">📦</span> My Orders
                    </a>
                    <a href="#" className="dropdown-item" onClick={handleLogout}>
                      <span className="dropdown-icon">🚪</span> Logout
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='headerLocationShowSmlScreen flexProp'>
            <div className="location-box order_4">
              <span className="location-icon">📍</span>
              <span className="pincode">{currentPincode}</span>
              <span className="location-name">{locationName}</span>
              <span className="dropdown-icon">▼</span>
            </div>
            <a href="/Prescription" className="no-decoration order_5">
              <div className="upload-box">
                <span className="upload-icon">📄</span>
                <span className="location-name">Upload Prescription</span>
              </div>
            </a>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;



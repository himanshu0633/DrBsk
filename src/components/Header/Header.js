import React, { useState, useEffect, useRef } from 'react';
import './Header.css';
import '../../App.css'
import logo from '../../logo/logo1.jpg';
import { useSelector } from 'react-redux';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  const cartItems = useSelector((state) => state.app.data);
  const cartCount = cartItems.length;
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef(null);
  const [showInput, setShowInput] = useState(false);
  const [pincode, setPincode] = useState('');
  const [locationName, setLocationName] = useState('');
  const [currentPincode, setCurrentPincode] = useState('');

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

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Logging out...');
    const userData = sessionStorage.clear('userData');
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

      if (data?.length > 0) {
        const location = data[0]?.display_name;
        // console.log("dkhfkwhdrsjjk", location);
        const placeName =
          location?.city || location?.town || location?.village || location?.state || "Unknown location";

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
  const storedUser = sessionStorage.getItem('userData');
  const userData = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div >
      <header className="header-container">
        {/* <div className="header ">
          Left Section
          <div className="left-section">
            <a className='logo_size' href="/">
              <img src={logo} alt="Logo" className="logo" />
            </a>

            {!isMobile && (
              <div className="location-box order_buttons ">
                <span className="location-icon">📍</span>
                <span className="pincode">560068</span>
                <span className="location-name">Bommanahalli (Bengaluru)</span>
                <span className="dropdown-icon">▼</span>
              </div>
            )}
          </div>
          Right Section
          <div className="right-section">
            <a href="/Prescription" className="no-decoration">
              {!isMobile && (
                <div className="upload-box">
                  <span className="upload-icon">📄</span>
                  <span>Upload Prescription</span>
                </div>
              )}
            </a>
            <a href="/Cart" className="no-decoration">
              {!isMobile && <div className="cart-icon">🛒 Cart</div>}
            </a>
            {!isMobile && (
              <a href="/Notifications" className="no-decoration">
                <div className="bell-icon">🔔</div>
              </a>
            )}
            <div className="signin-dropdown-wrapper" ref={dropdownRef}>
              <div className="signin-btn" onClick={toggleDropdown}>
                <div className="signin-icon">👤</div>
                {!isMobile && <span>Sign In</span>}
              </div>
              {showDropdown && (
                <div className="dropdown-menu">
                  <a className="dropdown-item" href="/EditProfile">
                    <span className="dropdown-icon">👤</span> My Profile
                  </a>
                  <a className="dropdown-item" href="/orders">
                    <span className="dropdown-icon">📦</span> My Orders
                  </a>
                  <a className="dropdown-item" href="/patients">
                    <span className="dropdown-icon">👩‍⚕️</span> Patients
                  </a>
                  <a className="dropdown-item" href="/notifications">
                    <span className="dropdown-icon">🔔</span> Notifications
                  </a>
                  <a className="dropdown-item" href="/consultations">
                    <span className="dropdown-icon">💬</span> Consultations
                  </a>
                  <a href="#" className="dropdown-item" onClick={handleLogout}>
                    <span className="dropdown-icon">🚪</span> Logout
                  </a>
                </div>
              )}
            </div>
          </div>
        </div> */}

        <div className=" ">
          <div className='header1'>
            <a className='logo_size' href="/">
              <img src={logo} alt="Logo" className="logo" />
            </a>
            <div className='headerLocationHideLgScreen flexProp' >
              <div className='position_relative'>
                <div className="location-box order_4 " onClick={handleDivClick}>
                  <span className="location-icon">📍</span>
                  <span className="pincode">{currentPincode}</span>
                  <span className="location-name">{locationName}</span>
                  <span className="dropdown-icon">▼</span>
                </div>
                {showInput && (
                  <form onSubmit={handleSubmit} className='pincodeUi' >

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
            <div className='navbarIconFlex '>
              {/* <a href="/Cart" className="no-decoration">
                <div className="cart-icon">🛒 Cart</div>
                 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </a> */}

              <Link to="/cart" className="cart-link">
                <ShoppingCart size={30} />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>

              {/* <a href="/Notifications" className="no-decoration">
                <div className="bell-icon">🔔</div>
              </a> */}
              <div className="signin-dropdown-wrapper" ref={dropdownRef}>
                <div className="signin-btn" onClick={toggleDropdown}>
                  <div className="signin-icon">👤</div>
                  {userData ? null : <span className='margin_left_8'>Sign In</span>}
                </div>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <a className="dropdown-item" href="/EditProfile">
                      <span className="dropdown-icon">👤</span> My Profile
                    </a>
                    <a className="dropdown-item" href="/OrderPage">
                      <span className="dropdown-icon">📦</span> My Orders
                    </a>
                    {/* <a className="dropdown-item" href="/patients">
                      <span className="dropdown-icon">👩‍⚕️</span> Patients
                    </a>
                    <a className="dropdown-item" href="/notifications">
                      <span className="dropdown-icon">🔔</span> Notifications
                    </a>
                    <a className="dropdown-item" href="/consultations">
                      <span className="dropdown-icon">💬</span> Consultations
                    </a> */}
                    <a href="#" className="dropdown-item" onClick={handleLogout}>
                      <span className="dropdown-icon">🚪</span> Logout
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='headerLocationShowSmlScreen flexProp'>
            <div className="location-box order_4 ">
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



        {/* Mobile only elements */}
        {/* {isMobile && (
          <div className="mobile-bottom-bar">
            <a href="/" className="mobile-icon">
              <span>📍</span>
              <span className="mobile-label">Location</span>
            </a>
            <a href="/Prescription" className="mobile-icon">
              <span>📄</span>
              <span className="mobile-label">Upload</span>
            </a>
            <a href="/Cart" className="mobile-icon">
              <span>🛒</span>
              <span className="mobile-label">Cart</span>
            </a>
            <a href="/Notifications" className="mobile-icon">
              <span>🔔</span>
              <span className="mobile-label">Alerts</span>
            </a>
          </div>
        )} */}
      </header>
    </div>
  );
};

export default Header;




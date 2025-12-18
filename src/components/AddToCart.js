import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import './addToCart.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteProduct, updateData, clearProducts } from '../store/Action';
import API_URL from '../config';
import axiosInstance from './AxiosInstance';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, InputAdornment, CircularProgress } from '@mui/material';
import JoinUrl from '../JoinUrl';

const AddToCart = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [emailSearchLoading, setEmailSearchLoading] = useState(false);
  const [formData, setFormData] = useState({
    flat: '',
    landmark: '',
    state: '',
    city: '',
    country: 'India',
    phone: '',
    email: '',
    selectedAddress: ''
  });

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const cartItems = useSelector((state) => state.app.data);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const emailFieldRef = useRef(null);
  
  // Loader states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Email validation function
  const isValidEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Function to fetch addresses by email
  const fetchAddressesByEmail = useCallback(async (email) => {
    if (!email || !isValidEmail(email)) {
      return;
    }

    setEmailSearchLoading(true);
    
    try {
      let fetchedAddresses = [];
      let userPhone = '';

      // 1. First check localStorage for guest addresses
      const guestAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
      
      // Filter addresses by email (case insensitive)
      const guestFilteredAddresses = guestAddresses.filter(addr => 
        typeof addr === 'object' && 
        addr.email && 
        addr.email.toLowerCase() === email.toLowerCase()
      );
      
      fetchedAddresses = [...guestFilteredAddresses];
      
      // Get phone from first address
      if (guestFilteredAddresses.length > 0) {
        userPhone = guestFilteredAddresses[0]?.phone || '';
      }

      // 2. If user is authenticated, fetch from backend
      if (isAuthenticated && userData?._id) {
        try {
          const response = await axiosInstance.get(`/admin/readAdmin/${userData._id}`);
          const userInfo = response?.data?.data;
          
          if (Array.isArray(userInfo?.address)) {
            // Filter user addresses by email
            const userFilteredAddresses = userInfo.address.filter(addr => 
              typeof addr === 'object' && 
              addr.email && 
              addr.email.toLowerCase() === email.toLowerCase()
            );
            
            // Merge with existing addresses (avoid duplicates)
            userFilteredAddresses.forEach(newAddr => {
              if (!fetchedAddresses.some(existingAddr => 
                JSON.stringify(existingAddr) === JSON.stringify(newAddr)
              )) {
                fetchedAddresses.push(newAddr);
              }
            });
            
            // Get phone from user info if not already found
            if (!userPhone && userInfo.phone) {
              userPhone = userInfo.phone;
            }
          }
        } catch (error) {
          console.error("Error fetching user addresses:", error);
        }
      }

      console.log("Fetched addresses for email:", email, fetchedAddresses);

      // Update state
      setAddresses(fetchedAddresses);
      
      if (fetchedAddresses.length > 0) {
        // Auto-select first address if no address is selected
        if (!formData.selectedAddress) {
          const firstAddress = fetchedAddresses[0];
          setFormData(prev => ({
            ...prev,
            selectedAddress: firstAddress.fullAddress,
            phone: userPhone || firstAddress.phone || prev.phone
          }));
        }
        
        toast.success(`Found ${fetchedAddresses.length} saved address(es)!`, {
          position: 'top-right',
          autoClose: 1500
        });
      } else {
        // Clear selected address if no addresses found
        setFormData(prev => ({ ...prev, selectedAddress: '' }));
        
        // Only show info if email was entered
        toast.info('No saved addresses found for this email. Add a new address.', {
          position: 'top-right',
          autoClose: 1500
        });
      }
    } catch (error) {
      console.error("Error fetching addresses by email:", error);
      toast.error('Error fetching addresses. Please try again.');
    } finally {
      setEmailSearchLoading(false);
    }
  }, [isAuthenticated, userData?._id, formData.selectedAddress, isValidEmail]);

  // Initialize form data from localStorage on component mount
  useEffect(() => {
    // Check authentication
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    // Load saved data from localStorage
    const savedEmail = localStorage.getItem('guestEmail') || '';
    const savedPhone = localStorage.getItem('guestPhone') || '';
    const savedAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
    
    // Set initial form data
    setFormData(prev => ({
      ...prev,
      email: savedEmail || prev.email,
      phone: savedPhone || prev.phone
    }));
    
    // If there's a saved email, fetch addresses for it
    if (savedEmail && isValidEmail(savedEmail)) {
      fetchAddressesByEmail(savedEmail);
    } else {
      setAddresses(savedAddresses);
      
      // Auto-select first address if available
      if (savedAddresses.length > 0 && !formData.selectedAddress) {
        const firstAddress = savedAddresses[0];
        if (typeof firstAddress === 'object') {
          setFormData(prev => ({
            ...prev,
            selectedAddress: firstAddress.fullAddress,
            email: firstAddress.email || savedEmail || prev.email,
            phone: firstAddress.phone || savedPhone || prev.phone
          }));
        }
      }
    }
  }, []);

  // Handle email blur - search addresses when user leaves email field
  const handleEmailBlur = () => {
    if (formData.email && isValidEmail(formData.email)) {
      fetchAddressesByEmail(formData.email);
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.final_price || 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItem = cartItems.find((item) => item._id === itemId);
    if (updatedItem) {
      const updatedProduct = { ...updatedItem, quantity: newQuantity };
      dispatch(updateData(updatedProduct));
      toast.success('Item quantity updated!', { position: 'top-right', autoClose: 2000 });
    }
  };

  const handleRemoveItem = (itemId) => {
    dispatch(deleteProduct(itemId));
    toast.info('Item removed from cart.', { position: 'top-right', autoClose: 2000 });
  };

  // Handle email change
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    // Save to localStorage when email is valid
    if (email && isValidEmail(email)) {
      localStorage.setItem('guestEmail', email);
    }
  };

  // Handle phone change - save to localStorage immediately
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phone: value }));
      
      // Save to localStorage immediately
      if (value.length === 10) {
        localStorage.setItem('guestPhone', value);
      }
    }
  };

  const handleAddAddress = async () => {
    setLoading(true);
    
    // Validate email
    if (!formData.email || !isValidEmail(formData.email)) {
      toast.error("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Validate phone
    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    // Validate address fields
    if (!formData.flat || !formData.landmark || !formData.city || !formData.state) {
      toast.error("Please fill all address fields");
      setLoading(false);
      return;
    }

    // Address object बनाएं
    const addressObject = {
      flat: formData.flat,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      phone: formData.phone,
      email: formData.email,
      fullAddress: `${formData.flat}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.country}`,
      timestamp: new Date().toISOString()
    };
    
    // localStorage से existing addresses निकालें
    const existingAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
    
    // Check for duplicate address
    const isDuplicate = existingAddresses.some(addr => 
      typeof addr === 'object' &&
      addr.email === addressObject.email &&
      addr.fullAddress === addressObject.fullAddress
    );
    
    if (!isDuplicate) {
      const updatedAddresses = [...existingAddresses, addressObject];
      
      // Save to localStorage
      localStorage.setItem('guestAddresses', JSON.stringify(updatedAddresses));
      
      // Also save email and phone separately for easy access
      localStorage.setItem('guestEmail', formData.email);
      localStorage.setItem('guestPhone', formData.phone);
      
      // State update करें
      setAddresses(updatedAddresses);
      setFormData(prev => ({
        ...prev,
        selectedAddress: addressObject.fullAddress
      }));
      
      toast.success("Address saved successfully!", {
        position: 'top-right',
        autoClose: 1500
      });
    } else {
      // Select the existing address
      const existingAddr = existingAddresses.find(addr => 
        addr.email === addressObject.email && 
        addr.fullAddress === addressObject.fullAddress
      );
      if (existingAddr) {
        setFormData(prev => ({
          ...prev,
          selectedAddress: existingAddr.fullAddress
        }));
      }
      toast.info("This address is already saved. Selected existing address.", {
        position: 'top-right',
        autoClose: 1500
      });
    }
    
    // Clear form fields except email and phone
    setFormData(prev => ({
      ...prev,
      flat: '',
      landmark: '',
      state: '',
      city: ''
    }));
    
    setShowModal(false);
    setLoading(false);
  };

  // Fetch states
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await axiosInstance.post('https://countriesnow.space/api/v0.1/countries/states', {
          country: 'India'
        });
        setStates(res.data.data.states.map(s => s.name));
      } catch (err) {
        console.error('Error fetching states', err);
      }
    };
    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!formData.state) return;

    const fetchCities = async () => {
      try {
        const res = await axiosInstance.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
          country: 'India',
          state: formData.state
        });
        setCities(res.data.data);
      } catch (err) {
        console.error('Error fetching cities', err);
      }
    };
    fetchCities();
  }, [formData.state]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log("✅ Razorpay SDK loaded");
        resolve(true);
      };
      script.onerror = () => {
        console.error("❌ Failed to load Razorpay SDK");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const fetchData = useCallback(async () => {
    // Guest user के लिए localStorage से data fetch करें
    const guestAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
    const guestEmail = localStorage.getItem('guestEmail') || '';
    const guestPhone = localStorage.getItem('guestPhone') || '';
    
    setAddresses(guestAddresses);
    
    // Auto-select first address if available
    if (guestAddresses.length > 0 && !formData.selectedAddress) {
      const firstAddress = guestAddresses[0];
      if (typeof firstAddress === 'object') {
        setFormData(prev => ({ 
          ...prev, 
          selectedAddress: firstAddress.fullAddress,
          email: firstAddress.email || guestEmail || prev.email,
          phone: firstAddress.phone || guestPhone || prev.phone
        }));
      }
    }
    
    // If user is authenticated, fetch their data too
    if (isAuthenticated && userData?._id) {
      try {
        const response = await axiosInstance.get(`/admin/readAdmin/${userData._id}`);
        const userInfo = response?.data?.data;

        console.log("Fetched user info:", userInfo);

        // Set email in form data
        if (userInfo?.email) {
          setFormData(prev => ({ ...prev, email: userInfo.email }));
        }

        if (Array.isArray(userInfo?.address)) {
          // Merge guest addresses with user addresses
          const mergedAddresses = [...guestAddresses, ...userInfo.address];
          setAddresses(mergedAddresses);
          if (mergedAddresses.length > 0 && !formData.selectedAddress) {
            const firstAddr = mergedAddresses[0];
            if (typeof firstAddr === 'object') {
              setFormData(prev => ({ 
                ...prev, 
                selectedAddress: firstAddr.fullAddress,
                email: firstAddr.email || userInfo.email || prev.email
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user address:", error);
      }
    }
  }, [isAuthenticated, userData?._id, formData.selectedAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle checkout function remains the same...
  const handleCheckout = async () => {
    // ... existing checkout code remains unchanged ...
    // (Keep all your existing checkout logic here)
  };

  // Loader component function
  const renderProcessingLoader = () => {
    if (!isProcessing) return null;
    
    return (
      <div className="processing-overlay">
        <div className="processing-modal">
          <div className="processing-spinner">
            <div className="spinner"></div>
          </div>
          <h3 className="processing-title">Processing Your Order</h3>
          <p className="processing-message">{processingMessage}</p>
          <div className="processing-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-steps">
              <span className="step active">Payment</span>
              <span className="step">Verification</span>
              <span className="step">Confirmation</span>
            </div>
          </div>
          <p className="processing-note">
            Please do not close this window or refresh the page.
          </p>
        </div>
      </div>
    );
  };

  // Login prompt message
  const renderLoginPrompt = () => {
    if (!isAuthenticated) {
      return (
        <div className="login-prompt">
          <p>You are browsing as a guest. 
            <button onClick={() => navigate('/login')} className="login-link">Login</button> 
            for order tracking and faster checkout.
          </p>
        </div>
      );
    }
    return null;
  };

  // Render address in list
  const renderAddressItem = (addr, index) => {
    if (typeof addr === 'string') {
      return (
        <li key={index} className={`address-card ${formData.selectedAddress === addr ? 'selected' : ''}`}>
          <label>
            <input
              type="radio"
              name="selectedAddress"
              value={addr}
              checked={formData.selectedAddress === addr}
              onChange={() =>
                setFormData(prev => ({ ...prev, selectedAddress: addr }))
              }
            />
            <div className="address-content">
              <span className='text_20'>{addr}</span>
              {formData.email && (
                <span className="address-email-badge">📧 {formData.email}</span>
              )}
            </div>
          </label>
        </li>
      );
    } else {
      // For object type addresses (guest users)
      return (
        <li key={index} className={`address-card ${formData.selectedAddress === addr.fullAddress ? 'selected' : ''}`}>
          <label>
            <input
              type="radio"
              name="selectedAddress"
              value={addr.fullAddress}
              checked={formData.selectedAddress === addr.fullAddress}
              onChange={() => {
                setFormData(prev => ({ 
                  ...prev, 
                  selectedAddress: addr.fullAddress,
                  email: addr.email || prev.email,
                  phone: addr.phone || prev.phone
                }));
                
                // Save email and phone to localStorage immediately
                if (addr.email) {
                  localStorage.setItem('guestEmail', addr.email);
                }
                if (addr.phone) {
                  localStorage.setItem('guestPhone', addr.phone);
                }
              }}
            />
            <div className="address-details">
              <span className='text_20'>{addr.fullAddress}</span>
              <div className="address-meta">
                {addr.email && <span className="address-email">📧 {addr.email}</span>}
                {addr.phone && <span className="address-phone">📱 {addr.phone}</span>}
                {addr.timestamp && (
                  <span className="address-time">
                    Saved: {new Date(addr.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </label>
        </li>
      );
    }
  };

  return (
    <>
      {/* Processing Loader */}
      {renderProcessingLoader()}
      
      <div className="cart-container">
        {renderLoginPrompt()}
        
        <div className="cart-header">
          <div className="container">
            <button className="back-button" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} /> Continue Shopping
            </button>
            <h1 className="cart-title">
              <ShoppingBag size={28} /> Shopping Cart
            </h1>
          </div>
        </div>

        <div className="container">
          <div className="cart-content">
            <div className="cart-items-section">
              <div className="section-header">
                <h2>Your Items ({cartItems.length})</h2>
                {cartItems.length > 0 && (
                  <button
                    className="clear-cart-btn"
                    onClick={() => {
                      dispatch(clearProducts());
                      toast.info('Cart cleared.', {
                        position: 'top-right',
                        autoClose: 2000,
                      });
                    }}
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <ShoppingBag size={64} />
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Add some items to get started</p>
                  <button onClick={() => navigate("/fever")} className="continue-shopping-btn">Start Shopping</button>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item._id} className="cart-item">
                      <Link to={`/ProductPage/${item._id}`} className="item-image">
                        <img src={JoinUrl(API_URL, item.media[0]?.url)} alt={item.name} />
                      </Link>

                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-description">{item.quantity} Pack</p>

                        <div className="item-pricing">
                          <span className="current-price">
                            ₹{parseFloat(item.final_price || 0).toFixed(2)}
                          </span>
                          <span className="discount">
                            {Math.round((item.discount))}% OFF
                          </span>
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                          >
                            <span>-</span>
                          </button>
                          <span className="quantity">{item.quantity || 1}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, (item.quantity || 1) + 1)}
                          >
                            <span>+</span>
                          </button>
                        </div>
                        <button className="remove-btn" onClick={() => handleRemoveItem(item._id)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="order-summary">
                <div className="summary-card">
                  <h3 className="summary-title">Order Summary</h3>

                  {!isAuthenticated && (
                    <div className="guest-notice">
                      <p>🎯 <strong>Guest Checkout Available!</strong> Enter your email below to load saved addresses.</p>
                    </div>
                  )}

                  <div className="email-section">
                    <div className="email-input-container">
                      <TextField
                        label="Email Address"
                        fullWidth
                        variant="outlined"
                        size="small"
                        type="email"
                        value={formData.email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                        placeholder="Enter your email address"
                        helperText={
                          formData.email && !isValidEmail(formData.email) 
                            ? "Please enter a valid email address" 
                            : "Enter email and click outside to load saved addresses"
                        }
                        error={formData.email && !isValidEmail(formData.email)}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: emailSearchLoading && (
                            <InputAdornment position="end">
                              <CircularProgress size={20} />
                            </InputAdornment>
                          ),
                        }}
                        inputRef={emailFieldRef}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />
                    </div>
                    {emailSearchLoading && (
                      <div className="search-loading">
                        <CircularProgress size={16} /> Searching for saved addresses...
                      </div>
                    )}
                  </div>

                  <button
                    className="enhanced-add-address-btn"
                    onClick={() => setShowModal(true)}
                  >
                    ➕ {addresses.length > 0 ? 'Add Another Address' : 'Add New Address'}
                  </button>

                  <div className='my_10'>
                    {addresses.length > 0 ? (
                      <div className="saved-addresses">
                        {/* <h4 className="section-subtitle">
                          📍 Saved Addresses ({addresses.length} found)
                          {formData.email && isValidEmail(formData.email) && (
                            <span className="email-filter-note">
                              for: {formData.email}
                            </span>
                          )}
                        </h4> */}
                        <ul className="address-list">
                          {addresses.map((addr, index) => renderAddressItem(addr, index))}
                        </ul>
                      </div>
                    ) : formData.email && isValidEmail(formData.email) ? (
                      <div className="no-address-found">
                        <p className="no-address-text">
                          No saved addresses found for this email. 
                          <button 
                            onClick={() => setShowModal(true)}
                            className="add-first-address-btn"
                          >
                            Add your first address
                          </button>
                        </p>
                      </div>
                    ) : (
                      <p className="no-address-text">
                        {formData.email ? 
                          "Please enter a valid email address and click outside the field to search." 
                          : "Enter your email above to load saved addresses or add a new one."
                        }
                      </p>
                    )}
                  </div>

                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span className="free-shipping">FREE</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax</span>
                      <span>₹0.00</span>
                    </div>
                    <div className="summary-row discount-row">
                      <span>Discount</span>
                      <span>-₹0.00</span>
                    </div>
                  </div>

                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹{totalPrice.toFixed(2)}</span>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={handleCheckout}
                    disabled={
                      !formData.selectedAddress || 
                      checkoutLoading || 
                      paymentProcessing || 
                      isProcessing ||
                      !formData.email ||
                      !isValidEmail(formData.email) ||
                      !formData.phone ||
                      formData.phone.length !== 10
                    }
                  >
                    {checkoutLoading ? (
                      <>
                        <span>Creating Order...</span>
                      </>
                    ) : paymentProcessing || isProcessing ? (
                      <>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        {isAuthenticated ? 'Proceed to Payment' : 'Proceed as Guest'}
                        <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                      </>
                    )}
                  </button>

                  {!isAuthenticated && (!formData.email || !isValidEmail(formData.email) || !formData.phone || formData.phone.length !== 10) && (
                    <div className="email-warning">
                      ⚠️ Email address and phone number are required for order confirmation
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="guest-benefits">
                      <p className="login-suggestion">
                        <button onClick={() => navigate('/login')} className="login-suggestion-btn">
                          Login
                        </button> for order tracking and faster checkout next time.
                      </p>
                    </div>
                  )}

                
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: 700, 
            fontSize: '1.25rem',
            pb: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
            color: 'white',
            px: 3,
            py: 2.5,
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: '5%',
              width: '90%',
              height: '1px',
              background: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          {isAuthenticated ? 'Add New Address' : 'Add Delivery Address'}
          <div style={{ 
            fontSize: '0.875rem', 
            fontWeight: 400, 
            opacity: 0.9,
            marginTop: '4px'
          }}>
            {formData.email && `Email: ${formData.email}`}
          </div>
        </DialogTitle>
        
        <DialogContent sx={{ 
          pt: 3, 
          pb: 1,
          px: 3,
          '& .form-grid': {
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: '16px',
            marginBottom: '16px'
          },
          '& .form-field': {
            marginBottom: '20px'
          }
        }}>
          <div className="form-grid">
            {/* Email Field */}
            <div className="form-field" style={{ gridColumn: 'span 12', paddingTop: '10px' }}>
              <TextField
                label="Email Address"
                fullWidth
                variant="outlined"
                size="medium"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                helperText={
                  formData.email && !isValidEmail(formData.email) 
                    ? "Please enter a valid email address" 
                    : "Address will be linked to this email"
                }
                required
                error={formData.email && !isValidEmail(formData.email)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: emailSearchLoading && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    fontSize: '0.75rem'
                  }
                }}
              />
              {emailSearchLoading && (
                <div style={{
                  fontSize: '0.75rem',
                  color: '#1976d2',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CircularProgress size={12} /> Searching saved addresses...
                </div>
              )}
            </div>

            {/* Address Fields */}
            <div className="form-field" style={{ gridColumn: 'span 6' }}>
              <TextField
                label="Flat / House No."
                fullWidth
                variant="outlined"
                size="medium"
                value={formData.flat}
                onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }
                  }
                }}
              />
            </div>
            
            <div className="form-field" style={{ gridColumn: 'span 6' }}>
              <TextField
                label="Landmark"
                fullWidth
                variant="outlined"
                size="medium"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }
                  }
                }}
              />
            </div>

            {/* State Dropdown */}
            <div className="form-field" style={{ gridColumn: 'span 6' }}>
              <div className="custom-select-container">
                <label className="custom-label">
                  State <span className="required-star">*</span>
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
                  className="custom-select"
                  style={{
                    width: '100%',
                    padding: '14px 12px',
                    borderRadius: '8px',
                    border: formData.state ? '2px solid #1976d2' : '1px solid #ddd',
                    fontSize: '0.875rem',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '16px'
                  }}
                  required
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* City Dropdown */}
            <div className="form-field" style={{ gridColumn: 'span 6' }}>
              <div className="custom-select-container">
                <label className="custom-label">
                  City <span className="required-star">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="custom-select"
                  style={{
                    width: '100%',
                    padding: '14px 12px',
                    borderRadius: '8px',
                    border: formData.city ? '2px solid #1976d2' : '1px solid #ddd',
                    fontSize: '0.875rem',
                    backgroundColor: !formData.state ? '#f5f5f5' : 'white',
                    cursor: formData.state ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '16px',
                    opacity: !formData.state ? 0.6 : 1
                  }}
                  disabled={!formData.state}
                  required
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {!formData.state && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    marginTop: '4px',
                    marginLeft: '4px'
                  }}>
                    Please select state first
                  </div>
                )}
              </div>
            </div>

            {/* Country Field */}
            <div className="form-field" style={{ gridColumn: 'span 6' }}>
              <TextField
                label="Country"
                fullWidth
                variant="outlined"
                size="medium"
                value="India"
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    backgroundColor: '#f8f9fa',
                    '&.Mui-disabled': {
                      backgroundColor: '#f8f9fa'
                    }
                  }
                }}
              />
            </div>

            {/* Phone Field */}
            <div className="form-field" style={{ gridColumn: 'span 6' }}>
              <TextField
                label="Phone Number"
                fullWidth
                variant="outlined"
                size="medium"
                value={formData.phone}
                onChange={handlePhoneChange}
                required
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment 
                      position="start" 
                      sx={{ 
                        mr: 1,
                        color: '#666',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      +91
                    </InputAdornment>
                  ),
                }}
                helperText={
                  formData.phone.length > 0 && formData.phone.length !== 10 
                    ? "Phone number must be exactly 10 digits" 
                    : "Required for delivery updates"
                }
                error={formData.phone.length > 0 && formData.phone.length !== 10}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1976d2',
                      }
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    fontSize: '0.75rem'
                  }
                }}
              />
            </div>
          </div>

          {/* Required Note */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginTop: '4px',
            marginBottom: '16px'
          }}>
            <span style={{ 
              color: '#d32f2f',
              fontWeight: 700,
              fontSize: '1.2rem',
              lineHeight: 1
            }}>
              *
            </span>
            <span style={{ 
              fontSize: '0.75rem',
              color: '#666'
            }}>
              Required fields
            </span>
          </div>

          {/* Guest Info Note */}
          {!isAuthenticated && (
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#0c5460',
              backgroundColor: '#d1ecf1',
              padding: '12px 16px',
              borderRadius: '8px',
              marginTop: '8px',
              border: '1px solid #bee5eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '1.2rem',
                color: '#0c5460'
              }}>
                ⓘ
              </span>
              <span>
                Address will be saved with this email for future orders. 
                <strong> Sign up</strong> to save addresses permanently across devices.
              </span>
            </div>
          )}
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          pb: 3,
          pt: 2,
          gap: '12px',
          background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
          borderTop: '1px solid #e0e0e0'
        }}>
          <button
            onClick={() => setShowModal(false)}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: '#666',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#999';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            Cancel
          </button>
          
          <button
            onClick={handleAddAddress}
            disabled={
              loading || 
              !formData.email || 
              !isValidEmail(formData.email) ||
              !formData.flat || 
              !formData.landmark || 
              !formData.city || 
              !formData.state || 
              formData.phone.length !== 10
            }
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.2)',
              opacity: (loading || 
                !formData.email || 
                !isValidEmail(formData.email) ||
                !formData.flat || 
                !formData.landmark || 
                !formData.city || 
                !formData.state || 
                formData.phone.length !== 10) ? 0.6 : 1,
              pointerEvents: (loading || 
                !formData.email || 
                !isValidEmail(formData.email) ||
                !formData.flat || 
                !formData.landmark || 
                !formData.city || 
                !formData.state || 
                formData.phone.length !== 10) ? 'none' : 'auto'
            }}
            onMouseOver={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(25, 118, 210, 0.2)';
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Saving...
              </span>
            ) : isAuthenticated ? (
              'Add Address'
            ) : (
              'Save Address'
            )}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddToCart;
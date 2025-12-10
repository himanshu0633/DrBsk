import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle } from 'lucide-react';
import './addToCart.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteProduct, updateData, clearProducts } from '../store/Action';
import API_URL from '../config';
import axiosInstance from './AxiosInstance';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, InputAdornment } from '@mui/material';
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

  // Email validation function
  const isValidEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

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
    
    setAddresses(savedAddresses);
    
    // Auto-select first address if available
    if (savedAddresses.length > 0 && !formData.selectedAddress) {
      const firstAddress = savedAddresses[0];
      const addressValue = typeof firstAddress === 'object' ? firstAddress.fullAddress : firstAddress;
      const addressEmail = typeof firstAddress === 'object' ? firstAddress.email : savedEmail;
      const addressPhone = typeof firstAddress === 'object' ? firstAddress.phone : savedPhone;
      
      setFormData(prev => ({
        ...prev,
        selectedAddress: addressValue,
        email: addressEmail || savedEmail || prev.email,
        phone: addressPhone || savedPhone || prev.phone
      }));
    }
  }, []);

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

  // Handle email change - save to localStorage immediately
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    // Save to localStorage immediately (not just on checkout)
    if (email && isValidEmail(email)) {
      localStorage.setItem('guestEmail', email);
      toast.success('Email saved for checkout!', { position: 'top-right', autoClose: 1500 });
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
    if (formData.email && !isValidEmail(formData.email)) {
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

    // Address object बनाएं
    const addressObject = {
      flat: formData.flat,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      phone: formData.phone,
      email: formData.email,
      fullAddress: `${formData.flat}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.country}`
    };
    
    // localStorage से existing addresses निकालें
    const existingAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
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
      selectedAddress: addressObject.fullAddress,
      flat: '',
      landmark: '',
      state: '',
      city: ''
    }));
    setShowModal(false);
    setLoading(false);
    toast.success("Address saved successfully!");
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
      const addressValue = typeof firstAddress === 'object' ? firstAddress.fullAddress : firstAddress;
      const addressEmail = typeof firstAddress === 'object' ? firstAddress.email : guestEmail;
      const addressPhone = typeof firstAddress === 'object' ? firstAddress.phone : guestPhone;
      
      setFormData(prev => ({ 
        ...prev, 
        selectedAddress: addressValue,
        email: addressEmail || guestEmail || prev.email,
        phone: addressPhone || guestPhone || prev.phone
      }));
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
            const addrValue = typeof firstAddr === 'object' ? firstAddr.fullAddress : firstAddr;
            const addrEmail = typeof firstAddr === 'object' ? firstAddr.email : userInfo.email;
            
            setFormData(prev => ({ 
              ...prev, 
              selectedAddress: addrValue,
              email: addrEmail || userInfo.email || prev.email
            }));
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

  const handleCheckout = async () => {
    console.log("=== STARTING CHECKOUT PROCESS ===");
    
    if (checkoutLoading || paymentProcessing) {
      console.log("Checkout already in progress");
      return;
    }

    setCheckoutLoading(true);

    try {
      // Form validation
      if (!formData.selectedAddress) {
        toast.warn('Please select an address before checkout.');
        setCheckoutLoading(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty');
        setCheckoutLoading(false);
        return;
      }

      // Get email from form or localStorage
      const checkoutEmail = formData.email || localStorage.getItem('guestEmail') || '';
      
      if (!checkoutEmail || !isValidEmail(checkoutEmail)) {
        toast.error('Please provide a valid email address');
        setCheckoutLoading(false);
        return;
      }

      // Get phone number
      let phoneNumber = formData.phone?.toString().trim();

      if (!phoneNumber) {
        // Try to get from saved addresses
        const selectedAddressObj = addresses.find(addr => 
          typeof addr === 'object' ? addr.fullAddress === formData.selectedAddress : addr === formData.selectedAddress
        );
        
        if (selectedAddressObj && typeof selectedAddressObj === 'object' && selectedAddressObj.phone) {
          phoneNumber = selectedAddressObj.phone;
        } else {
          phoneNumber = localStorage.getItem('guestPhone') || '';
        }
      }

      phoneNumber = phoneNumber.replace(/^\+91/, '').replace(/^91/, '').trim();

      if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
        toast.error('Please provide a valid 10-digit phone number');
        setCheckoutLoading(false);
        return;
      }

      // Prepare order items
      const orderItems = cartItems.map((item) => {
        const qty = parseInt(item.quantity) || 1;
        const price = parseFloat(item.final_price) || 0;

        if (!item._id || !item.name || qty < 1 || price <= 0) {
          throw new Error(`Invalid item data for: ${item.name || 'Unknown item'}`);
        }

        return {
          productId: item._id,
          name: item.name.trim(),
          quantity: qty,
          price: price
        };
      });

      // Create guest user ID if not logged in
      const userId = isAuthenticated ? userData._id : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare order payload for Step 1
      const orderPayload = {
        userId: userId,
        items: orderItems,
        address: formData.selectedAddress.trim(),
        phone: phoneNumber,
        email: checkoutEmail,
        totalAmount: parseFloat(totalPrice.toFixed(2)),
        isGuest: !isAuthenticated
      };

      console.log("Step 1: Creating Razorpay order...");
      console.log("Order payload:", JSON.stringify(orderPayload, null, 2));
      
      // Step 1: Create Razorpay Order
      const orderResponse = await axiosInstance.post('/api/createPaymentOrder', orderPayload);

      if (!orderResponse.data.success) {
        const errorMsg = orderResponse.data?.message || 'Failed to create payment order';
        console.error("❌ Razorpay order creation failed:", errorMsg);
        toast.error(errorMsg);
        setCheckoutLoading(false);
        return;
      }

      const { order: razorpayOrder } = orderResponse.data;
      console.log("✅ Razorpay order created:", razorpayOrder.id);

      // Load Razorpay SDK
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        toast.error('Payment system failed to load. Please refresh the page.');
        setCheckoutLoading(false);
        return;
      }

      // Configure Razorpay options
      const options = {
        key: "rzp_test_RpQ1JwSJEy6yAw",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Store Name",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          console.log("✅ Payment successful, response:", response);
          setPaymentProcessing(true);
          
          try {
            // Step 2: Verify payment and create order
            console.log("Step 2: Verifying payment and creating order...");
            
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ...orderPayload // Include all order details
            };

            console.log("Verification payload:", verifyPayload);

            const verifyResponse = await axiosInstance.post('/api/verifyPayment', verifyPayload);
            
            if (verifyResponse.data.success) {
              console.log("✅ Order created successfully:", verifyResponse.data.orderId);
              
              // Clear cart
              dispatch(clearProducts());
              localStorage.removeItem('cartItems');
              
              // Clear guest addresses if guest user
              if (!isAuthenticated) {
                localStorage.removeItem('guestAddresses');
                localStorage.removeItem('guestEmail');
                localStorage.removeItem('guestPhone');
              }
              
              toast.success(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} />
                  Order placed successfully! Order ID: {verifyResponse.data.orderId}
                </div>,
                {
                  position: 'top-right',
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true
                }
              );
              
              // Navigate to order confirmation page
              navigate(`/success`);
              
            } else {
              console.error("❌ Order creation failed:", verifyResponse.data.message);
              toast.error(verifyResponse.data.message || 'Failed to create order');
            }
          } catch (error) {
            console.error("❌ Payment verification error:", error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setPaymentProcessing(false);
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: userData.name || checkoutEmail.split('@')[0],
          email: checkoutEmail,
          contact: `+91${phoneNumber}`
        },
        theme: {
          color: '#3f51b5'
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal closed by user");
            setCheckoutLoading(false);
          }
        }
      };

      // Open Razorpay checkout
      console.log("Opening Razorpay checkout...");
      const rzp = new window.Razorpay(options);
      rzp.open();

      // Handle payment errors
      rzp.on('payment.failed', function (response) {
        console.error("❌ Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setCheckoutLoading(false);
        setPaymentProcessing(false);
      });

    } catch (error) {
      console.error('=== CHECKOUT ERROR ===');
      console.error('Error:', error.message);
      console.error('Response:', error.response?.data);

      let errorMessage = 'Checkout failed. Please try again.';

      if (error.response?.status === 400) {
        const validationError = error.response.data?.message;
        if (validationError) {
          errorMessage = validationError;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
      setCheckoutLoading(false);
      setPaymentProcessing(false);
    }
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
            <span className='text_20'>{addr}</span>
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
              {addr.email && <span className="address-email">📧 {addr.email}</span>}
              {addr.phone && <span className="address-phone">📱 {addr.phone}</span>}
            </div>
          </label>
        </li>
      );
    }
  };

  return (
    <>
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
                      <p>🎯 <strong>Guest Checkout Available!</strong> Enter your details below to proceed without login.</p>
                    </div>
                  )}


                  <button
                    className="enhanced-add-address-btn"
                    onClick={() => setShowModal(true)}
                  >
                    ➕ {addresses.length > 0 ? 'Add Another Address' : 'Add Address'}
                  </button>

                  <div className='my_10'>
                    {addresses.length > 0 ? (
                      <div className="saved-addresses">
                        <h4 className="section-subtitle">📍 Saved Addresses</h4>
                        <ul className="address-list">
                          {addresses.map((addr, index) => renderAddressItem(addr, index))}
                        </ul>
                      </div>
                    ) : (
                      <p className="no-address-text">
                        No address saved yet. Please add your delivery address.
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
                    ) : paymentProcessing ? (
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

                  <div className="security-badges">
                    <div className="badge">🔒 Secure Payment</div>
                    <div className="badge">💳 Razorpay Verified</div>
                  </div>
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
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {isAuthenticated ? 'Add New Address' : 'Add Delivery Address'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email Address *"
                fullWidth
                variant="outlined"
                size="small"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                helperText="Required for order confirmation and updates"
                required
                error={formData.email && !isValidEmail(formData.email)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Flat / House No. *"
                fullWidth
                variant="outlined"
                size="small"
                value={formData.flat}
                onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Landmark *"
                fullWidth
                variant="outlined"
                size="small"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <select
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                required
              >
                <option value="">Select State *</option>
                {states.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <select
                name="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={!formData.state}
                required
              >
                <option value="">Select City *</option>
                {cities.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                fullWidth
                variant="outlined"
                size="small"
                value="India"
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number *"
                fullWidth
                variant="outlined"
                size="small"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                }}
                helperText={formData.phone.length > 0 && formData.phone.length !== 10 ? "Phone number must be 10 digits" : "Required for delivery updates"}
                error={formData.phone.length > 0 && formData.phone.length !== 10}
                required
              />
            </Grid>
          </Grid>
          <div className="required-note" style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            * Required fields
          </div>
          {!isAuthenticated && (
            <div className="guest-info-note" style={{ 
              fontSize: '12px', 
              color: '#2e7d32',
              backgroundColor: '#f1f8e9',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '8px'
            }}>
              ℹ️ Your address will be saved locally for this session.
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleAddAddress}
            color="primary"
            variant="contained"
            sx={{ fontWeight: 600 }}
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
          >
            {loading ? 'Saving...' : isAuthenticated ? 'Add Address' : 'Save Address'}
          </Button>
          <Button
            onClick={() => setShowModal(false)}
            color="secondary"
            variant="outlined"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AddToCart; 
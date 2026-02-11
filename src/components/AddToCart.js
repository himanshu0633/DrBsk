import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle, CreditCard, Wallet } from 'lucide-react';
import './addToCart.css';
import Footer from "./Footer/Footer";

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
  
  // Payment method states
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'
  const [codCharge] = useState(99); // COD का extra charge
  const [codProcessing, setCodProcessing] = useState(false);
  
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
  
  // Loader states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // User type detection
  const storedUser = localStorage.getItem("userData");
  const parsedUserData = storedUser ? JSON.parse(storedUser) : null;
  const isWholesaler = parsedUserData?.type === "wholesalePartner";

  // Calculate totals with user type based pricing
  const baseTotal = cartItems.reduce((acc, item) => {
    const price = isWholesaler 
      ? parseFloat(item.retail_price || item.final_price || 0)
      : parseFloat(item.final_price || 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  const codTotal = paymentMethod === 'cod' ? baseTotal + codCharge : baseTotal;
  const finalTotal = paymentMethod === 'cod' ? codTotal : baseTotal;

  // Email validation function
  const isValidEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Initialize form data from localStorage on component mount
  useEffect(() => {
    // Authentication check logic
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
    
    // Save to localStorage immediately
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

  // Handle COD checkout
  const handleCODCheckout = async () => {
    console.log("=== STARTING COD CHECKOUT ===");
    
    setCodProcessing(true);

    try {
      // Form validation
      if (!formData.selectedAddress) {
        toast.warn('Please select an address before checkout.');
        setCodProcessing(false);
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        toast.error('Your cart is empty');
        setCodProcessing(false);
        return;
      }

      // Get email from form or localStorage
      const checkoutEmail = formData.email || localStorage.getItem('guestEmail') || '';
      
      if (!checkoutEmail || !isValidEmail(checkoutEmail)) {
        toast.error('Please provide a valid email address');
        setCodProcessing(false);
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
        setCodProcessing(false);
        return;
      }

      // Prepare order items with user type based price
      const orderItems = cartItems.map((item) => {
        const qty = parseInt(item.quantity) || 1;
        const price = isWholesaler 
          ? parseFloat(item.retail_price || item.final_price || 0)
          : parseFloat(item.final_price || 0);

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

      // Create user ID
      const userId = isAuthenticated ? userData._id : `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare COD order payload
      const codPayload = {
        userId: userId,
        items: orderItems,
        address: formData.selectedAddress.trim(),
        phone: phoneNumber,
        email: checkoutEmail,
        totalAmount: parseFloat(finalTotal.toFixed(2)),
        baseAmount: parseFloat(baseTotal.toFixed(2)),
        codCharge: codCharge,
        isGuest: !isAuthenticated,
        isWholesaler: isWholesaler
      };

      console.log("Creating COD order:", codPayload);
      
      // Show processing loader
      setIsProcessing(true);
      setProcessingMessage("Creating your COD order...");

      // API call to create COD order
      const response = await axiosInstance.post('/api/createCOD', codPayload);

      if (response.data.success) {
        console.log("✅ COD order created successfully:", response.data.orderId);
        
        setProcessingMessage("Finalizing your order...");
        
        // ---------- Facebook Pixel: Purchase Event (COD) ----------
        if (window.fbq) {
          window.fbq("track", "Purchase", {
            value: Number(finalTotal || 0),
            currency: "INR",
            content_ids: (cartItems || []).map(i => i._id).filter(Boolean),
            content_type: "product",
          });
          
          console.log("✅ Facebook Pixel: Purchase (COD) tracked", {
            value: finalTotal,
            content_ids: cartItems.map(i => i._id).filter(Boolean),
            payment_method: 'cod'
          });
        } else {
          console.log("⚠️ Facebook Pixel not available for Purchase (COD)");
        }
        
        // Clear cart
        dispatch(clearProducts());
        localStorage.removeItem('cartItems');
        
        // Clear guest addresses if guest user
        if (!isAuthenticated) {
          localStorage.removeItem('guestAddresses');
          localStorage.removeItem('guestEmail');
          localStorage.removeItem('guestPhone');
        }
        
        // Show success for 2 seconds before redirecting
        toast.success(
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={20} />
            COD Order placed successfully! Redirecting...
          </div>,
          {
            position: 'top-right',
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        );
        
        // Wait 2 seconds before navigating
        setTimeout(() => {
          setIsProcessing(false);
          setCodProcessing(false);
          navigate(`/success`, {
            state: {
              orderId: response.data.orderId,
              orderDetails: response.data.orderDetails,
              isCOD: true,
              codCharge: codCharge
            }
          });
        }, 2000);
        
      } else {
        console.error("❌ COD order creation failed:", response.data.message);
        setIsProcessing(false);
        setCodProcessing(false);
        toast.error(response.data.message || 'Failed to create COD order');
      }

    } catch (error) {
      console.error('=== COD CHECKOUT ERROR ===');
      console.error('Error:', error.message);
      console.error('Response:', error.response?.data);

      let errorMessage = 'COD order failed. Please try again.';

      if (error.response?.status === 400) {
        const validationError = error.response.data?.message;
        if (validationError) {
          errorMessage = validationError;
        }
      } 

      toast.error(errorMessage);
      setIsProcessing(false);
      setCodProcessing(false);
    }
  };

  // Handle online payment checkout
  const handleOnlineCheckout = async () => {
    console.log("=== STARTING ONLINE CHECKOUT PROCESS ===");
    
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

      // Prepare order items with user type based price
      const orderItems = cartItems.map((item) => {
        const qty = parseInt(item.quantity) || 1;
        const price = isWholesaler 
          ? parseFloat(item.retail_price || item.final_price || 0)
          : parseFloat(item.final_price || 0);

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
        totalAmount: parseFloat(finalTotal.toFixed(2)),
        isGuest: !isAuthenticated,
        isWholesaler: isWholesaler
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
        key: "rzp_live_RsAhVxy2ldrBIl", 
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Dr BSK",
        description: "Order Payment",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          console.log("✅ Payment successful, response:", response);
          
          // Show processing loader
          setIsProcessing(true);
          setProcessingMessage("Verifying your payment...");
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

            // Update loader message
            setProcessingMessage("Creating your order...");
            
            const verifyResponse = await axiosInstance.post('/api/verifyPayment', verifyPayload);
            
            if (verifyResponse.data.success) {
              console.log("✅ Order created successfully:", verifyResponse.data.orderId);
              
              // Update loader for final step
              setProcessingMessage("Finalizing your order...");
              
              // ---------- Facebook Pixel: Purchase Event (Online) ----------
              if (window.fbq) {
                window.fbq("track", "Purchase", {
                  value: Number(finalTotal || 0),
                  currency: "INR",
                  content_ids: (cartItems || []).map(i => i._id).filter(Boolean),
                  content_type: "product",
                });
                
                console.log("✅ Facebook Pixel: Purchase (Online) tracked", {
                  value: finalTotal,
                  content_ids: cartItems.map(i => i._id).filter(Boolean),
                  payment_method: 'online'
                });
              } else {
                console.log("⚠️ Facebook Pixel not available for Purchase (Online)");
              }
              
              // Clear cart
              dispatch(clearProducts());
              localStorage.removeItem('cartItems');
              
              // Clear guest addresses if guest user
              if (!isAuthenticated) {
                localStorage.removeItem('guestAddresses');
                localStorage.removeItem('guestEmail');
                localStorage.removeItem('guestPhone');
              }
              
              // Show success for 2 seconds before redirecting
              toast.success(
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={20} />
                  Order placed successfully! Redirecting...
                </div>,
                {
                  position: 'top-right',
                  autoClose: 2000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true
                }
              );
              
              // Wait 2 seconds before navigating (for better UX)
              setTimeout(() => {
                // Hide loader and navigate
                setIsProcessing(false);
                navigate(`/success`, {
                  state: {
                    orderId: verifyResponse.data.orderId,
                    orderDetails: verifyResponse.data.orderDetails
                  }
                });
              }, 2000);
              
            } else {
              console.error("❌ Order creation failed:", verifyResponse.data.message);
              setIsProcessing(false);
              toast.error(verifyResponse.data.message || 'Failed to create order');
            }
          } catch (error) {
            console.error("❌ Payment verification error:", error);
            setIsProcessing(false);
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
            if (!paymentProcessing) {
              setCheckoutLoading(false);
            }
          }
        }
      };

      // Open Razorpay checkout
      console.log("Opening Razorpay checkout...");
      const rzp = new window.Razorpay(options);
      
      // Razorpay modal के close होने पर
      rzp.on('modal.closed', function() {
        console.log("Razorpay modal closed");
        if (!paymentProcessing) {
          setCheckoutLoading(false);
        }
      });
      
      rzp.open();

      // Handle payment errors
      rzp.on('payment.failed', function (response) {
        console.error("❌ Payment failed:", response.error);
        setIsProcessing(false);
        toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setCheckoutLoading(false);
        setPaymentProcessing(false);
      });
      
      console.log("Razorpay Order ID received:", razorpayOrder.id);
      console.log("Razorpay Order Amount:", razorpayOrder.amount);
      console.log("Razorpay Key being used:", options.key);

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
      setIsProcessing(false);
      setCheckoutLoading(false);
      setPaymentProcessing(false);
    }
  };

  // Handle checkout based on payment method
  const handleCheckout = async () => {
    console.log("=== STARTING CHECKOUT ===");
    
    if (checkoutLoading || paymentProcessing || codProcessing || isProcessing) {
      console.log("Checkout already in progress");
      return;
    }

    // ---------- Facebook Pixel: InitiateCheckout Event ----------
    // Fire once when checkout starts
    if (window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        value: Number(finalTotal || 0),
        currency: "INR",
        content_ids: (cartItems || []).map(i => i._id).filter(Boolean),
        content_type: "product",
        num_items: (cartItems || []).length,
      });
      
      console.log("✅ Facebook Pixel: InitiateCheckout tracked", {
        value: finalTotal,
        content_ids: cartItems.map(i => i._id).filter(Boolean),
        num_items: cartItems.length,
        payment_method: paymentMethod
      });
    } else {
      console.log("⚠️ Facebook Pixel not available for InitiateCheckout");
    }

    if (paymentMethod === 'cod') {
      await handleCODCheckout();
    } else {
      await handleOnlineCheckout();
    }
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
        <li 
          key={index} 
          className={`address-card ${formData.selectedAddress === addr ? 'selected' : ''}`}
        >
          <label>
            <input
              type="radio"
              name="selectedAddress"
              value={addr}
              checked={formData.selectedAddress === addr}
              onChange={() => {
                setFormData(prev => ({ ...prev, selectedAddress: addr }));
              }}
            />
            <span className='text_20'>{addr}</span>
          </label>
        </li>
      );
    } else {
      // For object type addresses (guest users)
      return (
        <li 
          key={index} 
          className={`address-card ${formData.selectedAddress === addr.fullAddress ? 'selected' : ''}`}
        >
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

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const handleContinueShoppingClick = () => {
    navigate("/fever");
  };

  return (
    <>
      {/* Processing Loader */}
      {renderProcessingLoader()}
      
      <div className="cart-container">
        {renderLoginPrompt()}
        
        <div className="cart-header">
          <div className="container">
            <button className="back-button" onClick={handleBackButtonClick}>
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
                <h2>
                  Your Items ({cartItems.length})
                  {isWholesaler && (
                    <span className="wholesale-tag-cart">Wholesale</span>
                  )}
                </h2>
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
                  <button onClick={handleContinueShoppingClick} className="continue-shopping-btn">Start Shopping</button>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => {
                    const itemPrice = isWholesaler 
                      ? parseFloat(item.retail_price || item.final_price || 0)
                      : parseFloat(item.final_price || 0);
                    
                    return (
                      <div key={item._id} className="cart-item">
                        <Link to={`/ProductPage/${item._id}`} className="item-image">
                          <img src={JoinUrl(API_URL, item.media[0]?.url)} alt={item.name} />
                        </Link>

                        <div className="item-details">
                          <h3 className="item-name">{item.name}</h3>
                          <p className="item-description">{item.quantity} Pack</p>

                          <div className="item-pricing">
                            <span className="current-price">
                              ₹{itemPrice.toFixed(2)}
                              {isWholesaler && (
                                <span className="wholesale-tag-cart-item">Wholesale</span>
                              )}
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item._id, (item.quantity || 1) - 1);
                              }}
                              disabled={(item.quantity || 1) <= 1}
                            >
                              <span>-</span>
                            </button>
                            <span className="quantity">{item.quantity || 1}</span>
                            <button
                              className="quantity-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuantityChange(item._id, (item.quantity || 1) + 1);
                              }}
                            >
                              <span>+</span>
                            </button>
                          </div>
                          <button className="remove-btn" onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveItem(item._id);
                          }}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="order-summary">
                <div className="summary-card">
                  <h3 className="summary-title">
                    Order Summary
                  </h3>

                  {!isAuthenticated && (
                    <div className="guest-notice">
                      <p>🎯 <strong>Guest Checkout Available!</strong> Enter your details below to proceed without login.</p>
                    </div>
                  )}

                  {isWholesaler && (
                    <div className="wholesaler-note-cart">
                      <p>📦 You are viewing <strong>wholesale prices</strong>. Payment will be processed at wholesale rates.</p>
                    </div>
                  )}

                  <button
                    className="enhanced-add-address-btn"
                    onClick={() => {
                      setShowModal(true);
                    }}
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

                  {/* Payment Method Selection */}
                  <div className="payment-method-section">
                    <h4 className="section-subtitle">💳 Payment Method</h4>
                    <div className="payment-methods">
                      <div className="payment-option">
                        <label className={`payment-method-card ${paymentMethod === 'online' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="online"
                            checked={paymentMethod === 'online'}
                            onChange={(e) => {
                              setPaymentMethod(e.target.value);
                            }}
                          />
                          <div className="payment-method-content">
                            <div className="payment-method-header">
                              <span className="payment-icon"><CreditCard size={20} /></span>
                              <span className="payment-title">Online Payment</span>
                            </div>
                            <p className="payment-description">
                              Pay securely with Razorpay
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      <div className="payment-option">
                        <label className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => {
                              setPaymentMethod(e.target.value);
                            }}
                          />
                          <div className="payment-method-content">
                            <div className="payment-method-header">
                              <span className="payment-icon"><Wallet size={20} /></span>
                              <span className="payment-title">Cash on Delivery</span>
                            </div>
                            <p className="payment-description">
                              Pay when you receive your order
                              <span className="cod-charge">+ ₹{codCharge} COD charge</span>
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Subtotal ({cartItems.length} items)</span>
                      <span>₹{baseTotal.toFixed(2)}</span>
                    </div>
                    
                    {/* COD charge display */}
                    {paymentMethod === 'cod' && (
                      <div className="summary-row cod-charge-row">
                        <span>COD Charge</span>
                        <span>+ ₹{codCharge.toFixed(2)}</span>
                      </div>
                    )}
                    
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
                    <span>₹{finalTotal.toFixed(2)}</span>
                  </div>

                  {paymentMethod === 'cod' && (
                    <div className="cod-note">
                      <p>💡 <strong>Note:</strong> You'll pay ₹{finalTotal.toFixed(2)} (including ₹{codCharge} COD charge) when your order is delivered.</p>
                    </div>
                  )}

                  <button
                    className={`checkout-btn ${paymentMethod === 'cod' ? 'cod-btn' : ''}`}
                    onClick={handleCheckout}
                    disabled={
                      !formData.selectedAddress || 
                      checkoutLoading || 
                      paymentProcessing || 
                      isProcessing ||
                      codProcessing ||
                      !formData.email ||
                      !isValidEmail(formData.email) ||
                      !formData.phone ||
                      formData.phone.length !== 10
                    }
                  >
                    {checkoutLoading ? (
                      <span>Creating Order...</span>
                    ) : paymentProcessing || isProcessing ? (
                      <span>Processing Payment...</span>
                    ) : codProcessing ? (
                      <span>Creating COD Order...</span>
                    ) : (
                      <>
                        {paymentMethod === 'cod' 
                          ? `Place COD Order (₹${finalTotal.toFixed(2)})`
                          : isAuthenticated 
                            ? 'Proceed to Payment' 
                            : 'Proceed as Guest'
                        }
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
        onClose={() => {
          setShowModal(false);
        }}
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
            Please fill in all required fields
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
            <div className="form-field" style={{ gridColumn: 'span 12' ,paddingTop: '10px'}}>
              <TextField
                label="Email Address"
                fullWidth
                variant="outlined"
                size="medium"
                type="email"
                value={formData.email}
                onChange={handleEmailChange}
                helperText={
                  formData.email && !isValidEmail(formData.email) 
                    ? "Please enter a valid email address" 
                    : "Required for order confirmation and updates"
                }
                required
                error={formData.email && !isValidEmail(formData.email)}
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
                  },
                  '& .MuiFormHelperText-root': {
                    marginLeft: '4px',
                    fontSize: '0.75rem'
                  }
                }}
              />
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
                  onChange={(e) => {
                    setFormData({ ...formData, state: e.target.value, city: '' });
                  }}
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
                  onChange={(e) => {
                    setFormData({ ...formData, city: e.target.value });
                  }}
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
                Your address will be saved locally for this session only. 
                <strong> Sign up</strong> to save addresses permanently.
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
            onClick={() => {
              setShowModal(false);
            }}
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
       <Footer />
    </>
  );
};

export default AddToCart;
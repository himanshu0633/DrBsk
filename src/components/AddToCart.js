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

/** ---------- Facebook Pixel Functions ---------- */
// Server-side event function
const sendServerEvent = async (eventName, data) => {
  try {
    const eventData = {
      eventName,
      data: {
        ...data,
        eventSourceUrl: window.location.href,
        actionSource: 'website',
        eventTime: Math.floor(Date.now() / 1000),
      },
      fbp: getCookie('_fbp'),
      fbc: getCookie('_fbc'),
      clientUserAgent: navigator.userAgent,
    };

    // Send to your backend API
    await fetch('/api/facebook-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });
  } catch (error) {
    console.error('Error sending server event:', error);
  }
};

// Helper function to get cookies
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const AddToCart = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [hasTrackedPageView, setHasTrackedPageView] = useState(false);
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

  // Calculate totalPrice BEFORE any effects that use it
  const totalPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.final_price || 0);
    return acc + price * (item.quantity || 1);
  }, 0);

  // Email validation function
  const isValidEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Facebook Pixel Tracking Functions
  const trackViewContent = (contentData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: contentData.name,
        content_ids: contentData.content_ids || [contentData.id],
        content_type: contentData.type || 'product',
        value: contentData.value || 0,
        currency: contentData.currency || 'INR',
        content_category: contentData.category,
      });
    }

    // Server-side event send
    sendServerEvent('ViewContent', contentData);
  };

  const trackPageView = () => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
    
    // Server-side event send
    sendServerEvent('PageView', {
      id: 'cart_page_view',
      name: 'Shopping Cart Page',
      value: totalPrice,
      currency: 'INR',
      category: 'Cart',
      type: 'page',
      item_count: cartItems.length,
      total_value: totalPrice,
    });
  };

  const trackAddToCart = (productData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: productData.content_ids || [productData.id],
        content_name: productData.name,
        content_type: productData.type || 'product',
        value: productData.value || productData.price || 0,
        currency: productData.currency || 'INR',
        num_items: productData.quantity || 1,
      });
    }
    sendServerEvent('AddToCart', productData);
  };

  const trackInitiateCheckout = (checkoutData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: checkoutData.value || totalPrice,
        currency: checkoutData.currency || 'INR',
        num_items: cartItems.length,
        content_ids: cartItems.map(item => item._id),
        content_type: 'product',
      });
    }
    
    sendServerEvent('InitiateCheckout', checkoutData);
  };

  const trackPurchase = (purchaseData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: purchaseData.value || totalPrice,
        currency: purchaseData.currency || 'INR',
        content_ids: purchaseData.contentIds || cartItems.map(item => item._id),
        content_type: 'product',
        num_items: purchaseData.numItems || cartItems.length,
        order_id: purchaseData.orderId,
      });
    }
    sendServerEvent('Purchase', purchaseData);
  };

  const trackRemoveFromCart = (productData) => {
    trackViewContent({
      id: `remove_from_cart_${productData.id}`,
      name: `${productData.name} - Removed from Cart`,
      value: productData.value || productData.price || 0,
      currency: 'INR',
      category: 'Cart Action',
      type: 'remove_from_cart',
      action: 'remove',
    });
  };

  const trackClearCart = () => {
    trackViewContent({
      id: 'clear_cart_action',
      name: 'Cart Cleared',
      value: totalPrice,
      currency: 'INR',
      category: 'Cart Action',
      type: 'clear_cart',
      item_count: cartItems.length,
      total_value: totalPrice,
    });
  };

  // Initialize Facebook Pixel
  useEffect(() => {
    // Track PageView
    if (!hasTrackedPageView) {
      trackPageView();
      setHasTrackedPageView(true);
    }

    // Track cart view
    trackViewContent({
      id: 'cart_view',
      name: 'Cart Contents View',
      value: totalPrice,
      currency: 'INR',
      category: 'Cart',
      type: 'cart_view',
      item_count: cartItems.length,
      items: cartItems.map(item => ({
        id: item._id,
        name: item.name,
        price: item.final_price,
        quantity: item.quantity
      })),
    });

    // Track individual product views in cart
    cartItems.forEach((item, index) => {
      setTimeout(() => {
        trackViewContent({
          id: `cart_item_view_${item._id}`,
          name: `${item.name} - In Cart`,
          value: item.final_price,
          currency: 'INR',
          category: 'Cart Item',
          type: 'cart_product_view',
          quantity: item.quantity,
        });
      }, index * 300);
    });
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
  }, []);  // This effect runs once on mount

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItem = cartItems.find((item) => item._id === itemId);
    if (updatedItem) {
      const updatedProduct = { ...updatedItem, quantity: newQuantity };
      dispatch(updateData(updatedProduct));
      toast.success('Item quantity updated!', { position: 'top-right', autoClose: 2000 });
      
      // Track quantity change
      trackAddToCart({
        id: updatedItem._id,
        name: updatedItem.name,
        price: updatedItem.final_price,
        value: updatedItem.final_price * newQuantity,
        currency: 'INR',
        category: 'Cart Update',
        type: 'quantity_update',
        quantity: newQuantity,
        old_quantity: updatedItem.quantity,
        action: newQuantity > updatedItem.quantity ? 'increase' : 'decrease',
      });
    }
  };

  const handleRemoveItem = (itemId) => {
    const removedItem = cartItems.find((item) => item._id === itemId);
    if (removedItem) {
      trackRemoveFromCart({
        id: removedItem._id,
        name: removedItem.name,
        price: removedItem.final_price,
        value: removedItem.final_price * (removedItem.quantity || 1),
        currency: 'INR',
      });
    }
    
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
      
      // Track email update
      trackViewContent({
        id: 'email_updated_cart',
        name: 'Email Updated in Cart',
        value: 0,
        category: 'User Information',
        type: 'email_update',
      });
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
        
        // Track phone update
        trackViewContent({
          id: 'phone_updated_cart',
          name: 'Phone Updated in Cart',
          value: 0,
          category: 'User Information',
          type: 'phone_update',
        });
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
    
    // Track address addition
    trackViewContent({
      id: 'address_added_cart',
      name: 'Address Added in Cart',
      value: 0,
      category: 'User Information',
      type: 'address_add',
      address_type: isAuthenticated ? 'registered_user' : 'guest_user',
    });
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

    // Track Initiate Checkout event
    trackInitiateCheckout({
      id: 'cart_checkout_initiated',
      name: 'Checkout Initiated from Cart',
      value: totalPrice,
      currency: 'INR',
      content_ids: cartItems.map(item => item._id),
      item_count: cartItems.length,
      user_type: isAuthenticated ? 'registered' : 'guest',
    });

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
              
              // Track Purchase event
              trackPurchase({
                id: `order_${verifyResponse.data.orderId}`,
                name: `Order #${verifyResponse.data.orderId}`,
                value: totalPrice,
                currency: 'INR',
                contentIds: cartItems.map(item => item._id),
                numItems: cartItems.length,
                orderId: verifyResponse.data.orderId,
                user_type: isAuthenticated ? 'registered' : 'guest',
              });
              
              // Update loader for final step
              setProcessingMessage("Finalizing your order...");
              
              // Clear cart
              dispatch(clearProducts());
              localStorage.removeItem('cartItems');
              
              // Track cart clear after purchase
              trackClearCart();
              
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
              // Track checkout abandonment
              trackViewContent({
                id: 'checkout_abandoned',
                name: 'Checkout Abandoned',
                value: totalPrice,
                currency: 'INR',
                category: 'Cart Abandonment',
                type: 'checkout_abandonment',
                item_count: cartItems.length,
                total_value: totalPrice,
              });
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
        
        // Track payment failure
        trackViewContent({
          id: 'payment_failed',
          name: 'Payment Failed',
          value: totalPrice,
          currency: 'INR',
          category: 'Payment Error',
          type: 'payment_failure',
          error_code: response.error.code,
          error_description: response.error.description,
        });
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
      
      // Track checkout error
      trackViewContent({
        id: 'checkout_error',
        name: 'Checkout Error',
        value: totalPrice,
        currency: 'INR',
        category: 'Checkout Error',
        type: 'checkout_error',
        error_message: errorMessage,
      });
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
        <div 
          className="login-prompt"
          onClick={() => trackViewContent({
            id: 'guest_cart_view',
            name: 'Guest User in Cart',
            value: totalPrice,
            currency: 'INR',
            category: 'User Type',
            type: 'guest_user',
          })}
        >
          <p>You are browsing as a guest. 
            <button onClick={() => {
              trackViewContent({
                id: 'login_prompt_click_cart',
                name: 'Login Prompt Clicked in Cart',
                value: 0,
                category: 'User Action',
                type: 'login_prompt_click',
              });
              navigate('/login');
            }} className="login-link">Login</button> 
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
          onClick={() => trackViewContent({
            id: `address_selected_${index}`,
            name: 'Address Selected',
            value: 0,
            category: 'Checkout Process',
            type: 'address_selection',
            address_type: 'text',
          })}
        >
          <label>
            <input
              type="radio"
              name="selectedAddress"
              value={addr}
              checked={formData.selectedAddress === addr}
              onChange={() => {
                setFormData(prev => ({ ...prev, selectedAddress: addr }));
                trackViewContent({
                  id: `address_radio_${index}`,
                  name: 'Address Radio Selected',
                  value: 0,
                  category: 'Checkout Process',
                  type: 'address_selection',
                });
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
          onClick={() => trackViewContent({
            id: `address_selected_object_${index}`,
            name: 'Address Object Selected',
            value: 0,
            category: 'Checkout Process',
            type: 'address_selection',
            address_type: 'object',
          })}
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
                
                trackViewContent({
                  id: `address_radio_object_${index}`,
                  name: 'Address Radio Object Selected',
                  value: 0,
                  category: 'Checkout Process',
                  type: 'address_selection',
                });
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
    // Track back to shopping button click
    trackViewContent({
      id: 'back_to_shopping_cart',
      name: 'Back to Shopping from Cart',
      value: totalPrice,
      currency: 'INR',
      category: 'Navigation',
      type: 'cart_exit',
      item_count: cartItems.length,
    });
    navigate(-1);
  };

  const handleContinueShoppingClick = () => {
    // Track continue shopping button click
    trackViewContent({
      id: 'continue_shopping_cart',
      name: 'Continue Shopping from Cart',
      value: totalPrice,
      currency: 'INR',
      category: 'Navigation',
      type: 'continue_shopping',
      item_count: cartItems.length,
    });
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
                <h2
                  onClick={() => trackViewContent({
                    id: 'cart_section_header',
                    name: 'Cart Section Header Clicked',
                    value: 0,
                    category: 'User Interaction',
                    type: 'section_header_click',
                  })}
                >
                  Your Items ({cartItems.length})
                </h2>
                {cartItems.length > 0 && (
                  <button
                    className="clear-cart-btn"
                    onClick={() => {
                      // Track clear cart click
                      trackViewContent({
                        id: 'clear_cart_click',
                        name: 'Clear Cart Button Clicked',
                        value: totalPrice,
                        currency: 'INR',
                        category: 'Cart Action',
                        type: 'clear_cart_click',
                        item_count: cartItems.length,
                      });
                      
                      dispatch(clearProducts());
                      toast.info('Cart cleared.', {
                        position: 'top-right',
                        autoClose: 2000,
                      });
                      trackClearCart();
                    }}
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div 
                  className="empty-cart"
                  onClick={() => trackViewContent({
                    id: 'empty_cart_view',
                    name: 'Empty Cart View',
                    value: 0,
                    category: 'Cart State',
                    type: 'empty_cart',
                  })}
                >
                  <div className="empty-cart-icon">
                    <ShoppingBag size={64} />
                  </div>
                  <h3>Your cart is empty</h3>
                  <p>Add some items to get started</p>
                  <button onClick={handleContinueShoppingClick} className="continue-shopping-btn">Start Shopping</button>
                </div>
              ) : (
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="cart-item"
                      onClick={() => trackViewContent({
                        id: `cart_item_click_${item._id}`,
                        name: `${item.name} - Cart Item Clicked`,
                        value: item.final_price,
                        currency: 'INR',
                        category: 'Cart Item',
                        type: 'cart_item_interaction',
                      })}
                    >
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
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="order-summary">
                <div className="summary-card">
                  <h3 
                    className="summary-title"
                    onClick={() => trackViewContent({
                      id: 'order_summary_click',
                      name: 'Order Summary Clicked',
                      value: totalPrice,
                      currency: 'INR',
                      category: 'Order Summary',
                      type: 'order_summary_interaction',
                    })}
                  >
                    Order Summary
                  </h3>

                  {!isAuthenticated && (
                    <div 
                      className="guest-notice"
                      onClick={() => trackViewContent({
                        id: 'guest_notice_cart',
                        name: 'Guest Notice Viewed',
                        value: 0,
                        category: 'User Type',
                        type: 'guest_notice',
                      })}
                    >
                      <p>🎯 <strong>Guest Checkout Available!</strong> Enter your details below to proceed without login.</p>
                    </div>
                  )}

                  <button
                    className="enhanced-add-address-btn"
                    onClick={() => {
                      setShowModal(true);
                      // Track add address button click
                      trackViewContent({
                        id: 'add_address_button_click',
                        name: 'Add Address Button Clicked',
                        value: 0,
                        category: 'Checkout Process',
                        type: 'add_address_click',
                      });
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
                        <button onClick={() => {
                          trackViewContent({
                            id: 'login_suggestion_click_cart',
                            name: 'Login Suggestion Clicked in Cart',
                            value: 0,
                            category: 'User Action',
                            type: 'login_suggestion_click',
                          });
                          navigate('/login');
                        }} className="login-suggestion-btn">
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
          // Track address modal close
          trackViewContent({
            id: 'address_modal_closed',
            name: 'Address Modal Closed',
            value: 0,
            category: 'User Interaction',
            type: 'modal_close',
            action: 'address_modal',
          });
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
                    // Track state selection
                    trackViewContent({
                      id: 'state_selected_address',
                      name: 'State Selected in Address',
                      value: 0,
                      category: 'Address Form',
                      type: 'state_selection',
                      state: e.target.value,
                    });
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
                    // Track city selection
                    trackViewContent({
                      id: 'city_selected_address',
                      name: 'City Selected in Address',
                      value: 0,
                      category: 'Address Form',
                      type: 'city_selection',
                      city: e.target.value,
                    });
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
              // Track cancel button click
              trackViewContent({
                id: 'address_modal_cancel',
                name: 'Address Modal Cancel Button',
                value: 0,
                category: 'User Action',
                type: 'modal_cancel',
              });
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
    </>
  );
};

export default AddToCart;
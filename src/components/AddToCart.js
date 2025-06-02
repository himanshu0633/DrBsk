import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import './addToCart.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteProduct, updateData, clearProducts } from '../store/Action';
import API_URL from '../config';
import axiosInstance from './AxiosInstance';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, InputAdornment } from '@mui/material';

const AddToCart = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    flat: '',
    landmark: '',
    state: '',
    city: '',
    country: '',
    phone: '',
    selectedAddress: ''
  });

  const cartItems = useSelector((state) => state.app.data);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      setIsAuthenticated(true);
    } else {
      window.location.href = '/login';
    }
  }, []);

  if (isAuthenticated === null) return null;

  const totalPrice = cartItems.reduce((acc, item) => {
    const price = parseFloat(item.consumer_price || item.price || 0);
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

  const handleAddAddress = async () => {
    const userData = JSON.parse(sessionStorage.getItem('userData'));
    const userId = userData?._id;

    if (!userId) {
      toast.error("User ID not found.");
      return;
    }

    const fullAddress = `${formData.flat}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.country}`;

    try {
      const response = await axiosInstance.put(`admin/updateAdmin/${userId}`, {
        address: [...addresses, fullAddress],
        phone: formData.phone,
      });

      if (response.status === 200) {
        toast.success("Address added successfully");
        setAddresses((prev) => [...prev, fullAddress]);
        setFormData({ ...formData, selectedAddress: fullAddress });
        setShowModal(false);
      }
    } catch (error) {
      toast.error("Failed to update address");
      console.error("Address update error:", error);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = () => {
  if (!formData.selectedAddress) {
    toast.warn("Please select an address before checkout.");
    return;
  }

  const options = {
    key: "rzp_test_hgXU0UWRTSRoYM", // Replace with real Razorpay key
    amount: totalPrice * 100, // In paise
    currency: "INR",
    name: "My Shop",
    description: "Order Payment",
    handler: function (response) {
      toast.success("Payment successful!");
      dispatch(clearProducts());
      navigate("/success");
    },
    prefill: {
      name: "Test User",
      email: "test@example.com",
      contact: formData.phone || "9999999999",
    },
    notes: {
      address: formData.selectedAddress,
    },
    theme: {
      color: "#3399cc",
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
};


  return (
    <>
      <div className="cart-container">
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
                      <div className="item-image">
                        <img src={`${API_URL}${item.media[0]?.url}`} alt={item.name} />
                      </div>

                      <div className="item-details">
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-description">{item.quantity} Pack</p>

                        <div className="item-pricing">
                          <span className="current-price">
                            ₹{parseFloat(item.consumer_price || item.price || 0).toFixed(2)}
                          </span>
                          {item.retail_price && (
                            <>
                              <span className="original-price">
                                ₹{parseFloat(item.retail_price).toFixed(2)}
                              </span>
                              <span className="discount">
                                {Math.round(((item.retail_price - item.consumer_price) / item.retail_price) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="item-actions">
                        <div className="quantity-controls">
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity">{item.quantity || 1}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id, (item.quantity || 1) + 1)}
                          >
                            <Plus size={16} />
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

                <button
  className="enhanced-add-address-btn"
  onClick={() => setShowModal(true)}
>
  ➕ Add New Address
</button>
                {addresses.length > 0 ? (
  <div className="saved-addresses">
    <h4 className="section-subtitle">📍 Saved Addresses</h4>
    <ul className="address-list">
      {addresses.map((addr, index) => (
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
              onChange={() =>
                setFormData({ ...formData, selectedAddress: addr })
              }
            />
            <span>{addr}</span>
          </label>
        </li>
      ))}
    </ul>
  </div>
) : (
  <p className="no-address-text">No address saved yet. Please add one.</p>
)}

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

                  <div className="promo-code">
                    <input type="text" placeholder="Enter promo code" className="promo-input" />
                    <button className="apply-btn">Apply</button>
                  </div>

                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                    <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                  </button>

                  <div className="security-badges">
                    <div className="badge">🔒 Secure Checkout</div>
                    <div className="badge">✓ 30-Day Returns</div>
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
  <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Address</DialogTitle>
  <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Flat / House"
          fullWidth
          variant="outlined"
          size="small"
          onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Landmark"
          fullWidth
          variant="outlined"
          size="small"
          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="City"
          fullWidth
          variant="outlined"
          size="small"
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="State"
          fullWidth
          variant="outlined"
          size="small"
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Country"
          fullWidth
          variant="outlined"
          size="small"
          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Phone Number"
          fullWidth
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start">+91</InputAdornment>,
          }}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2 }}>
    <Button
      onClick={handleAddAddress}
      color="primary"
      variant="contained"
      sx={{ fontWeight: 600 }}
    >
      Add Address
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

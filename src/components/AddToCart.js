import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import './addToCart.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { deleteProduct, updateData , clearProducts } from '../store/Action'; // adjust the path accordingly


const AddToCart = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const cartItems = useSelector((state) => state.app.data);
   const navigate = useNavigate();
const dispatch = useDispatch();

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
    const updatedProduct = {
      ...updatedItem,
      quantity: newQuantity,
    };
    dispatch(updateData(updatedProduct));
    toast.success('Item quantity updated!', {
      position: 'top-right',
      autoClose: 2000,
    });
  }
};



 const handleRemoveItem = (itemId) => {
  dispatch(deleteProduct(itemId));
  toast.info('Item removed from cart.', {
    position: 'top-right',
    autoClose: 2000,
  });
};


  return (
    <div className="cart-container">
      {/* Header */}
      <div className="cart-header">
        <div className="container">
          <button className="back-button" onClick={() => navigate(-1)}>
      <ArrowLeft size={20} />
      Continue Shopping
    </button>
          <h1 className="cart-title">
            <ShoppingBag size={28} />
            Shopping Cart
          </h1>
        </div>
      </div>

      <div className="container">
        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="section-header">
              <h2>Your Items ({cartItems.length})</h2>
             {cartItems.length > 0 && (
  <button className="clear-cart-btn" onClick={() => {
    dispatch(clearProducts());
    toast.info('Cart cleared.', {
      position: 'top-right',
      autoClose: 2000,
    });
  }}>
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
                <button className="continue-shopping-btn">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item">
                    <div className="item-image">
                      <img
                        src={item.media?.[0]?.url?.startsWith('http')
                          ? item.media[0].url
                          : `${process.env.REACT_APP_API_URL || ''}${item.media?.[0]?.url}`}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    
                    <div className="item-details">
                      <h3 className="item-name">{item.name}</h3>
                      <p className="item-description">{item.quantity} Pack</p>
                      
                      <div className="item-pricing">
                        <span className="current-price">
                          ₹{parseFloat(item.consumer_price || item.price || 0).toFixed(2)}
                        </span>
                        {item.retail_price && (
                          <span className="original-price">
                            ₹{parseFloat(item.retail_price).toFixed(2)}
                          </span>
                        )}
                        {item.retail_price && (
                          <span className="discount">
                            {Math.round(((item.retail_price - item.consumer_price) / item.retail_price) * 100)}% OFF
                          </span>
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
                      
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          {cartItems.length > 0 && (
            <div className="order-summary">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                
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
                  <input 
                    type="text" 
                    placeholder="Enter promo code"
                    className="promo-input"
                  />
                  <button className="apply-btn">Apply</button>
                </div>

                <button className="checkout-btn">
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
  );
};

export default AddToCart;

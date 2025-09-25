// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
// import './addToCart.css';
// import { Link, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { deleteProduct, updateData, clearProducts } from '../store/Action';
// import API_URL from '../config';
// import axiosInstance from './AxiosInstance';
// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, InputAdornment } from '@mui/material';
// import JoinUrl from '../JoinUrl';

// const AddToCart = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [addresses, setAddresses] = useState([]);
//   const [OriginalAddress, setOriginalAddress] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);
//   // const [countryCode, setCountryCode] = useState('+91');
//   // const [localNumber, setLocalNumber] = useState('');
//   const [formData, setFormData] = useState({
//     flat: '',
//     landmark: '',
//     state: '',
//     city: '',
//     country: 'India',
//     phone: '',
//     selectedAddress: ''
//   });
//   const userData = localStorage.getItem('userData');
//   const cartItems = useSelector((state) => state.app.data);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const userData = localStorage.getItem('userData');
//     if (userData) {
//       setIsAuthenticated(true);
//     } else {
//       // window.location.href = '/login';
//       // navigate('/login')
//     }
//   }, []);

//   // if (isAuthenticated === null) return null;


//   // const totalPrice = cartItems.reduce((acc, item) => {
//   //   const price = parseFloat(item.consumer_price || item.price || 0);
//   //   return acc + price * (item.quantity || 1);
//   // }, 0);

//   const totalPrice = cartItems.reduce((acc, item) => {
//     const price = parseFloat(item.final_price || 0);
//     return acc + price * (item.quantity || 1);
//   }, 0);


//   const handleQuantityChange = (itemId, newQuantity) => {
//     if (newQuantity < 1) return;
//     const updatedItem = cartItems.find((item) => item._id === itemId);
//     if (updatedItem) {
//       const updatedProduct = { ...updatedItem, quantity: newQuantity };
//       dispatch(updateData(updatedProduct));
//       toast.success('Item quantity updated!', { position: 'top-right', autoClose: 2000 });
//     }
//   };

//   const handleRemoveItem = (itemId) => {
//     dispatch(deleteProduct(itemId));
//     toast.info('Item removed from cart.', { position: 'top-right', autoClose: 2000 });
//   };

//   const handleAddAddress = async () => {
//     const userData = JSON.parse(localStorage.getItem('userData'));
//     const userId = userData?._id;

//     // if (!userId) {
//     //   toast.error("User ID not found.");
//     //   return;
//     // }
//     const phoneWithCountry = `+91${formData.phone}`;

//     const fullAddress = `${formData.flat}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.country}`;

//     try {
//       const response = await axiosInstance.put(`admin/updateAdmin/${userId}`, {
//         address: [...addresses, fullAddress],
//         // phone: formData.phone,
//         phone: phoneWithCountry,
//       });

//       if (response.status === 200) {
//         toast.success("Address added successfully");
//         setAddresses((prev) => [...prev, fullAddress]);
//         setFormData({ ...formData, selectedAddress: fullAddress });
//         setShowModal(false);
//       }
//     } catch (error) {
//       toast.error("Failed to update address");
//       console.error("Address update error:", error);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     const fetchStates = async () => {
//       try {
//         const res = await axiosInstance.post('https://countriesnow.space/api/v0.1/countries/states', {
//           country: 'India'
//         });
//         setStates(res.data.data.states.map(s => s.name));
//       } catch (err) {
//         console.error('Error fetching states', err);
//       }
//     };
//     fetchStates();
//   }, []);

//   useEffect(() => {
//     if (!formData.state) return;

//     const fetchCities = async () => {
//       try {
//         const res = await axiosInstance.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
//           country: 'India',
//           state: formData.state
//         });
//         setCities(res.data.data);
//       } catch (err) {
//         console.error('Error fetching cities', err);
//       }
//     };
//     fetchCities();
//   }, [formData.state]);

// // option 1: Updated with proper Razorpay Order API flow
// const handleCheckout = async () => {
//   if (!formData.selectedAddress) {
//     toast.warn("Please select an address before checkout.");
//     return;
//   }

//   console.log("Phone used for checkout:", formData.phone);

//   try {
//     // First, create the order in your backend which will create Razorpay order
//     const userData = JSON.parse(localStorage.getItem("userData"));
//     // Get phone from user data if not in formData
//     const phoneNumber = formData.phone || OriginalAddress?.phone || "";

//     const orderPayload = {
//       userId: userData?._id,
//       items: cartItems.map((item) => ({
//         productId: item._id,
//         name: item.name,
//         quantity: item.quantity || 1,
//         price: parseFloat(item?.final_price || item?.consumer_price || 0),
//       })),
//       address: formData.selectedAddress,
//       phone: phoneNumber,
//       totalAmount: totalPrice,
//       paymentId: response.razorpay_payment_id || null, 
//     };

//     console.log("Order payload:", orderPayload); // Debug log
//     console.log("Cart items for debugging:", cartItems.map(item => ({
//       name: item.name,
//       final_price: item.final_price,
//       consumer_price: item.consumer_price,
//       retail_price: item.retail_price
//     })));

//     const orderResponse = await axiosInstance.post("/api/createOrder", orderPayload);

//     if (orderResponse.status !== 201) {
//       toast.error("Failed to create order.");
//       return;
//     }

//     const { razorpayOrderId } = orderResponse.data;

//     // Now create Razorpay payment options with the order ID
//     const options = {
//       key: "rzp_live_hgk55iUzVRpKZ1", // Your Razorpay key
//       amount: totalPrice * 100, // In paise
//       currency: "INR",
//       name: "BSK Healthcare",
//       description: "Order Payment",
//       order_id: razorpayOrderId, // Use the Razorpay order ID
//       handler: async function (response) {
//         try {
//           toast.success("Payment successful!");

//           // Update the order with payment ID
//           const updatePayload = {
//             paymentId: response.razorpay_payment_id,
//             razorpayOrderId: razorpayOrderId,
//           };

//           await axiosInstance.put(`/api/updatePayment/${orderResponse.data.orderId}`, updatePayload);

//           dispatch(clearProducts()); // Clear the cart
//           navigate("/success"); // Redirect to success page
//         } catch (error) {
//           console.error("Order update error:", error);
//           toast.error("Payment successful but failed to update order.");
//         }
//       },
//       prefill: {
//         name: "Test User",
//         email: "test@example.com",
//         contact: phoneNumber,
//       },
//       notes: {
//         address: formData.selectedAddress,
//       },
//       theme: {
//         color: "#3399cc",
//       },
//     };

//     const razorpay = new window.Razorpay(options);
//     razorpay.open();
//   } catch (error) {
//     console.error("Checkout error:", error);
//     toast.error("Something went wrong while creating the order.");
//   }
// };


// 2:
//   const handleCheckout = () => {
//   if (!formData.selectedAddress) {
//     toast.warn('Please select an address before checkout.');
//     return;
//   }
//   const phoneNumber = formData.phone || OriginalAddress?.phone || "";

//   const options = {
//     key: 'rzp_live_hgk55iUzVRpKZ1',
//     amount: Math.round(totalPrice * 100), // paise
//     currency: 'INR',
//     name: 'BSK Healthcare',
//     description: 'Order Payment',
//     handler: async function (response) {
//       try {
//         toast.success('Payment successful!');
//         const userData = JSON.parse(localStorage.getItem('userData'));


//         const orderPayload = {
//           userId: userData?._id,
//           items: cartItems.map((item) => {
//             const qty = item.cartQty ?? (typeof item.quantity === 'number' ? item.quantity : 1);
//             const price = Number(
//               item.unitPrice ??
//               item.selectedVariant?.final_price ??
//               item.selectedVariant?.finalPrice ??
//               0
//             );
//             return {
//               productId: item._id,
//               name: item.name,
//               quantity: qty,
//               price,
//             };
//           }),

//           address: formData.selectedAddress,
//           phone: phoneNumber,
//           totalAmount: totalPrice,
//           paymentId: response.razorpay_payment_id,
//         };
//         const res = await axiosInstance.post('/api/createOrder', orderPayload);
//         if (res.status === 201) {
//           dispatch(clearProducts());
//           navigate('/successOrder');
//           // toast.success('Order placed successfully!');
//         } else {
//           toast.error('Failed to place order.');
//         }
//       } catch (err) {
//         console.error('Order creation error:', err);
//         toast.error('Something went wrong while placing the order.');
//       }
//     },
//     prefill: {
//       name: userData?.name,
//       email: userData?.email,
//       contact: phoneNumber,
//     },
//     notes: { address: formData.selectedAddress },
//     theme: { color: '#3399cc' },
//   };
//   const rz = new window.Razorpay(options);
//   rz.open();
// };

// // 3:
//   const handleCheckout = async () => {
//     if (!formData.selectedAddress) {
//       toast.warn('Please select an address before checkout.');
//       return;
//     }

//     const phoneNumber = formData.phone || OriginalAddress?.phone || "";
//     const userData = JSON.parse(localStorage.getItem('userData'));

//     // Validate user data
//     if (!userData || !userData._id || !userData.email) {
//       toast.error('Please log in again to continue');
//       navigate('/login');
//       return;
//     }

//     // Validate cart items
//     if (!cartItems || cartItems.length === 0) {
//       toast.error('Your cart is empty');
//       return;
//     }

//     try {
//       console.log("User Data:", userData);

//       // Prepare order payload with detailed validation
//       const orderPayload = {
//         userId: userData._id,
//         items: cartItems.map((item, index) => {
//           const qty = item.cartQty ?? item.quantity ?? 1;
//           let price = 0;

//           // Try different price fields based on your product structure
//           if (item.final_price) {
//             price = Number(item.final_price);
//           } else if (item.consumer_price) {
//             price = Number(item.consumer_price);
//           } else if (item.selectedVariant?.final_price) {
//             price = Number(item.selectedVariant.final_price);
//           } else if (item.price) {
//             price = Number(item.price);
//           }

//           console.log(`Item ${index + 1}:`, {
//             _id: item._id,
//             name: item.name,
//             quantity: qty,
//             price: price
//           });

//           if (!item._id || !item.name || qty < 1 || price <= 0) {
//             throw new Error(`Invalid item data for: ${item.name || 'Unknown item'}`);
//           }

//           return {
//             productId: item._id,
//             name: item.name.trim(),
//             quantity: parseInt(qty),
//             price: parseFloat(price)
//           };
//         }),
//         address: formData.selectedAddress.trim(),
//         phone: phoneNumber.trim(),
//         totalAmount: parseFloat(totalPrice)
//       };

//       console.log("Final Order Payload:", orderPayload);

//       // Validate total amount
//       const calculatedTotal = orderPayload.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//       if (Math.abs(calculatedTotal - orderPayload.totalAmount) > 0.01) {
//         throw new Error(`Total amount mismatch. Expected: ${calculatedTotal}, Got: ${orderPayload.totalAmount}`);
//       }

//       // Create order in backend first

//       const orderResponse = await axiosInstance.post('/api/createOrder', orderPayload);

//       console.log("Order response:", orderResponse.data);

//       if (!orderResponse.data.success) {
//         toast.error(`Failed to create order: ${orderResponse.data.message}`);
//         return;
//       }

//       const { razorpayOrderId, orderId } = orderResponse.data;
//       console.log("Order created successfully:", { orderId, razorpayOrderId });

//       // Initialize Razorpay payment with customer email
//       const razorpayOptions = {
//         key: 'rzp_live_hgk55iUzVRpKZ1', // Your Razorpay key
//         amount: Math.round(orderPayload.totalAmount * 100), // Amount in paise
//         currency: 'INR',
//         name: 'BSK Healthcare',
//         description: `Order #${orderId.slice(-8)}`,
//         order_id: razorpayOrderId, // This links payment to order

//         handler: async function (response) {
//           console.log("=== PAYMENT SUCCESS ===");
//           console.log("Payment response:", response);

//           try {
//             // Payment was successful
//             console.log("Payment details:", {
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_signature: response.razorpay_signature
//             });

//             // Clear cart and redirect to success page
//             dispatch(clearProducts());
//             toast.success('Payment successful! Order placed.');

//             // Store order ID for success page
//             localStorage.setItem('lastOrderId', orderId);

//             navigate('/successOrder');

//           } catch (err) {
//             console.error('Post-payment processing error:', err);
//             toast.error('Payment successful but there was an issue. Please contact support.');
//             navigate('/successOrder'); // Still redirect as payment was successful
//           }
//         },

//         modal: {
//           ondismiss: function () {
//             console.log("Payment modal dismissed by user");
//             toast.info('Payment cancelled');
//           }
//         },

//         prefill: {
//           name: userData.name || '',
//           email: userData.email, // This ensures email shows in Razorpay dashboard
//           contact: phoneNumber
//         },

//         notes: {
//           address: formData.selectedAddress,
//           orderId: orderId,
//           userId: userData._id,
//           userEmail: userData.email
//         },

//         theme: {
//           color: '#3399cc'
//         },

//         // Additional options for better UX
//         method: {
//           netbanking: true,
//           card: true,
//           upi: true,
//           wallet: true,
//           emi: false
//         },

//         // Customer details for Razorpay dashboard
//         customer: {
//           name: userData.name,
//           email: userData.email,
//           contact: phoneNumber
//         }
//       };

//       console.log("Initializing Razorpay with options:", {
//         ...razorpayOptions,
//         handler: '[Function]'
//       });

//       // Create Razorpay instance
//       const razorpayInstance = new window.Razorpay(razorpayOptions);

//       // Handle payment failures
//       razorpayInstance.on('payment.failed', function (response) {
//         console.log("=== PAYMENT FAILED ===");
//         console.log("Failed payment response:", response);

//         const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
//         toast.error(`Payment failed: ${errorMsg}`);

//         // logger.error('Payment failed', {
//         //   orderId,
//         //   error: response.error,
//         //   userEmail: userData.email
//         // });
//         console.log(
//           'Payment failed', {
//           orderId,
//           error: response.error,
//           userEmail: userData.email
//         }
//         )
//       });

//       // Open Razorpay payment modal
//       razorpayInstance.open();

//     } catch (error) {
//       console.error('=== CHECKOUT ERROR ===');
//       console.error('Error details:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });

//       let errorMessage = 'Failed to initiate checkout. Please try again.';

//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.message) {
//         errorMessage = error.message;
//       }

//       toast.error(errorMessage);
//     }
//   };


//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     const userData = JSON.parse(localStorage.getItem('userData'));
//     const userId = userData?._id;

//     if (!userId) {
//       console.error("User ID not found.");
//       return;
//     }

//     try {
//       const response = await axiosInstance.get(`/admin/readAdmin/${userId}`);

//       const userInfo = response?.data?.data; // ✅ Actual user data is nested here

//       console.log("✅ Fetched user info:", userInfo);
//       console.log("✅ Fetched address:", userInfo?.address);

//       setOriginalAddress(userInfo);

//       if (Array.isArray(userInfo?.address)) {
//         setAddresses(userInfo.address);
//       } else {
//         console.warn("⚠️ Address is not an array.");
//       }
//     } catch (error) {
//       console.error("Error fetching address:", error);
//     }
//   };

//   return (
//     <>
//       <div className="cart-container">
//         <div className="cart-header">
//           <div className="container">
//             <button className="back-button" onClick={() => navigate(-1)}>
//               <ArrowLeft size={20} /> Continue Shopping
//             </button>
//             <h1 className="cart-title">
//               <ShoppingBag size={28} /> Shopping Cart
//             </h1>
//           </div>
//         </div>

//         <div className="container">
//           <div className="cart-content">
//             <div className="cart-items-section">
//               <div className="section-header">
//                 <h2>Your Items ({cartItems.length})</h2>
//                 {cartItems.length > 0 && (
//                   <button
//                     className="clear-cart-btn"
//                     onClick={() => {
//                       dispatch(clearProducts());
//                       toast.info('Cart cleared.', {
//                         position: 'top-right',
//                         autoClose: 2000,
//                       });
//                     }}
//                   >
//                     Clear Cart
//                   </button>
//                 )}
//               </div>

//               {cartItems.length === 0 ? (
//                 <div className="empty-cart">
//                   <div className="empty-cart-icon">
//                     <ShoppingBag size={64} />
//                   </div>
//                   <h3>Your cart is empty</h3>
//                   <p>Add some items to get started</p>
//                   <button onClick={() => navigate("/fever")} className="continue-shopping-btn">Start Shopping</button>
//                 </div>
//               ) : (
//                 <div className="cart-items">
//                   {cartItems.map((item) => (
//                     <div key={item._id} className="cart-item">
//                       <Link to={`/ProductPage/${item._id}`} className="item-image">
//                         <img
//                           // onClick={() => navigate(`/ProductPage/${item._id}`)} style={{ cursor: 'pointer' }}
//                           src={JoinUrl(API_URL, item.media[0]?.url)} alt={item.name} />
//                       </Link>

//                       <div className="item-details">
//                         <h3 className="item-name">{item.name}</h3>
//                         <p className="item-description">{item.quantity} Pack</p>

//                         <div className="item-pricing">
//                           <span className="current-price">
//                             {/* ₹{parseFloat(item.consumer_price || item.price || 0).toFixed(2)} */}
//                             ₹{parseFloat(item.final_price || 0).toFixed(2)}
//                           </span>
//                           {item.retail_price && (
//                             <>
//                               <span className="original-price">
//                                 ₹{parseFloat(item.retail_price).toFixed(2)}
//                               </span>
//                               <span className="discount">
//                                 {Math.round(((item.retail_price - item.consumer_price) / item.retail_price) * 100)}% OFF
//                               </span>
//                             </>
//                           )}
//                         </div>
//                       </div>

//                       <div className="item-actions">
//                         <div className="quantity-controls">
//                           <button
//                             className="quantity-btn"
//                             onClick={() => handleQuantityChange(item._id, (item.quantity || 1) - 1)}
//                             disabled={(item.quantity || 1) <= 1}
//                           >
//                             {/* <Minus size={24} /> */}
//                             <span>-</span>
//                           </button>
//                           <span className="quantity">{item.quantity || 1}</span>
//                           <button
//                             className="quantity-btn"
//                             onClick={() => handleQuantityChange(item._id, (item.quantity || 1) + 1)}
//                           >
//                             {/* <Plus size={24} /> */}
//                             <span>+</span>
//                           </button>
//                         </div>
//                         <button className="remove-btn" onClick={() => handleRemoveItem(item._id)}>
//                           <Trash2 size={18} />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {cartItems.length > 0 && (
//               <div className="order-summary">
//                 <div className="summary-card">
//                   <h3 className="summary-title">Order Summary</h3>

//                   <button
//                     className="enhanced-add-address-btn"
//                     onClick={() => setShowModal(true)}
//                   >
//                     ➕ Add New Address

//                   </button>

//                   <div className='my_10'>
//                     {addresses.length > 0 ? (
//                       <div className="saved-addresses">
//                         <h4 className="section-subtitle">📍 Saved Addresses</h4>
//                         <ul className="address-list">
//                           {addresses.map((addr, index) => (
//                             <li key={index} className={`address-card ${formData.selectedAddress === addr ? 'selected' : ''}`}>
//                               <label>
//                                 <input
//                                   type="radio"
//                                   name="selectedAddress"
//                                   value={addr}
//                                   checked={formData.selectedAddress === addr}
//                                   onChange={() =>
//                                     setFormData({ ...formData, selectedAddress: addr })
//                                   }
//                                 />
//                                 <span className='text_20'>{addr}</span>
//                               </label>
//                             </li>
//                           ))}

//                         </ul>
//                       </div>
//                     ) : (
//                       <p className="no-address-text">
//                         No address saved yet. Please add one.
//                       </p>

//                     )}
//                   </div>

//                   <div className="summary-details">
//                     <div className="summary-row">
//                       <span>Subtotal ({cartItems.length} items)</span>
//                       <span>₹{totalPrice.toFixed(2)}</span>
//                     </div>
//                     <div className="summary-row">
//                       <span>Shipping</span>
//                       <span className="free-shipping">FREE</span>
//                     </div>
//                     <div className="summary-row">
//                       <span>Tax</span>
//                       <span>₹0.00</span>
//                     </div>
//                     <div className="summary-row discount-row">
//                       <span>Discount</span>
//                       <span>-₹0.00</span>
//                     </div>
//                   </div>

//                   <div className="summary-divider"></div>
//                   <div className="summary-total">
//                     <span>Total</span>
//                     <span>₹{totalPrice.toFixed(2)}</span>
//                   </div>

//                   {/* <div className="promo-code">
//                     <input type="text" placeholder="Enter promo code" className="promo-input" />
//                     <button className="apply-btn">Apply</button>
//                   </div> */}

//                   <button className="checkout-btn" onClick={handleCheckout}>
//                     Proceed to Checkout
//                     <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
//                   </button>

//                   <div className="security-badges">
//                     <div className="badge">🔒 Secure Checkout</div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Dialog
//         open={showModal}
//         onClose={() => setShowModal(false)}
//         fullWidth
//         maxWidth="sm"
//       >
//         <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Address</DialogTitle>
//         <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Flat / House"
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="Landmark"
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
//               />
//             </Grid>
//             {/* <Grid item xs={12} sm={6}>
//               <TextField
//                 label="City"
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 label="State"
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//               />
//             </Grid> */}

//             <select name="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} >
//               <option value="">Select State</option>
//               {states.map((state) => <option key={state} value={state}>{state}</option>)}
//             </select>

//             <select name="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} >
//               <option value="">Select City</option>
//               {cities.map((city) => <option key={city} value={city}>{city}</option>)}
//             </select>

//             <Grid item xs={12} sm={6}>
//               {/* <select
//                 value={countryCode}
//                 onChange={(e) => {
//                   setCountryCode(e.target.value);
//                   setFormData({ ...formData, phone: '' }); // Optional: clear phone input on country change
//                 }}
//                 style={{ width: '25%', marginRight: 8 }}
//               >
//                 <option value="+91">+91 (India)</option>
//                 <option value="+98">+98 (Iran)</option>
//                 <option value="+1">+1 (USA)</option>
//               </select> */}

//               <TextField
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 value="India"
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               {/* <TextField
//                 label="Phone Number"
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 InputProps={{
//                   startAdornment: <InputAdornment position="start">+91</InputAdornment>,
//                 }}
//                 // onChange={(e) => setFormData({ ...formData, phone: e.target.value })}  
//               /> */}
//               <TextField
//                 label="Phone Number"
//                 fullWidth
//                 variant="outlined"
//                 size="small"
//                 name="phone"
//                 value={formData.phone}
//                 onChange={(e) => {
//                   const value = e.target.value;
//                   if (/^\d{0,10}$/.test(value)) {
//                     setFormData({ ...formData, phone: value });
//                   }
//                 }}
//                 InputProps={{
//                   startAdornment: <InputAdornment position="start">+91</InputAdornment>,
//                 }}
//               />

//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 2 }}>
//           <Button
//             onClick={handleAddAddress}
//             color="primary"
//             variant="contained"
//             sx={{ fontWeight: 600 }}
//           >
//             Add Address
//           </Button>
//           <Button
//             onClick={() => setShowModal(false)}
//             color="secondary"
//             variant="outlined"
//           >
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//     </>
//   );
// };

// export default AddToCart;


// // 4:
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import './addToCart.css';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { deleteProduct, updateData, clearProducts } from '../store/Action';
import API_URL from '../config';
import axiosInstance from './AxiosInstance';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Grid, InputAdornment } from '@mui/material';
import JoinUrl from '../JoinUrl';

const AddToCart = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [OriginalAddress, setOriginalAddress] = useState({});
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    flat: '',
    landmark: '',
    state: '',
    city: '',
    country: 'India',
    phone: '',
    selectedAddress: ''
  });

  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const cartItems = useSelector((state) => state.app.data);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      setIsAuthenticated(true);
    } else {
      navigate('/login');
      return;
    }
  }, [navigate]);

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

  const handleAddAddress = async () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData?._id;

    if (!userId) {
      toast.error("Please login first");
      return;
    }

    if (!formData.flat || !formData.landmark || !formData.city || !formData.state || !formData.phone) {
      toast.error("Please fill all address fields");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    const phoneWithCountry = `+91${formData.phone}`;
    const fullAddress = `${formData.flat}, ${formData.landmark}, ${formData.city}, ${formData.state}, ${formData.country}`;

    try {
      const response = await axiosInstance.put(`admin/updateAdmin/${userId}`, {
        address: [...addresses, fullAddress],
        phone: phoneWithCountry,
      });

      if (response.status === 200) {
        toast.success("Address added successfully");
        setAddresses((prev) => [...prev, fullAddress]);
        setFormData({
          ...formData,
          selectedAddress: fullAddress,
          flat: '',
          landmark: '',
          state: '',
          city: '',
          phone: ''
        });
        setShowModal(false);
      }
    } catch (error) {
      toast.error("Failed to update address");
      console.error("Address update error:", error);
    }
    setLoading(false);
  };

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

  const handleCheckout = async () => {
    // Validation checks
    if (!formData.selectedAddress) {
      toast.warn('Please select an address before checkout.');
      return;
    }

    if (!userData || !userData._id || !userData.email) {
      toast.error('Please log in again to continue');
      navigate('/login');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Get phone number - prioritize form data, then original address
    const phoneNumber = formData.phone ? `+91${formData.phone}` : OriginalAddress?.phone || "";

    if (!phoneNumber) {
      toast.error('Phone number is required for checkout');
      return;
    }

    try {
      // Prepare order payload with detailed validation
      const orderPayload = {
        userId: userData._id,
        items: cartItems.map((item, index) => {
          const qty = item.quantity || 1;
          const price = parseFloat(item.final_price || 0);

          if (!item._id || !item.name || qty < 1 || price <= 0) {
            throw new Error(`Invalid item data for: ${item.name || 'Unknown item'}`);
          }

          return {
            productId: item._id,
            name: item.name.trim(),
            quantity: parseInt(qty),
            price: parseFloat(price)
          };
        }),
        address: formData.selectedAddress.trim(),
        phone: phoneNumber.replace('+91', '').trim(), 
        totalAmount: parseFloat(totalPrice)
      };

      console.log("Final Order Payload:", orderPayload);

      // Validate total amount
      const calculatedTotal = orderPayload.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      if (Math.abs(calculatedTotal - orderPayload.totalAmount) > 0.01) {
        throw new Error(`Total amount mismatch. Expected: ${calculatedTotal}, Got: ${orderPayload.totalAmount}`);
      }

      // Create order in backend first
      console.log("Creating order in backend...");
      const orderResponse = await axiosInstance.post('/api/createOrder', orderPayload);

      console.log("Order response:", orderResponse.data);

      const { orderId, razorpayOrderId, message } = orderResponse.data || {};

      if (orderResponse.status !== 201 || !orderId || !razorpayOrderId) {
        toast.error(`Failed to create order${message ? `: ${message}` : ''}`);
        return;
      }

      // success path
      toast.success(message || 'Order created');

      console.log("Order created successfully:", { orderId, razorpayOrderId });

      // Initialize Razorpay payment
      const razorpayOptions = {
        key: 'rzp_live_hgk55iUzVRpKZ1',
        amount: Math.round(orderPayload.totalAmount * 100), // Amount in paise
        currency: 'INR',
        name: 'BSK Healthcare',
        description: `Order #${orderId.slice(-8)}`,
        order_id: razorpayOrderId,

        handler: async function (response) {
          console.log("Payment response:", response);

          try {
            toast.success('Payment successful! Order placed.');

            // Clear cart and redirect
            dispatch(clearProducts());
            localStorage.setItem('lastOrderId', orderId);
            navigate('/successOrder');

          } catch (err) {
            console.error('Post-payment processing error:', err);
            toast.error('Payment successful but there was an issue. Please contact support.');
            navigate('/successOrder');
          }
        },

        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled');
          }
        },

        prefill: {
          name: userData.name || '',
          email: userData.email || '', // This ensures email shows in Razorpay dashboard
          contact: phoneNumber.replace('+91', '') // Remove +91 for prefill
        },

        notes: {
          address: formData.selectedAddress,
          orderId: orderId,
          userId: userData._id,
          userEmail: userData.email
        },

        theme: {
          color: '#3399cc'
        },

        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,
          emi: false
        }
      };

      console.log("Initializing Razorpay with options:", {
        ...razorpayOptions,
        handler: '[Function]'
      });

      // Create Razorpay instance and handle failures
      const razorpayInstance = new window.Razorpay(razorpayOptions);

      razorpayInstance.on('payment.failed', function (response) {
        console.log("=== PAYMENT FAILED ===");
        console.log("Failed payment response:", response);

        const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
        toast.error(`Payment failed: ${errorMsg}`);
      });

      // Open payment modal
      razorpayInstance.open();

    } catch (error) {
      console.error('Checkout Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      let errorMessage = 'Failed to initiate checkout. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  const fetchData = async () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userId = userData?._id;

    if (!userId) {
      console.error("User ID not found.");
      return;
    }

    try {
      const response = await axiosInstance.get(`/admin/readAdmin/${userId}`);
      const userInfo = response?.data?.data;

      console.log("✅ Fetched user info:", userInfo);
      setOriginalAddress(userInfo || {});

      if (Array.isArray(userInfo?.address)) {
        setAddresses(userInfo.address);
        // Auto-select first address if available
        if (userInfo.address.length > 0 && !formData.selectedAddress) {
          setFormData(prev => ({ ...prev, selectedAddress: userInfo.address[0] }));
        }
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) return null;

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

                  <button
                    className="enhanced-add-address-btn"
                    onClick={() => setShowModal(true)}
                  >
                    ➕ Add New Address
                  </button>

                  <div className='my_10'>
                    {addresses.length > 0 ? (
                      <div className="saved-addresses">
                        <h4 className="section-subtitle">📍 Saved Addresses</h4>
                        <ul className="address-list">
                          {addresses.map((addr, index) => (
                            <li key={index} className={`address-card ${formData.selectedAddress === addr ? 'selected' : ''}`}>
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
                                <span className='text_20'>{addr}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="no-address-text">
                        No address saved yet. Please add one.
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
                    disabled={!formData.selectedAddress}
                  >
                    Proceed to Checkout
                    <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
                  </button>

                  <div className="security-badges">
                    <div className="badge">🔒 Secure Checkout</div>
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
                value={formData.flat}
                onChange={(e) => setFormData({ ...formData, flat: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Landmark"
                fullWidth
                variant="outlined"
                size="small"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <select
                name="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">Select State</option>
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
              >
                <option value="">Select City</option>
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
                label="Phone Number"
                fullWidth
                variant="outlined"
                size="small"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only digits
                  if (value.length <= 10) {
                    setFormData({ ...formData, phone: value });
                  }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                }}
                helperText={formData.phone.length > 0 && formData.phone.length !== 10 ? "Phone number must be 10 digits" : ""}
                error={formData.phone.length > 0 && formData.phone.length !== 10}
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
            disabled={loading || !formData.flat || !formData.landmark || !formData.city || !formData.state || formData.phone.length !== 10}
          >
            {loading ? 'Adding...' : 'Add Address'}
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
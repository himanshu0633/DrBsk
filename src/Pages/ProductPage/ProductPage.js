import React, { useState, useEffect } from 'react';
import './ProductPage.css';
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addData } from '../../store/Action';

import {
  Leaf,
  CalendarDays,
  Globe2,
  User,
  Home,
  FlaskConical,
  ArrowDown,
  Package,
  Shield,
  Heart,
  Bolt,
  Pill,
  ShoppingCart,
  Check,
  Share2
} from 'lucide-react';
import axiosInstance from '../../components/AxiosInstance';
import API_URL from '../../config';
import { toast } from 'react-toastify';
import CustomLoader from '../../components/CustomLoader';
import JoinUrl from '../../JoinUrl';

const normalizeNumber = (val) => {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

const money = (n, fallback = '—') => {
  if (n === null || n === undefined || Number.isNaN(n)) return fallback;
  // Ensure fixed decimals only when needed
  const num = Number(n);
  return `₹${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
};

// const parseQuantityVariants = (raw) => {
//   try {
//     let arr = [];
//     if (Array.isArray(raw)) {
//       arr = raw;
//     } else if (typeof raw === 'string') {
//       arr = JSON.parse(raw);
//     } else if (raw == null) {
//       arr = [];
//     } else {
//       arr = JSON.parse(String(raw));
//     }

//     if (!Array.isArray(arr)) return [];

//     return arr.map((v, i) => ({
//       _key: v._id || `v-${i}`,
//       label: v.label ?? '',
//       mrp: normalizeNumber(v.mrp),
//       discount: normalizeNumber(v.discount),
//       gst: normalizeNumber(v.gst),
//       retail_price: normalizeNumber(v.retail_price),
//       final_price: normalizeNumber(v.final_price),
//       in_stock:
//         typeof v.in_stock === 'string'
//           ? v.in_stock.toLowerCase() === 'yes'
//           : Boolean(v.in_stock),
//     }));
//   } catch (e) {
//     console.error('Failed to parse/normalize quantity variants:', e, raw);
//     return [];
//   }
// };

// option 2:
const parseQuantityVariants = (raw) => {
  try {
    let arr = [];

    if (Array.isArray(raw)) {
      // Check if the first element is a string (the nested JSON string)
      if (raw.length > 0 && typeof raw[0] === 'string') {
        // Parse each string in the array and flatten
        arr = raw.flatMap((item) => {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [];
          } catch (err) {
            console.error('Error parsing quantity variant string:', err, item);
            return [];
          }
        });
      } else {
        // raw is already an array of objects
        arr = raw;
      }
    } else if (typeof raw === 'string') {
      arr = JSON.parse(raw);
    } else {
      arr = [];
    }

    if (!Array.isArray(arr)) return [];

    return arr.map((v, i) => ({
      _key: v._id || `v-${i}`,
      label: v.label ?? '',
      mrp: normalizeNumber(v.mrp),
      discount: normalizeNumber(v.discount),
      gst: normalizeNumber(v.gst),
      retail_price: normalizeNumber(v.retail_price),
      final_price: normalizeNumber(v.final_price),
      in_stock:
        typeof v.in_stock === 'string'
          ? v.in_stock.toLowerCase() === 'yes'
          : Boolean(v.in_stock),
    }));
  } catch (e) {
    console.error('Failed to parse/normalize quantity variants:', e, raw);
    return [];
  }
};

const ProductPage = () => {
  const [units, setUnits] = useState(1); // number of packs/items to add
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const navigate = useNavigate();
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const dispatch = useDispatch();

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleMouseEnter = () => setIsZoomActive(true);
  const handleMouseLeave = () => setIsZoomActive(false);

  const increaseUnits = () => setUnits((prev) => prev + 1);
  const decreaseUnits = () => setUnits((prev) => (prev > 1 ? prev - 1 : prev));

  const toggleWishlist = () => setIsWishlisted((w) => !w);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: p } = await axiosInstance.get(`/user/product/${id}`);

      const variants = parseQuantityVariants(p.quantity);
      // choose default selected: first in-stock else 0
      let defaultIndex = 0;
      const firstInStock = variants.findIndex((v) => v.in_stock);
      if (firstInStock >= 0) defaultIndex = firstInStock;

      const derivedStock = variants.some((v) => v.in_stock);

      const normalized = {
        ...p,
        quantity: variants,
        consumer_price: normalizeNumber(p.consumer_price),
        retail_price: normalizeNumber(p.retail_price),
        mrp: normalizeNumber(p.mrp),
        discount: normalizeNumber(p.discount),
        stock:
          typeof p.stock === 'string'
            ? p.stock.toLowerCase() === 'yes'
            : (p.stock ?? derivedStock),
      };

      setProduct(normalized);
      setSelectedVariantIndex(Math.max(0, Math.min(defaultIndex, Math.max(variants.length - 1, 0))));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVariant = (i) => {
    setSelectedVariantIndex(i);
    // Optionally reset units when switching variant
    // setUnits(1);
  };
useEffect(() => {
    if (!product || !product.id) return;

    if (window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value:
          product.quantity?.[selectedVariantIndex]?.final_price ||
          product.retail_price ||
          0,
        currency: 'INR',
      });
    }
  }, [product?.id]);



  
  useEffect(() => {
  if (!product) return;

  const productId = product.id || product._id; // 🔥 important fix
  if (!productId) return;

  // 🔁 delay to ensure fbq is loaded
  const timer = setTimeout(() => {
    if (window.fbq) {
      window.fbq("track", "ViewContent", {
        content_ids: [productId],
        content_name: product.name || "Product",
        content_type: "product",
        value:
          product.quantity?.[selectedVariantIndex]?.final_price ||
          product.retail_price ||
          0,
        currency: "INR",
      });
    }
  }, 300);

  return () => clearTimeout(timer);
}, [product, selectedVariantIndex]);
const handleAddToCart = () => {
  if (!product) return;

  const variant = product.quantity?.[selectedVariantIndex];
  if (!variant) return;

  const cartItem = {
    ...product,
    _id: product._id || product.id, // Ensure consistent ID
    selectedVariant: {
      label: variant.label,
      mrp: variant.mrp,
      discount: variant.discount,
      gst: variant.gst,
      retail_price: variant.retail_price,
      final_price: variant.final_price,
      in_stock: variant.in_stock,
    },
    mrp: variant.mrp,
    discount: variant.discount,
    gst: variant.gst,
    retail_price: variant.retail_price,
    final_price: variant.final_price,
    quantity: units,
    unitPrice: variant.final_price,
    totalPrice:
      variant.final_price != null
        ? variant.final_price * units
        : null,
  };

  // Check if product already exists in cart with same variant
  const existingCartItems = JSON.parse(localStorage.getItem('reduxState') || '[]');
  const existingItemIndex = existingCartItems.findIndex(
    item => 
      item._id === cartItem._id && 
      item.selectedVariant?.label === cartItem.selectedVariant?.label
  );

  if (existingItemIndex !== -1) {
    // Product already in cart with same variant
    const existingItem = existingCartItems[existingItemIndex];
    const newQuantity = existingItem.quantity + units;
    
    // Update quantity in Redux store
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: {
        productId: cartItem._id,
        variantLabel: cartItem.selectedVariant?.label,
        quantity: newQuantity
      }
    });

    toast.success(`Quantity increased to ${newQuantity}`, {
      position: "top-right",
      autoClose: 2000,
    });
  } else {
    // New product or different variant
    dispatch(addData(cartItem));
    toast.success("Item added to cart!", {
      position: "top-right",
      autoClose: 2000,
    });
  }

  // Facebook Pixel - AddToCart Event
  if (window.fbq) {
    window.fbq("track", "AddToCart", {
      content_name: product?.name || product?.title || "Product",
      content_ids: [product?.id],
      content_type: "product",
      value: cartItem.totalPrice || variant.final_price,
      currency: "INR",
    });
  }

  setAddedToCart(true);
};

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.info('Link copied to clipboard!', { position: 'top-right', autoClose: 2000 });
    }).catch(() => {
      toast.error('Failed to copy link.', { position: 'top-right', autoClose: 2000 });
    });
  };


  const location = useLocation();
  // const product1 = location.state?.product;

  if (loading || !product) {
    return (
      <div>
        <CustomLoader />
      </div>
    );
  }

  const storedUser = localStorage.getItem('userData');
  const userData = storedUser ? JSON.parse(storedUser) : null;

  const mediaSafe = Array.isArray(product.media) ? product.media : [];

  // const selectedImageUrl = mediaSafe[selectedImageIndex]?.url
  //   ? JoinUrl(API_URL, mediaSafe[selectedImageIndex].url)
  //   : null;

  // Always provide a fallback image if url is missing or invalid
  const isValidUrl = (url) => url && (url.startsWith('http') || url.startsWith('/'));
  // const selectedImageUrl = isValidUrl(mediaSafe[selectedImageIndex]?.url)
  //   ? JoinUrl(API_URL, mediaSafe[selectedImageIndex].url)
  //   : ''; // add a local placeholder in public folder

  const variants = product.quantity || [];
  const selectedVariant = variants[selectedVariantIndex] || null;

  const canAddToCart = Boolean(selectedVariant?.in_stock);

  // Dynamic price area
  const unitPrice = selectedVariant?.final_price ?? null;
  const unitMrp = selectedVariant?.mrp ?? null;
  const unitDiscount = selectedVariant?.discount ?? null;
  const unitGst = selectedVariant?.gst ?? null;
  const orderTotal = unitPrice != null ? unitPrice * units : null;

  const selectedMediaItem = mediaSafe[selectedImageIndex];
  const selectedImageUrl = selectedMediaItem ? JoinUrl(API_URL, selectedMediaItem.url) : '';
  const cssSafeUrl = selectedImageUrl
    ? encodeURI(selectedImageUrl)
    : '';

  return (
    <>
      <Header />
      <div className="product-page">
        <div className="product-container">
          <div className="product-wrapper">
            {/* Product Image Section */}
            <div className="product-image-container">
              <div
                className="image-wrapper"
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: 'relative', cursor: 'crosshair' }}
              >

                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={product?.name || 'Product'}
                    className="product-image1"
                  />
                ) : (
                  <div
                    className="product-image1 no-image"
                    aria-label="No image available"
                  >
                    No Image
                  </div>
                )}

                {/* Zoom Lens */}
                {/* option 1: */}
                {/* {isZoomActive && selectedImageUrl && (
                  <div
                    className="zoom-lens"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '105%',
                      width: '320px',
                      height: '320px',
                      border: '1px solid #e5e7eb',
                      backgroundImage: `url(${selectedImageUrl})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      zIndex: 100,
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      backgroundColor: '#fff'
                    }}
                  />
                )} */}

                {/* option 2: */}
                {isZoomActive && cssSafeUrl && (
                  <div
                    className="zoom-lens"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: '105%',
                      width: '320px',
                      height: '320px',
                      border: '1px solid #e5e7eb',
                      backgroundImage: `url(${cssSafeUrl})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      zIndex: 100,
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      backgroundColor: selectedImageUrl === '' ? '#82b9f0ff' : '#fff'
                    }}
                  />
                )}



                <div className="product-badge natural-badge">
                  <Leaf className="badge-icon" size={16} />
                  <span>Natural</span>
                </div>
                <div className="product-badge bestseller-badge">
                  <Bolt className="badge-icon" size={16} />
                  <span>Bestseller</span>
                </div>
              </div>

              <div className="image-thumbnails">
                {mediaSafe.length > 0 ? (
                  mediaSafe.map((mediaItem, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`thumbnail ${selectedImageIndex === index ? 'active-thumbnail' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Select image ${index + 1}`}
                    >
                      {/* <img src={`${API_URL}${mediaItem.url}`} alt={`Thumbnail ${index + 1}`} /> */}
                      <img src={JoinUrl(API_URL, mediaItem.url)} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))
                ) : (
                  <div className="thumbnail">No thumbnails</div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="product-info">
              <div className="product-header">
                <h1 className="product-title">{product?.name || 'Product'}</h1>
                <div className="product-actions">
                  {/* <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={toggleWishlist}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart
                      className="wishlist-icon"
                      size={18}
                      fill={isWishlisted ? '#ff6b6b' : 'none'}
                      color="#ff6b6b"
                    />
                  </button> */}
                  <button
                    className="share-btn"
                    onClick={handleShare}
                    aria-label="Share this product"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>


              {/* Variant selector */}
              <div className="variant-section">
                <div className="variant-header mb-1">Select Quantity</div>
                <div className="variant-grid" role="listbox" aria-label="Variants">
                  {variants.length > 0 ? (
                    variants.map((v, i) => {
                      const selected = i === selectedVariantIndex;
                      return (
                        <button
                          type="button"
                          key={v._key || i}
                          role="option"
                          aria-selected={selected}
                          className={`variant-card ${selected ? 'selected' : ''} ${v.in_stock ? '' : 'disabled'}`}
                          onClick={() => v.in_stock && handleSelectVariant(i)}
                          title={v.in_stock ? 'Select variant' : 'Out of stock'}
                        >
                          <div className="variant-card__row">
                            <div className="variant-card__label">{v.label || '—'}</div>
                            {selected && (
                              <div className="variant-card__check">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                          <div className="variant-card__price">
                            <span className="variant-card__price--current">{money(v.final_price)}</span>
                            {/* {v.mrp != null && v.final_price != null && v.mrp > v.final_price && (
                              <span className="variant-card__price--mrp">{money(v.mrp)}</span>
                            )} */}
                          </div>
                          {/* <div className="variant-card__meta">
                            {v.discount != null && <span className="chip chip--green">{v.discount}% OFF</span>}
                            {v.gst != null && <span className="chip">GST {v.gst}%</span>}
                            <span className={`chip ${v.in_stock ? 'chip--instock' : 'chip--oos'}`}>
                              {v.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </div> */}
                        </button>
                      );
                    })
                  ) : (
                    <div className="variant-empty">No variant data available</div>
                  )}
                </div>
              </div>

              {/* Stock banner */}
              <div className={`stock-status ${product.stock ? 'bg-green' : 'bg-red'}`}>
                <div className={`status-indicator ${product.stock ? 'bg-green' : 'bg-red'}`}></div>
                <span className="stock-status__text">
                  {product.stock ? 'In Stock - Ready to Ship' : 'Out of Stock'}
                </span>
              </div>

              {/* Dynamic price block (based on selected variant) */}
              <div className="price-section">
                <div className="price-container">
                  <div className="current-price">{money(unitPrice)}</div>
                  {unitMrp != null && unitPrice != null && unitMrp > unitPrice && (
                    <div className="original-price">{money(unitMrp)}</div>
                  )}
                  {unitDiscount != null && unitDiscount > 0 && (
                    <div className="discount-badge">{unitDiscount}% OFF</div>
                  )}
                </div>
                <div className="tax-info">
                  {unitGst != null ? `Inclusive of ${unitGst}% GST` : 'Inclusive of all taxes'}
                </div>
              </div>

              {/* Quantity & total */}
              <div className="inline-row">
                <div className="quantity-container">
                  <label className="quantity-label">Quantity</label>
                  <div className="quantity-control">
                    <button
                      onClick={decreaseUnits}
                      className="quantity-btn"
                      aria-label="Decrease quantity"
                    >-</button>
                    <input
                      type="text"
                      value={units}
                      readOnly
                      className="quantity-input"
                      aria-label="Current quantity"
                    />
                    <button
                      onClick={increaseUnits}
                      className="quantity-btn"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="action-buttons">
                {addedToCart ? (
                  <button className="add-to-cart-btn" onClick={() => navigate('/cart')}>
                    <ShoppingCart className="btn-icon" size={18} />
                    Go to Cart
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="add-to-cart-btn"
                    disabled={!canAddToCart}
                    title={!canAddToCart ? 'Selected variant is out of stock' : 'Add to Cart'}
                  >
                    🛒 Add to Cart
                  </button>
                )}
              </div>

              {/* Badges and policy */}
              <div className="product-highlights">
                <div className="highlight-item">
                  <Pill className="highlight-icon" size={16} />
                  <span>Doctor Recommended</span>
                </div>
                <div className="highlight-item">
                  <Shield className="highlight-icon" size={16} />
                  <span>Quality Tested</span>
                </div>
                <div className="highlight-item">
                  <Package className="highlight-icon" size={16} />
                  <span>Free Delivery</span>
                </div>
              </div>

              <div className="product-details">
                <div className="product-detail">
                  <CalendarDays className="detail-icon" size={16} />
                  <div>
                    <strong>Expires on or after: </strong>
                    <span>{product?.expires_on || '—'}</span>
                  </div>
                </div>

                <div className="product-detail">
                  <Globe2 className="detail-icon" size={16} />
                  <div>
                    <strong>Country of origin: </strong>
                    <span>India</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="product-tabs-container">
                <div className="product-tabs">
                  <button
                    className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                  <button
                    className={`tab-btn ${activeTab === 'directions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('directions')}
                  >
                    Directions
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === 'description' && (
                    <div className="description-content">
                      <h3>Product Description</h3>
                      <p>{product?.description || '—'}</p>

                      <div className="feature-grid">
                        <div className="feature-item">
                          <div className="feature-icon1">
                            <Home size={20} />
                          </div>
                          <div className="feature-text">
                            <h4>Home Remedy</h4>
                            <p>Trusted natural solution for {product?.sub_category || '—'}</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon1">
                            <Leaf size={20} />
                          </div>
                          <div className="feature-text">
                            <h4>Natural Ingredients</h4>
                            <p>Made with natural active ingredients</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon1">
                            <User size={20} />
                          </div>
                          <div className="feature-text">
                            <h4>Suitable for</h4>
                            <p>Suitable for {product?.suitable_for || '—'}</p>
                          </div>
                        </div>
                        <div className="feature-item">
                          <div className="feature-icon1">
                            <FlaskConical size={20} />
                          </div>
                          <div className="feature-text">
                            <h4>Lab Tested</h4>
                            <p>Rigorously tested for safety and quality</p>
                          </div>
                        </div>
                      </div>

                      <h3>Benefits</h3>
                      <ul className="benefits-list">
                        <li>{product?.benefits || '—'}</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === 'directions' && (
                    <div className="directions-content">
                      <h3>Recommended Use</h3>
                      <div className="usage-card">
                        <div className="usage-step">
                          <div className="step-content">
                            <h3>Dosage</h3>
                            <p>{product?.dosage || '—'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="precautions">
                        <h3>Precautions</h3>
                        <ul>
                          <li>Stop use and ask a doctor if illness persists for more than 7 days or is accompanied by fever</li>
                          <li>Keep out of reach of children. In case of accidental overdose, seek professional help immediately</li>
                          <li>Store at room temperature away from moisture and heat</li>
                          <li>Do not use if seal is broken or missing</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* /Tabs */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
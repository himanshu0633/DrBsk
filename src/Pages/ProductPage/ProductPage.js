import React, { useState, useEffect, useRef, useMemo, useCallback } from "react"; 
import "./ProductPage.css";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addData } from "../../store/Action";
import API_URL from '../../config';
import {
  Leaf,
  CalendarDays,
  Globe2,
  User,
  Home,
  FlaskConical,
  Package,
  Shield,
  Bolt,
  Pill,
  ShoppingCart,
  Check,
  Share2,
} from "lucide-react";

import axiosInstance from "../../components/AxiosInstance";

import { toast } from "react-toastify";
import CustomLoader from "../../components/CustomLoader";
import JoinUrl from "../../JoinUrl";

/** ---------- helpers ---------- */
const normalizeNumber = (val) => {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
};

const money = (n, fallback = "—") => {
  if (n === null || n === undefined || Number.isNaN(n)) return fallback;
  const num = Number(n);
  return `₹${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
};

const parseQuantityVariants = (raw) => {
  try {
    let arr = [];

    if (Array.isArray(raw)) {
      if (raw.length > 0 && typeof raw[0] === "string") {
        arr = raw.flatMap((item) => {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        });
      } else {
        arr = raw;
      }
    } else if (typeof raw === "string") {
      arr = JSON.parse(raw);
    } else {
      arr = [];
    }

    if (!Array.isArray(arr)) return [];

    return arr.map((v, i) => ({
      _key: v._id || `v-${i}`,
      label: v.label ?? "",
      mrp: normalizeNumber(v.mrp),
      discount: normalizeNumber(v.discount),
      gst: normalizeNumber(v.gst),
      retail_price: normalizeNumber(v.retail_price),
      final_price: normalizeNumber(v.final_price),
      in_stock:
        typeof v.in_stock === "string"
          ? v.in_stock.toLowerCase() === "yes"
          : Boolean(v.in_stock),
    }));
  } catch (e) {
    console.error("Failed to parse variants:", e);
    return [];
  }
};

const toStr = (v) => (v === null || v === undefined ? "" : String(v));
const toNum = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** ---------- Facebook Pixel / Analytics Meta ---------- */
const trackAddToCart = (product, variant, quantity) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "AddToCart", {
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: variant.final_price * quantity,
      currency: "INR",
      num_items: quantity,
    });
  }
};

const trackInitiateCheckout = (checkoutData) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_ids: checkoutData.contentIds || [checkoutData.id],
      content_name: checkoutData.name,
      content_type: "product",
      value: checkoutData.value || checkoutData.price || 0,
      currency: "INR",
      num_items: checkoutData.numItems || 1,
    });
  }
};

/** ---------- component ---------- */
const ProductPage = () => {
  const [units, setUnits] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fever page की तरह user type detection
  const storedUser = localStorage.getItem("userData");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const isWholesaler = userData?.type === "wholesalePartner";

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const increaseUnits = () => {
    setUnits((prev) => prev + 1);
  };

  const decreaseUnits = () => {
    if (units > 1) {
      setUnits((prev) => prev - 1);
    }
  };

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data: p } = await axiosInstance.get(`/user/product/${id}`);

      const variants = parseQuantityVariants(p.quantity);
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
          typeof p.stock === "string"
            ? p.stock.toLowerCase() === "yes"
            : p.stock ?? derivedStock,
      };

      setProduct(normalized);
      setSelectedVariantIndex(
        Math.max(0, Math.min(defaultIndex, Math.max(variants.length - 1, 0)))
      );
      setSelectedImageIndex(0);
      setAddedToCart(false);
      setUnits(1);

    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll effect for image
  useEffect(() => {
    const handleScroll = () => {
      const imageWrapper = document.querySelector('.image-wrapper');
      const image = document.querySelector('.product-image1');
      
      if (imageWrapper && image) {
        const containerRect = imageWrapper.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // If container is in viewport
        if (containerRect.top < windowHeight && containerRect.bottom > 0) {
          let scrollAmount = Math.min(windowHeight - containerRect.top - image.offsetHeight, 0);
          image.style.transform = `translateY(${scrollAmount}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const mediaSafe = useMemo(() => (Array.isArray(product?.media) ? product.media : []), [product]);
  const variants = useMemo(() => product?.quantity || [], [product]);
  const selectedVariant = variants[selectedVariantIndex] || null;

  const canAddToCart = Boolean(selectedVariant?.in_stock);

  // Dynamic price area - user type के based
  const getDisplayPrice = useCallback((variant) => {
    if (!variant) return 0;
    if (isWholesaler) {
      return variant.retail_price ?? product?.retail_price ?? 0;
    }
    return variant.final_price ?? product?.consumer_price ?? 0;
  }, [isWholesaler, product]);

  const unitPrice = getDisplayPrice(selectedVariant);
  const unitMrp = selectedVariant?.mrp ?? product?.mrp ?? null;
  const unitDiscount = selectedVariant?.discount ?? product?.discount ?? null;
  const unitGst = selectedVariant?.gst ?? null;

  const handleSelectVariant = (i) => {
    const variant = variants[i];
    if (variant && variant.in_stock) {
      setSelectedVariantIndex(i);
      setUnits(1);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (!selectedVariant.in_stock) return;

    const qty = toNum(units, 1);

    // Price selection based on user type - Fever page की तरह
    const price = isWholesaler
      ? toNum(selectedVariant.retail_price ?? product.retail_price ?? 0, 0)
      : toNum(selectedVariant.final_price ?? product.consumer_price ?? 0, 0);

    // --- META TRACKING ---
    trackAddToCart(product, selectedVariant, qty);

    // --- CART LOGIC ---
    const pid = toStr(product._id || product.id);

    const cartItem = {
      ...product,
      _id: pid,
      selectedVariant: {
        label: selectedVariant.label,
        mrp: selectedVariant.mrp,
        discount: selectedVariant.discount,
        gst: selectedVariant.gst,
        retail_price: selectedVariant.retail_price,
        final_price: selectedVariant.final_price,
        in_stock: selectedVariant.in_stock,
      },
      // Fever page की तरह price selection
      price: price,
      mrp: selectedVariant.mrp ?? product.mrp,
      discount: selectedVariant.discount ?? product.discount,
      gst: selectedVariant.gst ?? product.gst,
      retail_price: selectedVariant.retail_price ?? product.retail_price,
      final_price: selectedVariant.final_price ?? product.final_price,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      // User type flag
      isWholesaler: isWholesaler,
    };

    const existingCartItems = JSON.parse(localStorage.getItem("reduxState") || "[]");
    const existingItemIndex = existingCartItems.findIndex(
      (item) =>
        item._id === cartItem._id &&
        item.selectedVariant?.label === cartItem.selectedVariant?.label
    );

    if (existingItemIndex !== -1) {
      const existingItem = existingCartItems[existingItemIndex];
      const newQuantity = (existingItem.quantity || 0) + qty;

      dispatch({
        type: "UPDATE_QUANTITY",
        payload: {
          productId: cartItem._id,
          variantLabel: cartItem.selectedVariant?.label,
          quantity: newQuantity,
        },
      });

      toast.success(`Quantity increased to ${newQuantity}`, {
        position: "top-right",
        autoClose: 2000,
      });
    } else {
      dispatch(addData(cartItem));
      toast.success("Item added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
    }

    setAddedToCart(true);
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    if (!selectedVariant.in_stock) return;

    const pid = toStr(product._id || product.id);
    
    // Price selection based on user type - Fever page की तरह
    const price = isWholesaler
      ? toNum(selectedVariant.retail_price ?? product.retail_price ?? 0, 0)
      : toNum(selectedVariant.final_price ?? product.consumer_price ?? 0, 0);
      
    const qty = toNum(units, 1);

    // --- META TRACKING ---
    trackInitiateCheckout({
      content_ids: [product._id],
      content_name: product.name,
      content_type: "product",
      value: price * qty,
      currency: "INR",
      num_items: qty,
    });

    // --- CHECKOUT LOGIC ---
    const checkoutProduct = {
      ...product,
      _id: pid,
      selectedVariant,
      selectedVariantIndex,
      // Price based on user type
      price: price,
      purchaseQuantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      mrp: selectedVariant.mrp ?? product.mrp,
      discount: selectedVariant.discount ?? product.discount,
      gst: selectedVariant.gst ?? product.gst,
      inStock: selectedVariant.in_stock ?? product.stock,
      // User type flag
      isWholesaler: isWholesaler,
    };

    navigate("/checkout", {
      state: {
        product: checkoutProduct,
        quantity: qty,
      },
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.info("Link copied to clipboard!", { position: "top-right", autoClose: 2000 });
      })
      .catch(() => {
        toast.error("Failed to copy link.", { position: "top-right", autoClose: 2000 });
      });
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  if (loading || !product) {
    return (
      <div>
        <Header />
        <CustomLoader />
        <Footer />
      </div>
    );
  }

  const selectedMediaItem = mediaSafe[selectedImageIndex];
  const selectedImageUrl = selectedMediaItem ? JoinUrl(API_URL, selectedMediaItem.url) : "";
  const cssSafeUrl = selectedImageUrl ? encodeURI(selectedImageUrl) : "";

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
                onMouseEnter={() => setIsZoomActive(true)}
                onMouseLeave={() => setIsZoomActive(false)}
                style={{ position: "relative", cursor: "crosshair" }}
              >
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={product?.name || "Product"}
                    className="product-image1"
                    onClick={() => handleImageClick(selectedImageIndex)}
                  />
                ) : (
                  <div 
                    className="product-image1 no-image" 
                    aria-label="No image available"
                  >
                    No Image
                  </div>
                )}

                {isZoomActive && cssSafeUrl && (
                  <div
                    className="zoom-lens"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "105%",
                      width: "320px",
                      height: "320px",
                      border: "1px solid #e5e7eb",
                      backgroundImage: `url(${cssSafeUrl})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "200%",
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      zIndex: 100,
                      borderRadius: "10px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      backgroundColor: selectedImageUrl === "" ? "#82b9f0ff" : "#fff",
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
                      className={`thumbnail ${selectedImageIndex === index ? "active-thumbnail" : ""}`}
                      onClick={() => handleImageClick(index)}
                      aria-label={`Select image ${index + 1}`}
                    >
                      <img 
                        src={JoinUrl(API_URL, mediaItem.url)} 
                        alt={`Thumbnail ${index + 1}`} 
                      />
                    </button>
                  ))
                ) : (
                  <div className="thumbnail">
                    No thumbnails
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="product-info">
              <div className="product-header">
                <h1 className="product-title">
                  {product?.name || "Product"}
                </h1>
                <div className="product-actions">
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
                      const displayPrice = isWholesaler 
                        ? v.retail_price ?? product?.retail_price ?? 0
                        : v.final_price ?? product?.consumer_price ?? 0;
                      
                      return (
                        <button
                          type="button"
                          key={v._key || i}
                          role="option"
                          aria-selected={selected}
                          className={`variant-card ${selected ? "selected" : ""} ${
                            v.in_stock ? "" : "disabled"
                          }`}
                          onClick={() => v.in_stock && handleSelectVariant(i)}
                          title={v.in_stock ? "Select variant" : "Out of stock"}
                        >
                          <div className="variant-card__row">
                            <div className="variant-card__label">{v.label || "—"}</div>
                            {selected && (
                              <div className="variant-card__check">
                                <Check size={16} />
                              </div>
                            )}
                          </div>
                          <div className="variant-card__price">
                            <span className="variant-card__price--current">
                              {money(displayPrice)}
                            </span>
                            {isWholesaler && (
                              <div className="wholesale-tag">Wholesale</div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="variant-empty">No variant data available</div>
                  )}
                </div>
              </div>

              {/* Stock banner */}
              <div className={`stock-status ${product.stock ? "bg-green" : "bg-red"}`}>
                <div className={`status-indicator ${product.stock ? "bg-green" : "bg-red"}`}></div>
                <span className="stock-status__text">
                  {product.stock 
                    ? (isWholesaler ? "Available for Wholesale" : "In Stock - Ready to Ship")
                    : "Out of Stock"
                  }
                </span>
                {isWholesaler && product.stock && (
                  <span className="wholesale-note">(Bulk orders available)</span>
                )}
              </div>

              {/* Dynamic price block - Fever page की तरह user type के based */}
              <div className="price-section">
                <div className="price-container">
                  {/* Wholesaler के लिए retail_price दिखाएं, normal user के लिए consumer/final price */}
                  {isWholesaler ? (
                    <>
                      <div className="current-price">
                        {money(selectedVariant?.retail_price ?? product?.retail_price ?? 0)}
                      </div>
                      <div className="wholesale-label">Wholesale Price</div>
                    </>
                  ) : (
                    <>
                      <div className="current-price">{money(unitPrice)}</div>
                      {unitMrp != null && unitMrp > unitPrice && (
                        <div className="original-price">{money(unitMrp)}</div>
                      )}
                      {unitDiscount != null && unitDiscount > 0 && (
                        <div className="discount-badge">{unitDiscount}% OFF</div>
                      )}
                    </>
                  )}
                </div>
                <div className={`tax-info ${isWholesaler ? 'wholesale-tax' : ''}`}>
                  {isWholesaler 
                    ? "Exclusive of GST" 
                    : unitGst != null 
                      ? `Inclusive of ${unitGst}% GST` 
                      : "Inclusive of all taxes"
                  }
                </div>
              </div>

              {/* Quantity */}
              <div className="inline-row">
                <div className="quantity-container">
                  <label className="quantity-label">Quantity</label>
                  <div className="quantity-control">
                    <button 
                      onClick={decreaseUnits} 
                      className="quantity-btn" 
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
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
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="action-buttons">
                {addedToCart ? (
                  <button 
                    className="add-to-cart-btn" 
                    onClick={() => navigate("/cart")}
                  >
                    <ShoppingCart className="btn-icon" size={18} />
                    Go to Cart
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleAddToCart}
                      className="add-to-cart-btn"
                      disabled={!canAddToCart}
                      title={!canAddToCart ? "Selected variant is out of stock" : "Add to Cart"}
                    >
                      🛒 Add to Cart
                    </button>

                    <button
                      onClick={handleBuyNow}
                      className="add-to-cart-btn"
                      disabled={!canAddToCart}
                      title={!canAddToCart ? "Selected variant is out of stock" : "Buy Now (Direct Checkout)"}
                    >
                      ⚡ Buy Now
                    </button>
                  </>
                )}
              </div>

              {/* Badges */}
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
                    <span>{product?.expires_on || "—"}</span>
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
                    className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
                    onClick={() => handleTabClick("description")}
                  >
                    Description
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "directions" ? "active" : ""}`}
                    onClick={() => handleTabClick("directions")}
                  >
                    Directions
                  </button>
                </div>

                <div className="tab-content">
                  {activeTab === "description" && (
                    <div className="description-content">
                      <h3>Product Description</h3>
                      <p>{product?.description || "—"}</p>

                      <div className="feature-grid">
                        <div className="feature-item">
                          <div className="feature-icon1">
                            <Home size={20} />
                          </div>
                          <div className="feature-text">
                            <h4>Home Remedy</h4>
                            <p>Trusted natural solution for {product?.sub_category || "—"}</p>
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
                            <p>Suitable for {product?.suitable_for || "—"}</p>
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
                        <li>{product?.benefits || "—"}</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === "directions" && (
                    <div className="directions-content">
                      <h3>Recommended Use</h3>
                      <div className="usage-card">
                        <div className="usage-step">
                          <div className="step-content">
                            <h3>Dosage</h3>
                            <p>{product?.dosage || "—"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="precautions">
                        <h3>Precautions</h3>
                        <ul>
                          <li>
                            Stop use and ask a doctor if illness persists for more than 7 days or is
                            accompanied by fever
                          </li>
                          <li>
                            Keep out of reach of children. In case of accidental overdose, seek
                            professional help immediately
                          </li>
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
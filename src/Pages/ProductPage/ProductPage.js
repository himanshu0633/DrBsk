import React, { useState, useEffect, useRef, useMemo } from "react";
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
    await fetch(`${API_URL}/api/facebook-events`, {
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

/** ---------- component ---------- */
const ProductPage = () => {
  const [units, setUnits] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasTrackedPageView, setHasTrackedPageView] = useState(false);
  const [viewedProducts, setViewedProducts] = useState(new Set());

  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const [isZoomActive, setIsZoomActive] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Facebook Pixel Tracking Functions
  const trackViewContent = (contentData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: contentData.name,
        content_ids: [contentData.id],
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
      id: 'product_page_view',
      name: 'Product Detail Page',
      value: 0,
      category: 'Product Detail',
      type: 'page',
    });
  };

  const trackAddToCart = (productData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [productData.id],
        content_name: productData.name,
        content_type: 'product',
        value: productData.value || productData.price || 0,
        currency: 'INR',
        num_items: productData.quantity || 1,
      });
    }
    sendServerEvent('AddToCart', productData);
  };

  const trackInitiateCheckout = (checkoutData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout');
    }
    
    sendServerEvent('InitiateCheckout', checkoutData);
  };

  const trackPurchase = (purchaseData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: purchaseData.value || 0,
        currency: 'INR',
        content_ids: purchaseData.contentIds || [],
        content_type: 'product',
        num_items: purchaseData.numItems || 1,
        order_id: purchaseData.orderId,
      });
    }
    sendServerEvent('Purchase', purchaseData);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const increaseUnits = () => {
    setUnits((prev) => prev + 1);
    
    // Track quantity increase
    trackViewContent({
      id: `quantity_increase_${product?._id}`,
      name: `${product?.name} - Quantity Increased`,
      value: units + 1,
      currency: 'INR',
      category: 'User Interaction',
      type: 'quantity_change',
      action: 'increase',
    });
  };

  const decreaseUnits = () => {
    if (units > 1) {
      setUnits((prev) => prev - 1);
      
      // Track quantity decrease
      trackViewContent({
        id: `quantity_decrease_${product?._id}`,
        name: `${product?.name} - Quantity Decreased`,
        value: units - 1,
        currency: 'INR',
        category: 'User Interaction',
        type: 'quantity_change',
        action: 'decrease',
      });
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

      // Track product page view
      if (!hasTrackedPageView) {
        trackPageView();
        setHasTrackedPageView(true);
      }

      // Track product detail view
      trackViewContent({
        id: p._id,
        name: p.name,
        value: p.consumer_price || 0,
        currency: 'INR',
        category: p.sub_category || 'Medicine',
        type: 'product_detail',
        description: p.description,
      });

      // Track variants view
      variants.forEach((variant, index) => {
        if (variant.in_stock) {
          trackViewContent({
            id: `${p._id}_${variant._key || index}`,
            name: `${p.name} - ${variant.label}`,
            value: variant.final_price || 0,
            currency: 'INR',
            category: p.sub_category || 'Medicine',
            type: 'product_variant',
          });
        }
      });

    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Failed to load product");
      
      // Track error
      trackViewContent({
        id: 'product_fetch_error',
        name: 'Error Loading Product',
        value: 0,
        category: 'Error',
        type: 'fetch_error',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Track tab changes
  useEffect(() => {
    if (product && hasTrackedPageView) {
      trackViewContent({
        id: `tab_${activeTab}_${product._id}`,
        name: `${product.name} - ${activeTab} Tab`,
        value: 0,
        category: 'User Interaction',
        type: 'tab_view',
        tab: activeTab,
      });
    }
  }, [activeTab, product, hasTrackedPageView]);

  const mediaSafe = useMemo(() => (Array.isArray(product?.media) ? product.media : []), [product]);
  const variants = useMemo(() => product?.quantity || [], [product]);
  const selectedVariant = variants[selectedVariantIndex] || null;

  const canAddToCart = Boolean(selectedVariant?.in_stock);

  // Dynamic price area
  const unitPrice = selectedVariant?.final_price ?? product?.consumer_price ?? 0;
  const unitMrp = selectedVariant?.mrp ?? product?.mrp ?? null;
  const unitDiscount = selectedVariant?.discount ?? product?.discount ?? null;
  const unitGst = selectedVariant?.gst ?? null;

  const handleSelectVariant = (i) => {
    const variant = variants[i];
    if (variant && variant.in_stock) {
      setSelectedVariantIndex(i);
      setUnits(1);
      
      // Track variant selection
      trackViewContent({
        id: `${product?._id}_${variant._key || i}`,
        name: `${product?.name} - ${variant.label} Selected`,
        value: variant.final_price || 0,
        currency: 'INR',
        category: 'User Interaction',
        type: 'variant_selection',
        variant_label: variant.label,
        variant_price: variant.final_price,
      });
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    if (!selectedVariant.in_stock) return;

    const pid = toStr(product._id || product.id);
    const price = toNum(selectedVariant.final_price ?? product.consumer_price ?? 0, 0);
    const qty = toNum(units, 1);

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
      mrp: selectedVariant.mrp,
      discount: selectedVariant.discount,
      gst: selectedVariant.gst,
      retail_price: selectedVariant.retail_price,
      final_price: selectedVariant.final_price,
      quantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
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
      
      // Track quantity update
      trackAddToCart({
        id: cartItem._id,
        name: cartItem.name,
        price: cartItem.unitPrice,
        value: cartItem.unitPrice * newQuantity,
        currency: 'INR',
        category: cartItem.sub_category || 'Medicine',
        type: 'product',
        quantity: newQuantity,
        action: 'quantity_update',
      });
    } else {
      dispatch(addData(cartItem));
      toast.success("Item added to cart!", {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Track AddToCart event
      trackAddToCart({
        id: cartItem._id,
        name: cartItem.name,
        price: cartItem.unitPrice,
        value: cartItem.unitPrice * qty,
        currency: 'INR',
        category: cartItem.sub_category || 'Medicine',
        type: 'product',
        quantity: qty,
        variant: cartItem.selectedVariant?.label,
      });
      
      // Track potential purchase initiation
      trackInitiateCheckout({
        id: `initiate_checkout_${cartItem._id}`,
        name: `Initiate Checkout - ${cartItem.name}`,
        value: cartItem.totalPrice,
        currency: 'INR',
        category: 'Checkout',
        type: 'add_to_cart_flow',
      });
    }

    setAddedToCart(true);
    
    // Track successful add to cart
    trackViewContent({
      id: `add_to_cart_success_${product._id}`,
      name: `${product.name} Added to Cart`,
      value: price * qty,
      currency: 'INR',
      category: 'User Conversion',
      type: 'add_to_cart_success',
    });
  };

  const handleBuyNow = () => {
    if (!product || !selectedVariant) return;
    if (!selectedVariant.in_stock) return;

    const pid = toStr(product._id || product.id);
    const price = toNum(selectedVariant.final_price ?? product.consumer_price ?? 0, 0);
    const qty = toNum(units, 1);

    const checkoutProduct = {
      ...product,
      _id: pid,
      selectedVariant,
      selectedVariantIndex,
      purchaseQuantity: qty,
      unitPrice: price,
      totalPrice: price * qty,
      mrp: selectedVariant.mrp ?? product.mrp,
      discount: selectedVariant.discount ?? product.discount,
      gst: selectedVariant.gst ?? product.gst,
      inStock: selectedVariant.in_stock ?? product.stock,
    };

    // Track Buy Now click
    trackViewContent({
      id: `buy_now_click_${product._id}`,
      name: `Buy Now - ${product.name}`,
      value: price * qty,
      currency: 'INR',
      category: 'User Conversion',
      type: 'buy_now_click',
    });
    
    // Track Initiate Checkout
    trackInitiateCheckout({
      id: `checkout_initiate_${product._id}`,
      name: `Checkout Initiated - ${product.name}`,
      value: price * qty,
      currency: 'INR',
      category: 'Checkout',
      type: 'buy_now_flow',
    });

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
        
        // Track share action
        trackViewContent({
          id: `share_${product?._id}`,
          name: `${product?.name} - Shared`,
          value: 0,
          category: 'User Interaction',
          type: 'share',
          platform: 'clipboard',
        });
      })
      .catch(() => {
        toast.error("Failed to copy link.", { position: "top-right", autoClose: 2000 });
      });
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    
    // Track image view
    trackViewContent({
      id: `image_view_${index}_${product?._id}`,
      name: `${product?.name} - Image ${index + 1}`,
      value: 0,
      category: 'Media',
      type: 'image_view',
      image_index: index,
    });
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
    // Track tab click
    trackViewContent({
      id: `tab_click_${tab}_${product?._id}`,
      name: `${product?.name} - ${tab} Tab Clicked`,
      value: 0,
      category: 'User Interaction',
      type: 'tab_click',
      tab: tab,
    });
  };

  if (loading || !product) {
    return (
      <div>
        <Header />
        <div 
          onClick={() => trackViewContent({
            id: 'product_page_loading',
            name: 'Product Page Loading',
            value: 0,
            category: 'Loading State',
            type: 'technical',
          })}
        >
          <CustomLoader />
        </div>
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
                onMouseEnter={() => {
                  setIsZoomActive(true);
                  // Track zoom interaction
                  trackViewContent({
                    id: `image_zoom_start_${product._id}`,
                    name: `${product.name} - Zoom Started`,
                    value: 0,
                    category: 'User Interaction',
                    type: 'image_zoom',
                    action: 'start',
                  });
                }}
                onMouseLeave={() => {
                  setIsZoomActive(false);
                  // Track zoom end
                  trackViewContent({
                    id: `image_zoom_end_${product._id}`,
                    name: `${product.name} - Zoom Ended`,
                    value: 0,
                    category: 'User Interaction',
                    type: 'image_zoom',
                    action: 'end',
                  });
                }}
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
                    onClick={() => trackViewContent({
                      id: `no_image_click_${product._id}`,
                      name: `${product.name} - No Image Clicked`,
                      value: 0,
                      category: 'Media',
                      type: 'no_image',
                    })}
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

                <div 
                  className="product-badge natural-badge"
                  onClick={() => trackViewContent({
                    id: `badge_click_natural_${product._id}`,
                    name: 'Natural Badge Clicked',
                    value: 0,
                    category: 'User Interaction',
                    type: 'badge_click',
                    badge: 'natural',
                  })}
                >
                  <Leaf className="badge-icon" size={16} />
                  <span>Natural</span>
                </div>
                <div 
                  className="product-badge bestseller-badge"
                  onClick={() => trackViewContent({
                    id: `badge_click_bestseller_${product._id}`,
                    name: 'Bestseller Badge Clicked',
                    value: 0,
                    category: 'User Interaction',
                    type: 'badge_click',
                    badge: 'bestseller',
                  })}
                >
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
                        onLoad={() => trackViewContent({
                          id: `thumbnail_load_${index}_${product._id}`,
                          name: `${product.name} - Thumbnail ${index + 1} Loaded`,
                          value: 0,
                          category: 'Technical',
                          type: 'image_load',
                        })}
                      />
                    </button>
                  ))
                ) : (
                  <div 
                    className="thumbnail"
                    onClick={() => trackViewContent({
                      id: `no_thumbnail_click_${product._id}`,
                      name: 'No Thumbnail Available',
                      value: 0,
                      category: 'Media',
                      type: 'no_thumbnail',
                    })}
                  >
                    No thumbnails
                  </div>
                )}
              </div>
            </div>

            {/* Product Info Section */}
            <div className="product-info">
              <div className="product-header">
                <h1 
                  className="product-title"
                  onClick={() => trackViewContent({
                    id: `product_title_click_${product._id}`,
                    name: 'Product Title Clicked',
                    value: 0,
                    category: 'User Interaction',
                    type: 'title_click',
                  })}
                >
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
                            <span className="variant-card__price--current">{money(v.final_price)}</span>
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
              <div 
                className={`stock-status ${product.stock ? "bg-green" : "bg-red"}`}
                onClick={() => trackViewContent({
                  id: `stock_status_click_${product._id}`,
                  name: `Stock Status - ${product.stock ? 'In Stock' : 'Out of Stock'}`,
                  value: 0,
                  category: 'Product Info',
                  type: 'stock_status_click',
                  status: product.stock ? 'in_stock' : 'out_of_stock',
                })}
              >
                <div className={`status-indicator ${product.stock ? "bg-green" : "bg-red"}`}></div>
                <span className="stock-status__text">
                  {product.stock ? "In Stock - Ready to Ship" : "Out of Stock"}
                </span>
              </div>

              {/* Dynamic price block */}
              <div 
                className="price-section"
                onClick={() => trackViewContent({
                  id: `price_section_click_${product._id}`,
                  name: 'Price Section Clicked',
                  value: unitPrice,
                  currency: 'INR',
                  category: 'Product Info',
                  type: 'price_view',
                })}
              >
                <div className="price-container">
                  <div className="current-price">{money(unitPrice)}</div>
                  {unitMrp != null && unitMrp > unitPrice && (
                    <div className="original-price">{money(unitMrp)}</div>
                  )}
                  {unitDiscount != null && unitDiscount > 0 && (
                    <div className="discount-badge">{unitDiscount}% OFF</div>
                  )}
                </div>
                <div className="tax-info">
                  {unitGst != null ? `Inclusive of ${unitGst}% GST` : "Inclusive of all taxes"}
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
                      onClick={() => trackViewContent({
                        id: `quantity_input_click_${product._id}`,
                        name: 'Quantity Input Clicked',
                        value: units,
                        category: 'User Interaction',
                        type: 'quantity_input_click',
                      })}
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
                    onClick={() => {
                      trackViewContent({
                        id: `go_to_cart_click_${product._id}`,
                        name: 'Go to Cart Clicked',
                        value: 0,
                        category: 'User Conversion',
                        type: 'go_to_cart',
                      });
                      navigate("/cart");
                    }}
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
                <div 
                  className="highlight-item"
                  onClick={() => trackViewContent({
                    id: `highlight_doctor_recommended_${product._id}`,
                    name: 'Doctor Recommended Badge Clicked',
                    value: 0,
                    category: 'Product Features',
                    type: 'highlight_click',
                    highlight: 'doctor_recommended',
                  })}
                >
                  <Pill className="highlight-icon" size={16} />
                  <span>Doctor Recommended</span>
                </div>
                <div 
                  className="highlight-item"
                  onClick={() => trackViewContent({
                    id: `highlight_quality_tested_${product._id}`,
                    name: 'Quality Tested Badge Clicked',
                    value: 0,
                    category: 'Product Features',
                    type: 'highlight_click',
                    highlight: 'quality_tested',
                  })}
                >
                  <Shield className="highlight-icon" size={16} />
                  <span>Quality Tested</span>
                </div>
                <div 
                  className="highlight-item"
                  onClick={() => trackViewContent({
                    id: `highlight_free_delivery_${product._id}`,
                    name: 'Free Delivery Badge Clicked',
                    value: 0,
                    category: 'Product Features',
                    type: 'highlight_click',
                    highlight: 'free_delivery',
                  })}
                >
                  <Package className="highlight-icon" size={16} />
                  <span>Free Delivery</span>
                </div>
              </div>

              <div className="product-details">
                <div 
                  className="product-detail"
                  onClick={() => trackViewContent({
                    id: `expiry_detail_click_${product._id}`,
                    name: 'Expiry Detail Clicked',
                    value: 0,
                    category: 'Product Info',
                    type: 'detail_click',
                    detail: 'expiry',
                  })}
                >
                  <CalendarDays className="detail-icon" size={16} />
                  <div>
                    <strong>Expires on or after: </strong>
                    <span>{product?.expires_on || "—"}</span>
                  </div>
                </div>

                <div 
                  className="product-detail"
                  onClick={() => trackViewContent({
                    id: `origin_detail_click_${product._id}`,
                    name: 'Origin Detail Clicked',
                    value: 0,
                    category: 'Product Info',
                    type: 'detail_click',
                    detail: 'origin',
                  })}
                >
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
                    <div 
                      className="description-content"
                      onClick={() => trackViewContent({
                        id: `description_content_click_${product._id}`,
                        name: 'Description Content Clicked',
                        value: 0,
                        category: 'Product Content',
                        type: 'content_click',
                        section: 'description',
                      })}
                    >
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
                    <div 
                      className="directions-content"
                      onClick={() => trackViewContent({
                        id: `directions_content_click_${product._id}`,
                        name: 'Directions Content Clicked',
                        value: 0,
                        category: 'Product Content',
                        type: 'content_click',
                        section: 'directions',
                      })}
                    >
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
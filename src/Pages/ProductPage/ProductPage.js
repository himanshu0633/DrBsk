import React, { useState } from 'react';
import './ProductPage.css';
import ProductCarousel from '../../components/ProductCarousel/ProductCarousel';
import logo from "../../logo/2.jpg";
import Footer from '../../components/Footer/Footer';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addData } from '../../store/Action'; 



// import axios from 'axios'; // If you're not using a custom axios instance

import {
  Leaf,
  CalendarDays,
  Globe2,
  User,
  Home,
  FlaskConical,
  Info,
  AlertTriangle,
  ArrowDown,
  Package,
  Shield,
  Heart,
  Bolt,
  Pill,
  ShoppingCart
} from 'lucide-react';
import axiosInstance from '../../components/AxiosInstance';
import API_URL from '../../config';
import { toast } from 'react-toastify';
import CustomLoader from '../../components/CustomLoader';

const ProductPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { id } = useParams();
  // console.log(id);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const navigate = useNavigate();



  const increaseQty = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQty = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      // console.log("Calling:", /user/product/${id});
      const response = await axiosInstance.get(`/user/product/${id}`);
      const p = response.data;
      console.log("Fetched product:", p);

      const fetchedProduct = {
        ...p,
        price: parseFloat(p.consumer_price),
        originalPrice: parseFloat(p.retail_price),
        discount: parseFloat(p.retail_price) - parseFloat(p.consumer_price),
      };

      setProduct(fetchedProduct);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };


  const dispatch = useDispatch();

  const handleAddToCart = () => {
    if (!product) return;

    const productToAdd = {
      ...product,
      quantity,
    };

    toast.success('Item added to cart!', {
      position: 'top-right',
      autoClose: 2000,
    });

    dispatch(addData(productToAdd));
    setAddedToCart(true);
  };


  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      console.warn("Product ID not available");
    }
  }, [id]);


  const location = useLocation();
  const product1 = location.state?.product;

  if (!product) {
    return <div><CustomLoader /></div>;
  }
  const storedUser = sessionStorage.getItem('userData');
  const userData = storedUser ? JSON.parse(storedUser) : null;

  return (
    <>
      <Header />
      <Navbar />
      <div className="product-page">
        {/* Breadcrumb Navigation */}
        {/* <div className="breadcrumb">
          <span>Home</span>
          <span className="breadcrumb-divider">/</span>
          <span>Health & Wellness</span>
          <span className="breadcrumb-divider">/</span>
          <span>Cough & Cold</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-active">Cough Drops</span>
        </div> */}

        {/* Product Section */}
        <div className="product-container">
          <div className="product-wrapper">
            {/* Product Image Section */}
            <div className="product-image-container">
              <div className="image-wrapper">
                <img src={`${API_URL}${product.media[selectedImageIndex]?.url}`} alt="Cough Drops Jar" className="product-image1" />
                <div className="product-badge natural-badge">
                  <Leaf className="badge-icon" size={16} />
                  <span>100% Natural</span>
                </div>
                <div className="product-badge bestseller-badge">
                  <Bolt className="badge-icon" size={16} />
                  <span>Bestseller</span>
                </div>
              </div>
              <div className="image-thumbnails">
                {product.media.map((mediaItem, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImageIndex === index ? 'active-thumbnail' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={`${API_URL}${mediaItem.url}`} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>

              {/* <div className="image-thumbnails">
                {product.media.map((mediaItem, index) => (
                  <div key={index} className="thumbnail">
                    <img src={`${API_URL}${mediaItem.url}`} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div> */}

            </div>

            {/* Product Info Section */}
            <div className="product-info">
              <div className="product-header">
                {/* <h1 className="product-title">Cough Drops (Coolsa) - JAR</h1> */}
                {/* <h1 className="product-title">{product.name}</h1> */}
                <h1 className="product-title">{product ? product.name : <CustomLoader />}</h1>


                <button
                  className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  onClick={toggleWishlist}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className="wishlist-icon"
                    size={20}
                    fill={isWishlisted ? "#ff6b6b" : "none"}
                    color="#ff6b6b"
                  />
                </button>
              </div>

              <div className="product-meta">
                <span className="product-pack">{product?.quantity || "Loading..."}</span>

                <span className="product-rating">
                  ★★★★☆ <span className="rating-count">(128 reviews)</span>
                </span>
              </div>

              <div className="stock-status in-stock">
                <div className="status-indicator"></div>
                <span>In Stock - Ready to Ship</span>
              </div>

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
                  <FlaskConical className="detail-icon" size={16} />
                  <div>
                    <strong>Composition:</strong>
                    <span>Cough Drops Nutravedic, Menthol, Eucalyptus Oil</span>
                  </div>
                </div>

                <div className="product-detail">
                  <CalendarDays className="detail-icon" size={16} />
                  <div>
                    <strong>Expires on or after:</strong>
                    <span>{product?.expires_on || "..."}</span>
                  </div>
                </div>

                <div className="product-detail">
                  <Globe2 className="detail-icon" size={16} />
                  <div>
                    <strong>Country of origin:</strong>
                    <span>India</span>
                  </div>
                </div>

                {/* <div className="product-detail">
                  <User className="detail-icon" size={16} />
                  <div>
                    <strong>Consumption:</strong>
                    <span>Oral</span>
                  </div>
                </div> */}
              </div>

              {/* <div className="price-section">
                <div className="price-container">
                  <div className="current-price">₹{product?.consumer_price || "..."}</div>
                  <div className="original-price">₹{product?.retail_price || "..."}</div>
                  <div className="discount-badge">{product?.discount || 0} OFF</div>

                </div>
                <div className="tax-info">Inclusive of all taxes</div>
              </div> */}

              <div className="product-price">
                {userData?.type === "wholesalePartner" ? (
                  <>
                    <span>₹{product.retail_price}</span>
                    {product.consumer_price < product.retail_price && (
                      <span className="original-price">₹{product.consumer_price}</span>
                    )}
                  </>
                ) : (
                  <>
                    <span>₹{product.consumer_price}</span>
                    {product.retail_price > product.consumer_price && (
                      <span className="original-price">₹{product.retail_price}</span>
                    )}
                  </>
                )}
              </div>

              <div className="delivery-info">
                <label className="delivery-option" htmlFor="standard">
                  <input type="radio" id="standard" name="delivery" defaultChecked />
                  <span className="delivery-type">Standard Delivery</span>
                  <span className="delivery-time">3-5 business days</span>
                  <span className="delivery-price">FREE</span>
                </label>

                <label className="delivery-option" htmlFor="express">
                  <input type="radio" id="express" name="delivery" />
                  <span className="delivery-type">Express Delivery</span>
                  <span className="delivery-time">1-2 business days</span>
                  <span className="delivery-price">+ ₹50.00</span>
                </label>
              </div>


              {/* Quantity & Buttons */}
              <div className="quantity-container">
                <label className="quantity-label">Quantity</label>
                <div className="quantity-control">
                  <button
                    onClick={decreaseQty}
                    className="quantity-btn"
                    aria-label="Decrease quantity"
                  >-</button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="quantity-input"
                    aria-label="Current quantity"
                  />
                  <button
                    onClick={increaseQty}
                    className="quantity-btn"
                    aria-label="Increase quantity"
                  >+</button>
                </div>
              </div>

              <div className="action-buttons">
                {addedToCart ? (
                  <button className="add-to-cart-btn" onClick={() => navigate('/cart')}>
                    <ShoppingCart className="btn-icon" size={18} />
                    Go to Cart
                  </button>
                ) : (
                  <button className="add-to-cart-btn" onClick={handleAddToCart}>
                    <ShoppingCart className="btn-icon" size={18} />
                    Add to Cart
                  </button>
                )}

                {/* Removed "Buy Now" button */}
              </div>


              {/* <button className="buy-now-btn">Buy Now</button>
              </div> */}

              <div className="product-policy">
                <div className="policy-item">
                  <Package className="policy-icon" size={16} />
                  <span>Free delivery on orders over ₹500</span>
                </div>
                <div className="policy-item">
                  <Shield className="policy-icon" size={16} />
                  <span>This product cannot be returned for a refund or exchange. <a href="#">View policy</a></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs Section */}
        <div className="product-tabs-container">
          <div className="product-tabs">
            <button
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            {/* <button
              className={`tab-btn ${activeTab === 'ingredients' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingredients')}
            >
              Ingredients
            </button> */}
            <button
              className={`tab-btn ${activeTab === 'directions' ? 'active' : ''}`}
              onClick={() => setActiveTab('directions')}
            >
              Directions
            </button>
            {/* <button
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews (128)
            </button> */}
          </div>

          <div className="tab-content">
            {activeTab === 'description' && (
              <div className="description-content">
                <h3>Product Description</h3>
                <p>{product?.description}</p>

                <div className="feature-grid">
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Home size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>Home Remedy</h4>
                      <p>Trusted natural solution for cough relief</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <Leaf size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>Natural Ingredients</h4>
                      <p>Made with 100% natural active ingredients</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <User size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>For All Ages</h4>
                      <p>Suitable for adults and children above 6 years</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-icon">
                      <FlaskConical size={20} />
                    </div>
                    <div className="feature-text">
                      <h4>Lab Tested</h4>
                      <p>Rigorously tested for safety and efficacy</p>
                    </div>
                  </div>
                </div>

                <h3>Benefits</h3>
                <ul className="benefits-list">
                  <li>{product?.benefits}</li>
                  {/* <li>Cooling menthol effect that soothes the throat</li>
                  <li>Helps clear nasal passages for easier breathing</li>
                  <li>Long-lasting effect with each drop</li>
                  <li>No artificial colors or preservatives</li> */}
                </ul>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="ingredients-content">
                <h3>Active Ingredients</h3>
                <ul className="ingredients-list">
                  <li>
                    <strong>Menthol (2mg):</strong> Provides cooling sensation and soothes throat irritation
                  </li>
                  <li>
                    <strong>Eucalyptus Oil (1mg):</strong> Helps clear nasal passages and supports respiratory health
                  </li>
                  <li>
                    <strong>Honey Extract:</strong> Natural soothing agent with antibacterial properties
                  </li>
                  <li>
                    <strong>Ginger Extract:</strong> Helps relieve throat discomfort and supports immunity
                  </li>
                </ul>

                <h3>Inactive Ingredients</h3>
                <p>Xylitol (natural sweetener), Natural Flavors, Vegetable Glycerin</p>

                <div className="allergy-warning">
                  <AlertTriangle className="warning-icon" size={18} />
                  <p><strong>Allergy Information:</strong> Contains no common allergens. Manufactured in a facility that also processes tree nuts.</p>
                </div>
              </div>
            )}

            {activeTab === 'directions' && (
              <div className="directions-content">
                <h3>Recommended Use</h3>
                <p>For temporary relief of minor throat irritation and cough associated with hoarseness, dry throat, and irritants.</p>

                <div className="usage-card">
                  <div className="usage-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Dosage</h4>
                      <p>{product?.dosage}.</p>
                    </div>
                  </div>
                  {/* <div className="usage-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Frequency</h4>
                      <p>Do not exceed 10 drops in 24 hours. For children under 12 years, consult a doctor before use.</p>
                    </div>
                  </div> */}
                  <div className="usage-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Method</h4>
                      <p>Allow drop to dissolve slowly in the mouth. Do not chew or swallow whole. For best results, avoid eating or drinking for 15 minutes after use.</p>
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

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <div className="reviews-summary">
                  <div className="overall-rating">
                    <div className="rating-score">4.2</div>
                    <div className="rating-stars">★★★★☆</div>
                    <div className="rating-count">128 reviews</div>
                  </div>
                  <div className="rating-distribution">
                    <div className="rating-bar">
                      <span className="star-count">5 ★</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: '65%' }}></div>
                      </div>
                      <span className="percentage">65%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="star-count">4 ★</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: '20%' }}></div>
                      </div>
                      <span className="percentage">20%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="star-count">3 ★</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: '8%' }}></div>
                      </div>
                      <span className="percentage">8%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="star-count">2 ★</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: '4%' }}></div>
                      </div>
                      <span className="percentage">4%</span>
                    </div>
                    <div className="rating-bar">
                      <span className="star-count">1 ★</span>
                      <div className="bar-container">
                        <div className="bar-fill" style={{ width: '3%' }}></div>
                      </div>
                      <span className="percentage">3%</span>
                    </div>
                  </div>
                </div>

                <div className="review-list">
                  <div className="review-card">
                    <div className="review-header">
                      <div className="reviewer">Sarah K.</div>
                      <div className="review-rating">★★★★★</div>
                      <div className="review-date">2 weeks ago</div>
                    </div>
                    <div className="review-title">Excellent for sore throat!</div>
                    <div className="review-text">
                      These drops really helped soothe my throat during a bad cold. The menthol flavor is strong but not overwhelming. I like that they're sugar-free too.
                    </div>
                    <div className="review-helpful">
                      <span>Was this helpful?</span>
                      <button>Yes (24)</button>
                      <button>No (2)</button>
                    </div>
                  </div>

                  <div className="review-card">
                    <div className="review-header">
                      <div className="reviewer">Michael T.</div>
                      <div className="review-rating">★★★★☆</div>
                      <div className="review-date">1 month ago</div>
                    </div>
                    <div className="review-title">Good product</div>
                    <div className="review-text">
                      Works as advertised. The only reason I'm not giving 5 stars is that the effect doesn't last as long as I'd like. But it's effective while it lasts.
                    </div>
                    <div className="review-helpful">
                      <span>Was this helpful?</span>
                      <button>Yes (12)</button>
                      <button>No (1)</button>
                    </div>
                  </div>
                </div>

                <button className="view-all-reviews">View All Reviews <ArrowDown size={16} /></button>
              </div>
            )}
          </div>
        </div>

        {/* Frequently Bought Together */}
        {/* <div className="frequently-bought">
          <h2>Frequently Bought Together</h2>
          <div className="bought-together-container">
            <div className="bought-together-products">
              <div className="bought-product">
                <div className="product-checkbox">
                  <input type="checkbox" id="product1" checked />
                  <label htmlFor="product1"></label>
                </div>
                <img src={logo} alt="Product 1" />
                <div className="product-name">Cough Drops (Coolsa) - JAR</div>
                <div className="product-price">₹200.00</div>
              </div>
              <div className="plus-sign">+</div>
              <div className="bought-product">
                <div className="product-checkbox">
                  <input type="checkbox" id="product2" checked />
                  <label htmlFor="product2"></label>
                </div>
                <img src={logo} alt="Product 2" />
                <div className="product-name">Organic Honey (500g)</div>
                <div className="product-price">₹350.00</div>
              </div>
              <div className="plus-sign">+</div>
              <div className="bought-product">
                <div className="product-checkbox">
                  <input type="checkbox" id="product3" />
                  <label htmlFor="product3"></label>
                </div>
                <img src={logo} alt="Product 3" />
                <div className="product-name">Eucalyptus Essential Oil</div>
                <div className="product-price">₹180.00</div>
              </div>
            </div>
            <div className="bought-together-summary">
              <div className="total-price">
                <span>Total Price:</span>
                <span className="price">₹730.00</span>
              </div>
              <button className="add-all-to-cart">Add All to Cart</button>
              <div className="savings">You save ₹50.00 with this combo</div>
            </div>
          </div>
        </div> */}  

        {/* Related Products */}
        {/* <ProductCarousel title="You May Also Like" /> */}

        {/* Recently Viewed */}
        {/* <ProductCarousel title="Recently Viewed" /> */}
      </div>
      <Footer />
    </>
  );
};

export default ProductPage;
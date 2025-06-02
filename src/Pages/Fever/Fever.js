import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import "./Fever.css";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../components/AxiosInstance";
import { useDispatch } from 'react-redux';
// import { addToCart } from '../../store/CartSlice';
import API_URL from "../../config";

const Fever = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    minDiscount: 0,
    maxDiscount: 5000
  });
  const [sortOption, setSortOption] = useState('none');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [allProducts, setAllProducts] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);
  // const [products, setProducts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/user/allproducts`);
      const fetchedProducts = response.data.map(p => ({
        ...p,
        price: parseFloat(p.consumer_price),
        originalPrice: parseFloat(p.retail_price),
        discount: parseFloat(p.retail_price) - parseFloat(p.consumer_price)
      }));

      console.log("Fetched products:", fetchedProducts); // ✅ Log fetched data
      setAllProducts(fetchedProducts);
      setProducts(fetchedProducts); // Set initial display
      // console.log("Filtered products:", products);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };


  // Apply filters and sorting
  useEffect(() => {
    let filtered = allProducts.filter(product => {
      const price = parseFloat(product.price) || 0;
      const discount = parseFloat(product.discount) || 0;

      return price >= filters.minPrice &&
        price <= filters.maxPrice &&
        discount >= filters.minDiscount &&
        discount <= filters.maxDiscount;
    });


    switch (sortOption) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'discount-high':
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    setProducts(filtered);
  }, [filters, sortOption, allProducts]);

  // useEffect(() => {
  //   console.log("Filtered products (after update):", products);
  // }, [products]);



  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      minPrice: 0,
      maxPrice: 5000,
      minDiscount: 0,
      maxDiscount: 5000
    });
    setSortOption('none');
  };

  // Toggle mobile filters
  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // const dispatch = useDispatch();

  // const handleAddToCart = (product) => {
  //   dispatch(addToCart(product)); // Dispatch the action
  // };



  return (
    <>
      <Header />
      <Navbar />
      <div className="fever-container">
        {/* Mobile Filter Button */}
        <button className="mobile-filter-btn" onClick={toggleMobileFilters}>
          {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          <span className="filter-icon">{mobileFiltersOpen ? '✕' : '☰'}</span>
        </button>

        <div className="fever-content">
          {/* Sidebar Filter */}
          <div className={`sidebar ${mobileFiltersOpen ? 'mobile-open' : ''}`}>
            <div className="filter-card">
              <div className="filter-header">
                <h3>Filters</h3>
                <button className="reset-btn" onClick={resetFilters}>Reset All</button>
              </div>

              <div className="filter-section">
                <h4>Price Range</h4>
                <div className="price-display">
                  <span>₹{filters.minPrice}</span>
                  <span>₹{filters.maxPrice}</span>
                </div>
                <div className="range-inputs">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>

              <div className="filter-section">
                <h4>Discount Range</h4>
                <div className="price-display">
                  <span>₹{filters.minDiscount}</span>
                  <span>₹{filters.maxDiscount}</span>
                </div>
                <div className="range-inputs">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    name="minDiscount"
                    value={filters.minDiscount}
                    onChange={handleFilterChange}
                  />
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    step="100"
                    name="maxDiscount"
                    value={filters.maxDiscount}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            <div className="product-header">
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item"><a href="/">Home</a></li>
                  <li className="breadcrumb-item"><a href="#">Health Conditions</a></li>
                  <li className="breadcrumb-item active">Fever Cough Cold</li>
                </ol>
              </nav>

              <div className="sort-container">
                <label>Sort By:</label>
                <select
                  value={sortOption}
                  onChange={handleSortChange}
                  aria-label="Sort products"
                >
                  <option value="none">Recommended</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="discount-high">Best Discount</option>
                </select>
              </div>
            </div>

            <div className="products-container">
              {products.length > 0 ? (
                products.map(product => (
                  <div key={product._id} className="product-card">
                    <Link to={`/ProductPage/${product._id}`} className="product-card-link">
                      <div className="product-badge">
                        {product.discount > 0 && (
                          <span className="discount-badge">Save ₹{product.discount}</span>
                        )}
                      </div>
                      <div className="product-image">
                        <img
                          src={`${API_URL}${product.media[0]?.url}`}
                          alt={product.name}
                          loading="lazy"
                        />

                      </div>
                      <div className="product-details">
                        <h3 className="product-title">{product.name}</h3>
                        <p className="product-quantity">{product.quantity}</p>
                        <div className="product-price">
                          {product.consumer_price ? (
                            <>
                              <span>₹{parseFloat(product.consumer_price).toFixed(2)}</span>
                              {product.retail_price &&
                                parseFloat(product.retail_price) > parseFloat(product.consumer_price) && (
                                  <span className="original-price">
                                    ₹{parseFloat(product.retail_price).toFixed(2)}
                                  </span>
                                )}
                            </>
                          ) : (
                            <span className="price-unavailable">Price unavailable</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="product-actions">
                      <button
                        // onClick={() => handleAddToCart(product)}
                        className="add-to-cart-btn"
                      >
                        <span className="cart-icon">🛒</span> Add to Cart
                      </button>
                    </div>
                  </div>
                ))

              ) : (
                <div className="no-products">
                  <h3>No products match your filters</h3>
                  <button onClick={resetFilters} className="reset-filters-btn">
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Fever;




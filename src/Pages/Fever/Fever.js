import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import "./Fever.css";
import { Link, useParams, useLocation } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../components/AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { addData } from "../../store/Action";
import API_URL from "../../config";
import { toast } from "react-toastify";
import CustomLoader from "../../components/CustomLoader";

const Fever = () => {
  const location = useLocation();
  const categoryId = location.state?.categoryId || null;
  const filterByPrescription = location.state?.filterByPrescription || false;
  const { subCategoryName } = useParams();

  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.items || []);

  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categorySubNames, setCategorySubNames] = useState([]);

  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 5000,
    minDiscount: 0,
    maxDiscount: 5000,
  });

  const [sortOption, setSortOption] = useState("none");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const storedUser = sessionStorage.getItem("userData");
  const userData = storedUser ? JSON.parse(storedUser) : null;

  // 🟡 Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/user/allproducts`);
      const fetched = response.data.map((p) => {
        const retail = parseFloat(p.retail_price) || 0;
        const consumer = parseFloat(p.consumer_price) || 0;
        const discount = Math.max(0, retail - consumer);
        return {
          ...p,
          price: consumer,
          originalPrice: retail,
          discount,
        };
      });
      setAllProducts(fetched);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  //  Fetch subcategories and match category
  const fetchSubcategories = async () => {
    try {
      const res = await axiosInstance.get("/user/allSubcategories");
      setSubcategories(res.data);
      if (categoryId) {
        const matched = res.data.filter(
          (sub) => sub.category_id?._id === categoryId
        );
        const subNames = matched.map((sub) => sub.name.toLowerCase());
        setCategorySubNames(subNames);
      }
    } catch (err) {
      console.error("Error fetching subcategories", err);
    }
  };

  // 🟡 Initial fetch
  useEffect(() => {
    fetchProducts();
    fetchSubcategories();
  }, [categoryId]);

  // 🟡 Filter products
  useEffect(() => {
    const filtered = allProducts.filter((product) => {
      const price = parseFloat(product.price) || 0;
      const discount = parseFloat(product.discount) || 0;

      const matchesSubCategory = subCategoryName
        ? product.sub_category?.toLowerCase() === subCategoryName.toLowerCase()
        : true;

      const matchesCategory = categoryId
        ? categorySubNames.includes(product.sub_category?.toLowerCase())
        : true;

      const matchesPrescription = filterByPrescription
        ? product.prescription?.toLowerCase() === "notrequired"
        : true;

        // console.log("Matched subcategory names:", categorySubNames);

      return (
        price >= filters.minPrice &&
        price <= filters.maxPrice &&
        discount >= filters.minDiscount &&
        discount <= filters.maxDiscount &&
        matchesSubCategory &&
        matchesCategory &&
        matchesPrescription
      );
    });

    // Sort
    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "discount-high":
        filtered.sort((a, b) => b.discount - a.discount);
        break;
      default:
        break;
    }

    setProducts(filtered);
  }, [
    filters,
    sortOption,
    allProducts,
    subCategoryName,
    categoryId,
    categorySubNames,
    filterByPrescription,
  ]);

  // Cart controls
  const getQuantity = (id) =>
    cartItems.find((i) => i._id === id)?.quantity || 0;

  const handleAddToCart = (product) => {
    dispatch(addData({ ...product, quantity: 1 }));
    toast.success("Item added to cart!");
  };

  const increaseQuantity = (id) => {
    const product = products.find((p) => p._id === id);
    const item = cartItems.find((i) => i._id === id);
    dispatch(addData({ ...product, quantity: (item?.quantity || 0) + 1 }));
  };

  const decreaseQuantity = (id) => {
    const item = cartItems.find((i) => i._id === id);
    if (item && item.quantity > 1) {
      dispatch(addData({ ...item, quantity: item.quantity - 1 }));
    } else {
      dispatch(addData({ ...item, quantity: 0 }));
    }
  };

  // 🟡 UI controls
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSortChange = (e) => setSortOption(e.target.value);
  const resetFilters = () =>
    setFilters({
      minPrice: 0,
      maxPrice: 5000,
      minDiscount: 0,
      maxDiscount: 5000,
    });

  const toggleMobileFilters = () =>
    setMobileFiltersOpen((prev) => !prev);

  // 🟡 JSX
  return (
    <>
      <Header />
      <Navbar />
      <div className="fever-container">
        <button className="mobile-filter-btn" onClick={toggleMobileFilters}>
          {mobileFiltersOpen ? "Hide Filters" : "Show Filters"}
          <span className="filter-icon">{mobileFiltersOpen ? "✕" : "☰"}</span>
        </button>

        {loading ? (
          <CustomLoader />
        ) : (
          <div className="fever-content">
            <div className={`sidebar ${mobileFiltersOpen ? "mobile-open" : ""}`}>
              <div className="filter-card">
                <div className="filter-header">
                  <h3>Filters</h3>
                  <button className="reset-btn" onClick={resetFilters}>
                    Reset All
                  </button>
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

            <div className="product-grid">
              <div className="product-header">
                <div className="sort-container">
                  <label>Sort By:</label>
                  <select value={sortOption} onChange={handleSortChange}>
                    <option value="none">Recommended</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount-high">Best Discount</option>
                  </select>
                </div>
              </div>

              <div className="products-container">
                {products.length > 0 ? (
                  products.map((product) => {
                    const quantity = getQuantity(product._id);
                    return (
                      <div key={product._id} className="product-card">
                        <Link
                          to={`/ProductPage/${product._id}`}
                          className="product-card-link"
                        >
                          {product.discount > 0 && (
                            <div className="product-badge">
                              <span className="discount-badge">
                                Save ₹{product.discount}
                              </span>
                            </div>
                          )}
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
                              {userData?.type === "wholesalePartner" ? (
                                <>
                                  <span>₹{product.retail_price}</span>
                                  {product.consumer_price < product.retail_price && (
                                    <span className="original-price">
                                      ₹{product.consumer_price}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <span>₹{product.consumer_price}</span>
                                  {product.retail_price > product.consumer_price && (
                                    <span className="original-price">
                                      ₹{product.retail_price}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Link>

                        <div className="product-actions">
                          {quantity > 0 ? (
                            <div className="quantity-controller">
                              <button onClick={() => decreaseQuantity(product._id)}>
                                -
                              </button>
                              <span>{quantity}</span>
                              <button onClick={() => increaseQuantity(product._id)}>
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="add-to-cart-btn"
                            >
                              🛒 Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
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
        )}
      </div>
      <Footer />
    </>
  );
};

export default Fever;

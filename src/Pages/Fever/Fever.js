import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header/Header";
import "./Fever.css";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../components/AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { addData } from "../../store/Action";
import API_URL from "../../config";
import { toast } from "react-toastify";
import CustomLoader from "../../components/CustomLoader";

const PAGE_SIZE = 20;

const Fever = () => {
  const location = useLocation();
  const categoryId = location.state?.categoryId || null;
  const filterByPrescription = location.state?.filterByPrescription || false;
  const { subCategoryName } = useParams();
  const navigate = useNavigate();

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

  // NEW: pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const storedUser = localStorage.getItem("userData");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const isWholesaler = userData?.type === "wholesalePartner";

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/user/allproducts`);

      const toNum = (v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;
      };

      const pickVariation = (q) => {
        if (!q) return null;
        let arr = q;
        if (typeof q === "string") {
          try { arr = JSON.parse(q); } catch { return null; }
        }
        if (!Array.isArray(arr) || arr.length === 0) return null;
        // prefer in-stock; else first
        return arr.find(v => (String(v.in_stock || "")).toLowerCase() === "yes") || arr[0];
      };

      const fetched = data.map((p) => {
        let retail = toNum(p.retail_price);
        let consumer = toNum(p.consumer_price || p.mrp);

        if (!retail) {
          const v = pickVariation(p.quantity);
          if (v) {
            if (toNum(v.retail_price)) retail = toNum(v.retail_price);
            const vConsumer = toNum(v.final_price || v.mrp || v.consumer_price);
            if (vConsumer) consumer = vConsumer;
          }
        }

        const discount = retail > 0 ? Math.max(0, retail - consumer) : 0;

        return {
          ...p,
          price: consumer,
          originalPrice: retail,
          discount,
          retail_price: retail,
          consumer_price: consumer,
        };
      });

      setAllProducts(fetched);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  // Fetch subcategories and match category
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

  // Initial fetch
  useEffect(() => {
    fetchProducts();
    fetchSubcategories();
  }, [categoryId]);

  // Filter + sort products
  useEffect(() => {
    const filtered = allProducts.filter((product) => {
      const price = parseFloat(product.price) || 0;
      const discount = parseFloat(product.discount) || 0;

      const matchesSubCategory = subCategoryName
        ? (product.sub_category || "").toLowerCase() === subCategoryName.toLowerCase()
        : true;

      const matchesCategory = categoryId
        ? categorySubNames.includes((product.sub_category || "").toLowerCase())
        : true;

      const matchesPrescription = filterByPrescription
        ? (product.prescription || "").toLowerCase() === "notrequired"
        : true;

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
    // NEW: whenever the product list changes due to filters/sort/etc, reset to page 1
    setCurrentPage(1);
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

  // UI controls
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

  // NEW: pagination calculations
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, currentPage]);

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
    // optional: scroll back to top of grid on page change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Simple pagination UI
  const Pagination = () => {
    if (products.length === 0) return null;

    // compact page numbers (first, prev, current, next, last)
    return (
      <div className="pagination-container">
        <button
          className="page-btn"
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
        >
          « First
        </button>
        <button
          className="page-btn"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹ Prev
        </button>

        <span className="page-indicator">
          Page {currentPage} of {totalPages}
        </span>

        <button
          className="page-btn"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next ›
        </button>
        <button
          className="page-btn"
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
        >
          Last »
        </button>
      </div>
    );
  };

  return (
    <>
      <Header />
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

              <div>
                {products.length > 0 ? (
                  isWholesaler ? (
                    <>
                      {/* Table view for wholesalers (paginated) */}
                      <div className="wholesale-table-container">
                        <table className="wholesale-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Name</th>
                              <th>Description</th>
                              <th>Wholesale Price</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProducts.map((product) => {
                              const quantity = getQuantity(product._id);
                              return (
                                <tr key={product._id}>
                                  <td>
                                    <img
                                      src={`${API_URL}${product.media[0]?.url}`}
                                      alt={product.name}
                                      className="table-product-image"
                                      loading="lazy"
                                    />
                                  </td>
                                  <td>
                                    <span
                                      className="cursor-pointer"
                                      onClick={() => navigate(`/ProductPage/${product._id}`)}
                                    >
                                      {product.name}
                                    </span>
                                  </td>
                                  <td>{product.description}</td>
                                  <td>₹{product.consumer_price}</td>
                                  <td>
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
                                        onClick={() => navigate(`/ProductPage/${product._id}`)
                                      
                                      }
                                        className="add-to-cart-btn"
                                      >
                                        🛒 Add
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <Pagination />
                    </>
                  ) : (
                    <>
                      {/* Cards view for consumers (paginated) */}
                      <div className="products-container">
                        {paginatedProducts.map((product) => {
                          const quantity = getQuantity(product._id);
                          return (
                            <div key={product._id} className="product-card ">
                              <Link
                                to={`/ProductPage/${product._id}`}
                                className="product-card-link"
                              >
                                {product.discount > 0 && (
                                  <div className="product-badge">
                                    <span className="discount-badge">
                                      Save ₹{Math.floor(product.discount)}
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
                                  <p
                                    className="product-quantity"
                                    style={{
                                      color: product.stock === "yes" ? "#2ecc40" : "#ff4136",
                                    }}
                                  >
                                    {product.stock === "no" ? "Out of Stock" : null}
                                  </p>
                                  <div className="product-price">
                                    {isWholesaler ? (
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
                                    onClick={() => navigate(`/ProductPage/${product._id}`)}
                                    className="add-to-cart-btn"
                                    disabled={product.stock === "no"}
                                  >
                                    Go to product
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <Pagination />
                    </>
                  )
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

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Header from "../../components/Header/Header";
import "./Fever.css";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../components/AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { addData } from "../../store/Action";
import API_URL from "../../config";
import { toast } from "react-toastify";
import CustomLoader from "../../components/CustomLoader";
import JoinUrl from "../../JoinUrl";

const PAGE_SIZE = 20;

const parseQuantityVariants = (raw) => {
  try {
    let arr = [];
    if (Array.isArray(raw)) {
      if (raw.length > 0 && typeof raw[0] === "string") {
        arr = raw.flatMap((item) => {
          try {
            const parsed = JSON.parse(item);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch (err) {
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
      ...v,
      mrp: v.mrp ? parseFloat(v.mrp) : null,
      discount: v.discount ? parseFloat(v.discount) : null,
      gst: v.gst ? parseFloat(v.gst) : null,
      retail_price: v.retail_price ? parseFloat(v.retail_price) : null,
      final_price: v.final_price ? parseFloat(v.final_price) : null,
      in_stock: v.in_stock ? String(v.in_stock).toLowerCase() === "yes" : false,
    }));
  } catch {
    return [];
  }
};

const EMPTY_ARR = [];
const selectCartItems = (state) => state.cart?.items ?? EMPTY_ARR;

const Fever = () => {
  const location = useLocation();
  const categoryId = location.state?.categoryId || null;
  const filterByPrescription = location.state?.filterByPrescription || false;
  const navigate = useNavigate();

  // HashRouter के लिए URL से subcategory निकालने का function
  const getSubcategoryFromHashURL = () => {
    const hash = window.location.hash;
    if (!hash) return null;

    // "#/fever/" के बाद का हिस्सा निकालें
    const parts = hash.split("/");

    // parts[2] होना चाहिए subcategory name
    if (parts.length >= 3) {
      const subcategoryName = parts[2];
      if (subcategoryName && subcategoryName.trim() !== "") {
        return decodeURIComponent(subcategoryName);
      }
    }

    return null;
  };

  const paramsSubcategory = useParams().subcategory;
  const subcategoryFromHash = getSubcategoryFromHashURL();
  const decodedSubCategoryName =
    subcategoryFromHash ||
    (paramsSubcategory ? decodeURIComponent(paramsSubcategory) : null);

  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);

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
  const [currentPage, setCurrentPage] = useState(1);

  const storedUser = localStorage.getItem("userData");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const isWholesaler = userData?.type === "wholesalePartner";

  // Fetch products by subcategory
  const fetchProductsBySubcategory = async (subcategoryName) => {
    setLoading(true);
    try {
      if (subcategoryName && subcategoryName.trim() !== "") {
        const { data } = await axiosInstance.get(
          `/api/productsBySubcategory?subcategory=${encodeURIComponent(
            subcategoryName
          )}`
        );

        const toNum = (v) => {
          const n = parseFloat(v);
          return Number.isFinite(n) ? n : 0;
        };

        const pickVariation = (q) => {
          if (!q) return null;
          let arr = q;
          if (typeof q === "string") {
            try {
              arr = JSON.parse(q);
            } catch {
              return null;
            }
          }
          if (!Array.isArray(arr) || arr.length === 0) return null;
          return (
            arr.find(
              (v) => String(v.in_stock || "").toLowerCase() === "yes"
            ) || arr[0]
          );
        };

        const fetched = data.map((p) => {
          let retail = toNum(p.retail_price);
          let consumer = toNum(p.consumer_price || p.mrp);

          if (!retail) {
            const v = pickVariation(p.quantity);
            if (v) {
              if (toNum(v.retail_price)) retail = toNum(v.retail_price);
              const vConsumer = toNum(
                v.final_price || v.mrp || v.consumer_price
              );
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
      } else {
        fetchAllProducts();
      }
    } catch (error) {
      toast.error("Failed to load products");
      fetchAllProducts();
    }
    setLoading(false);
  };

  // Fetch all products
  const fetchAllProducts = async () => {
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
          try {
            arr = JSON.parse(q);
          } catch {
            return null;
          }
        }
        if (!Array.isArray(arr) || arr.length === 0) return null;
        return (
          arr.find(
            (v) => String(v.in_stock || "").toLowerCase() === "yes"
          ) || arr[0]
        );
      };

      const fetched = data.map((p) => {
        let retail = toNum(p.retail_price);
        let consumer = toNum(p.consumer_price || p.mrp);

        if (!retail) {
          const v = pickVariation(p.quantity);
          if (v) {
            if (toNum(v.retail_price)) retail = toNum(v.retail_price);
            const vConsumer = toNum(
              v.final_price || v.mrp || v.consumer_price
            );
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
      toast.error("Failed to load products");
    }
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

  // Fetch products when subcategory changes
  useEffect(() => {
    if (decodedSubCategoryName && decodedSubCategoryName.trim() !== "") {
      fetchProductsBySubcategory(decodedSubCategoryName);
    } else {
      fetchAllProducts();
    }

    fetchSubcategories();
  }, [decodedSubCategoryName, categoryId]);

  // Filter + sort products
  useEffect(() => {
    const filtered = allProducts.filter((product) => {
      const price = parseFloat(product.price) || 0;
      const discount = parseFloat(product.discount) || 0;

      const matchesCategory = categoryId
        ? categorySubNames.includes((product.sub_category || "").toLowerCase())
        : true;

      const matchesPrescription = filterByPrescription
        ? (product.prescription || "").toLowerCase() === "notrequired"
        : true;

      const matchesPrice = price >= filters.minPrice && price <= filters.maxPrice;
      const matchesDiscount =
        discount >= filters.minDiscount && discount <= filters.maxDiscount;

      return matchesPrice && matchesDiscount && matchesCategory && matchesPrescription;
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
    setCurrentPage(1);
  }, [
    filters,
    sortOption,
    allProducts,
    decodedSubCategoryName,
    categoryId,
    categorySubNames,
    filterByPrescription,
  ]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, currentPage]);

  const pickBestVariant = (quantityArr) => {
    const variants = parseQuantityVariants(quantityArr);
    if (!variants.length) return null;
    return variants.find((v) => v.in_stock) || variants[0];
  };

  const getQuantity = useCallback(
    (id) => {
      return cartItems.find((i) => i._id === id)?.quantity || 0;
    },
    [cartItems]
  );

  const handleAddToCart = (product) => {
    const quantityVariant = pickBestVariant(product.quantity);

    const finalPrice = Number(
      quantityVariant?.final_price ?? product.consumer_price ?? product.price ?? 0
    );

    const mrpPrice = Number(
      quantityVariant?.mrp ?? product.retail_price ?? finalPrice
    );

    dispatch(
      addData({
        ...product,
        quantity: 1,
        price: finalPrice,
        originalPrice: mrpPrice,
      })
    );

    toast.success("Item added to cart!");
  };

  const increaseQuantity = (id) => {
    const product = products.find((p) => p._id === id);
    const item = cartItems.find((i) => i._id === id);
    const currentQty = item?.quantity || 0;

    if (product) {
      const quantityVariant = pickBestVariant(product.quantity);
      const finalPrice = Number(
        quantityVariant?.final_price ?? product.consumer_price ?? product.price ?? 0
      );

      dispatch(
        addData({
          ...product,
          quantity: currentQty + 1,
          price: finalPrice,
        })
      );
    }
  };

  const decreaseQuantity = (id) => {
    const item = cartItems.find((i) => i._id === id);
    if (item && item.quantity > 1) {
      dispatch(addData({ ...item, quantity: item.quantity - 1 }));
    } else {
      dispatch(addData({ ...item, quantity: 0 }));
    }
  };

  const handleGoToProductPage = (product) => {
    navigate(`/ProductPage/${product._id}`);
  };

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

  const toggleMobileFilters = () => setMobileFiltersOpen((prev) => !prev);

  const goToPage = (page) => {
    const p = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Pagination = () => {
    if (products.length === 0) return null;

    return (
      <div className="pagination-container">
        <button className="page-btn" onClick={() => goToPage(1)} disabled={currentPage === 1}>
          « First
        </button>
        <button className="page-btn" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
          ‹ Prev
        </button>

        <span className="page-indicator">
          Page {currentPage} of {totalPages}
        </span>

        <button className="page-btn" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Next ›
        </button>
        <button className="page-btn" onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
          Last »
        </button>
      </div>
    );
  };

  const pageTitle = decodedSubCategoryName ? `Products - ${decodedSubCategoryName}` : "All Products";

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
                    <input type="range" min="0" max="5000" step="100" name="minPrice" value={filters.minPrice} onChange={handleFilterChange} />
                    <input type="range" min="0" max="5000" step="100" name="maxPrice" value={filters.maxPrice} onChange={handleFilterChange} />
                  </div>
                </div>

                <div className="filter-section">
                  <h4>Discount Range</h4>
                  <div className="price-display">
                    <span>₹{filters.minDiscount}</span>
                    <span>₹{filters.maxDiscount}</span>
                  </div>
                  <div className="range-inputs">
                    <input type="range" min="0" max="5000" step="100" name="minDiscount" value={filters.minDiscount} onChange={handleFilterChange} />
                    <input type="range" min="0" max="5000" step="100" name="maxDiscount" value={filters.maxDiscount} onChange={handleFilterChange} />
                  </div>
                </div>
              </div>
            </div>

            <div className="product-grid">
              <div className="product-header">
                <div className="results-count">
                  Showing {products.length} product{products.length !== 1 ? "s" : ""}
                </div>
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
                      <div className="wholesale-table-container">
                        <table className="wholesale-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Name</th>
                              <th>Description</th>
                              <th>Price</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedProducts.map((product) => {
                              const quantity = getQuantity(product._id);
                              const quantityVariant = pickBestVariant(product.quantity);
                              const finalPrice = quantityVariant?.final_price ?? product.consumer_price ?? 0;
                              const mrpPrice = quantityVariant?.mrp ?? product.retail_price ?? null;

                              return (
                                <tr key={product._id}>
                                  <td>
                                    <img
                                      src={JoinUrl(API_URL, product.media[0]?.url)}
                                      alt={product.name}
                                      className="table-product-image"
                                      loading="lazy"
                                    />
                                  </td>
                                  <td>
                                    <span className="cursor-pointer product-name-link" onClick={() => handleGoToProductPage(product)}>
                                      {product.name}
                                    </span>
                                  </td>
                                  <td>{product.description}</td>
                                  <td>
                                    <div className="product-price">
                                      <span>₹{finalPrice}</span>
                                      {mrpPrice && mrpPrice > finalPrice && <span className="original-price">₹{mrpPrice}</span>}
                                    </div>
                                  </td>
                                  <td>
                                    {quantity > 0 ? (
                                      <div className="quantity-controller">
                                        <button onClick={(e) => { e.stopPropagation(); decreaseQuantity(product._id); }}>-</button>
                                        <span>{quantity}</span>
                                        <button onClick={(e) => { e.stopPropagation(); increaseQuantity(product._id); }}>+</button>
                                      </div>
                                    ) : (
                                      <button
                                      onClick={() => handleGoToProductPage(product)}
                                        // onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                        className="add-to-cart-btn"
                                      >
                                        🛒 Add to Cart
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
                      <div className="products-container">
                        {paginatedProducts.map((product) => {
                          const quantityVariant = pickBestVariant(product.quantity);
                          const finalPrice = quantityVariant?.final_price ?? product.consumer_price ?? 0;
                          const mrpPrice = quantityVariant?.mrp ?? product.retail_price ?? null;
                          const quantity = getQuantity(product._id);

                          return (
                            <div key={product._id} className="product-card">
                              <div className="product-card-link" onClick={() => handleGoToProductPage(product)}>
                                {product.discount > 0 && (
                                  <div className="product-badge">
                                    <span className="discount-badge">Save ₹{Math.floor(product.discount)}</span>
                                  </div>
                                )}
                                <div className="product-image">
                                  <img src={JoinUrl(API_URL, product.media[0]?.url)} alt={product.name} loading="lazy" />
                                </div>
                                <div className="product-details">
                                  <h3 className="product-title">{product.name}</h3>
                                  <p
                                    className="product-quantity"
                                    style={{ color: product.stock === "yes" ? "#2ecc40" : "#ff4136" }}
                                  >
                                    {product.stock === "no" ? "Out of Stock" : null}
                                  </p>
                                </div>
                                <div className="product-price ms-2">
                                  <span>₹{finalPrice}</span>
                                  {mrpPrice && mrpPrice > finalPrice && (
                                    <span className="original-price">₹{mrpPrice}</span>
                                  )}
                                </div>
                              </div>

                              <div className="product-actions">
                                {quantity > 0 ? (
                                  <div className="quantity-controller">
                                    <button onClick={(e) => { e.stopPropagation(); decreaseQuantity(product._id); }}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={(e) => { e.stopPropagation(); increaseQuantity(product._id); }}>+</button>
                                  </div>
                                ) : (
                                  <button
                                    // onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                                    onClick={() => handleGoToProductPage(product)}
                                    className="add-to-cart-btn"
                                    disabled={product.stock === "no"}
                                  >
                                    🛒 Add to Cart
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
                    <h3>No products found for "{decodedSubCategoryName || "this category"}"</h3>
                    <p>Try adjusting your filters or browse other categories</p>
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

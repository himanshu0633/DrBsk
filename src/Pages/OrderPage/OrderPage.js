import React, { useEffect, useState } from 'react';
import './OrderPage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../components/AxiosInstance';
import CustomLoader from '../../components/CustomLoader';
import { useNavigate } from 'react-router-dom';

// Add a default image import
import noImage from '../../assets/no-image.png';

function paymentStatusLabel(status) {
    if (!status) return 'Unknown';
    if (status === 'captured') return 'Paid';
    if (status === 'failed') return 'Failed';
    if (status === 'authorized') return 'Authorized';
    if (status === 'created') return 'Created';
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function refundStatusLabel(refundInfo) {
    if (!refundInfo) return 'No Refund';
    if (!refundInfo.refundId && refundInfo.status === 'none') return 'No Refund';
    if (!refundInfo.refundId) return 'No Refund';

    const status = refundInfo.status;
    if (status === 'processed') return 'Refund Processed';
    if (status === 'failed') return 'Refund Failed';
    if (status === 'pending') return 'Refund Pending';
    if (status === 'initiated') return 'Refund Initiated';
    if (status === 'none') return 'No Refund';
    return `Refund ${status}`;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getEstimatedRefundDays(refundInfo) {
    if (!refundInfo || !refundInfo.estimatedSettlement) return null;
    const now = new Date();
    const settlement = new Date(refundInfo.estimatedSettlement);
    const diffTime = settlement - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Should be settled';
    if (diffDays === 1) return 'Expected tomorrow';
    return `Expected in ${diffDays} days`;
}

// Function to get product image URL
const getProductImage = (item) => {
    console.log("getProductImage called with item:", item);
    
    if (!item) {
        console.log("No item provided");
        return noImage;
    }
    
    // Check 1: If media exists directly in item (from order creation)
    if (item.media && Array.isArray(item.media) && item.media.length > 0) {
        console.log("Found media in item.media:", item.media);
        const firstImage = item.media.find(mediaItem => {
            const isImage = mediaItem.type === 'image' || 
                (mediaItem.url && (
                    mediaItem.url.includes('.jpg') || 
                    mediaItem.url.includes('.png') || 
                    mediaItem.url.includes('.jpeg') ||
                    mediaItem.url.includes('.webp') ||
                    mediaItem.url.includes('.gif')
                ));
            console.log("Checking media item:", mediaItem.url, "isImage:", isImage);
            return isImage;
        });
        
        if (firstImage && firstImage.url) {
            console.log("Using item.media URL:", firstImage.url);
            return firstImage.url;
        }
    }
    
    // Check 2: If populated product has media
    if (item.productId && item.productId.media && Array.isArray(item.productId.media)) {
        console.log("Found media in productId.media:", item.productId.media);
        const firstImage = item.productId.media.find(mediaItem => {
            const isImage = mediaItem.type === 'image' || 
                (mediaItem.url && (
                    mediaItem.url.includes('.jpg') || 
                    mediaItem.url.includes('.png') || 
                    mediaItem.url.includes('.jpeg') ||
                    mediaItem.url.includes('.webp') ||
                    mediaItem.url.includes('.gif')
                ));
            console.log("Checking productId media item:", mediaItem.url, "isImage:", isImage);
            return isImage;
        });
        
        if (firstImage && firstImage.url) {
            console.log("Using productId.media URL:", firstImage.url);
            return firstImage.url;
        }
    }
    
    console.log("No image found, returning noImage");
    return noImage;
};

// Function to get product name
const getProductName = (item) => {
    if (!item) return 'Unknown Product';
    
    // Check if populated product has name
    if (item.productId && item.productId.name) {
        return item.productId.name;
    }
    
    // Check if item has name directly
    return item.name || 'Unknown Product';
};

// Function to get product ID
const getProductId = (item) => {
    if (!item) return null;
    
    // Check if item has productId directly (populated)
    if (item.productId && item.productId._id) {
        return item.productId._id;
    }
    
    // Check if item has productId as string
    if (item.productId && typeof item.productId === 'string') {
        return item.productId;
    }
    
    // Check if item has _id (for non-populated items)
    if (item._id) {
        return item._id;
    }
    
    return null;
};

// Function to get product category
const getProductCategory = (item, categories) => {
    if (!item || !categories) return null;
    
    // Check if item has category directly
    if (item.category) {
        // Try to find category details from categories array
        const categoryDetails = categories.find(cat => 
            cat._id === item.category || 
            cat.name === item.category ||
            (item.productId && item.productId.category && cat._id === item.productId.category)
        );
        
        if (categoryDetails) {
            return {
                name: categoryDetails.name,
                variety: categoryDetails.variety
            };
        }
        return {
            name: item.category,
            variety: item.variety || 'Unknown'
        };
    }
    
    // Check if populated product has category
    if (item.productId && item.productId.category) {
        // Find category details from categories array
        const categoryDetails = categories.find(cat => 
            cat._id === item.productId.category || 
            cat.name === item.productId.category
        );
        
        if (categoryDetails) {
            return {
                name: categoryDetails.name,
                variety: categoryDetails.variety
            };
        }
        return {
            name: item.productId.category,
            variety: item.productId.variety || 'Unknown'
        };
    }
    
    return null;
};

const handleCancelOrder = () => {
    console.log("Cancel order clicked");
    // TODO: Add cancel order API logic
};

const handleShareOrder = () => {
    console.log("Share order clicked");
    navigator.share
        ? navigator.share({
            title: "Order Details",
            text: "Check my order details",
            url: window.location.href
        })
        : alert("Share not supported on this device");
};

const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
        case 'upi':
            return '📱';
        case 'card':
            return '💳';
        case 'netbanking':
            return '🏦';
        case 'wallet':
            return '👛';
        default:
            return '💰';
    }
};

const handleSupportRequest = () => {
    console.log("Support request clicked");
    alert("Our support team will contact you soon.");
};

const handleExportOrder = () => {
    console.log("Export clicked");
    window.print(); // temporary export
};

const OrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const userId = userData?._id;

    // Authentication check
    useEffect(() => {
        if (!userData._id) {
            navigate('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [navigate, userData]);

    // Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, []);

    // Initial fetch and periodic updates
    useEffect(() => {
        if (userId) {
            fetchOrders();

            // Update every 30 seconds to check for payment/refund status changes
            const interval = setInterval(() => {
                fetchOrdersSilently();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [userId]);

    // Debug effect to log orders
    useEffect(() => {
        console.log("Orders state updated:", orders);
        console.log("Categories state updated:", categories);
        if (orders.length > 0 && categories.length > 0) {
            console.log("First order details:", orders[0]);
            if (orders[0].items && orders[0].items.length > 0) {
                const item = orders[0].items[0];
                console.log("First item category info:", getProductCategory(item, categories));
            }
        }
    }, [orders, categories]);

    const fetchCategories = async () => {
        try {
            const response = await axiosInstance.get('/user/allcategories');
            setCategories(response.data || []);
            console.log("Categories fetched:", response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchLivePaymentStatus = async (orderId) => {
        try {
            const response = await axiosInstance.get(`/api/paymentStatus/${orderId}`);
            return response.data.paymentInfo;
        } catch (error) {
            console.error('Error fetching payment status:', error);
            return null;
        }
    };

    const fetchRefundStatus = async (orderId) => {
        try {
            const response = await axiosInstance.get(`/api/orders/${orderId}/refund-status`);
            return response.data.refundInfo;
        } catch (error) {
            console.error('Error fetching refund status:', error);
            return null;
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/orders/${userId}`);
            console.log("Orders API response:", response.data);
            
            const ordersWithLiveStatus = await Promise.all(
                (response.data.orders || []).map(async (order) => {
                    // Fetch live payment status
                    const paymentInfo = await fetchLivePaymentStatus(order._id);

                    // Fetch live refund status for all orders
                    const refundInfo = await fetchRefundStatus(order._id);

                    return {
                        ...order,
                        paymentInfo: paymentInfo || order.paymentInfo,
                        refundInfo: refundInfo || order.refundInfo || { status: 'none' }
                    };
                })
            );
            setOrders(ordersWithLiveStatus);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdersSilently = async () => {
        try {
            const response = await axiosInstance.get(`/api/orders/${userId}`);
            const ordersWithLiveStatus = await Promise.all(
                (response.data.orders || []).map(async (order) => {
                    // Fetch live payment status
                    const paymentInfo = await fetchLivePaymentStatus(order._id);

                    // Fetch live refund status for all orders
                    const refundInfo = await fetchRefundStatus(order._id);

                    return {
                        ...order,
                        paymentInfo: paymentInfo || order.paymentInfo,
                        refundInfo: refundInfo || order.refundInfo || { status: 'none' }
                    };
                })
            );
            setOrders(ordersWithLiveStatus);
        } catch (error) {
            console.error('Error fetching orders silently:', error);
        }
    };

    const openOrderDetails = async (order) => {
        // Fetch the most recent data before showing modal
        try {
            const paymentInfo = await fetchLivePaymentStatus(order._id);
            const refundInfo = await fetchRefundStatus(order._id);

            setSelectedOrder({
                ...order,
                paymentInfo: paymentInfo || order.paymentInfo,
                refundInfo: refundInfo || order.refundInfo || { status: 'none' }
            });
        } catch (error) {
            console.error('Error fetching latest order data:', error);
            setSelectedOrder(order);
        }
        setShowModal(true);
    };

    // Function to handle product click
    const handleProductClick = (item) => {
        const productId = getProductId(item);
        if (productId) {
            // Close modal if open
            setShowModal(false);
            setSelectedOrder(null);
            
            // Navigate to product page
            navigate(`/ProductPage/${productId}`);
        } else {
            console.error('Product ID not found for item:', item);
        }
    };

    // Function to get category icon
    const getCategoryIcon = (categoryName) => {
        const categoryIcons = {
            'Veterinary': '🐾',
            'ANIMAL FEED SUPPLEMENT': '🥕',
            'ELECTROPATHY': '⚡',
            'Cough': '🤧',
            'Digestive': '🤢',
            'Liver': '💊',
            'Sexual': '❤️',
            'Energy Tonic': '⚡',
            'Leucorrhoea': '🌸',
            'PCOS': '⚕️',
            'Fever': '🤒',
            'Joint Pain and All Body Pain': '🦵',
            'Eyes Problem': '👁️',
            'Stone Problem': '💎',
            'Blood Pressure': '🩸',
            'Diabetes': '🩺',
            'Co-Piles': '🪑',
            'Blood Purifiers': '🩸',
            'Worms': '🐛',
            'Skin Care': '🧴',
            'Asthma': '😮‍💨',
            'Epilepsy': '🧠',
            'Hair Care': '💇',
            'Sleep Stimulator': '😴',
            'Vomiting': '🤮',
            'Drug Addiction': '💊',
            'Constipation': '🚽',
            'Anti-Bacteria': '🦠',
            'Baby Product': '👶',
            'Ear Problem': '👂',
            'Teeth': '🦷',
            'Nose Problem': '👃',
            'Tumour Problem': '🎗️',
            'Paralysis': '🦽'
        };
        
        return categoryIcons[categoryName] || '📦';
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        navigate('/login');
    };

    const closeOrderDetails = () => {
        setShowModal(false);
        setSelectedOrder(null);
    };

    if (isAuthenticated === null) return null;

    return (
        <>
            <Header />
            <div className="order-page-container">
                <div className="order-layout">
                    {/* Sidebar */}
                    <aside className="order-sidebar">
                        <div className="sidebar-header">
                            <h3>Hello {userData?.name}</h3>
                            <p>Welcome to your account</p>
                        </div>
                        <nav className="sidebar-nav">
                            <a className="nav-item" onClick={() => navigate('/EditProfile')}>
                                My Profile
                            </a>
                            <a className="nav-item active" onClick={() => navigate('/OrderPage')}>
                                My Orders
                            </a>
                            <a className="nav-item logout" onClick={handleLogout}>
                                Logout
                            </a>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="order-content">
                        <div className="order-card">
                            <div className="order-header">
                                <h2>My Orders</h2>
                            </div>

                            {loading ? (
                                <CustomLoader />
                            ) : (
                                <div className="orders-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Order ID</th>
                                                <th>Product(s)</th>
                                                <th>Category</th>
                                                <th>Image</th>
                                                <th>Date</th>
                                                <th>Order Status</th>
                                                <th>Payment Status</th>
                                                <th>Refund Status</th>
                                                <th>Total</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length > 0 ? (
                                                orders.map((order, index) => (
                                                    <tr key={order._id}>
                                                        <td>{index + 1}</td>
                                                        <td>{order._id.slice(-8)}</td>
                                                        <td>
                                                            {order.items && Array.isArray(order.items) && order.items.length > 0
                                                                ? order.items.map((item, idx) => {
                                                                    const productName = getProductName(item);
                                                                    const productId = getProductId(item);
                                                                    
                                                                    return (
                                                                        <div key={idx} className="product-name-item">
                                                                            <span 
                                                                                className="clickable-product-name"
                                                                                onClick={() => productId && handleProductClick(item)}
                                                                                style={{ 
                                                                                    cursor: productId ? 'pointer' : 'default',
                                                                                    color: productId ? '#007bff' : 'inherit',
                                                                                    textDecoration: productId ? 'underline' : 'none'
                                                                                }}
                                                                            >
                                                                                {productName}
                                                                            </span>
                                                                            {idx < order.items.length - 1 && ', '}
                                                                        </div>
                                                                    );
                                                                })
                                                                : 'No items'
                                                            }
                                                        </td>
                                                        <td>
                                                            {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                                                                <div className="product-categories">
                                                                    {order.items.map((item, idx) => {
                                                                        const categoryInfo = getProductCategory(item, categories);
                                                                        if (categoryInfo) {
                                                                            return (
                                                                                <div key={idx} className="category-badge">
                                                                                    <span className="category-icon">
                                                                                        {getCategoryIcon(categoryInfo.name)}
                                                                                    </span>
                                                                                    <span className="category-name">
                                                                                        {categoryInfo.name}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        }
                                                                        return null;
                                                                    }).filter(Boolean)}
                                                                </div>
                                                            ) : '-'}
                                                        </td>
                                                        <td>
                                                            {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                                                                <div 
                                                                    className="product-thumbnail"
                                                                    onClick={() => {
                                                                        const productId = getProductId(order.items[0]);
                                                                        if (productId) {
                                                                            navigate(`/ProductPage/${productId}`);
                                                                        }
                                                                    }}
                                                                    style={{ 
                                                                        cursor: getProductId(order.items[0]) ? 'pointer' : 'default'
                                                                    }}
                                                                >
                                                                    <img 
                                                                        src={getProductImage(order.items[0])} 
                                                                        alt="Product" 
                                                                        className="thumbnail-img"
                                                                        onError={(e) => {
                                                                            console.error("Image failed to load:", e.target.src);
                                                                            e.target.src = noImage;
                                                                        }}
                                                                        onLoad={(e) => {
                                                                            console.log("Image loaded successfully:", e.target.src);
                                                                        }}
                                                                    />
                                                                    {order.items.length > 1 && (
                                                                        <span className="more-items-count">+{order.items.length - 1}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{formatDate(order.createdAt)}</td>
                                                        <td>
                                                            <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${order.paymentInfo?.status?.toLowerCase() || 'unknown'}`}>
                                                                {order.paymentInfo
                                                                    ? paymentStatusLabel(order.paymentInfo.status)
                                                                    : 'Unknown'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${order.refundInfo?.status?.toLowerCase() || 'none'}`}>
                                                                {refundStatusLabel(order.refundInfo)}
                                                            </span>
                                                            {order.refundInfo && order.refundInfo.refundId && getEstimatedRefundDays(order.refundInfo) && (
                                                                <div className="refund-estimate">
                                                                    <small>{getEstimatedRefundDays(order.refundInfo)}</small>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>₹{order.totalAmount}</td>
                                                        <td>
                                                            <button
                                                                className="view-details-btn"
                                                                onClick={() => openOrderDetails(order)}
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="11" style={{ textAlign: 'center', padding: '40px' }}>
                                                        <div className="no-orders">
                                                            <p>No orders found.</p>
                                                            <button 
                                                                className="shop-now-btn"
                                                                onClick={() => navigate('/')}
                                                            >
                                                                Shop Now
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="modal-overlay" onClick={closeOrderDetails}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Enhanced Header with Quick Actions */}
                        <div className="modal-header">
                            <div className="modal-header-content">
                                <div className="order-id-display">
                                    <div className="order-id-header">
                                        <h3>
                                            <span className="order-icon">📦</span>
                                            Order Details
                                        </h3>
                                        <div className="order-meta">
                                            <span className="order-date-mobile">
                                                {formatDate(selectedOrder.createdAt)}
                                            </span>
                                            <button 
                                                className="copy-order-id"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(selectedOrder._id);
                                                    alert('Order ID copied to clipboard!');
                                                }}
                                                title="Copy Order ID"
                                            >
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                    <div className="order-id-section">
                                        <div className="order-id-badge">
                                            #ORDER{selectedOrder._id.slice(-8).toUpperCase()}
                                        </div>
                                        <span className="order-date">
                                            Placed on {formatDate(selectedOrder.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="order-status-header">
                                    <div className="status-amount-group">
                                        <span className={`status-badge-lg ${selectedOrder.status.toLowerCase()}`}>
                                            <span className="status-indicator"></span>
                                            {selectedOrder.status}
                                        </span>
                                        <div className="total-amount-display">
                                            <span className="amount-label">Total:</span>
                                            <span className="total-amount-lg">₹{selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Quick Action Buttons */}
                                    <div className="quick-actions">
                                        {selectedOrder.status === 'pending' && (
                                            <button className="quick-action-btn cancel-btn" onClick={handleCancelOrder}>
                                                <span>✕</span>
                                                Cancel Order
                                            </button>
                                        )}
                                        {selectedOrder.invoiceUrl && (
                                            <a 
                                                href={selectedOrder.invoiceUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="quick-action-btn invoice-btn"
                                            >
                                                <span>📄</span>
                                                Invoice
                                            </a>
                                        )}
                                        <button 
                                            className="quick-action-btn share-btn"
                                            onClick={handleShareOrder}
                                        >
                                            <span>↗️</span>
                                            Share
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button className="modal-close" onClick={closeOrderDetails}>
                                <span>×</span>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="modal-grid">
                                {/* Left Column - Order & Payment Info */}
                                <div className="modal-left-column">
                                    {/* Order Timeline */}
                                    <div className="info-card timeline-card">
                                        <div className="card-header">
                                            <h4>
                                                <span className="card-icon">⏱️</span>
                                                Order Timeline
                                            </h4>
                                        </div>
                                        <div className="card-body">
                                            <div className="order-timeline">
                                                <div className={`timeline-step ${selectedOrder.createdAt ? 'completed' : 'active'}`}>
                                                    <div className="step-marker">
                                                        <span className="step-icon">🛒</span>
                                                    </div>
                                                    <div className="step-content">
                                                        <div className="step-title">Order Placed</div>
                                                        <div className="step-date">{formatDate(selectedOrder.createdAt)}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className={`timeline-step ${selectedOrder.status === 'processing' || selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'completed' : selectedOrder.status === 'confirmed' ? 'active' : ''}`}>
                                                    <div className="step-marker">
                                                        <span className="step-icon">✅</span>
                                                    </div>
                                                    <div className="step-content">
                                                        <div className="step-title">Order Confirmed</div>
                                                        <div className="step-date">
                                                            {selectedOrder.confirmedAt ? formatDate(selectedOrder.confirmedAt) : 'Pending'}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className={`timeline-step ${selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'completed' : selectedOrder.status === 'processing' ? 'active' : ''}`}>
                                                    <div className="step-marker">
                                                        <span className="step-icon">🚚</span>
                                                    </div>
                                                    <div className="step-content">
                                                        <div className="step-title">Shipped</div>
                                                        <div className="step-date">
                                                            {selectedOrder.shippedAt ? formatDate(selectedOrder.shippedAt) : 'Pending'}
                                                        </div>
                                                        {selectedOrder.trackingNumber && (
                                                            <div className="tracking-info">
                                                                <a 
                                                                    href={`https://tracking.com/${selectedOrder.trackingNumber}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="tracking-link"
                                                                >
                                                                    Track: {selectedOrder.trackingNumber}
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className={`timeline-step ${selectedOrder.status === 'delivered' ? 'completed' : ''}`}>
                                                    <div className="step-marker">
                                                        <span className="step-icon">📦</span>
                                                    </div>
                                                    <div className="step-content">
                                                        <div className="step-title">Delivered</div>
                                                        <div className="step-date">
                                                            {selectedOrder.deliveredAt ? formatDate(selectedOrder.deliveredAt) : 'Pending'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Information Card */}
                                    <div className="info-card">
                                        <div className="card-header">
                                            <h4>
                                                <span className="card-icon">📋</span>
                                                Order Information
                                            </h4>
                                            <span className="card-badge">Details</span>
                                        </div>
                                        <div className="card-body">
                                            <div className="details-grid">
                                                <div className="detail-item">
                                                    <div className="detail-icon">📅</div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Order Date & Time</span>
                                                        <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-icon">📍</div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Delivery Address</span>
                                                        <div className="address-container">
                                                            <span className="detail-value address-text">{selectedOrder.address}</span>
                                                            {selectedOrder.deliveryInstructions && (
                                                                <div className="delivery-instructions">
                                                                    <span className="instructions-label">Instructions: </span>
                                                                    <span className="instructions-text">{selectedOrder.deliveryInstructions}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-icon">👤</div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Customer</span>
                                                        <div className="customer-info">
                                                            <span className="detail-value">{selectedOrder.userName || 'Customer'}</span>
                                                            <span className="customer-contact">
                                                                <a href={`tel:${selectedOrder.phone}`} className="phone-link">
                                                                    📞 {selectedOrder.phone}
                                                                </a>
                                                                {selectedOrder.userEmail && (
                                                                    <a href={`mailto:${selectedOrder.userEmail}`} className="email-link">
                                                                        ✉️ {selectedOrder.userEmail}
                                                                    </a>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="detail-item">
                                                    <div className="detail-icon">🆔</div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Razorpay Order ID</span>
                                                        <div className="id-container">
                                                            <span className="detail-value code-text">{selectedOrder.razorpayOrderId}</span>
                                                            <button 
                                                                className="copy-btn small"
                                                                onClick={() => navigator.clipboard.writeText(selectedOrder.razorpayOrderId)}
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information Card */}
                                    <div className="info-card">
                                        <div className="card-header">
                                            <h4>
                                                <span className="card-icon">💳</span>
                                                Payment Information
                                            </h4>
                                            <div className="payment-status-indicator">
                                                <span className={`payment-dot ${selectedOrder.paymentInfo?.status?.toLowerCase() || 'unknown'}`}></span>
                                                {selectedOrder.paymentInfo?.status || 'Unknown'}
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <div className="payment-overview">
                                                <div className="payment-amount">
                                                    <span className="amount-label">Amount Paid</span>
                                                    <span className="amount-value">₹{selectedOrder.totalAmount}</span>
                                                </div>
                                                <div className="payment-method">
                                                    <span className="method-label">Method</span>
                                                    <span className="method-value">
                                                        {selectedOrder.paymentInfo?.method ? (
                                                            <span className="method-badge">
                                                                {getPaymentMethodIcon(selectedOrder.paymentInfo.method)}
                                                                {selectedOrder.paymentInfo.method}
                                                            </span>
                                                        ) : 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="payment-details">
                                                <div className="detail-item">
                                                    <div className="detail-icon">🆔</div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Payment ID</span>
                                                        <div className="id-container">
                                                            <span className="detail-value code-text">
                                                                {selectedOrder.paymentInfo?.paymentId?.slice(-12) || 'N/A'}
                                                            </span>
                                                            {selectedOrder.paymentInfo?.paymentId && (
                                                                <button 
                                                                    className="copy-btn small"
                                                                    onClick={() => navigator.clipboard.writeText(selectedOrder.paymentInfo.paymentId)}
                                                                >
                                                                    Copy
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="detail-item">
                                                    <div className="detail-icon">🔄</div>
                                                    <div className="detail-content">
                                                        <span className="detail-label">Last Updated</span>
                                                        <span className="detail-value">
                                                            {selectedOrder.paymentInfo?.updatedAt 
                                                                ? formatDate(selectedOrder.paymentInfo.updatedAt)
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {selectedOrder.paymentInfo?.captured && (
                                                    <div className="detail-item">
                                                        <div className="detail-icon">💰</div>
                                                        <div className="detail-content">
                                                            <span className="detail-label">Captured</span>
                                                            <span className="detail-value">
                                                                ₹{selectedOrder.paymentInfo.capturedAmount || selectedOrder.totalAmount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Refund Information Card */}
                                    {selectedOrder.refundInfo && selectedOrder.refundInfo.refundId && (
                                        <div className="info-card refund-card">
                                            <div className="card-header">
                                                <h4>
                                                    <span className="card-icon">🔄</span>
                                                    Refund Information
                                                </h4>
                                                <div className="refund-status-display">
                                                    <span className={`refund-status-badge ${selectedOrder.refundInfo.status?.toLowerCase()}`}>
                                                        {refundStatusLabel(selectedOrder.refundInfo)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="refund-summary">
                                                    <div className="refund-amount-card">
                                                        <span className="refund-amount-label">Refund Amount</span>
                                                        <span className="refund-amount-value">₹{selectedOrder.refundInfo.amount}</span>
                                                        <span className="refund-percentage">
                                                            {((selectedOrder.refundInfo.amount / selectedOrder.totalAmount) * 100).toFixed(0)}% of order
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="refund-speed">
                                                        <span className="speed-label">Speed</span>
                                                        <span className={`speed-badge ${selectedOrder.refundInfo.speed}`}>
                                                            {selectedOrder.refundInfo.speed}
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="refund-details-grid">
                                                    <div className="refund-detail-item">
                                                        <span className="refund-detail-label">Refund ID</span>
                                                        <div className="id-container">
                                                            <span className="refund-detail-value code-text">
                                                                {selectedOrder.refundInfo.refundId}
                                                            </span>
                                                            <button 
                                                                className="copy-btn small"
                                                                onClick={() => navigator.clipboard.writeText(selectedOrder.refundInfo.refundId)}
                                                            >
                                                                Copy
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="refund-detail-item">
                                                        <span className="refund-detail-label">Reason</span>
                                                        <span className="refund-detail-value reason-text">
                                                            {selectedOrder.refundInfo.reason}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="refund-detail-item">
                                                        <span className="refund-detail-label">Initiated</span>
                                                        <span className="refund-detail-value">
                                                            {formatDate(selectedOrder.refundInfo.initiatedAt)}
                                                        </span>
                                                    </div>
                                                    
                                                    {selectedOrder.refundInfo.processedAt && (
                                                        <div className="refund-detail-item">
                                                            <span className="refund-detail-label">Processed</span>
                                                            <span className="refund-detail-value">
                                                                {formatDate(selectedOrder.refundInfo.processedAt)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedOrder.refundInfo.estimatedSettlement && (
                                                        <div className="refund-detail-item">
                                                            <span className="refund-detail-label">Estimated Credit</span>
                                                            <span className="refund-detail-value highlight">
                                                                {formatDate(selectedOrder.refundInfo.estimatedSettlement)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {selectedOrder.refundInfo.notes && (
                                                    <div className="refund-notes-card">
                                                        <div className="notes-header">
                                                            <span className="notes-icon">📝</span>
                                                            <span className="notes-title">Additional Notes</span>
                                                        </div>
                                                        <div className="notes-content">
                                                            {selectedOrder.refundInfo.notes}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Items Ordered */}
                                <div className="modal-right-column">
                                    <div className="info-card items-card">
                                        <div className="card-header">
                                            <div className="items-header">
                                                <h4>
                                                    <span className="card-icon">🛒</span>
                                                    Items Ordered
                                                    <span className="item-count">({selectedOrder.items?.length || 0} items)</span>
                                                </h4>
                                                <div className="items-summary">
                                                    <span className="summary-text">
                                                        Total: <strong>₹{selectedOrder.totalAmount}</strong>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="card-body">
                                            <div className="items-list-container">
                                                <div className="items-list-header">
                                                    <span className="header-item">Product</span>
                                                    <span className="header-item">Category</span>
                                                    <span className="header-item">Price</span>
                                                    <span className="header-item">Qty</span>
                                                    <span className="header-item">Total</span>
                                                </div>
                                                
                                                <div className="items-list">
                                                    {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.map((item, index) => {
                                                        const productImage = getProductImage(item);
                                                        const productName = getProductName(item);
                                                        const productId = getProductId(item);
                                                        const categoryInfo = getProductCategory(item, categories);
                                                        const itemTotal = (item.price || 0) * (item.quantity || 0);
                                                        
                                                        return (
                                                            <div 
                                                                key={index} 
                                                                className="item-card"
                                                                onClick={() => productId && handleProductClick(item)}
                                                                data-product-id={productId}
                                                            >
                                                                <div className="item-main-info">
                                                                    <div className="item-image-container">
                                                                        <div className="item-image">
                                                                            <img 
                                                                                src={productImage} 
                                                                                alt={productName} 
                                                                                onError={(e) => {
                                                                                    console.error("Modal image failed to load:", e.target.src);
                                                                                    e.target.src = noImage;
                                                                                }}
                                                                                onLoad={(e) => {
                                                                                    console.log("Modal image loaded:", e.target.src);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                        {productId && (
                                                                            <div className="view-product-overlay">
                                                                                <span className="view-product-icon">👁️</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="item-info">
                                                                        <h5 className="item-name">{productName}</h5>
                                                                        {item.sku && (
                                                                            <div className="item-sku">SKU: {item.sku}</div>
                                                                        )}
                                                                        {item.variant && (
                                                                            <div className="item-variant">
                                                                                <span className="variant-label">Variant:</span>
                                                                                <span className="variant-value">{item.variant}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="item-category-col">
                                                                    {categoryInfo ? (
                                                                        <div className="category-display">
                                                                            <div className="category-badge-modal">
                                                                                <span className="category-icon">
                                                                                    {getCategoryIcon(categoryInfo.name)}
                                                                                </span>
                                                                                <div className="category-details">
                                                                                    <span className="category-name-modal">
                                                                                        {categoryInfo.name}
                                                                                    </span>
                                                                                    <span className="category-variety">
                                                                                        {categoryInfo.variety}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="no-category">-</span>
                                                                    )}
                                                                </div>
                                                                
                                                                <div className="item-price-col">
                                                                    <span className="item-price">₹{item.price || 0}</span>
                                                                </div>
                                                                
                                                                <div className="item-quantity-col">
                                                                    <span className="item-quantity">{item.quantity || 0}</span>
                                                                </div>
                                                                
                                                                <div className="item-total-col">
                                                                    <span className="item-total">₹{itemTotal}</span>
                                                                </div>
                                                                
                                                                <div className="item-actions-col">
                                                                    {productId && (
                                                                        <button 
                                                                            className="view-product-btn"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleProductClick(item);
                                                                            }}
                                                                            title="View Product Details"
                                                                        >
                                                                            👁️ View
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                            
                                            {/* Order Summary */}
                                            <div className="order-summary-container">
                                                <h5 className="summary-title">Order Summary</h5>
                                                <div className="summary-grid">
                                                    <div className="summary-row">
                                                        <span>Subtotal</span>
                                                        <span>₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>Shipping</span>
                                                        <span className={selectedOrder.shippingCharge > 0 ? 'shipping-fee' : 'free-shipping'}>
                                                            {selectedOrder.shippingCharge > 0 
                                                                ? `₹${selectedOrder.shippingCharge}`
                                                                : 'FREE'}
                                                        </span>
                                                    </div>
                                                    <div className="summary-row">
                                                        <span>Tax (GST)</span>
                                                        <span>₹{selectedOrder.taxAmount || '0.00'}</span>
                                                    </div>
                                                    {selectedOrder.discount > 0 && (
                                                        <div className="summary-row discount-row">
                                                            <span>
                                                                <span className="discount-icon">🎁</span>
                                                                Discount
                                                            </span>
                                                            <span className="discount-amount">-₹{selectedOrder.discount}</span>
                                                        </div>
                                                    )}
                                                    <div className="summary-divider"></div>
                                                    <div className="summary-row total-row">
                                                        <span>Total Amount</span>
                                                        <div className="total-display">
                                                            <span className="total-amount">₹{selectedOrder.totalAmount}</span>
                                                            <span className="total-currency">INR</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="action-buttons-container">
                                        <div className="action-buttons-group">
                                            <button className="action-btn primary-btn" onClick={closeOrderDetails}>
                                                <span>✓</span>
                                                Close Details
                                            </button>
                                            <button 
                                                className="action-btn secondary-btn" 
                                                onClick={() => {
                                                    closeOrderDetails();
                                                    navigate('/orders');
                                                }}
                                            >
                                                <span>📋</span>
                                                View All Orders
                                            </button>
                                        </div>
                                        
                                        <div className="action-buttons-group">
                                            {selectedOrder.status === 'delivered' && (
                                                <button className="action-btn support-btn" onClick={handleSupportRequest}>
                                                    <span>🛟</span>
                                                    Get Support
                                                </button>
                                            )}
                                            
                                            <button 
                                                className="action-btn print-btn"
                                                onClick={() => window.print()}
                                            >
                                                <span>🖨️</span>
                                                Print
                                            </button>
                                            
                                            <button 
                                                className="action-btn export-btn"
                                                onClick={handleExportOrder}
                                            >
                                                <span>📥</span>
                                                Export
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
}

export default OrderPage;
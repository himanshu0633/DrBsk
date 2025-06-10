import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../components/AxiosInstance';
import CustomLoader from '../../../components/CustomLoader';
import API_URL from '../../../config';

const PharmaProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/user/allproducts');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axiosInstance.delete(`/user/deleteProduct/${id}`);
                fetchData(); // Refresh list after delete
            } catch (error) {
                console.error("Delete error:", error);
            }
        }
    };

    // const handleEdit = async (id) => {
    //     navigate(`/pharma-admin/addNewProduct/${id}`);
    //     try {
    //         await axiosInstance.put(`/user/updateProduct/${id}`);
    //         fetchData();
    //     } catch (error) {
    //         console.error("Edit error:", error);
    //     }
    // };

    const handleEdit = (id) => {
        navigate(`/pharma-admin/addNewProduct/${id}`);
    };


    const handleView = (product) => {
        setSelectedProduct(product);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Products</h2>
                <Link to="/pharma-admin/addNewProduct">
                    <button className="btn-add">Add New Product</button>
                </Link>
            </div>

            {loading ? (
                <CustomLoader />
            ) : (
                <div className=" overflow_x_auto">
                    <table className="product-table w_970">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Price (Retail)</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>{product._id}</td>
                                    <td>{product.name}</td>
                                    <td>₹{product.retail_price}</td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <button className="btn-view" onClick={() => handleView(product)}>View</button>
                                        <button className="btn-edit" onClick={() => handleEdit(product._id)}>Edit</button>
                                        <button className="btn-delete" onClick={() => handleDelete(product._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* View Modal */}
            {showModal && selectedProduct && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-button" onClick={closeModal}>×</span>
                        <h3>Product Details</h3>
                        {selectedProduct.media && selectedProduct.media.length > 0 ? (
                            <img
                                src={`${API_URL}${selectedProduct.media[0].url}`}
                                alt={selectedProduct.name}
                                className="modal-image"
                            />
                        ) : (
                            <p>No image available</p>
                        )}
                        <p><strong>Name:</strong> {selectedProduct.name}</p>
                        <p><strong>Description:</strong> {selectedProduct.description}</p>
                        <p><strong>Category:</strong> {selectedProduct.category}</p>
                        <p><strong>Sub-category:</strong> {selectedProduct.sub_category}</p>
                        <p><strong>Retail Price:</strong> ₹{selectedProduct.retail_price}</p>
                        <p><strong>Consumer Price:</strong> ₹{selectedProduct.consumer_price}</p>
                        <p><strong>MRP:</strong> ₹{selectedProduct.mrp}</p>
                        <p><strong>Discount:</strong> {selectedProduct.discount}%</p>
                        <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
                        <p><strong>Prescription:</strong> {selectedProduct.prescription}</p>
                        <p><strong>Benefits:</strong> {selectedProduct.benefits}</p>
                        <p><strong>Dosage:</strong> {selectedProduct.dosage}</p>
                        <p><strong>Side Effects:</strong> {selectedProduct.side_effects}</p>
                        <p><strong>Suitable For:</strong> {selectedProduct.suitable_for}</p>
                        <p><strong>Expires On:</strong> {new Date(selectedProduct.expires_on).toDateString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmaProducts;




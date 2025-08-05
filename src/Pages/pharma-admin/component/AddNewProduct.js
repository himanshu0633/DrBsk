import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from '../../../components/AxiosInstance';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';


const AddNewProduct = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        media: [],
        retail_price: "",
        consumer_price: "",
        discount: "",
        mrp: "",
        gst: "",
        stock: "",
        quantity: [],
        category: "",
        productvariety: "",
        sub_category: "",
        expires_on: "",
        suitable_for: "",
        benefits: "",
        dosage: "",
        side_effects: "",
        prescription: "required",
        created_at: new Date().toISOString(),
        deleted_at: null
    });

    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            try {
                const categoriesResponse = await axiosInstance.get('/user/allcategories');
                setCategoryList(categoriesResponse.data);

                if (isEditMode) {
                    const productResponse = await axiosInstance.get(`/user/product/${id}`);
                    const product = productResponse.data;
                    // console.log('lksdjf;sdkjfl;skjfl;sjdf;', productResponse.data)

                    // Fetch subcategories for selected category
                    if (product.category) {
                        const subCategoryResponse = await axiosInstance.get(
                            `/user/allSubcategories?category=${encodeURIComponent(product.category)}`
                        );
                        setSubCategoryList(subCategoryResponse.data);
                    }

                    setFormData({
                        ...product,
                        expires_on: product.expires_on?.split('T')[0],
                        media: product.media.map(m => ({
                            ...m,
                            url: m.url.startsWith('http') ? m.url : `${m.url}`,
                            type: m.type.includes('video') ? 'video' : 'image',
                            file: null
                        }))
                    });
                }
            } catch (error) {
                console.error("Error during initialization:", error);
            }
        };

        init();
    }, [id]);


    // const fetchProductDetails = async (productId) => {
    //     try {
    //         const res = await axiosInstance.get(`/user/product/${productId}`);
    //         const product = res.data;

    //         setFormData({
    //             ...product,
    //             expires_on: product.expires_on?.split('T')[0],
    //             media: product.media.map(m => ({
    //                 ...m,
    //                 url: m.url.startsWith('http') ? m.url : `${m.url}`,
    //                 type: m.type.includes('video') ? 'video' : 'image',
    //                 file: null // existing media won't be re-uploaded
    //             }))
    //         });

    //         fetchSubCategories(product.category);
    //     } catch (error) {
    //         console.error("Failed to load product:", error);
    //     }
    // };


    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => {
    //         const updatedData = { ...prev, [name]: value };

    //         // Calculate consumer_price whenever 'mrp' or 'discount' changes
    //         if (name === 'mrp' || name === 'discount') {
    //             const { mrp, discount } = updatedData;
    //             if (mrp && discount) {
    //                 const consumerPrice = mrp - (mrp * (discount / 100));
    //                 updatedData.consumer_price = consumerPrice.toFixed(2); // rounding to two decimal places
    //             }
    //         }
    //         return updatedData;
    //     });

    //     if (name === "category") {
    //         setFormData(prev => ({ ...prev, sub_category: "" })); // Reset subcategory
    //         fetchSubCategories(value);
    //     }
    // };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updatedData = { ...prev, [name]: value };

            // Parse numeric values safely
            const mrp = parseFloat(updatedData.mrp);
            const discount = parseFloat(updatedData.discount);
            const gst = parseFloat(updatedData.gst);

            // Calculate base discounted price
            let discountedPrice = 0;
            if (!isNaN(mrp) && !isNaN(discount)) {
                discountedPrice = mrp - (mrp * (discount / 100));
            }

            // Calculate consumer_price based on GST presence
            if (!isNaN(gst) && gst > 0) {
                // Add GST on top of discounted price
                const finalPrice = discountedPrice + (discountedPrice * (gst / 100));
                updatedData.consumer_price = finalPrice.toFixed(2);
            } else {
                // No GST, consumer_price is just discounted price
                if (discountedPrice > 0) {
                    updatedData.consumer_price = discountedPrice.toFixed(2);
                } else {
                    updatedData.consumer_price = "";
                }
            }

            // Reset sub_category if category changes
            if (name === "category") {
                updatedData.sub_category = "";
                fetchSubCategories(value);
            }

            return updatedData;
        });
    };



    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const mediaPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve({
                        url: reader.result,
                        type: file.type.startsWith('video') ? 'video' : 'image',
                        name: file.name,
                        size: file.size,
                        file: file
                    });
                };
                reader.readAsDataURL(file);
            });
        });

        Promise.all(mediaPromises).then(newMedia => {
            setFormData(prev => ({
                ...prev,
                media: [...prev.media, ...newMedia]
            }));
        });
    };

    const removeMedia = (index) => {
        setFormData(prev => {
            const updatedMedia = [...prev.media];
            updatedMedia.splice(index, 1);
            return {
                ...prev,
                media: updatedMedia
            };
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current.value = null;
        fileInputRef.current.click();
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'name', 'description', 'retail_price', 'consumer_price',
            'quantity', 'category', 'expires_on', 'dosage', 'productvariety'
        ];


        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.replace('_', ' ')} is required`;
            }
        });

        // if (formData.expires_on && new Date(formData.expires_on) < new Date()) {
        //     newErrors.expires_on = "Expiry date must be in the future";
        // }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const formPayload = new FormData();

            // Append all fields (excluding media for now)
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'media') return;
                if (value !== null && value !== undefined) {
                    formPayload.append(key, value);
                }
            });

            // Append media files (only new uploads with .file property)
            formData.media.forEach((item) => {
                if (item?.file) {
                    formPayload.append('media', item.file);
                } else {
                    // Optionally append existing media URLs if needed
                    formPayload.append('existingMedia', item.url);
                }
            });

            let res;
            if (isEditMode) {
                res = await axiosInstance.put(
                    `/user/updateProduct/${id}`,
                    formPayload,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                toast.success('Product updated successfully!');
            } else {
                res = await axiosInstance.post(
                    '/user/createProduct',
                    formPayload,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                toast.success('Product added successfully!');
            }

            navigate('/pharma-admin/products');
        } catch (error) {
            console.error('Submit Error:', error);
            toast.error('Something went wrong. Please try again.', error);
        }
    };


    const handleReset = () => {
        setFormData({
            name: "",
            description: "",
            media: [],
            retail_price: "",
            consumer_price: "",
            discount: "",
            mrp: "",
            stock: "",
            gst: "",
            quantity: [],
            category: "",
            sub_category: "",
            productvariety: "",
            expires_on: "",
            suitable_for: "",
            benefits: "",
            dosage: "",
            side_effects: "",
            prescription: "",
            created_at: new Date().toISOString(),
            deleted_at: null
        });
        setErrors({});
        setIsSubmitted(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / 1048576).toFixed(2) + ' MB';
    };

    const fetchSubCategories = async (category) => {
        try {
            const response = await axiosInstance.get(`/user/allSubcategories?category=${encodeURIComponent(category)}`);
            console.log("Fetched subCategories:", response.data);
            setSubCategoryList(response.data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
    };


    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allcategories');
            console.log("Fetched categories:", response.data);
            setCategoryList(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    // Handle change for a particular quantity input
    const handleQuantityChange = (index, value) => {
        setFormData(prev => {
            const newQuantities = [...prev.quantity];
            newQuantities[index] = value;
            return { ...prev, quantity: newQuantities };
        });
    };

    // Add another empty quantity input field
    const addQuantityField = () => {
        setFormData(prev => ({
            ...prev,
            quantity: [...prev.quantity, ""]
        }));
    };

    // Remove quantity input at given index
    const removeQuantityField = (index) => {
        setFormData(prev => {
            const newQuantities = [...prev.quantity];
            newQuantities.splice(index, 1);
            return { ...prev, quantity: newQuantities };
        });
    };


    return (
        <div>
            <div className="herbal-form-container">
                <div className="herbal-form-header">
                    <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>
                    <button type="button" className="herbal-cancel-btn" onClick={() => navigate("/pharma-admin/products")}>
                        Cancel
                    </button>
                </div>

                {isSubmitted ? (
                    <div className="herbal-success-message">
                        <p>Product submitted successfully!</p>
                        <button onClick={handleReset}>Add Another Product</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="herbal-product-form">
                        {/* Basic Information */}
                        <div className="herbal-form-section">
                            <h3>Basic Information</h3>
                            <div className="herbal-form-row">
                                <div className="herbal-form-group">
                                    <label>Product Name*</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && <span className="herbal-error">{errors.name}</span>}
                                </div>

                                <div className="herbal-form-group">
                                    <label>Product Media (Images/Videos)*</label>
                                    <div className="media-upload-container">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleMediaChange}
                                            accept="image/*,video/*"
                                            multiple
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            type="button"
                                            className="media-upload-btn"
                                            onClick={triggerFileInput}
                                        >
                                            Add Media
                                        </button>
                                        <p className="media-upload-hint">Supports JPG, PNG, GIF, MP4 (Max 10MB each)</p>
                                        <div className="media-preview-container">
                                            {formData.media.length === 0 ? (
                                                <div className="no-media-placeholder">
                                                    No media selected
                                                </div>
                                            ) : (
                                                formData.media.map((media, index) => (
                                                    <div key={index} className="media-preview-item">
                                                        {media.type === 'video' ? (
                                                            <video controls>
                                                                <source src={media.url} type={`video/${media.file.name.split('.').pop()}`} />
                                                                Your browser does not support the video tag.
                                                            </video>
                                                        ) : (
                                                            <img src={media.url} alt={`Preview ${index}`} />
                                                        )}
                                                        <button
                                                            type="button"
                                                            className="remove-media-btn"
                                                            onClick={() => removeMedia(index)}
                                                            aria-label="Remove media"
                                                        >
                                                            ×
                                                        </button>
                                                        <div className="media-info">
                                                            <span className="media-name">{media.name}</span>
                                                            <span className="media-size">{formatFileSize(media.size)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="herbal-form-group">
                                    <label >Prescription</label>
                                    <select name="prescription" value={formData.prescription} onChange={handleChange} >
                                        {/* <option value="">Select Prescription</option> */}
                                        <option value="required">Required</option>
                                        <option value="Notrequired">Not Required</option>
                                    </select>
                                </div>
                            </div>

                            <div className="herbal-form-group">
                                <label>Description*</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="3"
                                />
                                {errors.description && <span className="herbal-error">{errors.description}</span>}
                            </div>
                        </div>


                        {/* Pricing Information */}
                        <div className="herbal-form-section">
                            <h3>Pricing Information</h3>
                            <div className="herbal-form-row">

                                <div className="herbal-form-group">
                                    <label>MRP</label>
                                    <input
                                        type="number"
                                        name="mrp"
                                        value={formData.mrp}
                                        onChange={handleChange}
                                        placeholder="Enter maximum retail price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="herbal-form-group">
                                    <label>Discount (%)</label>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        placeholder="Enter discount percentage"
                                        min="0"
                                        max="100"
                                    />
                                </div>

                                <div className="herbal-form-group">
                                    <label>Discounted Price</label>
                                    <input
                                        type="number"
                                        name="consumer_price"
                                        value={formData.consumer_price}
                                        readOnly
                                        placeholder="Calculated consumer price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>


                                <div className="herbal-form-group">
                                    <label>GST</label>
                                    <input
                                        type="number"
                                        name="gst"
                                        value={formData.gst}
                                        onChange={handleChange}
                                        placeholder="Enter GST %"
                                        min="0"
                                        step="0.01"
                                    />

                                </div>

                                <div className="herbal-form-group">
                                    <label>Final Consumer Price</label>
                                    <input
                                        type="number"
                                        name="consumer_price"
                                        value={formData.consumer_price}
                                        readOnly
                                        placeholder="Calculated consumer price"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                            </div>


                            <div className="herbal-form-row">
                                <div className="herbal-form-group">
                                    <label>WholesalePartner Price (MRP)*</label>
                                    <input
                                        type="number"
                                        name="retail_price"
                                        value={formData.retail_price}
                                        onChange={handleChange}
                                        placeholder="Enter retail price"
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.retail_price && <span className="herbal-error">{errors.retail_price}</span>}
                                </div>

                                {/* <div className="herbal-form-group">
                                    <label>Quantity*</label>
                                    <input
                                        type="text"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        placeholder="e.g., 100ml, 50g"
                                    />
                                    {errors.quantity && <span className="herbal-error">{errors.quantity}</span>}
                                </div> */}

                                <div className="herbal-form-group">
                                    <label>Quantities*</label>
                                    {formData.quantity.length === 0 && (
                                        <p>No quantities added yet. Click 'Add Quantity' to start.</p>
                                    )}
                                    {formData.quantity.map((qty, index) => (
                                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                value={qty}
                                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                placeholder="Enter quantity"
                                                style={{ flexGrow: 1 }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeQuantityField(index)}
                                                aria-label="Remove quantity"
                                                style={{
                                                    marginLeft: '8px',
                                                    backgroundColor: '#f44336',
                                                    color: '#fff',
                                                    border: 'none',
                                                    padding: '0 8px',
                                                    cursor: 'pointer',
                                                    borderRadius: '4px',
                                                    height: '32px'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addQuantityField}
                                        style={{
                                            marginTop: '8px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Add Quantity
                                    </button>

                                    {errors.quantity && <span className="herbal-error">{errors.quantity}</span>}
                                </div>

                                <div className="herbal-form-group">
                                    <label>Use By* (Expiry Date)</label>
                                    <input
                                        // type="date"
                                        type="text"
                                        name="expires_on"
                                        value={formData.expires_on}
                                        onChange={handleChange}
                                    // min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.expires_on && <span className="herbal-error">{errors.expires_on}</span>}
                                </div>

                                <div className="herbal-form-group">
                                    <label >Stock</label>
                                    <select name="stock" value={formData.stock} onChange={handleChange} >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>
                            </div>
                        </div>


                        {/* Category Information */}
                        <div className="herbal-form-section">
                            <h3>Category Information</h3>
                            <div className="herbal-form-row">
                                <div className="herbal-form-group">
                                    <label>Variety*</label>
                                    <select
                                        name="productvariety"
                                        value={formData.productvariety}
                                        onChange={(e) => {
                                            const selectedVariety = e.target.value;
                                            setFormData(prev => ({
                                                ...prev,
                                                productvariety: selectedVariety,
                                                category: "",
                                                sub_category: ""
                                            }));
                                        }}
                                        className='selectCss'
                                    >
                                        <option value="">Select Variety</option>
                                        <option value="Human">Human</option>
                                        <option value="Veterinary">Veterinary</option>
                                    </select>
                                    {errors.variety && <span className="herbal-error">{errors.variety}</span>}
                                </div>


                                <div className="herbal-form-group">
                                    <label>Category*</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select Category</option>
                                        {categoryList
                                            .filter(cat => cat.variety === formData.productvariety
                                            )
                                            .map((sub, index) => (
                                                <option key={index} value={sub.name}>{sub.name}</option>
                                            ))}
                                    </select>
                                    {errors.category && <span className="herbal-error">{errors.category}</span>}
                                </div>


                                <div className="herbal-form-group">
                                    <label>Sub Category</label>
                                    <select
                                        name="sub_category"
                                        value={formData.sub_category}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select subcategory</option>
                                        {subCategoryList.map((sub, index) => (
                                            <option key={index} value={sub.name}>{sub.name}</option>
                                        ))}
                                    </select>

                                </div>

                                <div className="herbal-form-group">
                                    <label>Suitable For</label>
                                    <input
                                        type="text"
                                        name="suitable_for"
                                        value={formData.suitable_for}
                                        onChange={handleChange}
                                        placeholder="e.g., Adults, Children, All ages"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="herbal-form-section">
                            <h3>Product Details</h3>
                            <div className="herbal-form-row">
                                <div className="herbal-form-group">
                                    <label>Benefits (comma separated)</label>
                                    <textarea
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleChange}
                                        placeholder="Enter benefits separated by commas"
                                        rows="3"
                                    />
                                </div>

                                <div className="herbal-form-group">
                                    <label>Dosage/Usage Instructions*</label>
                                    <textarea
                                        name="dosage"
                                        value={formData.dosage}
                                        onChange={handleChange}
                                        placeholder="Enter dosage instructions"
                                        rows="3"
                                    />
                                    {errors.dosage && <span className="herbal-error">{errors.dosage}</span>}
                                </div>
                            </div>

                            <div className="herbal-form-group">
                                <label>Side Effects</label>
                                <textarea
                                    name="side_effects"
                                    value={formData.side_effects}
                                    onChange={handleChange}
                                    placeholder="Enter any known side effects"
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div className="herbal-form-actions">
                            <button type="button" onClick={handleReset} className="herbal-reset-btn">
                                Reset
                            </button>
                            {/* <p>{isEditMode ? "Edit Product" : "Add New Product"}</p> */}

                            <button type="submit" className="herbal-submit-btn">
                                {isEditMode ? "Update Product" : "Submit Product"}
                            </button>

                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default AddNewProduct





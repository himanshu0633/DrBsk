// import React, { useEffect, useState, useRef } from 'react'
// import axiosInstance from '../../../components/AxiosInstance';
// import { toast } from 'react-toastify';
// import { useParams, useNavigate } from 'react-router-dom';


// const AddNewProduct = () => {
//     const { id } = useParams();
//     const isEditMode = !!id;
//     const navigate = useNavigate();

//     const [categoryList, setCategoryList] = useState([]);
//     const [subCategoryList, setSubCategoryList] = useState([]);
//     const [formData, setFormData] = useState({
//         name: "",
//         description: "",
//         media: [],
//         retail_price: "",
//         consumer_price: "",
//         discount: "",
//         mrp: "",
//         gst: "",
//         stock: "yes",
//         quantity: [],
//         category: "",
//         productvariety: "",
//         sub_category: "",
//         expires_on: "",
//         suitable_for: "",
//         benefits: "",
//         dosage: "",
//         side_effects: "",
//         prescription: "required",
//         created_at: new Date().toISOString(),
//         deleted_at: null
//     });

//     const [errors, setErrors] = useState({});
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const fileInputRef = useRef(null);

//     useEffect(() => {
//         const init = async () => {
//             try {
//                 const categoriesResponse = await axiosInstance.get('/user/allcategories');
//                 setCategoryList(categoriesResponse.data);

//                 if (isEditMode) {
//                     const productResponse = await axiosInstance.get(`/user/product/${id}`);
//                     const product = productResponse.data;
//                     // console.log('lksdjf;sdkjfl;skjfl;sjdf;', productResponse.data)

//                     // Fetch subcategories for selected category
//                     if (product.category) {
//                         const subCategoryResponse = await axiosInstance.get(
//                             `/user/allSubcategories?category=${encodeURIComponent(product.category)}`
//                         );
//                         setSubCategoryList(subCategoryResponse.data);
//                     }

//                     setFormData({
//                         ...product,
//                         expires_on: product.expires_on?.split('T')[0],
//                         media: product.media.map(m => ({
//                             ...m,
//                             url: m.url.startsWith('http') ? m.url : `${m.url}`,
//                             type: m.type.includes('video') ? 'video' : 'image',
//                             file: null
//                         })),
//                         quantity: Array.isArray(product.quantity)
//                             ? product.quantity
//                             : (typeof product.quantity === 'string' && product.quantity.length > 0
//                                 ? [product.quantity]
//                                 : []),
//                         stock: (() => {
//                             const s = (product.stock ?? '').toLowerCase().trim();
//                             console.log("Stock value:", s);
//                             return s === 'yes' ? 'yes'
//                                 : s === 'no' ? 'no'
//                                     : 'yes';
//                         })(),

//                     });


//                 }
//             } catch (error) {
//                 console.error("Error during initialization:", error);
//             }
//         };

//         init();
//     }, [id]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => {
//             const updatedData = { ...prev, [name]: value };

//             // Parse numeric values safely
//             const mrp = parseFloat(updatedData.mrp);
//             const discount = parseFloat(updatedData.discount);
//             const gst = parseFloat(updatedData.gst);

//             // Calculate base discounted price
//             let discountedPrice = 0;
//             if (!isNaN(mrp) && !isNaN(discount)) {
//                 discountedPrice = mrp - (mrp * (discount / 100));
//             }

//             // Calculate consumer_price based on GST presence
//             if (!isNaN(gst) && gst > 0) {
//                 // Add GST on top of discounted price
//                 const finalPrice = discountedPrice + (discountedPrice * (gst / 100));
//                 updatedData.consumer_price = finalPrice.toFixed(2);
//             } else {
//                 // No GST, consumer_price is just discounted price
//                 if (discountedPrice > 0) {
//                     updatedData.consumer_price = discountedPrice.toFixed(2);
//                 } else {
//                     updatedData.consumer_price = "";
//                 }
//             }

//             // Reset sub_category if category changes
//             if (name === "category") {
//                 updatedData.sub_category = "";
//                 fetchSubCategories(value);
//             }

//             return updatedData;
//         });
//     };



//     const handleMediaChange = (e) => {
//         const files = Array.from(e.target.files);
//         if (files.length === 0) return;

//         const mediaPromises = files.map(file => {
//             return new Promise((resolve) => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     resolve({
//                         url: reader.result,
//                         type: file.type.startsWith('video') ? 'video' : 'image',
//                         name: file.name,
//                         size: file.size,
//                         file: file
//                     });
//                 };
//                 reader.readAsDataURL(file);
//             });
//         });

//         Promise.all(mediaPromises).then(newMedia => {
//             setFormData(prev => ({
//                 ...prev,
//                 media: [...prev.media, ...newMedia]
//             }));
//         });
//     };

//     const removeMedia = (index) => {
//         setFormData(prev => {
//             const updatedMedia = [...prev.media];
//             updatedMedia.splice(index, 1);
//             return {
//                 ...prev,
//                 media: updatedMedia
//             };
//         });
//     };

//     const triggerFileInput = () => {
//         fileInputRef.current.value = null;
//         fileInputRef.current.click();
//     };

//     const validateForm = () => {
//         const newErrors = {};
//         const requiredFields = [
//             'name', 'description', 'retail_price', 'consumer_price',
//             'quantity', 'category', 'expires_on', 'dosage', 'productvariety'
//         ];


//         requiredFields.forEach(field => {
//             if (!formData[field]) {
//                 newErrors[field] = `${field.replace('_', ' ')} is required`;
//             }
//         });

//         // if (formData.expires_on && new Date(formData.expires_on) < new Date()) {
//         //     newErrors.expires_on = "Expiry date must be in the future";
//         // }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateForm()) return;

//         try {
//             const formPayload = new FormData();

//             // Append all fields (excluding media for now)
//             Object.entries(formData).forEach(([key, value]) => {
//                 if (key === 'media') return;
//                 if (value !== null && value !== undefined) {
//                     formPayload.append(key, value);
//                 }
//             });

//             // Append media files (only new uploads with .file property)
//             formData.media.forEach((item) => {
//                 if (item?.file) {
//                     formPayload.append('media', item.file);
//                 } else {
//                     // Optionally append existing media URLs if needed
//                     formPayload.append('existingMedia', item.url);
//                 }
//             });

//             let res;
//             if (isEditMode) {
//                 res = await axiosInstance.put(
//                     `/user/updateProduct/${id}`,
//                     formPayload,
//                     {
//                         headers: {
//                             'Content-Type': 'multipart/form-data',
//                         },
//                     }
//                 );
//                 toast.success('Product updated successfully!');
//             } else {
//                 res = await axiosInstance.post(
//                     '/user/createProduct',
//                     formPayload,
//                     {
//                         headers: {
//                             'Content-Type': 'multipart/form-data',
//                         },
//                     }
//                 );
//                 toast.success('Product added successfully!');
//             }

//             navigate('/pharma-admin/products');
//         } catch (error) {
//             console.error('Submit Error:', error);
//             toast.error('Something went wrong. Please try again.', error);
//         }
//     };


//     const handleReset = () => {
//         setFormData({
//             name: "",
//             description: "",
//             media: [],
//             retail_price: "",
//             consumer_price: "",
//             discount: "",
//             mrp: "",
//             stock: "",
//             gst: "",
//             quantity: [],
//             category: "",
//             sub_category: "",
//             productvariety: "",
//             expires_on: "",
//             suitable_for: "",
//             benefits: "",
//             dosage: "",
//             side_effects: "",
//             prescription: "",
//             created_at: new Date().toISOString(),
//             deleted_at: null
//         });
//         setErrors({});
//         setIsSubmitted(false);
//     };

//     const formatFileSize = (bytes) => {
//         if (bytes < 1024) return bytes + ' bytes';
//         else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
//         else return (bytes / 1048576).toFixed(2) + ' MB';
//     };

//     const fetchSubCategories = async (category) => {
//         try {
//             const response = await axiosInstance.get(`/user/allSubcategories?category=${encodeURIComponent(category)}`);
//             console.log("Fetched subCategories:", response.data);
//             setSubCategoryList(response.data);
//         } catch (error) {
//             console.error("Error fetching subcategories:", error);
//         }
//     };


//     const fetchData = async () => {
//         try {
//             const response = await axiosInstance.get('/user/allcategories');
//             console.log("Fetched categories:", response.data);
//             setCategoryList(response.data);
//         } catch (error) {
//             console.error("Error fetching categories:", error);
//         }
//     };

//     // Handle change for a particular quantity input
//     const handleQuantityChange = (index, value) => {
//         setFormData(prev => {
//             const newQuantities = [...prev.quantity];
//             newQuantities[index] = value;
//             return { ...prev, quantity: newQuantities };
//         });
//     };

//     // Add another empty quantity input field
//     const addQuantityField = () => {
//         setFormData(prev => ({
//             ...prev,
//             quantity: [...prev.quantity, ""]
//         }));
//     };

//     // Remove quantity input at given index
//     const removeQuantityField = (index) => {
//         setFormData(prev => {
//             const newQuantities = [...prev.quantity];
//             newQuantities.splice(index, 1);
//             return { ...prev, quantity: newQuantities };
//         });
//     };


//     return (
//         <div>
//             <div className="herbal-form-container">
//                 <div className="herbal-form-header">
//                     <h2>{isEditMode ? "Edit Product" : "Add New Product"}</h2>
//                     <button type="button" className="herbal-cancel-btn" onClick={() => navigate("/pharma-admin/products")}>
//                         Cancel
//                     </button>
//                 </div>

//                 {isSubmitted ? (
//                     <div className="herbal-success-message">
//                         <p>Product submitted successfully!</p>
//                         <button onClick={handleReset}>Add Another Product</button>
//                     </div>
//                 ) : (
//                     <form onSubmit={handleSubmit} className="herbal-product-form">
//                         {/* Basic Information */}
//                         <div className="herbal-form-section">
//                             <h3>Basic Information</h3>
//                             <div className="herbal-form-row">
//                                 <div className="herbal-form-group">
//                                     <label>Product Name*</label>
//                                     <input
//                                         type="text"
//                                         name="name"
//                                         value={formData.name}
//                                         onChange={handleChange}
//                                         placeholder="Enter product name"
//                                     />
//                                     {errors.name && <span className="herbal-error">{errors.name}</span>}
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Product Media (Images/Videos)*</label>
//                                     <div className="media-upload-container">
//                                         <input
//                                             type="file"
//                                             ref={fileInputRef}
//                                             onChange={handleMediaChange}
//                                             accept="image/*,video/*"
//                                             multiple
//                                             style={{ display: 'none' }}
//                                         />
//                                         <button
//                                             type="button"
//                                             className="media-upload-btn"
//                                             onClick={triggerFileInput}
//                                         >
//                                             Add Media
//                                         </button>
//                                         <p className="media-upload-hint">Supports JPG, PNG, GIF, MP4 (Max 10MB each)</p>
//                                         <div className="media-preview-container">
//                                             {formData.media.length === 0 ? (
//                                                 <div className="no-media-placeholder">
//                                                     No media selected
//                                                 </div>
//                                             ) : (
//                                                 formData.media.map((media, index) => (
//                                                     <div key={index} className="media-preview-item">
//                                                         {media.type === 'video' ? (
//                                                             <video controls>
//                                                                 <source src={media.url} type={`video/${media.file.name.split('.').pop()}`} />
//                                                                 Your browser does not support the video tag.
//                                                             </video>
//                                                         ) : (
//                                                             <img src={media.url} alt={`Preview ${index}`} />
//                                                         )}
//                                                         <button
//                                                             type="button"
//                                                             className="remove-media-btn"
//                                                             onClick={() => removeMedia(index)}
//                                                             aria-label="Remove media"
//                                                         >
//                                                             ×
//                                                         </button>
//                                                         <div className="media-info">
//                                                             <span className="media-name">{media.name}</span>
//                                                             <span className="media-size">{formatFileSize(media.size)}</span>
//                                                         </div>
//                                                     </div>
//                                                 ))
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label >Prescription</label>
//                                     <select name="prescription" value={formData.prescription} onChange={handleChange} >
//                                         {/* <option value="">Select Prescription</option> */}
//                                         <option value="required">Required</option>
//                                         <option value="Notrequired">Not Required</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             <div className="herbal-form-group">
//                                 <label>Description*</label>
//                                 <textarea
//                                     name="description"
//                                     value={formData.description}
//                                     onChange={handleChange}
//                                     placeholder="Enter product description"
//                                     rows="3"
//                                 />
//                                 {errors.description && <span className="herbal-error">{errors.description}</span>}
//                             </div>
//                         </div>


//                         {/* Pricing Information */}
//                         <div className="herbal-form-section">
//                             <h3>Pricing Information</h3>
//                             <div className="herbal-form-row">

//                                 <div className="herbal-form-group">
//                                     <label>MRP</label>
//                                     <input
//                                         type="number"
//                                         name="mrp"
//                                         value={formData.mrp}
//                                         onChange={handleChange}
//                                         placeholder="Enter maximum retail price"
//                                         min="0"
//                                         step="0.01"
//                                     />
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Discount (%)</label>
//                                     <input
//                                         type="number"
//                                         name="discount"
//                                         value={formData.discount}
//                                         onChange={handleChange}
//                                         placeholder="Enter discount percentage"
//                                         min="0"
//                                         max="100"
//                                     />
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Discounted Price</label>
//                                     <input
//                                         type="number"
//                                         name="consumer_price"
//                                         value={formData.consumer_price}
//                                         readOnly
//                                         placeholder="Calculated consumer price"
//                                         min="0"
//                                         step="0.01"
//                                     />
//                                 </div>


//                                 <div className="herbal-form-group">
//                                     <label>GST</label>
//                                     <input
//                                         type="number"
//                                         name="gst"
//                                         value={formData.gst}
//                                         onChange={handleChange}
//                                         placeholder="Enter GST %"
//                                         min="0"
//                                         step="0.01"
//                                     />

//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Final Consumer Price</label>
//                                     <input
//                                         type="number"
//                                         name="consumer_price"
//                                         value={formData.consumer_price}
//                                         readOnly
//                                         placeholder="Calculated consumer price"
//                                         min="0"
//                                         step="0.01"
//                                     />
//                                 </div>

//                             </div>


//                             <div className="herbal-form-row">
//                                 <div className="herbal-form-group">
//                                     <label>WholesalePartner Price (MRP)*</label>
//                                     <input
//                                         type="number"
//                                         name="retail_price"
//                                         value={formData.retail_price}
//                                         onChange={handleChange}
//                                         placeholder="Enter retail price"
//                                         min="0"
//                                         step="0.01"
//                                     />
//                                     {errors.retail_price && <span className="herbal-error">{errors.retail_price}</span>}
//                                 </div>

//                                 {/* <div className="herbal-form-group">
//                                     <label>Quantity*</label>
//                                     <input
//                                         type="text"
//                                         name="quantity"
//                                         value={formData.quantity}
//                                         onChange={handleChange}
//                                         placeholder="e.g., 100ml, 50g"
//                                     />
//                                     {errors.quantity && <span className="herbal-error">{errors.quantity}</span>}
//                                 </div> */}

//                                 <div className="herbal-form-group">
//                                     <label>Quantities*</label>
//                                     {formData.quantity?.length === 0 && (
//                                         <p>No quantities added yet. Click 'Add Quantity' to start.</p>
//                                     )}
//                                     {formData.quantity?.map((qty, index) => (
//                                         <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
//                                             <input
//                                                 type="text"
//                                                 value={qty}
//                                                 onChange={(e) => handleQuantityChange(index, e.target.value)}
//                                                 placeholder="Enter quantity"
//                                                 style={{ flexGrow: 1 }}
//                                             />
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removeQuantityField(index)}
//                                                 aria-label="Remove quantity"
//                                                 style={{
//                                                     marginLeft: '8px',
//                                                     backgroundColor: '#f44336',
//                                                     color: '#fff',
//                                                     border: 'none',
//                                                     padding: '0 8px',
//                                                     cursor: 'pointer',
//                                                     borderRadius: '4px',
//                                                     height: '32px'
//                                                 }}
//                                             >
//                                                 ×
//                                             </button>
//                                         </div>
//                                     ))}

//                                     <button
//                                         type="button"
//                                         onClick={addQuantityField}
//                                         style={{
//                                             marginTop: '8px',
//                                             backgroundColor: '#4CAF50',
//                                             color: 'white',
//                                             border: 'none',
//                                             padding: '8px 12px',
//                                             cursor: 'pointer',
//                                             borderRadius: '4px'
//                                         }}
//                                     >
//                                         Add Quantity
//                                     </button>

//                                     {errors.quantity && <span className="herbal-error">{errors.quantity}</span>}
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Use By* (Expiry Date)</label>
//                                     <input
//                                         // type="date"
//                                         type="text"
//                                         name="expires_on"
//                                         value={formData.expires_on}
//                                         onChange={handleChange}
//                                     // min={new Date().toISOString().split('T')[0]}
//                                     />
//                                     {errors.expires_on && <span className="herbal-error">{errors.expires_on}</span>}
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label >Stock *</label>
//                                     <select name="stock" required value={formData.stock} onChange={handleChange} >
//                                         <option value="yes">Yes</option>
//                                         <option value="no">No</option>
//                                     </select>
//                                 </div>
//                             </div>
//                         </div>


//                         {/* Category Information */}
//                         <div className="herbal-form-section">
//                             <h3>Category Information</h3>
//                             <div className="herbal-form-row">
//                                 <div className="herbal-form-group">
//                                     <label>Variety*</label>
//                                     <select
//                                         name="productvariety"
//                                         value={formData.productvariety}
//                                         onChange={(e) => {
//                                             const selectedVariety = e.target.value;
//                                             setFormData(prev => ({
//                                                 ...prev,
//                                                 productvariety: selectedVariety,
//                                                 category: "",
//                                                 sub_category: ""
//                                             }));
//                                         }}
//                                         className='selectCss'
//                                     >
//                                         <option value="">Select Variety</option>
//                                         <option value="Human">Human</option>
//                                         <option value="Veterinary">Veterinary</option>
//                                     </select>
//                                     {errors.variety && <span className="herbal-error">{errors.variety}</span>}
//                                 </div>


//                                 <div className="herbal-form-group">
//                                     <label>Category*</label>
//                                     <select
//                                         name="category"
//                                         value={formData.category}
//                                         onChange={handleChange}
//                                         required
//                                     >
//                                         <option value="">Select Category</option>
//                                         {categoryList
//                                             .filter(cat => cat.variety === formData.productvariety
//                                             )
//                                             .map((sub, index) => (
//                                                 <option key={index} value={sub.name}>{sub.name}</option>
//                                             ))}
//                                     </select>
//                                     {errors.category && <span className="herbal-error">{errors.category}</span>}
//                                 </div>


//                                 <div className="herbal-form-group">
//                                     <label>Sub Category</label>
//                                     <select
//                                         name="sub_category"
//                                         value={formData.sub_category}
//                                         onChange={handleChange}
//                                         required
//                                     >
//                                         <option value="">Select subcategory</option>
//                                         {subCategoryList.map((sub, index) => (
//                                             <option key={index} value={sub.name}>{sub.name}</option>
//                                         ))}
//                                     </select>

//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Suitable For</label>
//                                     <input
//                                         type="text"
//                                         name="suitable_for"
//                                         value={formData.suitable_for}
//                                         onChange={handleChange}
//                                         placeholder="e.g., Adults, Children, All ages"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Product Details */}
//                         <div className="herbal-form-section">
//                             <h3>Product Details</h3>
//                             <div className="herbal-form-row">
//                                 <div className="herbal-form-group">
//                                     <label>Benefits (comma separated)</label>
//                                     <textarea
//                                         name="benefits"
//                                         value={formData.benefits}
//                                         onChange={handleChange}
//                                         placeholder="Enter benefits separated by commas"
//                                         rows="3"
//                                     />
//                                 </div>

//                                 <div className="herbal-form-group">
//                                     <label>Dosage/Usage Instructions*</label>
//                                     <textarea
//                                         name="dosage"
//                                         value={formData.dosage}
//                                         onChange={handleChange}
//                                         placeholder="Enter dosage instructions"
//                                         rows="3"
//                                     />
//                                     {errors.dosage && <span className="herbal-error">{errors.dosage}</span>}
//                                 </div>
//                             </div>

//                             <div className="herbal-form-group">
//                                 <label>Side Effects</label>
//                                 <textarea
//                                     name="side_effects"
//                                     value={formData.side_effects}
//                                     onChange={handleChange}
//                                     placeholder="Enter any known side effects"
//                                     rows="2"
//                                 />
//                             </div>
//                         </div>

//                         <div className="herbal-form-actions">
//                             <button type="button" onClick={handleReset} className="herbal-reset-btn">
//                                 Reset
//                             </button>
//                             {/* <p>{isEditMode ? "Edit Product" : "Add New Product"}</p> */}

//                             <button type="submit" className="herbal-submit-btn">
//                                 {isEditMode ? "Update Product" : "Submit Product"}
//                             </button>

//                         </div>
//                     </form>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default AddNewProduct


import React, { useEffect, useState, useRef } from 'react'
import axiosInstance from '../../../components/AxiosInstance';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import JoinUrl from '../../../JoinUrl';

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
        consumer_price: "", // kept for legacy — not used for variants
        discount: "",
        mrp: "",
        gst: "",
        stock: "yes",
        quantity: [], // legacy list of labels
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

                    // fetch subcategories
                    if (product.category) {
                        const subCategoryResponse = await axiosInstance.get(
                            `/user/allSubcategories?category=${encodeURIComponent(product.category)}`
                        );
                        setSubCategoryList(subCategoryResponse.data);
                    }

                    // normalize quantity rows
                    const normalizeRow = (r) => ({
                        label: r?.label ?? (typeof r === 'string' ? r : ''),
                        mrp: r?.mrp ?? "",
                        discount: r?.discount ?? "",
                        gst: r?.gst ?? "",
                        retail_price: r?.retail_price ?? "",
                        final_price: r?.final_price ?? "",
                        in_stock: (r?.in_stock ?? 'yes').toLowerCase() === 'no' ? 'no' : 'yes'
                    });

                    let quantityRows = [];
                    if (Array.isArray(product.quantity) && product.quantity.length > 0) {
                        quantityRows = product.quantity.map(normalizeRow);
                    } else if (Array.isArray(product.variants) && product.variants.length > 0) {
                        quantityRows = product.variants.map(normalizeRow);
                    }

                    setFormData(prev => ({
                        ...prev,
                        ...product,
                        expires_on: product.expires_on?.split?.('T')?.[0] ?? product.expires_on ?? "",
                        media: (product.media || []).map(m => ({
                            ...m,
                            url: m.url?.startsWith?.('http') ? m.url : `${m.url}`,
                            type: m.type?.includes?.('video') ? 'video' : 'image',
                            file: null
                        })),
                        stock: (() => {
                            const s = (product.stock ?? '').toLowerCase().trim();
                            return s === 'yes' ? 'yes' : s === 'no' ? 'no' : 'yes';
                        })(),
                        quantity: quantityRows
                    }));
                }
            } catch (error) {
                console.error("Error during initialization:", error);
            }
        };

        init();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // legacy single-price auto-calc
            const mrp = parseFloat(updated.mrp);
            const discount = parseFloat(updated.discount);
            const gst = parseFloat(updated.gst);
            let discountedPrice = 0;
            if (!isNaN(mrp) && !isNaN(discount)) discountedPrice = mrp - (mrp * (discount / 100));
            if (!isNaN(gst) && gst > 0) {
                const finalPrice = discountedPrice + (discountedPrice * (gst / 100));
                updated.consumer_price = isFinite(finalPrice) && finalPrice > 0 ? finalPrice.toFixed(2) : "";
            } else {
                updated.consumer_price = discountedPrice > 0 ? discountedPrice.toFixed(2) : "";
            }

            if (name === "category") {
                updated.sub_category = "";
                fetchSubCategories(value);
            }
            return updated;
        });
    };

    const addQuantityRow = () => {
        setFormData(prev => ({
            ...prev,
            quantity: [
                ...prev.quantity,
                { label: "", mrp: "", discount: "", gst: "", retail_price: "", final_price: "", in_stock: "yes" }
            ]
        }));
    };

    const removeQuantityRow = (index) => {
        setFormData(prev => {
            const q = [...prev.quantity];
            q.splice(index, 1);
            return { ...prev, quantity: q };
        });
    };

    const handleQuantityRowChange = (index, field, value) => {
        setFormData(prev => {
            const q = [...prev.quantity];
            q[index] = { ...q[index], [field]: value };

            // auto compute final_price when mrp/discount/gst changes
            const mrp = parseFloat(q[index].mrp);
            const discount = parseFloat(q[index].discount);
            const gst = parseFloat(q[index].gst);
            if (!isNaN(mrp)) {
                const discounted = !isNaN(discount) ? mrp * (1 - (discount / 100)) : mrp;
                const final = !isNaN(gst) ? discounted * (1 + (gst / 100)) : discounted;
                q[index].final_price = isFinite(final) && final > 0 ? final.toFixed(2) : "";
            } else {
                q[index].final_price = "";
            }

            return { ...prev, quantity: q };
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
            return { ...prev, media: updatedMedia };
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current.value = null;
        fileInputRef.current.click();
    };

    const validateForm = () => {
        const newErrors = {};
        const requiredFields = [
            'name', 'description', 'category', 'expires_on', 'dosage', 'productvariety'
        ];
        
        requiredFields.forEach(field => {
            if (!formData[field]) newErrors[field] = `${field.replace('_', ' ')} is required`;
        });

        // Validate at least one quantity row exists
        if (formData.quantity.length === 0) {
            newErrors.quantity = "At least one quantity/variant is required";
        } else {
            // Validate each quantity row
            formData.quantity.forEach((q, i) => {
                if (!q.label) newErrors[`quantity.${i}.label`] = "Quantity label is required";
                if (!q.mrp || isNaN(parseFloat(q.mrp))) newErrors[`quantity.${i}.mrp`] = "Valid MRP is required";
            });
        }

        // Validate media
        if (formData.media.length === 0) {
            newErrors.media = "At least one media file is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        try {
            const formPayload = new FormData();

            // Append all form data except media and quantity
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'media' || key === 'quantity') return;
                if (value !== null && value !== undefined) {
                    formPayload.append(key, value);
                }
            });

            // Append quantity as JSON string
            formPayload.append('quantity', JSON.stringify(formData.quantity));

            // Handle media files
            formData.media.forEach((mediaItem) => {
                if (mediaItem.file) {
                    formPayload.append('media', mediaItem.file);
                } else if (mediaItem.url) {
                    formPayload.append('existingMedia', mediaItem.url);
                }
            });

            let response;
            if (isEditMode) {
                response = await axiosInstance.put(`/user/updateProduct/${id}`, formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product updated successfully!');
            } else {
                response = await axiosInstance.post('/user/createProduct', formPayload, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Product created successfully!');
            }

            navigate('/pharma-admin/products');
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.message || 'Failed to submit product');
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
            stock: "yes",
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
            prescription: "required",
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
            setSubCategoryList(response.data);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
        }
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
                                    <button type="button" className="media-upload-btn" onClick={triggerFileInput}>
                                        Add Media
                                    </button>
                                    <p className="media-upload-hint">Supports JPG, PNG, GIF, MP4 (Max 10MB each)</p>
                                    <div className="media-preview-container">
                                        {formData.media.length === 0 ? (
                                            <div className="no-media-placeholder">No media selected</div>
                                        ) : (
                                            formData.media.map((media, index) => (
                                                <div key={index} className="media-preview-item">
                                                    {media.type === 'video' ? (
                                                        <video controls>
                                                            <source src={media.url} type={`video/${media.file?.name?.split('.').pop() || 'mp4'}`} />
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    ) : (
                                                        <img src={JoinUrl(media.url)} alt={`Preview ${index}`} />
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
                                                        <span className="media-size">{formatFileSize(media.size || 0)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                                {errors.media && <span className="herbal-error">{errors.media}</span>}
                            </div>

                            <div className="herbal-form-group">
                                <label>Prescription</label>
                                <select name="prescription" value={formData.prescription} onChange={handleChange}>
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
                        <h3>Quantity & Pricing</h3>
                        <p style={{ marginTop: -8, opacity: 0.8 }}>
                            Add each pack size (e.g., <i>8 fl oz, 16 fl oz, 1 L</i>) with its own price. Final price auto-calculates.
                        </p>

                        {errors.quantity && <div className="herbal-error" style={{ marginBottom: 10 }}>{errors.quantity}</div>}

                        {formData.quantity.map((q, i) => (
                            <div key={i} className="herbal-form-row" style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginBottom: 10 }}>
                                <div className="herbal-form-group">
                                    <label>Quantity Label*</label>
                                    <input
                                        type="text"
                                        value={q.label}
                                        onChange={(e) => handleQuantityRowChange(i, 'label', e.target.value)}
                                        placeholder="e.g., 8 fl oz (Bottle)"
                                    />
                                    {errors[`quantity.${i}.label`] && <span className="herbal-error">{errors[`quantity.${i}.label`]}</span>}
                                </div>
                                <div className="herbal-form-group">
                                    <label>MRP*</label>
                                    <input
                                        type="number"
                                        value={q.mrp}
                                        onChange={(e) => handleQuantityRowChange(i, 'mrp', e.target.value)}
                                        placeholder="0.00"
                                        min="0" 
                                        step="0.01"
                                    />
                                    {errors[`quantity.${i}.mrp`] && <span className="herbal-error">{errors[`quantity.${i}.mrp`]}</span>}
                                </div>
                                <div className="herbal-form-group">
                                    <label>Discount (%)</label>
                                    <input
                                        type="number"
                                        value={q.discount}
                                        onChange={(e) => handleQuantityRowChange(i, 'discount', e.target.value)}
                                        placeholder="0"
                                        min="0" 
                                        max="100"
                                    />
                                </div>
                                <div className="herbal-form-group">
                                    <label>GST (%)</label>
                                    <input
                                        type="number"
                                        value={q.gst}
                                        onChange={(e) => handleQuantityRowChange(i, 'gst', e.target.value)}
                                        placeholder="0"
                                        min="0" 
                                        step="0.01"
                                    />
                                </div>
                                <div className="herbal-form-group">
                                    <label>Final Consumer Price</label>
                                    <input 
                                        type="number" 
                                        value={q.final_price} 
                                        readOnly 
                                        placeholder="Auto" 
                                    />
                                </div>
                                <div className="herbal-form-group">
                                    <label>WholesalePartner Price</label>
                                    <input
                                        type="number"
                                        value={q.retail_price}
                                        onChange={(e) => handleQuantityRowChange(i, 'retail_price', e.target.value)}
                                        placeholder="Optional"
                                        min="0" 
                                        step="0.01"
                                    />
                                </div>
                                <div className="herbal-form-group">
                                    <label>In Stock</label>
                                    <select 
                                        value={q.in_stock} 
                                        onChange={(e) => handleQuantityRowChange(i, 'in_stock', e.target.value)}
                                    >
                                        <option value="yes">Yes</option>
                                        <option value="no">No</option>
                                    </select>
                                </div>

                                <div className="herbal-form-group" style={{ alignSelf: 'flex-end' }}>
                                    <button
                                        type="button"
                                        onClick={() => removeQuantityRow(i)}
                                        className="herbal-reset-btn"
                                        style={{ background: '#f44336', color: '#fff' }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button 
                            type="button" 
                            onClick={addQuantityRow} 
                            className="herbal-submit-btn" 
                            style={{ width: 'fit-content' }}
                        >
                            + Add Quantity
                        </button>
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
                                {errors.productvariety && <span className="herbal-error">{errors.productvariety}</span>}
                            </div>

                            <div className="herbal-form-group">
                                <label>Category*</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categoryList
                                        .filter(cat => cat.variety === formData.productvariety)
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
                                <label>Use By* (Expiry Date)</label>
                                <input 
                                    type="text" 
                                    name="expires_on" 
                                    value={formData.expires_on} 
                                    onChange={handleChange} 
                                />
                                {errors.expires_on && <span className="herbal-error">{errors.expires_on}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="herbal-form-section">
                        <h3>Product Details</h3>
                        <div className="herbal-form-row">
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
                        <button type="submit" className="herbal-submit-btn">
                            {isEditMode ? "Update Product" : "Submit Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewProduct;
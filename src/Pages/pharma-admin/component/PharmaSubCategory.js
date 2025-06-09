// import React, { useState, useEffect } from 'react';
// import axiosInstance from '../../../components/AxiosInstance';
// import API_URL from '../../../config';
// import CustomLoader from '../../../components/CustomLoader';


// const PharmaSubCategory = () => {
//     const [formData, setFormData] = useState({
//         name: '',
//         description: '',
//         image: '',
//         subcategory_id: '',
//         deleted_at: ''
//     });

//     const [subCategories, setSubCategories] = useState([]);
//     const [categories, setCategories] = useState([]);
//     const [showModal, setShowModal] = useState(false);
//     const [subCategoryList, setSubCategoryList] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [newCategory, setNewCategory] = useState({
//         name: '',
//         image: null,
//         category_id: '',
//     });

//     const fetchData = async () => {
//         try {
//             const response = await axiosInstance.get('/user/allcategories');
//             setCategories(response.data)
//         } catch (error) {
//             console.error("Error fetching categories:", error);
//         }
//         setLoading(false);
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);


//     const handleInputChange = (e) => {
//         const { name, value, files } = e.target;
//         setNewCategory((prev) => ({
//             ...prev,
//             [name]: files ? files[0] : value,
//         }));
//     };

//     const handleCreateSubCategory = async (e) => {
//         e.preventDefault();

//         const formData = new FormData();
//         formData.append('name', newCategory.name);
//         formData.append('image', newCategory.image);
//         formData.append('category_id', newCategory.category_id);

//         try {
//             const response = await axiosInstance.post(
//                 '/user/createSubCategory',
//                 formData
//             );

//             console.log("API Response:", response.data);
//             setShowModal(false);
//             fetchData();

//         } catch (error) {
//             console.error("Error submitting category:", error);
//             setShowModal(false);
//             alert("There was an error submitting the category. Please try again.");
//         }
//     };

//     const fetchSubCategories = async () => {
//         try {
//             const response = await axiosInstance.get('/user/allSubcategories');
//             console.log("Subcategories fetched:", response.data);
//             setSubCategoryList(response.data);
//         }
//         catch (error) {
//             console.error("Error fetching subcategories:", error);
//             alert("There was an error fetching subcategories. Please try again.");
//         }
//     }
//     useEffect(() => {
//         fetchSubCategories();
//     }, []);


//     return (
//         <>
//             <div className="admin-page">
//                 <div className="admin-header">
//                     <h2>Sub Category</h2>
//                     <button className="btn-add"
//                         onClick={() => setShowModal(true)}
//                     >Add New Sub Category</button>
//                 </div>

//                 {showModal && (
//                     <div className="modal-overlay">
//                         <div className="modal">
//                             <h3>Add New Category</h3>
//                             <form >
//                                 <select
//                                     name="category_id"
//                                     value={newCategory.category_id}
//                                     onChange={handleInputChange}
//                                     required
//                                     className='selectCss'
//                                 >
//                                     <option value="">Select Category</option>
//                                     {categories.map(cat => (
//                                         <option key={cat._id} value={cat._id}>{cat.name}</option>
//                                     ))}
//                                 </select>


//                                 <input
//                                     type="text"
//                                     name="name"
//                                     placeholder="Category Name"
//                                     value={newCategory.name}
//                                     onChange={handleInputChange}
//                                     required
//                                 />
//                                 <input
//                                     type="file"
//                                     name="image"
//                                     accept="image/*"
//                                     onChange={handleInputChange}
//                                     required
//                                 />
//                                 <div className="modal-actions">
//                                     <button
//                                         onClick={handleCreateSubCategory}
//                                         type="submit" className="btn-save">Save</button>
//                                     <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}

//                 {loading ? (<CustomLoader />) : (<div>
//                     <table className="admin-table">
//                         <thead>
//                             <tr>
//                                 <th>Name</th>
//                                 <th>Description</th>
//                                 <th>Image</th>
//                                 <th>Sub Category</th>
//                                 <th>Status</th>
//                                 <th>Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>

//                             {subCategoryList.map((item, i) => {
//                                 // console.log("Image URL:", item.category_id?.image);
//                                 return (
//                                     <tr key={i}>
//                                         <td>{item.category_id?.name || 'Unknown'}</td>
//                                         <td>{item.description}</td>
//                                         <td>
//                                             <img
//                                                 // src={`${API_URL}/${item.category_id?.image}`}
//                                                 src={item.category_id?.image}
//                                                 alt={item.name} width="60" height="60" style={{ borderRadius: '6px' }} />
//                                         </td>
//                                         <td>{item.name}</td>
//                                         <td>
//                                             {item.deleted_at ? (
//                                                 <span className="status-badge deleted">Deleted</span>
//                                             ) : (
//                                                 <span className="status-badge active">Active</span>
//                                             )}
//                                         </td>
//                                         <td>
//                                             <button onClick={() => startEditingSubCategory(item)} className="btn-edit">Edit</button>
//                                             <button onClick={() => handleDeleteSubCategory(item._id)} className="btn-delete">Delete</button>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>)}


//             </div>
//         </>
//     );
// };

// export default PharmaSubCategory;

import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';
import CustomLoader from '../../../components/CustomLoader';
import { toast } from 'react-toastify';

const PharmaSubCategory = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        category_id: '',
        subCategoryvariety: '', // New field added
    });
    const [filteredCategories, setFilteredCategories] = useState([]);


    const [editingId, setEditingId] = useState(null);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allcategories');
            setCategories(response.data);
            setFilteredCategories(response.data); // Set initially
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to fetch categories. Please try again.");
        }
        setLoading(false);
    };


    const fetchSubCategories = async () => {
        try {
            const response = await axiosInstance.get('/user/allSubcategories');
            setSubCategoryList(response.data);
            // toast.success("Sub Categories fetched successfully");
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            toast.error("Failed to fetch subcategories. Please try again.");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        fetchSubCategories();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "subCategoryvariety") {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
                category_id: '', // Reset category selection when variety changes
            }));

            const filtered = categories.filter(cat => cat.variety === value);
            setFilteredCategories(filtered);
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: files ? files[0] : value,
            }));
        }
    };



    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        const newFormData = new FormData();
        newFormData.append('name', formData.name);
        newFormData.append('description', formData.description);
        newFormData.append('image', formData.image);
        newFormData.append('category_id', formData.category_id);
        newFormData.append('subCategoryvariety', formData.subCategoryvariety);


        try {
            if (editingId) {
                // Edit mode
                await axiosInstance.put(`/user/updateSubCategory/${editingId}`, newFormData);
                toast.success("Sub Category updated successfully");
            } else {
                // Create mode
                await axiosInstance.post('/user/createSubCategory', newFormData);
                toast.success("Sub Category created successfully");
            }

            fetchSubCategories();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error submitting subcategory:", error);
            toast.error("There was an error. Please try again.");
        }
    };

    const startEditingSubCategory = (item) => {
        const selectedVariety = item.subCategoryvariety || '';
        const filtered = categories.filter(cat => cat.variety === selectedVariety);

        setFormData({
            name: item.name,
            description: item.description,
            image: '',
            category_id: item.category_id?._id || '',
            subCategoryvariety: selectedVariety,
        });

        setFilteredCategories(filtered);
        setEditingId(item._id);
        setShowModal(true);
    };


    const resetForm = () => {
        setFormData({ name: '', image: '', description: '', category_id: '', subCategoryvariety: '', });
        setEditingId(null);
    };

    const handleDeleteSubCategory = async (id) => {
        if (window.confirm("Are you sure you want to delete this subcategory?")) {
            try {
                await axiosInstance.delete(`/user/deleteSubCategory/${id}`);
                fetchSubCategories();
                toast.success("Subcategory deleted successfully");
            } catch (error) {
                console.error("Error deleting subcategory:", error);
                toast.error("Failed to delete subcategory. Please try again.");
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Sub Category</h2>
                <button className="btn-add" onClick={() => { setShowModal(true); resetForm(); }}>
                    Add New Sub Category
                </button>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{editingId ? "Edit Sub Category" : "Add New Sub Category"}</h3>
                        <form onSubmit={handleCreateOrUpdate}>
                            <select
                                name="subCategoryvariety"
                                value={formData.subCategoryvariety}
                                onChange={handleInputChange}
                                className='selectCss'
                                required
                            >
                                <option value="" disabled>Select Variety</option>
                                <option value="Human">Human</option>
                                <option value="Veterinary">Veterinary</option>
                            </select>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                required
                                className="selectCss"
                            >
                                <option value="">Select Category</option>
                                {filteredCategories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>


                            <input
                                type="text"
                                name="name"
                                placeholder="Sub Category Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Sub Category Description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />

                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleInputChange}
                                required={!editingId}
                            />

                            <div className="modal-actions">
                                <button type="submit" className="btn-save">
                                    {editingId ? "Update" : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <CustomLoader />
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Variety</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subCategoryList.map((item, i) => (
                            <tr key={i}>
                                <td>{item.subCategoryvariety || 'Unknown'}</td>
                                <td>{item.name || 'Unknown'}</td>
                                <td>{item.description || '-'}</td>
                                <td>
                                    <img
                                        src={`${API_URL}/${item.category_id?.image}`}
                                        alt={item.name}
                                        width="60"
                                        height="60"
                                        style={{ borderRadius: '6px' }}
                                    />
                                </td>
                                <td>{item.category_id?.name || 'Unknown'}</td>
                                <td>
                                    {item.deleted_at ? (
                                        <span className="status-badge deleted">Deleted</span>
                                    ) : (
                                        <span className="status-badge active">Active</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        onClick={() => startEditingSubCategory(item)}
                                        className="btn-edit"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSubCategory(item._id)}
                                        className="btn-delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PharmaSubCategory;


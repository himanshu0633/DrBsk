// import React, { useEffect, useState } from 'react'
// import axiosInstance from '../../../components/AxiosInstance';
// import API_URL from '../../../config';

// const PharmaCategory = () => {
//     const [showModal, setShowModal] = useState(false);
//     const [isSubmitted, setIsSubmitted] = useState(false);
//     const [categoryList, setCategoryList] = useState([]);
//     const [newCategory, setNewCategory] = useState({
//         name: '',
//         image: null,
//     });

//     const handleInputChange = (e) => {
//         const { name, value, files } = e.target;
//         setNewCategory((prev) => ({
//             ...prev,
//             [name]: files ? files[0] : value,
//         }));
//     };

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         console.log('Submitting category:', newCategory);
//         setShowModal(false);
//     };
    // const handleCreateCategory = async (e) => {
    //     e.preventDefault();

    //     const formData = new FormData();
    //     formData.append('name', newCategory.name);
    //     formData.append('image', newCategory.image);

    //     try {
    //         const response = await axiosInstance.post(
    //             '/user/createCategory',
    //             formData
    //         );

    //         console.log("API Response:", response.data);
    //         setShowModal(false);
    //         fetchData(); // refresh the list
    //     } catch (error) {
    //         console.error("Error submitting category:", error);
    //         setShowModal(false);
    //         alert("There was an error submitting the category. Please try again.");
    //     }
    // };


//     useEffect(() => {
//         fetchData();
//     }, [])

//     const fetchData = async () => {
//         try {
//             const response = await axiosInstance.get('/user/allcategories');
//             console.log("Fetched categories:", response.data);
//             setCategoryList(response.data);
//             setShowModal(false)
//         } catch (error) {
//             console.error("Error fetching categories:", error);
//         }
//     };
//     const handleEditCategory = ((e) => {
//         e.preventDefault();
//         const response = axiosInstance.put('/updateCategory/:id');
//     })
//     const handleDeleteCategory = ((e) => {
//         e.preventDefault();
//         const response = axiosInstance.delete('/deleteCategory/:id');
//     })


//     return (
//         <div>
//             <div className="admin-page">
//                 <div className="admin-header">
//                     <h2>Category</h2>
//                     <button className="btn-add" onClick={() => setShowModal(true)}>
//                         Add Category
//                     </button>
//                 </div>

//                 <table className="admin-table">
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Description</th>
//                             <th>Category ID</th>
//                             <th>Image</th>
//                             <th>Status</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {categoryList.map((user, index) => (
//                             <tr key={index}>
//                                 <td>{user.name}</td>
//                                 <td>{user.description}</td>
//                                 <td>{user.category_id}</td>
//                                 <td>
//                                     <img
//                                         src={`${API_URL}/${user.image}`}
//                                         alt={user.name}
//                                         width="60"
//                                         height="60"
//                                         style={{ borderRadius: '6px' }}
//                                     />

//                                 </td>
//                                 <td>
//                                     {user.deleted_at ? (
//                                         <span className="status-badge deleted">Deleted</span>
//                                     ) : (
//                                         <span className="status-badge active">Active</span>
//                                     )}
//                                 </td>
//                                 <td>
//                                     <button onClick={handleEditCategory} className="btn-edit">Edit</button>
//                                     <button onClick={handleDeleteCategory} className="btn-delete">Delete</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>

//                 {/* Modal */}
//                 {showModal && (
//                     <div className="modal-overlay">
//                         <div className="modal">
//                             <h3>Add New Category</h3>
//                             <form onSubmit={handleSubmit}>
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
//                                     <button onClick={handleCreateCategory} type="submit" className="btn-save">Save</button>
//                                     <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }

// export default PharmaCategory



import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';

const PharmaCategory = () => {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [newCategory, setNewCategory] = useState({
        name: '',
        image: null,
    });

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            handleUpdateCategory();
        } else {
            handleCreateCategory(e);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', newCategory.name);
        formData.append('image', newCategory.image);

        try {
            await axiosInstance.post('/user/createCategory', formData);
            fetchData();
            resetForm();
        } catch (error) {
            console.error("Error creating category:", error);
            alert("Error creating category.");
        }
    };

    const handleUpdateCategory = async () => {
        const formData = new FormData();
        formData.append('name', newCategory.name);
        if (newCategory.image) {
            formData.append('image', newCategory.image);
        }

        try {
            const res = await axiosInstance.put(`/user/updateCategory/${editingCategoryId}`, formData);
            console.log("Update Success:", res.data);
            fetchData();
            resetForm();
        } catch (error) {
            console.error("Error updating category:", error.response?.data || error.message);
            alert("Failed to update category: " + (error.response?.data?.message || error.message));
        }
    };


    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await axiosInstance.delete(`/user/deleteCategory/${id}`);
            console.log("Delete Success:", res.data);
            fetchData();
        } catch (error) {
            console.error("Error deleting category:", error.response?.data || error.message);
            alert("Failed to delete category: " + (error.response?.data?.message || error.message));
        }
    };


    const handleEditCategory = (category) => {
        setNewCategory({ name: category.name, image: null });
        setEditingCategoryId(category.category_id);
        setIsEditing(true);
        setShowModal(true);
    };

    const resetForm = () => {
        setNewCategory({ name: '', image: null });
        setIsEditing(false);
        setEditingCategoryId(null);
        setShowModal(false);
    };

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allcategories');
            setCategoryList(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2>Category</h2>
                <button className="btn-add" onClick={() => { setShowModal(true); setIsEditing(false); }}>
                    Add Category
                </button>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Category ID</th>
                        <th>Image</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {categoryList.map((cat, index) => (
                        <tr key={index}>
                            <td>{cat.name}</td>
                            <td>{cat.description}</td>
                            <td>{cat.category_id}</td>
                            <td>
                                <img
                                    src={`${API_URL}/${cat.image}`}
                                    alt={cat.name}
                                    width="60"
                                    height="60"
                                    style={{ borderRadius: '6px' }}
                                />
                            </td>
                            <td>
                                {cat.deleted_at ? (
                                    <span className="status-badge deleted">Deleted</span>
                                ) : (
                                    <span className="status-badge active">Active</span>
                                )}
                            </td>
                            <td>
                                <button onClick={() => handleEditCategory(cat)} className="btn-edit">Edit</button>
                                <button onClick={() => handleDeleteCategory(cat.category_id)} className="btn-delete">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleInputChange}
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn-save">{isEditing ? "Update" : "Save"}</button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmaCategory;

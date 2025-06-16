import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';
import CustomLoader from '../../../components/CustomLoader';

const PharmaCategory = () => {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState({
        variety: '',
        name: '',
        description: '',
        image: null,
    });

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: name === "image" ? files[0] : value,
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
        formData.append('variety', newCategory.variety);
        formData.append('name', newCategory.name);
        formData.append('description', newCategory.description);
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
        formData.append('variety', newCategory.variety);
        formData.append('name', newCategory.name);
        formData.append('description', newCategory.description);

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

    const startEditingCategory = (cat) => {
        setIsEditing(true);
        setEditingCategoryId(cat._id);
        setNewCategory({
            variety: cat.variety || '',
            name: cat.name || '',
            description: cat.description || '',
            image: null,
        });
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
        setLoading(false);
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
            {loading ? (<CustomLoader />) : (<div className='overflow_x_auto'>
                <table className="admin-table w_970">
                    <thead>
                        <tr>
                            <th>Variety</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categoryList.map((cat, index) => (
                            <tr key={index}>
                                <td>{cat.variety}</td>
                                <td>{cat.name}</td>
                                <td>{cat.description}</td>
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
                                    <button onClick={() => startEditingCategory(cat)} className="btn-edit">Edit</button>
                                    <button onClick={() => handleDeleteCategory(cat._id)} className="btn-delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>)}


            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <span className="close-button" onClick={resetForm}>&times;</span>
                        <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
                        <form onSubmit={handleSubmit}>
                            <select
                                name="variety"
                                value={newCategory.variety}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="selectVariety">Select Variety</option>
                                <option value="Human">Human</option>
                                <option value="Veterinary">Veterinary</option>
                            </select>
                            <input
                                type="text"
                                name="name"
                                placeholder="Category Name"
                                value={newCategory.name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Category Description"
                                value={newCategory.description}
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
                                <button type="submit" className="btn-save">
                                    {isEditing ? "Update" : "Save"}
                                </button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>
    );
};

export default PharmaCategory;



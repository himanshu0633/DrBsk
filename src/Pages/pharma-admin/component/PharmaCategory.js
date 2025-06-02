import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';

const PharmaCategory = () => {
    const [showModal, setShowModal] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
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
        console.log('Submitting category:', newCategory);
        setShowModal(false);
    };
    const handleCreateCategory = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', newCategory.name);
        formData.append('image', newCategory.image);

        try {
            const response = await axiosInstance.post(
                '/user/createCategory',
                formData
            );

            console.log("API Response:", response.data);
            setShowModal(false);
            fetchData(); // refresh the list
        } catch (error) {
            console.error("Error submitting category:", error);
            setShowModal(false);
            alert("There was an error submitting the category. Please try again.");
        }
    };


    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allcategories');
            console.log("Fetched categories:", response.data);
            setCategoryList(response.data);
            setShowModal(false)
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

 

    return (
        <div>
            <div className="admin-page">
                <div className="admin-header">
                    <h2>Category</h2>
                    <button className="btn-add" onClick={() => setShowModal(true)}>
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
                        {categoryList.map((user, index) => (
                            <tr key={index}>
                                <td>{user.name}</td>
                                <td>{user.description}</td>
                                <td>{user.category_id}</td>
                                <td>
                                    <img
                                        src={`${API_URL}/${user.image}`}
                                        alt={user.name}
                                        width="60"
                                        height="60"
                                        style={{ borderRadius: '6px' }}
                                    />

                                </td>
                                <td>
                                    {user.deleted_at ? (
                                        <span className="status-badge deleted">Deleted</span>
                                    ) : (
                                        <span className="status-badge active">Active</span>
                                    )}
                                </td>
                                <td>
                                    <button className="btn-edit">Edit</button>
                                    <button className="btn-delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal */}
                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Add New Category</h3>
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
                                    required
                                />
                                <div className="modal-actions">
                                    <button onClick={handleCreateCategory} type="submit" className="btn-save">Save</button>
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default PharmaCategory

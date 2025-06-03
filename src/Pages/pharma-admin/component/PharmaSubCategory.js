import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';


const PharmaSubCategory = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        subcategory_id: '',
        deleted_at: ''
    });

    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [newCategory, setNewCategory] = useState({
        name: '',
        image: null,
        category_id: '',
    });


    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allcategories');
            setCategories(response.data)
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setNewCategory((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleCreateSubCategory = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', newCategory.name);
        formData.append('image', newCategory.image);
        formData.append('category_id', newCategory.category_id);

        try {
            const response = await axiosInstance.post(
                '/user/createSubCategory',
                formData
            );

            console.log("API Response:", response.data);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error("Error submitting category:", error);
            setShowModal(false);
            alert("There was an error submitting the category. Please try again.");
        }
    };

    const fetchSubCategories = async () => {
        try {
            const response = await axiosInstance.get('/user/allSubcategories');
            console.log("Subcategories fetched:", response.data);
            setSubCategoryList(response.data);
        }
        catch (error) {
            console.error("Error fetching subcategories:", error);
            alert("There was an error fetching subcategories. Please try again.");
        }
    }
    useEffect(() => {
        fetchSubCategories();
    }, []);


    return (
        <>
            <div className="admin-page">
                <div className="admin-header">
                    <h2>Sub Category</h2>
                    <button className="btn-add"
                        onClick={() => setShowModal(true)}
                    >Add New Sub Category</button>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal">
                            <h3>Add New Category</h3>
                            <form >
                                <select
                                    name="category_id"
                                    value={newCategory.category_id}
                                    onChange={handleInputChange}
                                    required
                                    className='selectCss'
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
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
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    // onChange={handleInputChange}
                                    required
                                />
                                <div className="modal-actions">
                                    <button
                                        onClick={handleCreateSubCategory}
                                        type="submit" className="btn-save">Save</button>
                                    <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Image</th>
                            <th>Sub Category</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>

                        {subCategoryList.map((item, i) => {
                            // console.log("Image URL:", item.category_id?.image);
                            return (
                                <tr key={i}>
                                    <td>{item.category_id?.name || 'Unknown'}</td>
                                    <td>{item.description}</td>
                                    <td>
                                        <img
                                            // src={`${API_URL}/${item.category_id?.image}`}
                                            src={item.category_id?.image}
                                            alt={item.name} width="60" height="60" style={{ borderRadius: '6px' }} />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>
                                        {item.deleted_at ? (
                                            <span className="status-badge deleted">Deleted</span>
                                        ) : (
                                            <span className="status-badge active">Active</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default PharmaSubCategory;

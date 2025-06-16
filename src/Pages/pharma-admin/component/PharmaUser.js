// import React, { useEffect, useState } from 'react'
// import axiosInstance from '../../../components/AxiosInstance';
// import CustomLoader from '../../../components/CustomLoader';

// const PharmaUser = () => {
//     const [users, setUsers] = useState([]);
//     const [loading, setloading] = useState(true);
//     const [showModal, setShowModal] = useState(false);


//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axiosInstance.get('/admin/readallAdmins');
//                 console.log("Fetched users:", response.data);
//                 setUsers(response.data.data);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         };
//         fetchData();
//         setloading(false);
//     }, []);

//     function startEditingUser(user) {
//         console.log("Editing user:", user);

//         setShowModal(true);
//     }
//     function deleteUser() {

//     }


//     return (
//         <div className="user-content">
//             <div className="user-header">
//                 <h2>Users</h2>
//             </div>

//             <div className="user-table-container">
//                 <table className="user-table">
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Email</th>
//                             <th>Role</th>
//                             <th>Address</th>
//                             <th>Status</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     {loading ? (<CustomLoader />) : (<tbody>
//                         {users.map((user, index) => (
//                             <tr key={index}>
//                                 <td data-label="Name">{user.name}</td>
//                                 <td data-label="Email">{user.email}</td>
//                                 <td data-label="Role">{user.role}</td>
//                                 <td data-label="Address">{user.address || 'N/A'}</td>
//                                 <td data-label="Status">
//                                     {user.deleted_at ? (
//                                         <span className="status-badge deleted">Deleted</span>
//                                     ) : (
//                                         <span className="status-badge active">Active</span>
//                                     )}
//                                 </td>
//                                 <td data-label="Actions" className="actions-cell">
//                                     <button onClick={() => startEditingUser(user)} className="btn-action btn-edit">Edit</button>
//                                     <button onClick={() => deleteUser(user._id)} className="btn-action btn-delete">Delete</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>)}

//                 </table>
//             </div>

//             {showModal && (
//                 <div className="modal-overlay">
//                     <div className="modal">
//                         <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
//                         <form onSubmit={handleSubmit}>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 placeholder="Category Name"
//                                 value={newCategory.name}
//                                 onChange={handleInputChange}
//                                 required
//                             />
//                             <input
//                                 type="text"
//                                 name="description"
//                                 placeholder="Category Description"
//                                 value={newCategory.description}
//                                 onChange={handleInputChange}
//                                 required
//                             />
//                             <input
//                                 type="file"
//                                 name="image"
//                                 accept="image/*"
//                                 onChange={handleInputChange}
//                             />
//                             <div className="modal-actions">
//                                 <button type="submit" className="btn-save">{isEditing ? "Update" : "Save"}</button>
//                                 <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//         </div>
//     )
// }

// export default PharmaUser



import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import CustomLoader from '../../../components/CustomLoader';
import { toast } from 'react-toastify';

const PharmaUser = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        address: '',
        phone: '',
    });

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/admin/readallAdmins');
            setUsers(response.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const startEditingUser = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address || '',
            phone: user.phone || '',
        });
        setShowModal(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/admin/updateAdmin/${selectedUser._id}`, formData);
            setShowModal(false);
            setSelectedUser(null);
            fetchUsers();
            toast.success("User updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("Failed to update user.");
        }
    };

    const deleteUser = async (userId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (!confirmDelete) return;

        try {
            await axiosInstance.delete(`/admin/deleteAdmin/${userId}`);
            fetchUsers();
            toast.success("User deleted successfully!");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user.");
        }
    };

    const resetForm = () => {
        setShowModal(false);
        setFormData({ name: '', email: '', role: '', address: '' });
        setSelectedUser(null);
    };

    return (
        <div className="user-content">
            <div className="user-header">
                <h2>Users</h2>
            </div>

            <div className="user-table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Address</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    {loading ? (
                        <CustomLoader />
                    ) : (
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.address || 'N/A'}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>
                                        {user.deleted_at ? (
                                            <span className="status-badge deleted">Deleted</span>
                                        ) : (
                                            <span className="status-badge active">Active</span>
                                        )}
                                    </td>
                                    <td className="actions-cell">
                                        <button onClick={() => startEditingUser(user)} className="btn-action btn-edit">Edit</button>
                                        <button onClick={() => deleteUser(user._id)} className="btn-action btn-delete">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Edit User</h3>
                        <form className='modalInput' onSubmit={handleUpdateUser}>
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="role"
                                placeholder="Role"
                                value={formData.role}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="address"
                                placeholder="Address"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                            <input
                                type='tel'
                                name='phone'
                                placeholder='Phone Number'
                                value={formData.phone}
                                onChange={handleInputChange}
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn-save">Update</button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PharmaUser;


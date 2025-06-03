import React, { useEffect, useState } from 'react'
import axiosInstance from '../../../components/AxiosInstance';

const PharmaUser = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axiosInstance.get('/admin/readallAdmins');
                console.log("Fetched users:", response.data);
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

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
                            <th>User ID</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* {users.map((user, index) => (
                            <tr key={index}>
                                <td data-label="Name">{user.name}</td>
                                <td data-label="Email">{user.email}</td>
                                <td data-label="User ID">{user.user_id}</td>
                                <td data-label="Role">{user.role}</td>
                                <td data-label="Status">
                                    {user.deleted_at ? (
                                        <span className="status-badge deleted">Deleted</span>
                                    ) : (
                                        <span className="status-badge active">Active</span>
                                    )}
                                </td>
                                <td data-label="Actions" className="actions-cell">
                                    <button className="btn-action btn-edit">Edit</button>
                                    <button className="btn-action btn-delete">Delete</button>
                                </td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default PharmaUser

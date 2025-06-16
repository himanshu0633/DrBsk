import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import { toast } from 'react-toastify';
import CustomLoader from '../../../components/CustomLoader';

const PharmaWholeSale = () => {
    const [wholeSaleUsers, setWholeSaleUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allWholesalePartners');
            setWholeSaleUsers(response.data.data);
        } catch (error) {
            console.error("Error fetching wholesale users:", error);
        }
        setLoading(false)
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async () => {
        if (!selectedUserId || !pendingStatus) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axiosInstance.put(
                `/user/updateWholesalePartner/${selectedUserId}`,
                { status: pendingStatus },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                // alert(`User status updated to "${pendingStatus}"`);
                setSelectedUserId(null);
                setPendingStatus(null);
                setShowActionModal(false);
                fetchData();
                toast.success(`User status updated to "${pendingStatus}"`)
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error updating status. Please try again.");
        }
    };

    const handleCancel = () => {
        setSelectedUserId(null);
        setPendingStatus(null);
        setShowActionModal(false);
    };

    return (
        <div className="user-content">
            <div className="user-header">
                <h2>Wholesale Users</h2>
            </div>

            <div className="user-table-container tableOverflow">
                {loading ? <CustomLoader /> : (
                    <table className="user-table tableWidth">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Website</th>
                                <th>GST Number</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Country</th>
                                <th>State</th>
                                <th>City</th>
                                <th>Street</th>
                                <th>Zip Code</th>
                                <th>Billing Email</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wholeSaleUsers.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.companyName}</td>
                                    <td>{user.website}</td>
                                    <td>{user.gstNumber}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone}</td>
                                    <td>{user.country}</td>
                                    <td>{user.state}</td>
                                    <td>{user.city}</td>
                                    <td>{user.street}</td>
                                    <td>{user.zipcode}</td>
                                    <td>{user.billingEmail}</td>
                                    <td className={
                                        user.status === 'Pending' ? 'clrOrange' :
                                            user.status === 'Accepted' ? 'clrGreen' :
                                                'clrRed'
                                    }>
                                        {user.status}
                                    </td>

                                    <td>
                                        <button
                                            onClick={() => {
                                                setSelectedUserId(user._id);
                                                setShowActionModal(true);
                                            }}
                                            className="btn-action btn-update"
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>)}

                {/* {showActionModal && (
                    <div className="modal-overlay">
                        <div className="action-dropdown">
                            
                            <div className="actionFlex">
                                <button
                                    onClick={() => setPendingStatus('Accepted')}
                                    className={`btn-action btn-edit ${pendingStatus === 'Accepted' ? 'active' : ''}`}
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={() => setPendingStatus('Rejected')}
                                    className={`btn-action btn-delete ${pendingStatus === 'Rejected' ? 'active' : ''}`}
                                >
                                    Reject
                                </button>
                            </div>

                            {pendingStatus && (
                                <div className="actionFlex">
                                    <button onClick={handleStatusUpdate} className="btn-action btn-accept">Submit</button>
                                    <button onClick={handleCancel} className="btn-action btn-cancel">Cancel</button>
                                </div>
                            )}
                        </div>
                    </div>
                )} */}

                {showActionModal && (
                    <div className="modal-overlay">
                        <div className="action-dropdown">

                            {/* Dropdown for Accept/Reject */}
                            <div className="actionFlex">
                                <select
                                    value={pendingStatus || ''}
                                    onChange={(e) => setPendingStatus(e.target.value)}
                                    className="dropdown-select"
                                >
                                    <option value="" disabled>Select Action</option>
                                    <option value="Accepted">Accept</option>
                                    <option value="Rejected">Reject</option>
                                </select>
                            </div>

                            {/* Submit and Cancel Buttons (Always visible) */}
                            <div className="actionFlex">
                                <button
                                    onClick={handleStatusUpdate}
                                    className="btn-action btn-edit"
                                    disabled={!pendingStatus}
                                >
                                    Submit
                                </button>
                                <button onClick={handleCancel} className="btn-action btn-cancel">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PharmaWholeSale;


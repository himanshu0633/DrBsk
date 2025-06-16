import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import CustomLoader from '../../../components/CustomLoader';
import API_URL from '../../../config';

const PharmaPrescription = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allPrescriptions');
            const prescriptionData = response.data;
            setPrescriptions(prescriptionData);
            console.log("API Response:", prescriptionData);

            // Get unique userIds
            const uniqueUserIds = [
                ...new Set(prescriptionData.map(item => item.userId))
            ];

            // Fetch user details for each userId
            const userResponses = await Promise.all(
                uniqueUserIds.map(userId =>
                    axiosInstance.get(`/admin/readAdmin/${userId}`)
                )
            );

            // Map userId to user data
            const userMap = {};
            userResponses.forEach((res, index) => {
                const userId = uniqueUserIds[index];
               userMap[userId] = res.data?.data || res.data; 
            });

            setUsers(userMap);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            {loading ? (
                <CustomLoader />
            ) : (
                <div className='bannerFlex'>
                    {prescriptions.map((item, i) => (
                        <div key={i} className='bannerCard'>
                            <img
                                className='bannerImg'
                                src={`${API_URL}/${item?.image?.replace(/\\/g, '/')}`}
                                alt={`Prescription ${i + 1}`}
                            />
                            {/* <p>User ID: {item.userId}</p> */}
                            <h3>User Name: {users[item.userId]?.name || 'Loading...'}</h3>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PharmaPrescription;

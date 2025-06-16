
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';
import CustomLoader from '../../../components/CustomLoader';
import { toast } from 'react-toastify';

const PharmaBanner = () => {
    const [formData, setFormData] = useState({ image: '', category_id: '' });
    const [showModal, setShowModal] = useState(false);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const bannerList = [
        { id: 1, title: "main" },
        { id: 2, title: "carousel" },
        { id: 3, title: "carousel1" },
        { id: 4, title: "carousel2" }
    ];

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };

    const handleBannerSubmit = async (e) => {
        e.preventDefault();

        const selectedType = bannerList.find(b => b.id === parseInt(formData.category_id))?.title;

        if (!selectedType || !formData.image) {
            alert("Please select a banner type and upload an image.");
            return;
        }

        const data = new FormData();
        data.append('type', selectedType);
        data.append('slider_image', formData.image);

        try {
            const response = await axiosInstance.post('/user/createBanner', data);
            console.log("API Response:", response.data);
            toast.success("Banner uploaded successfully!");
            setFormData({ image: '', category_id: '' });
            setShowModal(false);
            fetchData(); 

        } catch (error) {
            console.error("Error submitting banner:", error);
            alert("There was an error submitting the banner. Please try again.");
            toast.error("There was an error submitting the banner. Please try again.");
        }

    };

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allBanners');
            console.log("API Response:", response.data);
            setBanners(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
        setLoading(false)
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2 className='bannerTitlesize'>Banner Management</h2>
            </div>

            <div className='BannerbtnFlex'>
                <div>
                    <button
                        type="button"
                        className="btn-save"
                        onClick={() => setShowModal(true)}
                    >
                        Add Banner
                    </button>
                </div>
            </div>

            {loading ? <CustomLoader /> : (<div className='bannerFlex'>
                {banners.map((item, i) => {
                    return (
                        <div key={i} className='bannerCard'>
                            <img className='bannerImg' src={`${API_URL}/${item.slider_image}`} alt={`Banner ${i + 1}`} />
                            <p>{item.type}</p>
                        </div>
                    )
                })}
            </div>)}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Add New Banner</h3>
                        <form onSubmit={handleBannerSubmit}>
                            <select
                                name="category_id"
                                value={formData.category_id || ''}
                                onChange={handleInputChange}
                                required
                                className="selectCss"
                            >
                                <option value="">Select Banner Type</option>
                                {bannerList.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.title}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleInputChange}
                                required
                            />

                            <div className="modal-actions">
                                <button type="submit" className="btn-save" >Save</button>
                                <button
                                    type="button"
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                >
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

export default PharmaBanner;


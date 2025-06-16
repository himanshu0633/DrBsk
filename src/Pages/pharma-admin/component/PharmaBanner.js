
// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../components/AxiosInstance';
// import API_URL from '../../../config';
// import CustomLoader from '../../../components/CustomLoader';
// import { toast } from 'react-toastify';
// import API_URL from '../../../config';
// import {
//     Box,
//     Typography,
//     CircularProgress,
//     Avatar,
//     useMediaQuery,
//     useTheme,
//     Container,
//     Tooltip,
//     Modal,
//     Backdrop,
//     Fade,
//     IconButton,
//     Table,
//     TableBody,
//     TableCell,
//     TableContainer,
//     TableHead,
//     TableRow,
//     Paper,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

// const PharmaBanner = () => {
//     const [formData, setFormData] = useState({ image: '', category_id: '' });
//     const [showModal, setShowModal] = useState(false);
//     const [banners, setBanners] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const bannerList = [
//         { id: 1, title: "main" },
//         { id: 2, title: "carousel" },
//         { id: 3, title: "carousel1" },
//         { id: 4, title: "carousel2" }
//     ];

//     const handleInputChange = (e) => {
//         const { name, value, files } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: files ? files[0] : value,
//         }));
//     };

//     const handleBannerSubmit = async (e) => {
//         e.preventDefault();

//         const selectedType = bannerList.find(b => b.id === parseInt(formData.category_id))?.title;

//         if (!selectedType || !formData.image) {
//             alert("Please select a banner type and upload an image.");
//             return;
//         }

//         const data = new FormData();
//         data.append('type', selectedType);
//         data.append('slider_image', formData.image);

//         try {
//             const response = await axiosInstance.post('/user/createBanner', data);
//             console.log("API Response:", response.data);
//             toast.success("Banner uploaded successfully!");
//             setFormData({ image: '', category_id: '' });
//             setShowModal(false);
//             fetchData(); 

//         } catch (error) {
//             console.error("Error submitting banner:", error);
//             alert("There was an error submitting the banner. Please try again.");
//             toast.error("There was an error submitting the banner. Please try again.");
//         }

//     };

//     const fetchData = async () => {
//         try {
//             const response = await axiosInstance.get('/user/allBanners');
//             console.log("API Response:", response.data);
//             setBanners(response.data);
//         } catch (error) {
//             console.error("Error fetching categories:", error);
//         }
//         setLoading(false)
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     return (
//         <div className="admin-page">
//             <div className="admin-header">
//                 <h2 className='bannerTitlesize'>Banner Management</h2>
//             </div>

//             <div className='BannerbtnFlex'>
//                 <div>
//                     <button
//                         type="button"
//                         className="btn-save"
//                         onClick={() => setShowModal(true)}
//                     >
//                         Add Banner
//                     </button>
//                 </div>
//             </div>

//             {loading ? <CustomLoader /> : (<div className='bannerFlex'>
//                 {banners.map((item, i) => {
//                     return (
//                         <div key={i} className='bannerCard'>
//                             <img className='bannerImg' src={`${API_URL}/${item.slider_image}`} alt={`Banner ${i + 1}`} />
//                             <p>{item.type}</p>
//                         </div>
//                     )
//                 })}
//             </div>)}

//             {showModal && (
//                 <div className="modal-overlay">
//                     <div className="modal-content">
//                         <h3>Add New Banner</h3>
//                         <form onSubmit={handleBannerSubmit}>
//                             <select
//                                 name="category_id"
//                                 value={formData.category_id || ''}
//                                 onChange={handleInputChange}
//                                 required
//                                 className="selectCss"
//                             >
//                                 <option value="">Select Banner Type</option>
//                                 {bannerList.map(item => (
//                                     <option key={item.id} value={item.id}>
//                                         {item.title}
//                                     </option>
//                                 ))}
//                             </select>

//                             <input
//                                 type="file"
//                                 name="image"
//                                 accept="image/*"
//                                 onChange={handleInputChange}
//                                 required
//                             />

//                             <div className="modal-actions">
//                                 <button type="submit" className="btn-save" >Save</button>
//                                 <button
//                                     type="button"
//                                     className="btn-cancel"
//                                     onClick={() => setShowModal(false)}
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}


//         </div>
//     );
// };

// export default PharmaBanner;




import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';
import CustomLoader from '../../../components/CustomLoader';
import { toast } from 'react-toastify';
import API_URL from '../../../config';
import {
    Box,
    Typography,
    CircularProgress,
    Avatar,
    useMediaQuery,
    useTheme,
    Container,
    Tooltip,
    Modal,
    Backdrop,
    Fade,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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


<Container maxWidth="lg" sx={{ mt: 5 }}>
    <Typography
        variant="h4"
        gutterBottom
        sx={{
            fontWeight: 700,
            color: '#68171b',
            mb: 4,
        }}
    >
        Banner Management
    </Typography>

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

    {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress />
        </Box>
    ) : (
        <Box sx={{ overflow: 'auto' }}>
            <TableContainer component={Paper} sx={{ borderRadius: 2, minWidth: '900px' }}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#68171b' }}>
                        <TableRow>
                            <TableCell><strong>User</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Prescription Image</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {prescriptions.map((item, i) => {
                            const user = users[item.userId];
                            return (
                                <TableRow key={i}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Tooltip title={user?.name || ''}>
                                                <Avatar
                                                    alt={user?.name}
                                                    src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'U'}`}
                                                    sx={{ mr: 2 }}
                                                />
                                            </Tooltip>
                                            {user?.name || 'Loading...'}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{user?.email || ''}</TableCell>
                                    <TableCell>
                                        <img
                                            src={`${API_URL}/${item.image?.replace(/\\/g, '/')}`}
                                            alt={`Prescription ${i + 1}`}
                                            onClick={() => handleImageClick(item.image)}
                                            style={{
                                                width: '150px',
                                                height: 'auto',
                                                borderRadius: 8,
                                                cursor: 'pointer',
                                                border: '1px solid #ccc',
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )}


    {/* Modal for full image view */}
    <Modal
        open={Boolean(selectedImage)}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
            timeout: 500,
            sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
        }}
    >
        <Fade in={Boolean(selectedImage)}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    outline: 'none',
                }}
            >
                <IconButton
                    onClick={handleCloseModal}
                    sx={{
                        position: 'absolute',
                        top: '-50px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: '#fff',
                        zIndex: 1000,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.8)',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <img
                    src={selectedImage}
                    alt="Full Prescription"
                    style={{
                        height: '400px',
                        width: '800px',
                        borderRadius: 12,
                        display: 'block',
                    }}
                />
            </Box>
        </Fade>
    </Modal>
</Container>


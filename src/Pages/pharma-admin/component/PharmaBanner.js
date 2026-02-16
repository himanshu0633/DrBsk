import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import API_URL from '../../../config';
import { toast } from 'react-toastify';
import {
    Box,
    Typography,
    CircularProgress,
    Container,
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
    Button,
    TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Add, Delete } from '@mui/icons-material';
import JoinUrl from '../../../JoinUrl';

const PharmaBanner = () => {
    const [formData, setFormData] = useState({ image: '', banner_type: '' });
    const [showModal, setShowModal] = useState(false);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const bannerList = [
        { id: 1, title: "HomePageSlider" },
        { id: 2, title: "MiddleSlider" },
        { id: 3, title: "EndSlider" },
        // { id: 4, title: "carousel2" }
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

        const selectedType = bannerList.find(b => b.id === parseInt(formData.banner_type))?.title;

        if (!selectedType || !formData.image) {
            toast.error("Please select a banner type and upload an image.");
            return;
        }

        const data = new FormData();
        data.append('type', selectedType);
        data.append('slider_image', formData.image);

        try {
            const response = await axiosInstance.post('/user/createBanner', data);
            toast.success("Banner uploaded successfully!");
            setFormData({ image: '', banner_type: '' });
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error("There was an error submitting the banner. Please try again.");
            console.error("Error submitting banner:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/user/allBanners');
            setBanners(response.data);
        } catch (error) {
            console.error("Error fetching banners:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageClick = (url) => {
        setSelectedImage(url);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };
    
    const handleDeleteBanner = async (id) => {
        if (window.confirm("Are you sure you want to delete this banner?")) {
            try {
                await axiosInstance.delete(`/user/deleteBanner/${id}`);
                fetchData();
                toast.success("Banner deleted successfully");
            } catch (error) {
                console.error("Error deleting Banner:", error);
                toast.error("Failed to delete Banner. Please try again.");
            }
        }
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const currentBanners = banners.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Typography
                variant="h4"
                gutterBottom
                className='fontSize25sml'
                sx={{
                    fontWeight: 700,
                    color: 'black',
                    mb: 4,
                }}
            >
                Banner Management
            </Typography>

            <Box sx={{
                display: 'flex',
                justifyContent: 'end',
                alignItems: 'center',
                my: 3
            }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => setShowModal(true)}
                >
                    Add Banner
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ mt: 4 }}>
                    <TableContainer component={Paper} >
                        <Table>
                            <TableHead sx={{ backgroundColor: '#68171b' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white' }}><strong>Banner Type</strong></TableCell>
                                    <TableCell sx={{ color: 'white' }}><strong>Image</strong></TableCell>
                                    <TableCell sx={{ color: 'white' }}><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentBanners.map((item, i) => {
                                    // Check type of slider_image, fallback to empty string or suitable default
                                    const sliderPath =
                                        Array.isArray(item.slider_image) && item.slider_image.length > 0
                                            ? item.slider_image[0]
                                            : '';

                                    const imageUrl = sliderPath ? JoinUrl(API_URL, sliderPath) : '';

                                    return (
                                        <TableRow key={i}>
                                            <TableCell>{item.type}</TableCell>
                                            <TableCell>
                                                <img
                                                    src={imageUrl}
                                                    alt={`Banner ${i + 1}`}
                                                    style={{ width: 200, height: 130, cursor: 'pointer', borderRadius: 8, objectFit: 'cover' }}
                                                    onClick={() => handleImageClick(imageUrl)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeleteBanner(item._id)}
                                                    disabled={!!item.deleted_at}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <TablePagination
                            rowsPerPageOptions={[10, 20, 30]}
                            component="div"
                            count={banners.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                            sx={{
                                backgroundColor: '#f5f5f5',
                                borderBottomLeftRadius: '8px',
                                borderBottomRightRadius: '8px',
                            }}
                        />
                    </TableContainer>
                </Box>
            )}

            {/* Add Banner Modal - Perfectly Centered */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={showModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 450,
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            boxShadow: 24,
                            p: 4,
                            outline: 'none',
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            component="h2" 
                            sx={{ 
                                mb: 3, 
                                fontWeight: 600,
                                color: '#1a1a1a',
                                borderBottom: '2px solid #f0f0f0',
                                pb: 2
                            }}
                        >
                            Add New Banner
                        </Typography>
                        
                        <form onSubmit={handleBannerSubmit}>
                            <select
                                name="banner_type"
                                value={formData.banner_type}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    marginBottom: '20px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    backgroundColor: '#fafafa',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    cursor: 'pointer'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                            >
                                <option value="">Select Banner Type</option>
                                {bannerList.map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.title}
                                    </option>
                                ))}
                            </select>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="body2" sx={{ mb: 1, color: '#666', fontWeight: 500 }}>
                                    Upload Image
                                </Typography>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '10px 0',
                                        fontSize: '14px',
                                        color: '#666'
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: '#999', mt: 0.5, display: 'block' }}>
                                    Supported formats: JPG, PNG, GIF (Max size: 5MB)
                                </Typography>
                            </Box>

                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                gap: 2, 
                                mt: 4,
                                borderTop: '1px solid #f0f0f0',
                                pt: 3
                            }}>
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => {
                                        setShowModal(false);
                                        setFormData({ image: '', banner_type: '' });
                                    }}
                                    sx={{
                                        color: '#666',
                                        borderColor: '#ddd',
                                        '&:hover': {
                                            borderColor: '#999',
                                            backgroundColor: '#f5f5f5'
                                        }
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        backgroundColor: '#1976d2',
                                        '&:hover': {
                                            backgroundColor: '#1565c0'
                                        }
                                    }}
                                >
                                    Save Banner
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Fade>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                open={Boolean(selectedImage)}
                onClose={handleCloseModal}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={Boolean(selectedImage)}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            outline: 'none',
                        }}
                    >
                        <IconButton
                            onClick={handleCloseModal}
                            sx={{
                                position: 'absolute',
                                top: -40,
                                right: -40,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': {
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        <img
                            src={selectedImage}
                            alt="Full Preview"
                            style={{
                                maxHeight: '90vh',
                                maxWidth: '90vw',
                                borderRadius: 12,
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                            }}
                        />
                    </Box>
                </Fade>
            </Modal>
        </Container>
    );
};

export default PharmaBanner;
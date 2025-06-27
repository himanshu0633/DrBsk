// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../components/AxiosInstance';
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
// import { Delete } from 'lucide-react';
// import { toast } from 'react-toastify';
// import { DeleteOutlineRounded } from '@mui/icons-material';

// const PharmaPrescription = () => {
//     const [prescriptions, setPrescriptions] = useState([]);
//     const [users, setUsers] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [selectedImage, setSelectedImage] = useState(null);

//     const theme = useTheme();
//     const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

//     const fetchData = async () => {
//         try {
//             const response = await axiosInstance.get('/user/allPrescriptions');
//             const data = response.data;
//             setPrescriptions(data);

//             const userIds = [...new Set(data.map(item => item.userId))];
//             const userRes = await Promise.all(
//                 userIds.map(id => axiosInstance.get(`/admin/readAdmin/${id}`))
//             );

//             const userMap = {};
//             userRes.forEach((res, index) => {
//                 const userId = userIds[index];
//                 userMap[userId] = res.data?.data || res.data;
//             });

//             setUsers(userMap);
//         } catch (error) {
//             console.error("Fetch error:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const handleImageClick = (imagePath) => {
//         setSelectedImage(`${API_URL}/${imagePath.replace(/\\/g, '/')}`);
//     };

//     const handleCloseModal = () => {
//         setSelectedImage(null);
//     };

//     const handleDeletePrescription = async (id) => {
//         if (window.confirm("Are you sure you want to delete this Prescription?")) {
//             try {
//                 await axiosInstance.delete(`/user/deletePrescription/${id}`);
//                 fetchData();
//                 toast.success("Prescription deleted successfully");
//             } catch (error) {
//                 console.error("Error deleting Prescription:", error);
//                 toast.error("Failed to delete Prescription. Please try again.");
//             }
//         }
//     };
//     return (
//         <Container maxWidth="lg" sx={{ mt: 5 }}>
//             <Typography
//                 variant="h4"
//                 gutterBottom
//                 className='fontSize25sml'
//                 sx={{
//                     fontWeight: 700,
//                     color: 'black',
//                     mb: 4,
//                 }}
//             >
//                 Prescriptions
//             </Typography>

//             {loading ? (
//                 <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
//                     <CircularProgress />
//                 </Box>
//             ) : (
//                 <Box sx={{ overflow: 'auto' }}>
//                     <TableContainer component={Paper} sx={{ borderRadius: 2, minWidth: '900px' }}>
//                         <Table>
//                             <TableHead sx={{ backgroundColor: '#68171b' }}>
//                                 <TableRow>
//                                     <TableCell><strong>User</strong></TableCell>
//                                     <TableCell><strong>Email</strong></TableCell>
//                                     <TableCell><strong>Prescription Image</strong></TableCell>
//                                     <TableCell><strong>Actions</strong></TableCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {prescriptions.map((item, i) => {
//                                     const user = users[item.userId];
//                                     return (
//                                         <TableRow key={i}>
//                                             <TableCell>
//                                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                                                     <Tooltip title={user?.name || ''}>
//                                                         <Avatar
//                                                             alt={user?.name}
//                                                             src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'U'}`}
//                                                             sx={{ mr: 2 }}
//                                                         />
//                                                     </Tooltip>
//                                                     {user?.name || 'Loading...'}
//                                                 </Box>
//                                             </TableCell>
//                                             <TableCell>{user?.email || ''}</TableCell>
//                                             <TableCell>
//                                                 <img
//                                                     src={`${API_URL}/${item.image?.replace(/\\/g, '/')}`}
//                                                     alt={`Prescription ${i + 1}`}
//                                                     onClick={() => handleImageClick(item.image)}
//                                                     style={{
//                                                         width: '150px',
//                                                         height: '100px',
//                                                         borderRadius: 8,
//                                                         cursor: 'pointer',
//                                                         border: '1px solid #ccc',
//                                                     }}
//                                                 />
//                                             </TableCell>
//                                             <TableCell>
//                                                 <IconButton
//                                                     color="error"
//                                                     onClick={() => handleDeletePrescription(item._id)}
//                                                     disabled={!!item.deleted_at}
//                                                 >
//                                                     {/* <Delete /> */}
//                                                     <DeleteOutlineRounded/>
//                                                 </IconButton>
//                                             </TableCell>
//                                         </TableRow>
//                                     );
//                                 })}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 </Box>
//             )}


//             {/* Modal for full image view */}
//             <Modal
//                 open={Boolean(selectedImage)}
//                 onClose={handleCloseModal}
//                 closeAfterTransition
//                 BackdropComponent={Backdrop}
//                 BackdropProps={{
//                     timeout: 500,
//                     sx: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
//                 }}
//             >
//                 <Fade in={Boolean(selectedImage)}>
//                     <Box
//                         sx={{
//                             position: 'absolute',
//                             top: '50%',
//                             left: '50%',
//                             transform: 'translate(-50%, -50%)',
//                             textAlign: 'center',
//                             outline: 'none',
//                         }}
//                     >
//                         <IconButton
//                             onClick={handleCloseModal}
//                             sx={{
//                                 position: 'absolute',
//                                 top: '-50px',
//                                 left: '50%',
//                                 transform: 'translateX(-50%)',
//                                 color: '#fff',
//                                 zIndex: 1000,
//                                 backgroundColor: 'rgba(0,0,0,0.6)',
//                                 '&:hover': {
//                                     backgroundColor: 'rgba(0,0,0,0.8)',
//                                 },
//                             }}
//                         >
//                             <CloseIcon />
//                         </IconButton>
//                         <img
//                             src={selectedImage}
//                             alt="Full Prescription"
//                             style={{
//                                 height: '400px',
//                                 width: '800px',
//                                 borderRadius: 12,
//                                 display: 'block',
//                             }}
//                         />
//                     </Box>
//                 </Fade>
//             </Modal>
//         </Container>
//     );
// };

// export default PharmaPrescription;



import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
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
    TablePagination,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import { DeleteOutlineRounded } from '@mui/icons-material';

const PharmaPrescription = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get('/user/allPrescriptions');
            const data = response.data;
            setPrescriptions(data);

            const userIds = [...new Set(data.map(item => item.userId))];
            const userRes = await Promise.all(
                userIds.map(id => axiosInstance.get(`/admin/readAdmin/${id}`))
            );

            const userMap = {};
            userRes.forEach((res, index) => {
                const userId = userIds[index];
                userMap[userId] = res.data?.data || res.data;
            });

            setUsers(userMap);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImageClick = (imagePath) => {
        setSelectedImage(`${API_URL}/${imagePath.replace(/\\/g, '/')}`);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const handleDeletePrescription = async (id) => {
        if (window.confirm("Are you sure you want to delete this Prescription?")) {
            try {
                await axiosInstance.delete(`/user/deletePrescription/${id}`);
                fetchData();
                toast.success("Prescription deleted successfully");
            } catch (error) {
                console.error("Error deleting Prescription:", error);
                toast.error("Failed to delete Prescription. Please try again.");
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

    // Calculate the current prescriptions to display
    const currentPrescriptions = prescriptions.slice(
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
                Prescriptions
            </Typography>

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
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {currentPrescriptions.map((item, i) => {
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
                                                        height: '100px',
                                                        borderRadius: 8,
                                                        cursor: 'pointer',
                                                        border: '1px solid #ccc',
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDeletePrescription(item._id)}
                                                    disabled={!!item.deleted_at}
                                                >
                                                    <DeleteOutlineRounded />
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
                            count={prescriptions.length}
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
    );
};

export default PharmaPrescription;


// import React, { useEffect, useState } from 'react';
// import axiosInstance from '../../../components/AxiosInstance';
// import API_URL from '../../../config';
// import {
//     Box,
//     Typography,
//     CircularProgress,
//     ImageList,
//     ImageListItem,
//     ImageListItemBar,
//     Avatar,
//     useMediaQuery,
//     useTheme,
//     Container,
//     Tooltip,
//     Modal,
//     Backdrop,
//     Fade,
//     IconButton,
// } from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';

// const PharmaPrescription = () => {
//     const [prescriptions, setPrescriptions] = useState([]);
//     const [users, setUsers] = useState({});
//     const [loading, setLoading] = useState(true);
//     const [selectedImage, setSelectedImage] = useState(null);

//     const theme = useTheme();
//     const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
//     const isMedium = useMediaQuery(theme.breakpoints.between('sm', 'md'));

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

//     const getColumns = () => {
//         if (isSmall) return 1;
//         if (isMedium) return 2;
//         return 3;
//     };

//     const handleImageClick = (imagePath) => {
//         setSelectedImage(`${API_URL}/${imagePath.replace(/\\/g, '/')}`);
//     };

//     const handleCloseModal = () => {
//         setSelectedImage(null);
//     };

//     return (
//         <Container maxWidth="lg" sx={{ mt: 5 }}>
//             <Typography
//                 variant="h4"
//                 gutterBottom
//                 sx={{
//                     fontWeight: 700,
//                     // textAlign: 'center',
//                     color: '#68171b',
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
//                 <ImageList variant="masonry" cols={getColumns()} gap={20}>
//                     {prescriptions.map((item, i) => {
//                         const user = users[item.userId];
//                         return (
//                             <ImageListItem
//                                 key={i}
//                                 sx={{
//                                     borderRadius: 3,
//                                     overflow: 'hidden',
//                                     boxShadow: 4,
//                                     transition: 'transform 0.3s ease',
//                                     '&:hover': {
//                                         transform: 'scale(1.03)',
//                                         boxShadow: 8,
//                                     },
//                                 }}
//                             >
//                                 <img
//                                     src={`${API_URL}/${item.image?.replace(/\\/g, '/')}`}
//                                     alt={`Prescription ${i + 1}`}
//                                     loading="lazy"
//                                     style={{
//                                         width: '100%',
//                                         height: '300px',
//                                         borderRadius: '10px',
//                                         display: 'block',
//                                         cursor: 'pointer',
//                                     }}
//                                     onClick={() => handleImageClick(item.image)}
//                                 />
//                                 <ImageListItemBar
//                                     title={user?.name || 'Loading...'}
//                                     subtitle={user?.email || ''}
//                                     actionIcon={
//                                         <Tooltip title={user?.name || ''}>
//                                             <Avatar
//                                                 alt={user?.name}
//                                                 src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'U'}`}
//                                                 sx={{ width: 40, height: 40, mr: 1 }}
//                                             />
//                                         </Tooltip>
//                                     }
//                                     sx={{
//                                         background: 'rgba(0, 0, 0, 0.6)',
//                                         color: '#fff',
//                                     }}
//                                 />
//                             </ImageListItem>
//                         );
//                     })}
//                 </ImageList>
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
//                                 height: '500px',
//                                 width: '1000px',
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const PharmaPrescription = () => {
    const [prescriptions, setPrescriptions] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

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

    return (
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
                Prescriptions
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ overflow: 'auto' }}>
                    <TableContainer component={Paper} sx={{ borderRadius: 2, minWidth: '900px'}}>
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
                                                        height: '100px',
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
    );
};

export default PharmaPrescription;






import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import {
  Box,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  TablePagination
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  backgroundColor:
    status === 'Delivered' ? theme.palette.success.light :
      status === 'Pending' ? theme.palette.warning.light :
        status === 'Cancelled' ? theme.palette.error.light :
          theme.palette.info.light,
  color:
    status === 'Delivered' ? theme.palette.success.dark :
      status === 'Pending' ? theme.palette.warning.dark :
        status === 'Cancelled' ? theme.palette.error.dark :
          theme.palette.info.dark,
}));

const statusOptions = ['Pending', 'Delivered', 'Cancelled'];

const PharmaOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get('/api/orders');
        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );


  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatusId(orderId);
    try {
      const response = await axiosInstance.put(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });
      console.log(response.data);  // Debug here to check the response
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Failed to update order status:", error);  // Debug the error
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" className='fontSize25sml' gutterBottom sx={{ fontWeight: 'bold' }}>
          Orders
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment ID</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>

                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>View</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentOrders.map((order) => {
                  const items = order.items || [];

                  return items.map((item, index) => (
                    <TableRow key={`${order._id}-${item.productId}-${index}`} hover>
                      {/* Product ID */}
                      <TableCell>{item.productId}</TableCell>

                      {/* Product Name */}
                      <TableCell>{item.name}</TableCell>

                      {/* ✅ Total Amount  */}
                      {index === 0 && (
                        <TableCell rowSpan={items.length}>₹{order.totalAmount}</TableCell>
                      )}

                      {/* Quantity */}
                      <TableCell>{item.quantity}</TableCell>

                      {/* Payment ID */}
                      {index === 0 && (
                        <TableCell rowSpan={items.length}>{order.paymentId || 'N/A'}</TableCell>
                      )}

                      {index === 0 && (
                        <TableCell rowSpan={items.length}>
                          <select
                            value={order.status}
                            disabled={updatingStatusId === order._id}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            style={{
                              fontWeight: '600',
                              color:
                                order.status === 'Delivered' ? 'green' :
                                  order.status === 'Pending' ? 'orange' :
                                    order.status === 'Cancelled' ? 'red' : 'black',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              cursor: updatingStatusId === order._id ? 'not-allowed' : 'pointer',
                              minWidth: '100px',
                              textAlign: 'center'
                            }}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                      )}

                      {/* view order all details */}
                      {index === 0 && (
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewOrder(order)}
                          >
                            View
                          </Button>
                        </TableCell>)}
                    </TableRow>
                  ));
                })}
              </TableBody>

            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 30]}
              component="div"
              count={orders.length}
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
          </StyledTableContainer>
        )}
      </Box>

      {/* Order Details Dialog - Simplified to match your data structure */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedOrder && (
          <>
            <div>
              <Typography variant="h6">Order Details</Typography>
            </div>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Order Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <><strong>Status:</strong>
                    <StatusChip
                      label={selectedOrder.status}
                      status={selectedOrder.status}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </>
                  <Typography><strong>Payment ID:</strong> {selectedOrder.paymentId || 'N/A'}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Items in this Order
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {selectedOrder.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography><strong>Product ID:</strong> {item.productId}</Typography>
                      <Typography><strong>Name:</strong> {item.name}</Typography>
                      <Typography><strong>Price:</strong> ₹{item.price}</Typography>
                      <Typography><strong>Quantity:</strong> {item.quantity}</Typography>
                    </Box>
                  ))}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default PharmaOrder;

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
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  Grid,
  TablePagination,
  TextField,
  DialogTitle,
  Alert,
  AlertTitle,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  minWidth: '80px',
  backgroundColor:
    status === 'delivered' ? theme.palette.success.light :
      status === 'pending' ? theme.palette.warning.light :
        status === 'cancelled' ? theme.palette.error.light :
          status === 'refunded' ? theme.palette.info.light :
            status === 'captured' || status === 'paid' ? theme.palette.success.light :
              status === 'authorized' ? theme.palette.info.light :
                status === 'failed' ? theme.palette.error.light :
                  status === 'processed' ? theme.palette.success.light :
                    status === 'initiated' ? theme.palette.warning.light :
                      status === 'created' ? theme.palette.grey.light :
                        status === 'none' ? theme.palette.grey.light :
                          theme.palette.grey.light,
  color:
    status === 'delivered' ? theme.palette.success.dark :
      status === 'pending' ? theme.palette.warning.dark :
        status === 'cancelled' ? theme.palette.error.dark :
      status === 'refunded' ? theme.palette.info.dark :
        status === 'captured' || status === 'paid' ? theme.palette.success.dark :
          status === 'authorized' ? theme.palette.info.dark :
            status === 'failed' ? theme.palette.error.dark :
              status === 'processed' ? theme.palette.success.dark :
                status === 'initiated' ? theme.palette.warning.dark :
                  status === 'created' ? theme.palette.grey.dark :
                    status === 'none' ? theme.palette.grey.dark :
                      theme.palette.grey.dark,
}));

const statusOptions = ['Pending', 'Delivered', 'Cancelled'];

// Safe rendering utilities
const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    // Try to extract common properties
    if (value.name) return safeString(value.name, defaultValue);
    if (value.title) return safeString(value.title, defaultValue);
    if (value.productName) return safeString(value.productName, defaultValue);
    // Fallback to JSON string if it's a simple object
    try {
      return JSON.stringify(value);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

const getProductName = (item) => {
  if (!item) return 'Unknown Product';
  return safeString(item.name, 'Unknown Product');
};

const PharmaOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [processingCapture, setProcessingCapture] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchDataSilently();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSilently = async () => {
    setRefreshing(true);
    try {
      const response = await axiosInstance.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching data silently:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const paymentResponse = await axiosInstance.get(`/api/paymentStatus/${order._id}`);
      const updatedOrder = {
        ...order,
        paymentInfo: paymentResponse.data.paymentInfo,
        refundInfo: paymentResponse.data.refundInfo
      };
      setSelectedOrder(updatedOrder);
    } catch (error) {
      console.error("Error fetching latest payment status:", error);
      setSelectedOrder(order);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOrder(null);
  };

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

  const capturePayment = async (orderId) => {
    setProcessingCapture(orderId);
    try {
      const response = await axiosInstance.post(`/api/capturePayment/${orderId}`);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, paymentInfo: response.data.paymentInfo }
            : order
        )
      );
      alert('Payment Paid successfully!');
      fetchData();
    } catch (error) {
      console.error("Failed to capture payment:", error);
      alert("Failed to capture payment. Please try again.");
    } finally {
      setProcessingCapture(null);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (newStatus === 'Cancelled') {
      setOrderToCancel(orderId);
      setShowCancelDialog(true);
      return;
    }

    setUpdatingStatusId(orderId);
    try {
      const response = await axiosInstance.put(`/api/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert('Order status updated successfully!');
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;

    setUpdatingStatusId(orderToCancel);
    try {
      const response = await axiosInstance.put(`/api/orders/${orderToCancel}/status`, {
        status: 'Cancelled',
        cancelReason: cancelReason || 'Cancelled by admin'
      });

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderToCancel ? {
            ...order,
            status: 'Cancelled',
            cancelReason: cancelReason || 'Cancelled by admin',
            cancelledAt: new Date(),
            refundInfo: response.data.refundDetails || response.data.order?.refundInfo
          } : order
        )
      );

      const message = response.data.refundProcessed
        ? `Order cancelled and refund initiated! Refund will be processed within 5-7 business days.`
        : 'Order cancelled successfully! No refund needed.';

      alert(message);
      await fetchData();

    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setUpdatingStatusId(null);
      setShowCancelDialog(false);
      setOrderToCancel(null);
      setCancelReason('');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatusLabel = (paymentInfo) => {
    if (!paymentInfo || typeof paymentInfo !== 'object') return 'Unknown';
    return safeString(paymentInfo.status, 'Unknown');
  };

  const getRefundStatusText = (refundInfo) => {
    if (!refundInfo || typeof refundInfo !== 'object') return 'No Refund';
    if (!refundInfo.refundId && refundInfo.status === 'none') return 'No Refund';
    if (!refundInfo.refundId) return 'No Refund';

    const status = safeString(refundInfo.status, '');
    if (status === 'processed') return 'Refund Processed';
    if (status === 'failed') return 'Refund Failed';
    if (status === 'pending') return 'Refund Pending';
    if (status === 'initiated') return 'Refund Initiated';
    return `Refund ${status}`;
  };

  const getEstimatedRefundDays = (refundInfo) => {
    if (!refundInfo || !refundInfo.estimatedSettlement) return null;
    const now = new Date();
    const settlement = new Date(refundInfo.estimatedSettlement);
    const diffTime = settlement - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Should be settled';
    if (diffDays === 1) return 'Expected tomorrow';
    return `Expected in ${diffDays} days`;
  };

  const canCancelOrder = (order) => {
    return order.status !== 'Cancelled' && order.status !== 'Delivered';
  };

  const needsPaymentCapture = (paymentInfo) => {
    return paymentInfo?.status === 'authorized';
  };

  // Safe render component that prevents object rendering
  const SafeTableCell = ({ children, ...props }) => {
    let safeChildren = children;
    
    if (children !== null && children !== undefined) {
      if (typeof children === 'object' && !Array.isArray(children)) {
        // If it's an object, convert to string
        safeChildren = safeString(children);
      }
    }
    
    return <TableCell {...props}>{safeChildren}</TableCell>;
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" className='fontSize25sml' gutterBottom sx={{ fontWeight: 'bold' }}>
            Orders Management
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {refreshing && <CircularProgress size={20} />}
            <Button variant="outlined" onClick={fetchData} disabled={loading}>
              Refresh Orders
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <StyledTableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.primary.main }}>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quantity</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Refund Status</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography>No orders found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentOrders.map((order) => {
                    const items = order.items || [];

                    return items.map((item, index) => (
                      <TableRow key={`${order._id}-${item.productId || index}-${index}`} hover>
                        <SafeTableCell>
                          {getProductName(item)}
                        </SafeTableCell>

                        {index === 0 && (
                          <TableCell rowSpan={items.length}>
                            ₹{safeNumber(order.totalAmount, 0)}
                          </TableCell>
                        )}

                        <SafeTableCell>
                          {safeNumber(item.quantity, 0)}
                        </SafeTableCell>

                        {index === 0 && (
                          <TableCell rowSpan={items.length}>
                            <select
                              value={safeString(order.status, 'Pending')}
                              disabled={updatingStatusId === order._id || !canCancelOrder(order)}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                backgroundColor: canCancelOrder(order) ? 'white' : '#f5f5f5'
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

                        {index === 0 && (
                          <TableCell rowSpan={items.length}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <StatusChip
                                label={getPaymentStatusLabel(order.paymentInfo)}
                                status={safeString(order.paymentInfo?.status, 'unknown').toLowerCase()}
                                size="small"
                              />
                              {needsPaymentCapture(order.paymentInfo) && (
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  disabled={processingCapture === order._id}
                                  onClick={() => capturePayment(order._id)}
                                  sx={{ fontSize: '10px', padding: '2px 8px' }}
                                >
                                  {processingCapture === order._id ? 'Capturing...' : 'Capture Payment'}
                                </Button>
                              )}
                            </Box>
                          </TableCell>
                        )}

                        {index === 0 && (
                          <TableCell rowSpan={items.length}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <StatusChip
                                label={getRefundStatusText(order.refundInfo)}
                                status={safeString(order.refundInfo?.status, 'none').toLowerCase()}
                                size="small"
                              />
                              {order.refundInfo && order.refundInfo.refundId && getEstimatedRefundDays(order.refundInfo) && (
                                <Typography variant="caption" color="text.secondary">
                                  {getEstimatedRefundDays(order.refundInfo)}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        )}

                        {index === 0 && (
                          <TableCell rowSpan={items.length}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleViewOrder(order)}
                              >
                                View Details
                              </Button>
                            </Box>
                          </TableCell>
                        )}
                      </TableRow>
                    ));
                  })
                )}
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

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onClose={() => setShowCancelDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <AlertTitle>Cancel Order & Process Refund</AlertTitle>
            Cancelling this order will automatically process a refund if payment has been captured.
          </Alert>
          <TextField
            fullWidth
            label="Cancellation Reason (Required)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation..."
            multiline
            rows={3}
            variant="outlined"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmCancelOrder}
            color="error"
            variant="contained"
            disabled={updatingStatusId === orderToCancel || !cancelReason.trim()}
          >
            {updatingStatusId === orderToCancel ? 'Processing...' : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedOrder && (
          <>
            <DialogTitle>
              <Typography variant="h6">Order Details - #{safeString(selectedOrder._id, '').slice(-8)}</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Order Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography><strong>Status:</strong>
                    <StatusChip
                      label={safeString(selectedOrder.status, 'Pending')}
                      status={safeString(selectedOrder.status, '').toLowerCase()}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography><strong>Total Amount:</strong> ₹{safeNumber(selectedOrder.totalAmount, 0)}</Typography>
                  <Typography><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</Typography>
                  <Typography><strong>Phone:</strong> {safeString(selectedOrder.phone, 'N/A')}</Typography>
                  <Typography><strong>Address:</strong> {safeString(selectedOrder.address, 'N/A')}</Typography>
                  <Typography><strong>User Email:</strong> {safeString(selectedOrder.userEmail, 'N/A')}</Typography>
                  <Typography><strong>Razorpay Order ID:</strong> {safeString(selectedOrder.razorpayOrderId, 'N/A')}</Typography>

                  {selectedOrder.cancelReason && (
                    <Box mt={2} p={2} bgcolor="error.light" borderRadius={1}>
                      <Typography variant="subtitle2" color="error.dark">Cancellation Reason:</Typography>
                      <Typography variant="body2">{safeString(selectedOrder.cancelReason)}</Typography>
                      {selectedOrder.cancelledAt && (
                        <Typography variant="body2"><strong>Cancelled on:</strong> {formatDate(selectedOrder.cancelledAt)}</Typography>
                      )}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Payment Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography><strong>Payment ID:</strong> {selectedOrder.paymentInfo?.paymentId || 'N/A'}</Typography>
                  <Typography><strong>Payment Status:</strong>
                    <StatusChip
                      label={getPaymentStatusLabel(selectedOrder.paymentInfo)}
                      status={safeString(selectedOrder.paymentInfo?.status, 'unknown').toLowerCase()}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  {selectedOrder.paymentInfo?.method && (
                    <Typography><strong>Payment Method:</strong> {safeString(selectedOrder.paymentInfo.method)}</Typography>
                  )}
                  {selectedOrder.paymentInfo?.updatedAt && (
                    <Typography><strong>Last Updated:</strong> {formatDate(selectedOrder.paymentInfo.updatedAt)}</Typography>
                  )}

                  {selectedOrder.refundInfo && selectedOrder.refundInfo.refundId && (
                    <Box mt={2} p={2} bgcolor="info.light" borderRadius={1}>
                      <Typography variant="subtitle2" color="info.dark">Refund Information:</Typography>
                      <Typography variant="body2"><strong>Refund ID:</strong> {safeString(selectedOrder.refundInfo.refundId)}</Typography>
                      <Typography variant="body2"><strong>Amount:</strong> ₹{safeNumber(selectedOrder.refundInfo.amount, 0)}</Typography>
                      <Typography variant="body2"><strong>Status:</strong>
                        <StatusChip
                          label={getRefundStatusText(selectedOrder.refundInfo)}
                          status={safeString(selectedOrder.refundInfo.status, 'unknown').toLowerCase()}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography variant="body2"><strong>Reason:</strong> {safeString(selectedOrder.refundInfo.reason, 'N/A')}</Typography>
                      {selectedOrder.refundInfo.initiatedAt && (
                        <Typography variant="body2"><strong>Initiated:</strong> {formatDate(selectedOrder.refundInfo.initiatedAt)}</Typography>
                      )}
                      {selectedOrder.refundInfo.processedAt && (
                        <Typography variant="body2"><strong>Processed:</strong> {formatDate(selectedOrder.refundInfo.processedAt)}</Typography>
                      )}
                      {selectedOrder.refundInfo.estimatedSettlement && (
                        <Typography variant="body2">
                          <strong>Expected Settlement:</strong> {formatDate(selectedOrder.refundInfo.estimatedSettlement)}
                          <Typography variant="caption" display="block" color="text.secondary">
                            ({getEstimatedRefundDays(selectedOrder.refundInfo)})
                          </Typography>
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Items in this Order
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {selectedOrder.items && selectedOrder.items.map((item, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                      <Typography><strong>Product ID:</strong> {safeString(item.productId, 'N/A')}</Typography>
                      <Typography><strong>Name:</strong> {getProductName(item)}</Typography>
                      <Typography><strong>Price:</strong> ₹{safeNumber(item.price, 0)}</Typography>
                      <Typography><strong>Quantity:</strong> {safeNumber(item.quantity, 0)}</Typography>
                      <Typography><strong>Subtotal:</strong> ₹{safeNumber(item.price, 0) * safeNumber(item.quantity, 0)}</Typography>
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
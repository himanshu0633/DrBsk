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
import {
  Receipt,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  Visibility
} from '@mui/icons-material';
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


const PharmaOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle />;
      case 'Pending':
        return <Pending />;
      case 'Cancelled':
        return <Cancel />;
      default:
        return <LocalShipping />;
    }
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

        {/* ✅ Total Amount सिर्फ एक बार दिखेगा */}
        {index === 0 && (
          <TableCell rowSpan={items.length}>₹{order.totalAmount}</TableCell>
        )}

        {/* Quantity */}
        <TableCell>{item.quantity}</TableCell>

        {/* Payment ID सिर्फ एक बार */}
        {index === 0 && (
          <TableCell rowSpan={items.length}>{order.paymentId || 'N/A'}</TableCell>
        )}

        {/* Status सिर्फ एक बार */}
        {index === 0 && (
          <TableCell rowSpan={items.length}>
            <StatusChip
              icon={getStatusIcon(order.status)}
              label={order.status}
              status={order.status}
            />
          </TableCell>
        )}
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
            <DialogTitle>
              <Typography variant="h6">Order Details</Typography>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Order Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography><strong>Status:</strong>
                    <StatusChip
                      label={selectedOrder.status}
                      status={selectedOrder.status}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Typography>
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
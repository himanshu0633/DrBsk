// import React, { useEffect, useState } from 'react'
// import axiosInstance from '../../../components/AxiosInstance';
// import CustomLoader from '../../../components/CustomLoader';

// const PharmaUser = () => {
//     const [users, setUsers] = useState([]);
//     const [loading, setloading] = useState(true);
//     const [showModal, setShowModal] = useState(false);


//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const response = await axiosInstance.get('/admin/readallAdmins');
//                 console.log("Fetched users:", response.data);
//                 setUsers(response.data.data);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         };
//         fetchData();
//         setloading(false);
//     }, []);

//     function startEditingUser(user) {
//         console.log("Editing user:", user);

//         setShowModal(true);
//     }
//     function deleteUser() {

//     }


//     return (
//         <div className="user-content">
//             <div className="user-header">
//                 <h2>Users</h2>
//             </div>

//             <div className="user-table-container">
//                 <table className="user-table">
//                     <thead>
//                         <tr>
//                             <th>Name</th>
//                             <th>Email</th>
//                             <th>Role</th>
//                             <th>Address</th>
//                             <th>Status</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     {loading ? (<CustomLoader />) : (<tbody>
//                         {users.map((user, index) => (
//                             <tr key={index}>
//                                 <td data-label="Name">{user.name}</td>
//                                 <td data-label="Email">{user.email}</td>
//                                 <td data-label="Role">{user.role}</td>
//                                 <td data-label="Address">{user.address || 'N/A'}</td>
//                                 <td data-label="Status">
//                                     {user.deleted_at ? (
//                                         <span className="status-badge deleted">Deleted</span>
//                                     ) : (
//                                         <span className="status-badge active">Active</span>
//                                     )}
//                                 </td>
//                                 <td data-label="Actions" className="actions-cell">
//                                     <button onClick={() => startEditingUser(user)} className="btn-action btn-edit">Edit</button>
//                                     <button onClick={() => deleteUser(user._id)} className="btn-action btn-delete">Delete</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>)}

//                 </table>
//             </div>

//             {showModal && (
//                 <div className="modal-overlay">
//                     <div className="modal">
//                         <h3>{isEditing ? "Edit Category" : "Add New Category"}</h3>
//                         <form onSubmit={handleSubmit}>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 placeholder="Category Name"
//                                 value={newCategory.name}
//                                 onChange={handleInputChange}
//                                 required
//                             />
//                             <input
//                                 type="text"
//                                 name="description"
//                                 placeholder="Category Description"
//                                 value={newCategory.description}
//                                 onChange={handleInputChange}
//                                 required
//                             />
//                             <input
//                                 type="file"
//                                 name="image"
//                                 accept="image/*"
//                                 onChange={handleInputChange}
//                             />
//                             <div className="modal-actions">
//                                 <button type="submit" className="btn-save">{isEditing ? "Update" : "Save"}</button>
//                                 <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//         </div>
//     )
// }

// export default PharmaUser



import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../components/AxiosInstance';
import CustomLoader from '../../../components/CustomLoader';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

const PharmaUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    address: '',
    phone: '',
  });

  const roles = ['admin', 'manager', 'staff', 'pharmacist'];

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/readallAdmins');
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEditingUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address || '',
      phone: user.phone || '',
    });
    setShowModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/admin/updateAdmin/${selectedUser._id}`, formData);
      setShowModal(false);
      setSelectedUser(null);
      fetchUsers();
      toast.success("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user.");
    }
  };

  const deleteUser = async (userId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this user?");
      if (!confirmDelete) return;

      await axiosInstance.delete(`/admin/deleteAdmin/${userId}`);
      fetchUsers();
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', role: '', address: '', phone: '' });
    setSelectedUser(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
      </Box>

      <Card variant="outlined">
        <CardContent>
          {loading ? (
            <CustomLoader />
          ) : (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="user table">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={
                            user.role === 'admin' ? 'primary' : 
                            user.role === 'manager' ? 'secondary' : 
                            'default'
                          } 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.address || 'N/A'}</TableCell>
                      <TableCell>{user.phone || 'N/A'}</TableCell>
                      <TableCell>
                        {user.deleted_at ? (
                          <Chip label="Deleted" color="error" size="small" />
                        ) : (
                          <Chip label="Active" color="success" size="small" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => startEditingUser(user)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => deleteUser(user._id)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModal} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>
          Edit User
          <IconButton
            aria-label="close"
            onClick={resetForm}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdateUser}>
          <DialogContent dividers>
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Role"
                required
              >
                {roles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              fullWidth
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              Update User
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PharmaUser;

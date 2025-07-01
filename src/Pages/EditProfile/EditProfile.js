import React, { useEffect, useState } from 'react';
import Header from '../../components/Header/Header';
import './EditProfile.css';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../components/AxiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'male',
    dob: '',
    height: '',
    weight: '',
  });

  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');

    if (userData) {
      const parsedData = JSON.parse(userData);
      setIsAuthenticated(true);

      // Store the userId separately if needed
      setUserId(parsedData._id);

      setFormData({
        name: parsedData.name || '',
        email: parsedData.email || '',
        mobile: parsedData.mobile || '',
        gender: parsedData.gender || 'male',
        dob: parsedData.dob || '',
        height: parsedData.height || '',
        weight: parsedData.weight || '',
      });

      if (parsedData.profileImage) {
        setProfileImage(parsedData.profileImage);
      }
    } else {
      // window.location.href = '/login';
          navigate('/login')
    }
  }, []);


  if (isAuthenticated === null) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setProfileImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedData = {
        ...formData,
        profileImage,
      };

      const response = await axiosInstance.put(`/admin/updateAdmin/${userId}`, updatedData);

      if (response.status === 200 || response.status === 201) {
        console.log("Profile updated:", response.data);

        sessionStorage.setItem('userData', JSON.stringify(response.data.updatedUser || updatedData));
        toast.success('Profile updated successfully!');
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please try again.");
    }
  };
  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Logging out...');
    sessionStorage.clear();
    // window.location.href = '/login';
        navigate('/login')
  };


  return (
    <>
      <Header />

      <div className="edit-profile-container">
        <div className="profile-layout">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="sidebar-header">
              <h3>Hello {formData.name}</h3>
              <p>Welcome to your account</p>
            </div>
            <nav className="sidebar-nav">
              <a className="nav-item active" href="http://localhost:3000/EditProfile">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
                My Profile
              </a>
              <a className="nav-item" href="http://localhost:3000/OrderPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M13 12h7v1.5h-7zm0-2.5h7V11h-7zm0 5h7V16h-7zM21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H3V6h18v13z" />
                </svg>
                My Orders
              </a>
              {/* <a className="nav-item" href="http://localhost:3000/PatientsPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
                Patients
              </a> */}
              {/* <a className="nav-item" href="http://localhost:3000/NotificationsPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                Notifications
              </a> */}
              {/* <a className="nav-item" href="ConsultationsPage">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z" />
                </svg>
                Consultations
              </a> */}
              <a className="nav-item" href="#">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                </svg>
                Need Help?
              </a>
              <a onClick={handleLogout} className="nav-item logout" href="#">
                <svg className="nav-icon" viewBox="0 0 24 24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                Logout
              </a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="profile-content">
            <div className="profile-card">
              <h2 className="profile-title">Edit Profile</h2>

              <div className="profile-picture-section">
                <div className="profile-picture-container">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="profile-picture" />
                  ) : (
                    <div className="profile-picture-placeholder">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                  <label className="profile-picture-upload">
                    <input type="file" accept="image/*" onChange={handleImageChange} />
                    <svg viewBox="0 0 24 24">
                      <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z" />
                    </svg>
                  </label>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="phone-input">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        id="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" value={formData.gender} onChange={handleChange}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="dob">Date of Birth</label>
                      <input
                        type="date"
                        id="dob"
                        value={formData.dob}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="height">Height (cm)</label>
                      <input
                        type="number"
                        id="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Height"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="weight">Weight (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Weight"
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </form>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EditProfile;
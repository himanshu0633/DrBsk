// import React, { useState } from 'react';
// import axiosInstance from './AxiosInstance';
// import { toast } from 'react-toastify';

// function SignUpForm() {
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         mobile: '',
//         password: '',
//         address: ''
//     });

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [error, setError] = useState(null);
//     const [success, setSuccess] = useState(false);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         if (name === 'mobile' && !/^\d{0,10}$/.test(value)) return;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));

//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (formData.mobile.length !== 10) {
//             setError('mobile number must be exactly 10 digits');
//             return;
//         }
//         setIsSubmitting(true);
//         setError(null);
//         setSuccess(false);

//         try {
//             const response = await axiosInstance.post('/admin/createAdmin', formData);

//             if (response.status === 200 || response.status === 201) {
//                 console.log("Registration successful:", response.data);
//                 toast.success('Registration successful!');
//                 setSuccess(true);
//                 setFormData({
//                     name: '',
//                     email: '',
//                     mobile: '',
//                     password: '',
//                     address: ''
//                 });
//             } else {
//                 throw new Error(response.statusText || 'Registration failed');
//             }
//         } catch (error) {
//             console.error("Registration error:", error);
//             setError(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
//             toast.error('Registration failed')
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     return (
//         <div className="signup-container">
//             <h2 className="signup-title">Sign Up</h2>
//             {error && <div className="error-message">{error}</div>}
//             {success && <div className="success-message">Registration successful!</div>}

//             <form onSubmit={handleSubmit} className="signup-form">
//                 <input
//                     type="text"
//                     name="name"
//                     placeholder="Full Name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     required
//                     className="signup-input"
//                 />
//                 <input
//                     type="email"
//                     name="email"
//                     placeholder="Email Address"
//                     value={formData.email}
//                     onChange={handleChange}
//                     required
//                     className="signup-input"
//                 />
//                 <input
//                     type="password"
//                     name="password"
//                     placeholder="Password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     required
//                     minLength="6"
//                     className="signup-input"
//                 />
//                 <input
//                     type="tel"
//                     name="mobile"
//                     placeholder="Mobile Number"
//                     value={formData.mobile}
//                     onChange={handleChange}
//                     required
//                     className="signup-input"
//                 />
//                 <input
//                     type="text"
//                     name="address"
//                     placeholder="Address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     required
//                     className="signup-input"
//                 />
//                 {error && <p className='clrRed'>{error}</p>}
//                 <button
//                     type="submit"
//                     className="signup-button"
//                     disabled={isSubmitting}
//                 >
//                     {isSubmitting ? 'Submitting...' : 'Submit'}
//                 </button>

//             </form>
//         </div>
//     );
// }

// export default SignUpForm;


// 2: otp verification
import React, { useState } from 'react';
import axiosInstance from './AxiosInstance';
import { toast } from 'react-toastify';

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', password: '', address: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'mobile' && !/^\d{0,10}$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const sendOtp = async e => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!formData.email) {
      setError('Email is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/api/pre-signup', { email: formData.email });
      toast.success('OTP sent to your email');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtpAndSignup = async e => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (otp.length !== 6) {
      setError('Enter 6-digit OTP');
      return;
    }
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/api/verify-otp-and-signup', { ...formData, otp });
      toast.success('Registration successful!');
      setSuccess(true);
      setStep(3);
      setFormData({ name: '', email: '', mobile: '', password: '', address: '' });
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = error && <p className="clrRed">{error}</p>;
  const successMessage = success && <div className="success-message">Registration successful!</div>;

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      {errorMessage}
      {successMessage}
      {step === 1 && (
        <form onSubmit={sendOtp} className="signup-form">
          <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="signup-input" />
          <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="signup-input" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required minLength={6} className="signup-input" />
          <input type="tel" name="mobile" placeholder="Mobile Number" value={formData.mobile} onChange={handleChange} required className="signup-input" />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required className="signup-input" />
          <button type="submit" disabled={isSubmitting} className="signup-button">
            {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={verifyOtpAndSignup} className="signup-form">
          <input type="text" name="otp" placeholder="Enter OTP" value={otp} maxLength={6} onChange={e => setOtp(e.target.value)} required className="signup-input" />
          <button type="submit" disabled={isSubmitting} className="signup-button">
            {isSubmitting ? 'Verifying...' : 'Verify & Register'}
          </button>
        </form>
      )}
      {step === 3 && (
        <div className="success-message">Registration successful! You can now log in.</div>
      )}
    </div>
  );
}

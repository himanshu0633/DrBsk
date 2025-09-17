import React, { useState } from 'react';
import {
  Eye, EyeOff, Mail, Lock, ArrowRight
} from 'lucide-react';
import './Cart.css';
import Header from '../../components/Header/Header';
import SignUpForm from '../../components/SignUp';
import axiosInstance from '../../components/AxiosInstance';
import WholesalePartnerForm from '../../components/wholeSale_signup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobileLogin, setIsMobileLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isWholesalePartner, setIsWholesalePartner] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleLoginMethod = () => {
    setIsMobileLogin(!isMobileLogin);
    setErrors({});
    setOtpSent(false);
    setLoginError(null);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^[0-9]{10}$/.test(mobile);

  const handleSendOtp = () => {
    if (!validateMobile(mobile)) {
      setErrors({ mobile: 'Please enter a valid 10-digit mobile number' });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      toast.success(`OTP sent to +91${mobile}`);
    }, 1500);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setLoginError(null);

    const newErrors = {};

    if (isMobileLogin) {
      if (!validateMobile(mobile)) newErrors.mobile = 'Please enter a valid 10-digit mobile number';
      if (!otp) newErrors.otp = 'Please enter the OTP';
    } else {
      if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';
      if (!password || password.length < 5) newErrors.password = 'Password must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post('/admin/login', {
        email,
        password
      });

      if (response.status === 200) {
        // Store login data in session storage
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data));

        // Redirect to dashboard
        // window.location.href = '/';
        navigate('/homepage')
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowSignUp = (isWholesale = false) => {
    setIsWholesalePartner(isWholesale);
    setShowSignUp(true);
  };

  const handleBackToLogin = () => {
    setShowSignUp(false);
    setIsWholesalePartner(false);
  };

  return (
    <div className="davaindia-cart-page">
      <Header />
      <div className="davaindia-auth-container">
        <div className="davaindia-illustration-side">
          <img src="https://app.davaindia.com/images/AuthLogo.svg" alt="Health" className="davaindia-illustration" />
          <p className="davaindia-tagline"><span className="davaindia-highlight">India's largest</span> private generic pharmacy retail chain</p>
        </div>

        <div className="davaindia-form-side">
          <div className="davaindia-form-container">
            {!showSignUp ? (
              <>
                <h1 className="davaindia-form-title">Welcome back</h1>
                <p className="davaindia-form-subtitle">Sign in to access your account</p>

                {loginError && <div className="davaindia-error-message">{loginError}</div>}

                <form onSubmit={handleSubmit}>
                  {!isMobileLogin ? (
                    <>
                      <div className={`davaindia-form-group ${errors.email ? 'error' : ''}`}>
                        <label>Email</label>
                        <div className="davaindia-input-container">
                          <Mail size={18} className="davaindia-input-icon left" />
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className='w-100' />
                        </div>
                        {errors.email && <div className="davaindia-error-message">{errors.email}</div>}
                      </div>

                      <div className={`davaindia-form-group ${errors.password ? 'error' : ''}`}>
                        <label>Password</label>
                        <div className="davaindia-input-container justifyBetween">
                          <div className='davaindia-input-container1 '>
                            <Lock size={18} className="davaindia-input-icon left" />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className='w-100' />
                          </div>
                          <button type="button" onClick={togglePasswordVisibility}>
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && <div className="davaindia-error-message">{errors.password}</div>}
                      </div>

                      <button type="submit" className="davaindia-btn davaindia-btn-primary" disabled={isLoading}>
                        {isLoading ? <span className="davaindia-spinner"></span> : <>Sign In <ArrowRight size={18} /></>}
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={`davaindia-form-group ${errors.mobile ? 'error' : ''}`}>
                        <label>Mobile</label>
                        <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter mobile number" />
                        {errors.mobile && <div className="davaindia-error-message">{errors.mobile}</div>}
                      </div>
                      {otpSent && (
                        <div className={`davaindia-form-group ${errors.otp ? 'error' : ''}`}>
                          <label>OTP</label>
                          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6" placeholder="Enter OTP" />
                          {errors.otp && <div className="davaindia-error-message">{errors.otp}</div>}
                        </div>
                      )}
                      <button type="button" onClick={handleSendOtp} className="davaindia-btn davaindia-btn-secondary" disabled={isLoading}>
                        {isLoading ? <span className="davaindia-spinner"></span> : 'Send OTP'}
                      </button>
                    </>
                  )}
                </form>

                {/* <button type="button" onClick={toggleLoginMethod} className="davaindia-toggle-btn">
                  {isMobileLogin ? 'Use email instead' : 'Use mobile instead'}
                </button> */}

                <div className="davaindia-form-footer">
                  Don’t have an account?{' '}
                  <button type="button" onClick={() => handleShowSignUp(false)} className="davaindia-link-button">
                    Sign up
                  </button>
                </div>
                <div className="davaindia-form-footer">
                  Want to be Our WholeSale Partner?{' '}
                  <button type="button" onClick={() => handleShowSignUp(true)} className="davaindia-link-button">
                    Sign up
                  </button>

                </div>
              </>
            ) : (
              <>
                <h1 className="davaindia-form-title">Create Account</h1>
                {isWholesalePartner ? <WholesalePartnerForm /> : <SignUpForm />}

                <div className="davaindia-form-footer">
                  Already have an account?{' '}
                  <button type="button" onClick={handleBackToLogin} className="davaindia-link-button">
                    Sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

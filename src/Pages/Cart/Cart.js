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
  const [phone, setPhone] = useState('');
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
    // Clear form fields when switching
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp('');
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

  const handleSendOtp = () => {
    if (!validatePhone(phone)) {
      setErrors({ phone: 'Please enter a valid 10-digit phone number' });
      return;
    }
    setIsLoading(true);
    // In a real app, you would call an API endpoint here
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      toast.success(`OTP sent to +91${phone}`);
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setLoginError(null);

    const newErrors = {};

    if (isMobileLogin) {
      if (!validatePhone(phone)) newErrors.phone = 'Please enter a valid 10-digit mobile number';
      if (!otp) newErrors.otp = 'Please enter the OTP';
      if (otp && otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';
    } else {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email address';
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 5) newErrors.password = 'Password must be at least 5 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      let response;
      
      if (isMobileLogin) {
        // Handle mobile login with OTP
        // This would typically call a different endpoint for mobile login
        // For now, using email/password endpoint as fallback
        response = await axiosInstance.post('/admin/login', {
          phone, // Make sure your backend supports phone login
          otp // This should be verified separately
        });
      } else {
        // Email login
        response = await axiosInstance.post('/admin/login', {
          email,
          password
        });
      }

      if (response.status === 200 && response.data.token) {
        // Store login data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.data));

        // Link guest orders to this user (only for email login)
        if (!isMobileLogin && email) {
          try {
            const linkResponse = await axiosInstance.post('/api/link-guest-orders', {
              email: email,
              userId: response.data.data._id
            }, {
              headers: { 
                Authorization: `Bearer ${response.data.token}` 
              }
            });
            
            if (linkResponse.data.success && linkResponse.data.linkedCount > 0) {
              toast.success(`${linkResponse.data.linkedCount} previous guest orders linked to your account!`, {
                position: 'top-right',
                autoClose: 5000
              });
            }
          } catch (linkError) {
            console.log('Guest order linking failed:', linkError);
            // Continue anyway - not critical
          }
        }

        // Navigate to OrderPage
        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 2000
        });
        
        navigate('/OrderPage');
      } else {
        throw new Error('Login failed: No token received');
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed. Please try again.';
      setLoginError(errorMessage);
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 3000
      });
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
    // Reset form state
    setEmail('');
    setPassword('');
    setPhone('');
    setOtp('');
    setOtpSent(false);
    setErrors({});
    setLoginError(null);
  };

  return (
    <div className="davaindia-cart-page">
      <Header />
      <div className="davaindia-auth-container">
        <div className="davaindia-illustration-side">
          <img 
            src="https://app.davaindia.com/images/AuthLogo.svg" 
            alt="Health" 
            className="davaindia-illustration" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/fallback-auth-logo.png'; // Add a fallback image
            }}
          />
          <p className="davaindia-tagline">
            <span className="davaindia-highlight">India's largest</span> private generic pharmacy retail chain
          </p>
        </div>

        <div className="davaindia-form-side">
          <div className="davaindia-form-container">
            {!showSignUp ? (
              <>
                <h1 className="davaindia-form-title">Welcome back</h1>
                <p className="davaindia-form-subtitle">Sign in to access your account</p>

                {loginError && (
                  <div className="davaindia-error-message">
                    {loginError}
                  </div>
                )}

                {/* Login method toggle */}
                <div className="davaindia-login-toggle">
                  <button
                    type="button"
                    onClick={() => toggleLoginMethod()}
                    className="davaindia-link-button"
                  >
                    {isMobileLogin ? 'Use email login' : 'Use mobile login'}
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  {!isMobileLogin ? (
                    <>
                      <div className={`davaindia-form-group ${errors.email ? 'error' : ''}`}>
                        <label htmlFor="email">Email</label>
                        <div className="davaindia-input-container">
                          <Mail size={18} className="davaindia-input-icon left" />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-100"
                            disabled={isLoading}
                            autoComplete="email"
                          />
                        </div>
                        {errors.email && <div className="davaindia-error-message">{errors.email}</div>}
                      </div>

                      <div className={`davaindia-form-group ${errors.password ? 'error' : ''}`}>
                        <label htmlFor="password">Password</label>
                        <div className="davaindia-input-container justifyBetween">
                          <div className="davaindia-input-container1">
                            <Lock size={18} className="davaindia-input-icon left" />
                            <input
                              id="password"
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="w-100"
                              disabled={isLoading}
                              autoComplete="current-password"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={togglePasswordVisibility}
                            disabled={isLoading}
                            className="davaindia-password-toggle"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {errors.password && <div className="davaindia-error-message">{errors.password}</div>}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={`davaindia-form-group ${errors.phone ? 'error' : ''}`}>
                        <label htmlFor="phone">Phone Number</label>
                        <div className="davaindia-input-container">
                          <span className="davaindia-country-code">+91</span>
                          <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) setPhone(value);
                            }}
                            placeholder="Enter phone number"
                            className="w-100"
                            disabled={isLoading || otpSent}
                            maxLength="10"
                          />
                        </div>
                        {errors.phone && <div className="davaindia-error-message">{errors.phone}</div>}
                      </div>
                      
                      {otpSent && (
                        <div className={`davaindia-form-group ${errors.otp ? 'error' : ''}`}>
                          <label htmlFor="otp">OTP</label>
                          <div className="davaindia-input-container">
                            <input
                              id="otp"
                              type="text"
                              value={otp}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 6) setOtp(value);
                              }}
                              maxLength="6"
                              placeholder="Enter 6-digit OTP"
                              className="w-100"
                              disabled={isLoading}
                            />
                          </div>
                          {errors.otp && <div className="davaindia-error-message">{errors.otp}</div>}
                          <div className="davaindia-otp-resend">
                            <button 
                              type="button" 
                              onClick={handleSendOtp}
                              className="davaindia-link-button"
                              disabled={isLoading}
                            >
                              Resend OTP
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {!otpSent && (
                        <button 
                          type="button" 
                          onClick={handleSendOtp} 
                          className="davaindia-btn davaindia-btn-secondary"
                          disabled={isLoading || !phone || phone.length !== 10}
                        >
                          {isLoading ? <span className="davaindia-spinner"></span> : 'Send OTP'}
                        </button>
                      )}
                    </>
                  )}

                  {/* Submit button - only show when form is complete */}
                  {(!isMobileLogin || (isMobileLogin && otpSent)) && (
                    <button 
                      type="submit" 
                      className="davaindia-btn davaindia-btn-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="davaindia-spinner"></span>
                      ) : (
                        <>
                          Sign In <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  )}
                </form>

                <div className="davaindia-form-footer">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleShowSignUp(false)} 
                    className="davaindia-link-button"
                  >
                    Sign up
                  </button>
                </div>
                <div className="davaindia-form-footer">
                  Want to be Our WholeSale Partner?{' '}
                  <button 
                    type="button" 
                    onClick={() => handleShowSignUp(true)} 
                    className="davaindia-link-button"
                  >
                    Sign up
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="davaindia-form-title">
                  {isWholesalePartner ? 'Wholesale Partner Registration' : 'Create Account'}
                </h1>
                {isWholesalePartner ? <WholesalePartnerForm /> : <SignUpForm />}

                <div className="davaindia-form-footer">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={handleBackToLogin} 
                    className="davaindia-link-button"
                  >
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
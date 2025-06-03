import React, { useState } from 'react';

const WholesalePartnerForm = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    gstNumber: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    billingEmail: ''
  });

  const [errors, setErrors] = useState({});
  const [loadingGST, setLoadingGST] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGSTFetch = () => {
    if (!formData.gstNumber || formData.gstNumber.length < 15) {
      setErrors(prev => ({ ...prev, gstNumber: 'Enter a valid GST number' }));
      return;
    }

    setLoadingGST(true);

    // Simulate API call
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        companyName: 'Example Pvt Ltd',
        street: '123 Example Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipcode: '400001',
        country: 'India'
      }));
      setErrors(prev => ({ ...prev, gstNumber: '' }));
      setLoadingGST(false);
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const formGroupStyle = {
    marginBottom: '15px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px'
  };

  const errorStyle = {
    color: 'red',
    fontSize: '0.9em',
    marginTop: '5px'
  };

  const containerStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px'
  };

  const headingStyle = {
    textAlign: 'center',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Wholesale Partner Registration</h2>
      <form onSubmit={handleSubmit}>
        <div style={formGroupStyle}>
          <label style={labelStyle}>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleGSTFetch}
            disabled={loadingGST}
            style={{ ...buttonStyle, backgroundColor: loadingGST ? '#6c757d' : '#007bff' }}
          >
            {loadingGST ? 'Fetching...' : 'Fetch Details'}
          </button>
          {errors.gstNumber && <div style={errorStyle}>{errors.gstNumber}</div>}
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Company Name</label>
          <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Website</label>
          <input type="text" name="website" value={formData.website} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Phone Number</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Street Address</label>
          <input type="text" name="street" value={formData.street} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>State</label>
          <input type="text" name="state" value={formData.state} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Zip Code</label>
          <input type="text" name="zipcode" value={formData.zipcode} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Country</label>
          <input type="text" name="country" value={formData.country} onChange={handleChange} style={inputStyle} />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Billing Email Address</label>
          <input type="email" name="billingEmail" value={formData.billingEmail} onChange={handleChange} style={inputStyle} />
        </div>

        <button type="submit" style={buttonStyle}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default WholesalePartnerForm;

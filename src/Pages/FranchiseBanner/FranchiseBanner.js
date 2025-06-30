import React from 'react';
import './FranchiseBanner.css';
import logo from "../../logo/logo1.jpg";
import Footer from '../../components/Footer/Footer';
import Head from '../Head/Head';

const FranchiseBanner = () => {
  return (
    <div className="franchise-page">
      <Head />
      {/* Banner Section */}
      <div className="banner-container">
        <div className="banner">
          <div className="left-content">
            {/* <img
              src={logo}
              alt="Logo"
              className="logo"
            /> */}
            <h2 className="banner-title">
              Enjoy "90% subsidy" on your investment, begin your<br />
              Healthcare Business with BSK pharma now!<br />
              Enter your details and Transform your business<br />
              dream into reality.
            </h2>
            <ul className="benefits-list">
              <li>Take the first mover advantage and open your own generic pharmacy store in your location.</li>
            </ul>
            <div className="terms">T&C apply</div>
          </div>

          <div className="right-content">
            <img
              src="https://www.ukgermanpharmaceuticals.com/uploaded-files/gallery/photos/thumbs/APJ-Abdul-Kalam-Inspiration-Award-20244-thumbs-800X600.jpg"
              alt="Person"
              className="person-image"
            />
          </div>
        </div>
      </div>

      {/* Questionnaire Sections */}
      <div className="questionnaire-container">
        <div className="questionnaire">
          <QuestionBox
            title="Are you a healthcare professional?"
            yesText="Yes"
            noText="No"
          />
          <QuestionBox
            title="Do you have the required 250 sqft space to open the store?"
            yesText="Yes"
            noText="No"
          />
        </div>
      </div>

      <div className="questionnaire-container">
        <div className="questionnaire">
          <QuestionBox
            title="Do you have investment ready to open the store?"
            yesText="Yes"
            noText="No"
          />
          <QuestionBox
            title="Are you a pharmacist or can you arrange a pharmacy license?"
            yesText="Yes"
            noText="No"
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="form-container">
        <FranchiseForm />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

// Question Box Component
const QuestionBox = ({ title, yesText, noText }) => {
  const [selected, setSelected] = React.useState(null);

  const handleSelect = (value) => {
    setSelected(value);
  };

  return (
    <div className="question-box">
      <h3 className="question-title">{title}</h3>
      <hr className="question-divider" />
      <button
        className={`yes-btn ${selected === 'yes' ? 'selected' : ''}`}
        onClick={() => handleSelect('yes')}
      >
        {yesText}
      </button>
      <button
        className={`no-btn ${selected === 'no' ? 'selected' : ''}`}
        onClick={() => handleSelect('no')}
      >
        {noText}
      </button>
    </div>
  );
};

// Form Component
const FranchiseForm = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    pincode: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // You can add API call or other submission logic here
  };

  return (
    <form onSubmit={handleSubmit} className="franchise-form">
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Please Enter your calling number"
        value={formData.phone}
        onChange={handleChange}
        required
        pattern="[0-9]{10}"
        title="Please enter a 10-digit phone number"
      />
      <input
        type="number"
        name="pincode"
        placeholder="Pincode"
        value={formData.pincode}
        onChange={handleChange}
        required
      />
      <button type="submit" className="submit-btn">Submit</button>
    </form>
  );
};

export default FranchiseBanner;
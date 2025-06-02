import React from 'react';
import './Prescription.css';
import prescription from "../../logo/Prescription.webp";
import Header from '../../components/Header/Header';

const Prescription = () => {
  return (
    <>
      <Header />
      <div className="prescription-page-container">
        <div className="prescription-left-panel">
          <div className="prescription-panel-header">
            <h2>Valid Prescription Guide</h2>
            <p className="prescription-warning">
              <span className="prescription-warning-icon">⚠️</span> Your uploaded prescription should contain all the information shown in the model prescription below
            </p>
          </div>

          <div className="prescription-image-guide-container">
            <div className="prescription-image-wrapper">
              <div className="prescription-image-container">
                <img
                  src={prescription}
                  alt="Model Prescription Example"
                  className="prescription-example-image"
                />
              </div>
            </div>

            <div className="prescription-guide-lines">
              <h4 className="prescription-guide-title">Upload Guidelines</h4>
              <ul className="prescription-guide-list">
                <li className="prescription-guide-item">
                  <span className="prescription-bullet">•</span> Do not crop any part of the prescription
                </li>
                <li className="prescription-guide-item">
                  <span className="prescription-bullet">•</span> Avoid blurred or low-quality images
                </li>
                <li className="prescription-guide-item">
                  <span className="prescription-bullet">•</span> Must include doctor and patient details, date of visit
                </li>
                <li className="prescription-guide-item">
                  <span className="prescription-bullet">•</span> Supported formats: PNG, JPEG, PDF
                </li>
                <li className="prescription-guide-item">
                  <span className="prescription-bullet">•</span> Maximum file size: 5MB
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="prescription-right-panel">
          <div className="prescription-panel-header">
            <h3>Upload Your Prescription</h3>
            <p className="prescription-panel-subtitle">Please upload a valid prescription from your doctor</p>
          </div>

          <div className="prescription-upload-area">
            <div className="prescription-upload-icon">📁</div>
            <button className="prescription-upload-button">
              <span className="prescription-button-icon">⬆</span> Upload Prescription
            </button>
            <p className="prescription-upload-hint">or drag and drop files here</p>
          </div>

          <div className="prescription-options-container">
            <div className="prescription-option-box prescription-selected">
              <div className="prescription-option-icon">✅</div>
              <div className="prescription-option-content">
                <div className="prescription-option-title">Search & Add medicines</div>
                <div className="prescription-option-description">Manually search and add medicines in the cart</div>
              </div>
            </div>

            <div className="prescription-option-box">
              <div className="prescription-option-icon">📞</div>
              <div className="prescription-option-content">
                <div className="prescription-option-title">Get a call from Davaindia</div>
                <div className="prescription-option-description">Our pharmacist will call to confirm your medicines</div>
              </div>
            </div>
          </div>

          <button className="prescription-continue-button" disabled>
            Continue to Checkout
          </button>
          <p className="prescription-upload-warning">
            <span className="prescription-warning-icon">⚠</span> Please upload your prescription to proceed
          </p>
        </div>
      </div>
    </>
  );
};

export default Prescription;
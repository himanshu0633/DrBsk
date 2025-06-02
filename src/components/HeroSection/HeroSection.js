import React from 'react';
import './HeroSection.css';
import Right from '../../logo/Right.svg';
import Left from '../../logo/Left.svg';

const HeroSection = () => {
  return (
    <div className="hero-container">
      <div className="search-section">
        <img 
          src={Right} 
          alt="Decorative pattern" 
          className="decorative-image right-image" 
        />
        
        <div className="hero-content">
          <h2>Buy generic medicines online at the <span className="highlight">lowest price</span></h2>
          
          <div className="search-box">
            <div className="search-icon">🔍</div>
            <input 
              type="text" 
              placeholder="Search for medicines, health products..." 
              className="search-input"
            />
            
          </div>
        </div>
        
        <img 
          src={Left} 
          alt="Decorative pattern" 
          className="decorative-image left-image" 
        />
      </div>
    </div>
  );
};

export default HeroSection;
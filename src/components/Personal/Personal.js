import React from 'react';
import './Personal.css';
import logo from "../../logo/1.jpg";
import logo2 from "../../logo/2.jpg";
import logo3 from "../../logo/3.jpg";
import logo4 from "../../logo/4.jpg";
import logo5 from "../../logo/5.jpg";
import logo6 from "../../logo/6.jpg";
import logo7 from "../../logo/7.jpg";
import logo8 from "../../logo/8.jpg";
import logo9 from "../../logo/9.jpg";

const Personal = [
  { title: 'First Aid', img: logo, bg: '#fef7e0' },
  { title: 'Feminine', img: logo2, bg: '#fdebed' },
  { title: 'Oral Care', img: logo3, bg: '#f5f5ff' },
  { title: 'Sexual Wellness', img: logo4, bg: '#fff4e5' },
  { title: 'Skin Care', img: logo5, bg: '#e6f5f3' },
  { title: 'Hair Care', img: logo6, bg: '#f2f9ff' },
  { title: 'Pain Relief', img: logo7, bg: '#fff9f1' },
  { title: 'Home Essentials', img: logo8, bg: '#f0fff5' },
  { title: 'Orthopedic', img: logo9, bg: '#fef3f2' },
  { title: 'Baby Care', img: logo, bg: '#eff8ff' }
];

const PersonalCareSlider = () => {
  const items = [...Personal, ...Personal]; // Infinite scroll effect

  return (
    <div className="personal-wrapper">
      <h2 className="personal-title">Personal Care Essentials</h2>
      <div className="personal-scroll-container">
        <div className="personal-scroll-content">
          {items.map((item, index) => (
            <div className="personal-card" key={`personal-${index}`}>
              <div className="personal-image-wrapper" style={{ backgroundColor: item.bg }}>
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="personal-image" 
                  loading="lazy"
                />
              </div>
              <h3 className="personal-item-title">{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalCareSlider;
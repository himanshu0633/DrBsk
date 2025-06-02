import React from 'react';
import './Categories.css';
import logo from "../../logo/1.jpg";
import logo2 from "../../logo/2.jpg";
import logo3 from "../../logo/3.jpg";
import logo4 from "../../logo/4.jpg";
import logo5 from "../../logo/5.jpg";
import logo6 from "../../logo/6.jpg";
import logo7 from "../../logo/7.jpg";
import logo8 from "../../logo/8.jpg";
import logo9 from "../../logo/9.jpg";

const categories = [
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

const Categories = () => {
  // Duplicate categories to create infinite effect
  const items = [...categories, ...categories];

  return (
    <div className="categories-wrapper">
      <h4 className="categories-title">Popular Categories</h4>
      <div className="scrolling-wrapper">
        <div className="scrolling-content">
          {items.map((item, index) => (
            <div className="category-card" key={index}>
              <div className="category-image-container" style={{ background: item.bg }}>
                <img src={item.img} alt={item.title} className="category-image" />
              </div>
              <p className="category-title">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
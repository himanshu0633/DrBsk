import React, { useEffect, useState } from 'react';
import './Slider.css';
import cd1 from '../../logo/cd1.webp';
import cd2 from '../../logo/cd2.webp';
import cd3 from '../../logo/cd3.webp';
import cd4 from '../../logo/cd4.webp';
import cd5 from '../../logo/cd5.jpg';

const Slider = () => {
  const [loaded, setLoaded] = useState(false);
  const images = [cd1, cd2, cd3, cd4, cd5];
  const duplicatedImages = [...images, ...images]; // for seamless loop

  // Wait until all images are loaded
  useEffect(() => {
    let loadedCount = 0;
    duplicatedImages.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === duplicatedImages.length) {
          setLoaded(true);
        }
      };
    });
  }, [duplicatedImages]);

  return (
    <div className="cd-slider-container">
      <div className={`cd-slider-track ${loaded ? 'animate' : ''}`}>
        {duplicatedImages.map((img, index) => (
          <div className="cd-slide" key={`img-${index}`}>
            <img src={img} alt={`CD ${index % images.length + 1}`} className="cd-image" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Slider;
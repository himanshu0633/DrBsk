import React, { useEffect, useRef, useState } from 'react';
import './Banner.css';
import b1 from '../../logo/b1.webp'; // Import your first banner image
import b2 from '../../logo/b2.webp'; // Import your second banner image

const Banner = () => {
  // Banner images array
  const originalImages = [b1, b2];
  // Create a cloned set for seamless looping
  const images = [originalImages[originalImages.length - 1], ...originalImages, originalImages[0]];
  
  const [currentIndex, setCurrentIndex] = useState(1); // Start at first original image
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const intervalRef = useRef(null);

  // Auto slide functionality
  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => prev + 1);
    }, 3000);
  };

  // Initialize auto slide
  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle seamless looping
  useEffect(() => {
    // When we reach the last cloned item, instantly reset to the first original
    if (currentIndex === images.length - 1) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(1);
      }, 500); // Should match transition duration
      return () => clearTimeout(timer);
    }
    // When we reach the first cloned item, instantly reset to the last original
    else if (currentIndex === 0) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(images.length - 2);
      }, 500);
      return () => clearTimeout(timer);
    }
    // Enable transitions for normal slides
    else if (!transitionEnabled) {
      setTimeout(() => setTransitionEnabled(true), 50);
    }
  }, [currentIndex, images.length, transitionEnabled]);

  return (
    <div className="banner-carousel-fullwidth">
      <div className="banner-carousel-container">
        <div
          className="banner-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: transitionEnabled ? 'transform 0.5s ease-in-out' : 'none'
          }}
        >
          {images.map((img, index) => (
            <div className="banner-carousel-slide" key={`banner-slide-${index}`}>
              <img 
                src={img} 
                alt={`Banner ${index}`} 
                className="banner-carousel-image" 
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation dots */}
      <div className="banner-carousel-indicators">
        {originalImages.map((_, index) => (
          <button
            key={`banner-indicator-${index}`}
            className={`banner-carousel-dot ${index === (currentIndex - 1) % originalImages.length ? 'banner-carousel-dot-active' : ''}`}
            onClick={() => {
              setCurrentIndex(index + 1);
            }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
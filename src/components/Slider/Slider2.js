import React, { useEffect, useState } from 'react';
import './Slider.css';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';

const Slider2 = () => {
  const [loaded, setLoaded] = useState(false);
  const [banners, setBanners] = useState([]);

  // Fetch banners of type 'carousel1'
  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/user/allBanners");
      const bannerData = response.data;

      const mainBanners = bannerData.filter(
        (banner) =>
          banner.type === "carousel2" &&
          Array.isArray(banner.slider_image) &&
          banner.slider_image.length > 0
      );

      if (mainBanners.length > 0) {
        // Clone first and last for smooth loop
        const updatedBanners = [
          mainBanners[mainBanners.length - 1],
          ...mainBanners,
          mainBanners[0],
        ];
        setBanners(updatedBanners);

        // Preload images
        let loadedCount = 0;
        updatedBanners.forEach((banner) => {
          const img = new Image();
          img.src = banner.slider_image[0]; // Use first image
          img.onload = () => {
            loadedCount++;
            if (loadedCount === updatedBanners.length) {
              setLoaded(true);
            }
          };
        });
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);



  return (
    <div>
      <div className="cd-slider-container">
        <div className={`cd-slider-track ${loaded ? 'animate' : ''}`}>
          {banners.map((banner, index) => (
            <div className="cd-slide" key={`banner-${index}`}>
              <img
                // src={banner.slider_image[0]}
                src={`${API_URL}/${banner.slider_image[0]}`}

                alt={`Banner ${index + 1}`}
                className="cd-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slider2;

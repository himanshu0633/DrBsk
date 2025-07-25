import React, { useEffect, useRef, useState } from "react";
import "./Banner.css";
import axiosInstance from "../AxiosInstance";
import API_URL from "../../config";
import Slider from 'react-slick'; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Banner = () => {
  const [banners, setBanners] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/user/allBanners");
      const bannerData = response.data;

      const mainBanners = bannerData.filter(
        (banner) =>
          banner.type === "HomePageSlider" &&
          Array.isArray(banner.slider_image) &&
          banner.slider_image.length > 0
      );

      if (mainBanners.length > 0) {
        setBanners([
          mainBanners[mainBanners.length - 1],
          ...mainBanners,
          mainBanners[0],
        ]);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // if (banners.length === 0) {
  //   return <div className="banner-carousel-loading">No Banners</div>;
  // }

  // const originalBanners = banners.slice(1, banners.length - 1);


  const settings = {
    dots: true,  // Show dots for navigation
    infinite: true,  // Loop the slider
    speed: 500,  // Transition speed
    slidesToShow: 1,  // Show one slide at a time
    slidesToScroll: 1,  // Scroll one slide at a time
    autoplay: true,  // Enable autoplay
    autoplaySpeed: 3000,  // Autoplay interval (in ms)
    arrows: false,  // Disable arrows
  };

  return (
    <div className="banner-slider-container">
      <Slider {...settings}>  {/* Wrap the slides with Slider component */}
        {banners.map((banner, index) => (
          <div className="banner-slide" key={`banner-${index}`}>
            <img
              src={`${API_URL}/${banner.slider_image[0]}`}
              alt={`Banner ${index + 1}`}
              className="banner-image1"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default Banner;


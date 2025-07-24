import React, { useEffect, useRef, useState } from "react";
import "./Banner.css";
import axiosInstance from "../AxiosInstance";
import API_URL from "../../config";

const Banner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const intervalRef = useRef(null);

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

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 3000);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    if (currentIndex === banners.length - 1) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(1);
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentIndex === 0) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIndex(banners.length - 2);
      }, 500);
      return () => clearTimeout(timer);
    } else if (!transitionEnabled) {
      setTimeout(() => setTransitionEnabled(true), 50);
    }
  }, [currentIndex, banners.length, transitionEnabled]);

  if (banners.length === 0) {
    return <div className="banner-carousel-loading">Loading banners...</div>;
  }

  const originalBanners = banners.slice(1, banners.length - 1);

  return (
    <div className="banner-carousel-fullwidth">
      <div className="banner-carousel-container">
        <div
          className="banner-carousel-track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: transitionEnabled
              ? "transform 0.5s ease-in-out"
              : "none",
          }}
        >
          {banners.map((banner, index) => (
            <div
              className="banner-carousel-slide"
              key={`banner-slide-${index}`}
            >
              <img
                src={`${API_URL}/${banner.slider_image[0]}`}
                alt={`Banner ${index}`}
                className="banner-carousel-image"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="banner-carousel-indicators">
        {originalBanners.map((_, index) => (
          <button
            key={`banner-indicator-${index}`}
            className={`banner-carousel-dot ${
              index === (currentIndex - 1) % originalBanners.length
                ? "banner-carousel-dot-active"
                : ""
            }`}
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


// import React, { useEffect, useRef, useState } from "react";
// import "./Banner.css";
// import axiosInstance from "../AxiosInstance";
// import API_URL from "../../config";

// const Banner = () => {
//   const [banners, setBanners] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(1);
//   const [transitionEnabled, setTransitionEnabled] = useState(true);
//   const intervalRef = useRef(null);

//   const fetchData = async () => {
//     try {
//       const response = await axiosInstance.get("/user/allBanners");
//       const bannerData = response.data;

//       // Filter only type === 'main' and ensure image exists
//       const mainBanners = bannerData.filter(
//         (banner) =>
//           banner.type === "HomePageSlider" &&
//           Array.isArray(banner.slider_image) &&
//           banner.slider_image.length > 0
//       );

//       if (mainBanners.length > 0) {
//         setBanners([
//           mainBanners[mainBanners.length - 1], // clone last
//           ...mainBanners,   
//           mainBanners[0], // clone first
//         ]);
//       }
//     } catch (error) {
//       console.error("Error fetching banners:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const startAutoSlide = () => {
//     intervalRef.current = setInterval(() => {
//       setCurrentIndex((prev) => prev + 1);
//     }, 3000);
//   };

//   useEffect(() => {
//     startAutoSlide();
//     return () => {
//       clearInterval(intervalRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     if (banners.length === 0) return;

//     if (currentIndex === banners.length - 1) {
//       const timer = setTimeout(() => {
//         setTransitionEnabled(false);
//         setCurrentIndex(1);
//       }, 500);
//       return () => clearTimeout(timer);
//     } else if (currentIndex === 0) {
//       const timer = setTimeout(() => {
//         setTransitionEnabled(false);
//         setCurrentIndex(banners.length - 2);
//       }, 500);
//       return () => clearTimeout(timer);
//     } else if (!transitionEnabled) {
//       setTimeout(() => setTransitionEnabled(true), 50);
//     }
//   }, [currentIndex, banners.length, transitionEnabled]);

//   if (banners.length === 0) {
//     return <div className="banner-carousel-loading">Loading banners...</div>;
//   }

//   const originalBanners = banners.slice(1, banners.length - 1);

//   return (
//     <div className="banner-carousel-fullwidth">
//       <div className="banner-carousel-container">
//         <div
//           className="banner-carousel-track"
//           style={{
//             transform: `translateX(-${currentIndex * 100}%)`,
//             transition: transitionEnabled
//               ? "transform 0.5s ease-in-out"
//               : "none",
//           }}
//         >
//           {banners.map((banner, index) => (
//             <div
//               className="banner-carousel-slide"
//               key={`banner-slide-${index}`}
//             >
//               <img
//                 src={`${API_URL}/${banner.slider_image[0]}`}
//                 alt={`Banner ${index}`}
//                 className="banner-carousel-image"
//                 loading="lazy"
//               />
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="banner-carousel-indicators">
//         {originalBanners.map((_, index) => (
//           <button
//             key={`banner-indicator-${index}`}
//             className={`banner-carousel-dot ${index === (currentIndex - 1) % originalBanners.length
//                 ? "banner-carousel-dot-active"
//                 : ""
//               }`}
//             onClick={() => {
//               setCurrentIndex(index + 1);
//             }}
//             aria-label={`Go to slide ${index + 1}`}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Banner;


// import React, { useEffect, useState } from "react";
// import Slider from "react-slick";
// import "./Banner.css";
// import axiosInstance from "../AxiosInstance";
// import API_URL from "../../config";

// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";

// const Banner = () => {
//   const [banners, setBanners] = useState([]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await axiosInstance.get("/user/allBanners");
//         const bannerData = response.data;

//         const mainBanners = bannerData.filter(
//           (banner) =>
//             banner.type === "HomePageSlider" &&
//             Array.isArray(banner.slider_image) &&
//             banner.slider_image.length > 0
//         );

//         setBanners(mainBanners);
//       } catch (err) {
//         console.error("Error fetching banners:", err);
//       }
//     };

//     fetchData();
//   }, []);

//  const settings = {
//   dots: true,
//   infinite: true,
//   speed: 600,
//   slidesToShow: 1,
//   slidesToScroll: 1,
//   autoplay: true,
//   autoplaySpeed: 3000,
//   arrows: false,
//   pauseOnHover: true,
//   centerMode: false, // <- critical
//   variableWidth: false // <- critical
// };


//   return (
//     <div className="banner-slider-wrapper">
//       <Slider {...settings}>
//         {banners.map((banner, index) => (
//           <div className="slide-wrapper" key={index}>
//             <img
//               src={`${API_URL}/${banner.slider_image[0]}`}
//               alt={`Banner ${index}`}
//               className="banner-image"
//               loading="lazy"
//             />
//           </div>
//         ))}
//       </Slider>
//     </div>
//   );
// };

// export default Banner;

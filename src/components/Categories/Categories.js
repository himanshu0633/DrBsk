import React, { useEffect, useState } from 'react';
import './Categories.css';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';
import CustomLoader from '../CustomLoader';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import JoinUrl from '../../JoinUrl';

const Categories = () => {
  const [categoryName, setCategoryName] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubCategories();
    
    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await axiosInstance.get(`/user/allSubcategories`);
      const veterinaryCategories = response?.data?.filter(
  (item) => item.subCategoryvariety === 'Human'
);
      setCategoryName(veterinaryCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSlidesToShow = () => {
    if (windowWidth >= 1200) return 5; // Desktop: 5 categories
    if (windowWidth >= 768) return 4;  // Tablet: 4 categories
    return 2; // Mobile: 2 categories
  };

  const settings = {
    dots: false,
    infinite: categoryName.length > getSlidesToShow(),
    speed: 500,
    arrows: windowWidth > 768, // Show arrows only on tablet and desktop
    initialSlide: 0,
    autoplay: false,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: Math.min(categoryName.length, getSlidesToShow()),
    slidesToScroll: 1,
    centerMode: windowWidth < 768,
    centerPadding: windowWidth < 768 ? '20px' : '0',
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(categoryName.length, 5), // Desktop: 5
          slidesToScroll: 1,
          infinite: categoryName.length > 5
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: Math.min(categoryName.length, 4), // Tablet: 4
          slidesToScroll: 1,
          infinite: categoryName.length > 4
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(categoryName.length, 4), // Tablet: 4
          slidesToScroll: 1,
          infinite: categoryName.length > 4,
          arrows: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2, // Mobile: 2 categories
          slidesToScroll: 1,
          infinite: categoryName.length > 2,
          arrows: false,
          centerMode: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: categoryName.length > 2,
          arrows: false,
          centerMode: true,
          centerPadding: '30px'
        }
      }
    ]
  };

  if (categoryName.length === 0 && !loading) return null;

  return (
    <div className="categories-wrapper">
      {loading ? (
        <div className="loader-container">
          <CustomLoader />
        </div>
      ) : (
        <div className="categories-container">
          <div className="categories-section">
            <h2 className="section-title">Popular Human Subcategories</h2>
            <div className="categories-slider-wrapper">
              <Slider {...settings} className="categories-slider">
                {categoryName.map((item, index) => (
                  <div key={item._id || index} className="category-slide">
                    <div 
                      className="category-item"
                      onClick={() => navigate(`/fever/${item.name}`)}
                    >
                      <div className="category-image-wrapper">
                        <img
                          src={JoinUrl(API_URL, item.image)}
                          alt={item.name} 
                          className="category-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150x120?text=Category';
                          }}
                        />
                      </div>
                      <div className="category-name">{item.name}</div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
import React, { useEffect, useState } from 'react';
import './Categories.css';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';
import CustomLoader from '../CustomLoader';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import JoinUrl from '../../JoinUrl';

const Categories = ({ onCategoryClick }) => {
  const [categoryName, setCategoryName] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  // Facebook Pixel Tracking Functions
  const trackViewContent = (contentData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: contentData.name,
        content_ids: [contentData.id],
        content_type: contentData.type || 'product',
        value: contentData.value || 0,
        currency: contentData.currency || 'INR',
        content_category: contentData.category,
      });
    }

    // Server-side event send
    sendServerEvent('ViewContent', contentData);
  };

  const trackAddToCart = (productData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_ids: [productData.id],
        content_name: productData.name,
        content_type: 'product',
        value: productData.value || productData.price || 0,
        currency: 'INR',
        num_items: productData.quantity || 1,
      });
    }
    sendServerEvent('AddToCart', productData);
  };

  // Server-side event function
  const sendServerEvent = async (eventName, data) => {
    try {
      const eventData = {
        eventName,
        data: {
          ...data,
          eventSourceUrl: window.location.href,
          actionSource: 'website',
          eventTime: Math.floor(Date.now() / 1000),
        },
        fbp: getCookie('_fbp'),
        fbc: getCookie('_fbc'),
        clientUserAgent: navigator.userAgent,
      };

      // Send to your backend API
      await fetch(`${API_URL}api/facebook-events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error('Error sending server event:', error);
    }
  };

  // Helper function to get cookies
  const getCookie = (name) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Effect for window resize and initial tracking
  useEffect(() => {
    fetchSubCategories();
    
    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Track categories section view
    trackViewContent({
      id: 'categories_section',
      name: 'Popular Human Subcategories Section',
      value: 0,
      category: 'Navigation',
      type: 'category_section',
    });
    
    setIsInitialized(true);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect for tracking loading state
  useEffect(() => {
    if (loading) {
      trackViewContent({
        id: 'categories_loading',
        name: 'Categories Loading State',
        value: 0,
        category: 'Loading',
        type: 'technical',
      });
    }
  }, [loading]);

  // Effect for tracking total categories count
  useEffect(() => {
    if (!loading && categoryName.length > 0) {
      trackViewContent({
        id: 'total_categories_count',
        name: `Total Categories: ${categoryName.length}`,
        value: categoryName.length,
        category: 'Analytics',
        type: 'metrics',
      });
    }
  }, [loading, categoryName.length]);

  const fetchSubCategories = async () => {
    try {
      const response = await axiosInstance.get(`/user/allSubcategories`);
      const veterinaryCategories = response?.data?.filter(
        (item) => item.subCategoryvariety === 'Human'
      );
      setCategoryName(veterinaryCategories);
      
      // Track individual category views after data is loaded
      setTimeout(() => {
        veterinaryCategories.forEach((category, index) => {
          setTimeout(() => {
            trackViewContent({
              id: `category_${category._id || index}`,
              name: `${category.name} Category View`,
              value: 0,
              category: 'Product Category',
              type: 'category',
            });
          }, index * 300);
        });
      }, 1000);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      // Track error
      trackViewContent({
        id: 'categories_fetch_error',
        name: 'Error Fetching Categories',
        value: 0,
        category: 'Error',
        type: 'technical',
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getSlidesToShow = () => {
    if (windowWidth >= 1200) return 5; // Desktop: 5 categories
    if (windowWidth >= 768) return 4;  // Tablet: 4 categories
    return 2; // Mobile: 2 categories
  };

  const handleCategoryClick = (category) => {
    // Track the category click event
    trackViewContent({
      id: category._id || `category_${Date.now()}`,
      name: category.name,
      value: 0,
      category: 'Human Medicine Category',
      type: 'category',
      subcategory: category.subCategoryvariety,
    });

    // Call parent component callback if provided
    if (onCategoryClick) {
      onCategoryClick(category.name);
    }

    // Navigate to category page
    navigate(`/fever/${category.name}`);
  };

  const handleSliderNavigation = (direction) => {
    trackViewContent({
      id: `categories_slider_${direction}`,
      name: `Categories Slider ${direction} Navigation`,
      value: 0,
      category: 'Navigation',
      type: 'slider_interaction',
    });
  };

  const handleImageError = (e, categoryName) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/150x120?text=Category';
    
    // Track image error for analytics
    trackViewContent({
      id: `category_image_error_${categoryName}`,
      name: `Image Error: ${categoryName}`,
      value: 0,
      category: 'Error Tracking',
      type: 'technical',
    });
  };

  const handleImageLoad = (category) => {
    trackViewContent({
      id: `category_image_loaded_${category._id}`,
      name: `${category.name} Image Loaded`,
      value: 0,
      category: 'Technical',
      type: 'image_load',
    });
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
    beforeChange: (current, next) => {
      const direction = next > current ? 'next' : 'previous';
      handleSliderNavigation(direction);
    },
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
          {/* Hidden div for tracking - removed useEffect from here */}
          <div 
            style={{ display: 'none' }}
            data-tracking="categories_loading"
          />
        </div>
      ) : (
        <div className="categories-container">
          <div className="categories-section">
            <h2 
              className="section-title"
              onClick={() => trackViewContent({
                id: 'categories_title_click',
                name: 'Popular Human Subcategories Title',
                value: 0,
                category: 'Navigation',
                type: 'section_title',
              })}
            >
              Popular Human Subcategories
            </h2>
            <div className="categories-slider-wrapper">
              <Slider {...settings} className="categories-slider">
                {categoryName.map((item, index) => (
                  <div 
                    key={item._id || index} 
                    className="category-slide"
                    onClick={(e) => {
                      // Prevent double triggering if parent div also handles click
                      if (e.target.closest('.category-item')) return;
                      handleCategoryClick(item);
                    }}
                  >
                    <div 
                      className="category-item"
                      onClick={() => handleCategoryClick(item)}
                    >
                      <div className="category-image-wrapper">
                        <img
                          src={JoinUrl(API_URL, item.image)}
                          alt={item.name} 
                          className="category-img"
                          onError={(e) => handleImageError(e, item.name)}
                          onLoad={() => handleImageLoad(item)}
                          onClick={() => trackViewContent({
                            id: `category_image_${item._id}`,
                            name: `${item.name} Category Image`,
                            value: 0,
                            category: 'Category Image',
                            type: 'image',
                          })}
                        />
                      </div>
                      <div 
                        className="category-name"
                        onClick={() => trackViewContent({
                          id: `category_name_click_${item._id}`,
                          name: `${item.name} Category Name`,
                          value: 0,
                          category: 'Navigation',
                          type: 'text',
                        })}
                      >
                        {item.name}
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
            
            {/* Hidden div for total categories tracking - removed useEffect from here */}
            <div 
              style={{ display: 'none' }}
              data-tracking="total_categories"
              data-count={categoryName.length}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
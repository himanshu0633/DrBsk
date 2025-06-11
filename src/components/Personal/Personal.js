import React, { useEffect, useState } from 'react';
import './Personal.css';
import CustomLoader from '../CustomLoader';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import '../Categories/Categories.css'


const PersonalCareSlider = () => {
  const [VetcategoryName, setVetCategoryName] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVetCategories();
  }, []);

  const fetchVetCategories = async () => {
    try {
      const response = await axiosInstance.get(`/user/allcategories`);
      const veterinaryCategories = response?.data?.filter(
        (item) => item.variety === 'Veterinary'
      );
      setVetCategoryName(veterinaryCategories);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Vet categories:", error);
    }
  };

  const settings = {
    dots: false,
    // infinite: true,
    infinite: VetcategoryName.length >= 6,
    speed: 500,
    // slidesToShow: 6,
    slidesToShow: VetcategoryName.length >= 6 ? 6 : VetcategoryName.length,
    slidesToScroll: 1,
    arrow: true,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
        }
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          // initialSlide: 2,
          infinite: true,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (

    <div className="personal-wrapper">
      {loading ? <CustomLoader /> : <div className="slider_container">
        <h2 className="personal-title">Popular Veterinary Categories</h2>
        <Slider {...settings}>
          {VetcategoryName.map((item, index) => (
            <div className="category-card cursor-pointer" key={index}
              onClick={() => navigate('/fever', { state: { categoryId: item._id } })}
            >
              <div className="category-image-container" style={{ background: item.bg }}>
                <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
              </div>
              <p className="category-title">{item.name}</p>
            </div>
          ))}
        </Slider>
      </div>}

      {/* {loading ? <CustomLoader /> : (<div className="scrolling-content">
            {VetcategoryName.map((item, index) => (
              <div className="category-card cursor-pointer" key={index}
                onClick={() => navigate('/fever', { state: { categoryId: item._id } })}
              >
                <div className="category-image-container" style={{ background: item.bg }}>
                  <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
                </div>
                <p className="category-title">{item.name}</p>
              </div>
            ))}
          </div>)} */}
    </div>
  );
};

export default PersonalCareSlider;
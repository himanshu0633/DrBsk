import React, { useEffect, useState } from 'react';
import './Categories.css';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';
import CustomLoader from '../CustomLoader';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";

const Categories = () => {
  const [categoryName, setCategoryName] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await axiosInstance.get(`/user/allcategories`);
      const humanCategories = response?.data?.filter(
        (item) => item.variety === 'Human'
      );
      setCategoryName(humanCategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    dots: false,
    infinite: categoryName.length > 1,
    speed: 500,
    // slidesToShow: categoryName.length >= 6 ? 6 : categoryName.length,
    slidesToShow: Math.max(1, Math.min(categoryName.length, 6)),
    slidesToScroll: 1,
    arrow: true,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          // slidesToShow: 4,
          slidesToShow: Math.max(1, Math.min(categoryName.length, 4)),
          slidesToScroll: 1,
          infinite: categoryName.length >= 5
        }
      },
      {
        breakpoint: 800,
        settings: {
          // slidesToShow: 3,
          slidesToShow: Math.max(1, Math.min(categoryName.length, 3)),
          slidesToScroll: 1,
          infinite: categoryName.length >= 3
        }
      },
      {
        breakpoint: 600,
        settings: {
          // slidesToShow: 2,
          slidesToShow: Math.max(1, Math.min(categoryName.length, 1)),
          slidesToScroll: 1,
          infinite: categoryName.length >= 2
        }
      }
    ]
  };

  if (categoryName.length === 0) return null;

  return (
    <div className="categories-wrapper">
      {loading ? <CustomLoader /> : (
        <div className="slider_container">
          <h4 className="categories-title">Popular Human Categories</h4>
          <Slider {...settings}>
            {categoryName.map((item, index) => (
              <div
                className="category-card cursor-pointer"
                key={item._id}
                onClick={() => navigate('/fever', { state: { categoryId: item._id } })}
              >
                <div className="category-image-container" style={{ background: item.bg }}>
                  <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
                </div>
                <p className="category-title">{item.name}</p>
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

export default Categories;



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
      setLoading(false)
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 6,
    slidesToScroll: 3,
    arrow: true,
  };

  return (
    <div className="categories-wrapper">


      {loading ? <CustomLoader /> : <div className="slider_container">
        <h4 className="categories-title">Popular Human Categories</h4>
        <Slider {...settings}>
          {categoryName.map((item, index) => (
            <div className="category-card cursor-pointer" key={index}
              onClick={() => navigate('/fever', { state: { categoryId: item._id } })}
            >
              <div className="category-image-container" style={{ background: item.bg }}>
                <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
                <p className="category-title">{item.name}</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>}


      {/* <div className="scrolling-wrapper">
        {loading ? <CustomLoader /> : (<div className="scrolling-content">
          {categoryName.map((item, index) => (
            <div className="category-card cursor-pointer" key={index}
              // onClick={() => navigate(`/subcategory/${item._id}`)}
              onClick={() => navigate('/fever', { state: { categoryId: item._id } })}

            >
              <div className="category-image-container" style={{ background: item.bg }}>
                <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
              </div>
              <p className="category-title">{item.name}</p>
            </div>
          ))}
        </div>)}

      </div> */}
    </div>
  );
};

export default Categories;

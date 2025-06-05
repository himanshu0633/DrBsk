
import React, { useEffect, useState } from 'react';
import './Categories.css';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';
import CustomLoader from '../CustomLoader';

const Categories = () => {
  const [subcategoryName, setSubCategoryName] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubCategories();
  }, []);

  const fetchSubCategories = async () => {
    try {
      const response = await axiosInstance.get(`/user/allSubcategories`);
      setSubCategoryName(response?.data);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  return (
    <div className="categories-wrapper">
      <h4 className="categories-title">Popular Categories</h4>
      <div className="scrolling-wrapper">
        {loading ? <CustomLoader /> : (<div className="scrolling-content">
          {subcategoryName.map((item, index) => (
            <div className="category-card" key={index}>
              <div className="category-image-container" style={{ background: item.bg }}>
                <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
              </div>
              <p className="category-title">{item.name}</p>
            </div>
          ))}
        </div>)}

      </div>
    </div>
  );
};

export default Categories;

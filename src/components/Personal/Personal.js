import React, { useEffect, useState } from 'react';
import './Personal.css';
import CustomLoader from '../CustomLoader';
import axiosInstance from '../AxiosInstance';
import API_URL from '../../config';
import { useNavigate } from 'react-router-dom';


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


  return (
    // <div className="personal-wrapper">
    //   <h2 className="personal-title">Popular Veterinary Categories</h2>
    //   <div className="personal-scroll-container">
    //     <div className="personal-scroll-content">
    //       {loading ? <CustomLoader /> : (<div className="scrolling-content">
    //         {VetcategoryName.map((item, index) => (
    //           <div className="category-card cursor-pointer" key={index} onClick={() => navigate(`/subcategory/${item.name}?variety=Veterinary`)}
    //           >
    //             <div className="category-image-container" style={{ background: item.bg }}>
    //               <img src={`${API_URL}/${item.image}`} alt={item.name} className="category-image" />
    //             </div>
    //             <p className="category-title">{item.name}</p>
    //           </div>
    //         ))}
    //       </div>)}
    //     </div>
    //   </div>
    // </div>

    <div className="personal-wrapper">
      <h2 className="personal-title">Popular Veterinary Categories</h2>
      <div className="personal-scroll-container">
        <div className="personal-scroll-content">
          {loading ? <CustomLoader /> : (<div className="scrolling-content">
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
          </div>)}
        </div>
      </div>
    </div>

  );
};

export default PersonalCareSlider;
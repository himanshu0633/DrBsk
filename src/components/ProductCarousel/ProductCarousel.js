import React, { useEffect, useState } from 'react';
import './ProductCarousel.css';
import logo from "../../logo/1.jpg";
import logo2 from "../../logo/2.jpg";
import logo3 from "../../logo/3.jpg";
import logo4 from "../../logo/4.jpg";
import logo5 from "../../logo/5.jpg";
import logo6 from "../../logo/6.jpg";
import axiosInstance from '../AxiosInstance';
import { Link } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const ProductCarousel = ({ title, backgroundColor }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get(`/user/allnewarrivalproducts`);
      const fetchedProducts = response.data.map(p => ({
        ...p,
        price: parseFloat(p.consumer_price),
        originalPrice: parseFloat(p.retail_price),
        discount: parseFloat(p.retail_price) - parseFloat(p.consumer_price)
      }));

      console.log("ksdjflskdjflk", fetchedProducts);
      setAllProducts(fetchedProducts);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  var settings = {
    dots: true,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 568,
        settings: {
          slidesToShow: 1.5,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div>
      {/* <div className="deal-section mt-5 py-4 pt_30" style={{ backgroundColor }}>
        <div className="deal-header">
          <h2>{title}</h2>
          <a href="#">View All</a>
        </div>

        <Slider {...settings}>
          {allProducts.map((item, i) => {
            return (
              <div className='carousel' key={item.id}>
                <div className="deal-card">
                  <span className="discount-tag">{item.discount}</span>
                  <img src="https://images.unsplash.com/photo-1631669969504-f35518bf96ba?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWVkaWNlbnxlbnwwfHwwfHx8MA%3D%3D" />
                  <div className="deal-title">{item.benefits}</div>
                  <div className="deal-pack">{item.quantity}</div>
                  <div className="deal-price">₹{item.mrp}</div>
                  <Link to={`/ProductPage/${item._id}`} className="add-btn ">🛒 Add to Cart</Link>
                </div>
              </div>
            )
          })}
        </Slider>
        <div>
        </div>
      </div> */}
    </div>
  );
};

export default ProductCarousel;
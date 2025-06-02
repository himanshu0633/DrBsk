import React from "react";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import HeroSection from "../../components/HeroSection/HeroSection";
import Features from "../../components/Features/Features";
import Banner from "../../components/Banner/Banner";
import Categories from "../../components/Categories/Categories";
import CarouselBanner from "../../components/CarouselBanner/CarouselBanner";
import PromoSection from "../../components/PromoSection/PromoSection";
import Personal from "../../components/Personal/Personal";
import ProductCarousel from "../../components/ProductCarousel/ProductCarousel";
import Footer from "../../components/Footer/Footer";
import Slider from "../../components/Slider/Slider";
import MobileMenu from "../../components/MobileMenu";
// import "./App.css";

function Dashboard() {
  return (
    <div className="App">
      <Header />
      <div className="header-spacer"></div>
      <Navbar />
      <HeroSection />
      <Features />
      <Banner />
      <div className="spacer"></div>
      <Slider />
      <Categories />
      {/* <CarouselBanner /> */}
      <PromoSection />
      <Slider />
      <Personal />
      {/* <CarouselBanner /> */}
      <ProductCarousel title="New Arrivals" backgroundColor="#fae2c8" />
      {/* <ProductCarousel title="Personal Care" backgroundColor="#f5bac6" />
      <ProductCarousel title="In the spotlight" backgroundColor="#dfdefb" /> */}
      <div className="banner22"></div>
      <Footer />
   
    </div>
  );
}

export default Dashboard;

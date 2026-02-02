import React, { useEffect } from "react";
import Header from "../../components/Header/Header";
import API_URL from '../../config';
import Features from "../../components/Features/Features";
import Banner from "../../components/Banner/Banner";
import Categories from "../../components/Categories/Categories";

import PromoSection from "../../components/PromoSection/PromoSection";
import Personal from "../../components/Personal/Personal";

import Footer from "../../components/Footer/Footer";
import Slider from "../../components/Slider/Slider";

import Slider2 from "../../components/Slider/Slider2";
import VideoPlayer from '../../components/VideoPlayer';

function Dashboard() {
  
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

  const trackInitiateCheckout = (checkoutData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: checkoutData.value || 0,
        currency: 'INR',
        num_items: checkoutData.numItems || 1,
        content_ids: checkoutData.contentIds || [],
        content_type: 'product',
      });
    }
    sendServerEvent('InitiateCheckout', checkoutData);
  };

  const trackPurchase = (purchaseData) => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: purchaseData.value || 0,
        currency: 'INR',
        content_ids: purchaseData.contentIds || [],
        content_type: 'product',
        num_items: purchaseData.numItems || 1,
        order_id: purchaseData.orderId,
      });
    }
    sendServerEvent('Purchase', purchaseData);
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
      await fetch(`${API_URL}/api/facebook-events`, {
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

  // Initialize Facebook Pixel
  const initializeFacebookPixel = () => {
    if (typeof window === 'undefined' || window.fbq) return;
    
    window.fbq = function() {
      window.fbq.callMethod ? 
      window.fbq.callMethod.apply(window.fbq, arguments) : 
      window.fbq.queue.push(arguments);
    };
    
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
    
    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
    
    // Initialize with your Pixel ID
    window.fbq('init', '1131280045595284');
    window.fbq('track', 'PageView');
  };

  // Track dashboard load as ViewContent
  useEffect(() => {
    // Initialize Pixel if not already done
    if (typeof window !== 'undefined' && !window.fbq) {
      initializeFacebookPixel();
    }

    // Track Dashboard as ViewContent
    trackViewContent({
      id: 'dashboard_home',
      name: 'BSK Pharma Dashboard Home',
      value: 0,
      currency: 'INR',
      type: 'dashboard',
      category: 'Pharmacy',
    });

    // Track main sections
    const sections = [
      { id: 'video_section', name: 'Video Player Section', category: 'Media' },
      { id: 'banner_section', name: 'Banner Section', category: 'Promotion' },
      { id: 'features_section', name: 'Features Section', category: 'Highlights' },
      { id: 'slider_section', name: 'Slider Products', category: 'Products' },
      { id: 'categories_section', name: 'Product Categories', category: 'Navigation' },
      { id: 'promo_section', name: 'Promotional Offers', category: 'Deals' },
      { id: 'personal_section', name: 'Personal Care Products', category: 'Products' },
    ];

    sections.forEach((section, index) => {
      setTimeout(() => {
        trackViewContent(section);
      }, index * 500);
    });
  }, []);

  // Event handlers for tracking
  const handleCategoryClick = (categoryName) => {
    trackViewContent({
      id: `category_${categoryName.toLowerCase().replace(/\s+/g, '_')}`,
      name: `${categoryName} Category`,
      value: 0,
      category: 'Product Category',
      type: 'category',
    });
  };

  const handlePromoClick = (promoName) => {
    trackViewContent({
      id: `promo_${promoName.toLowerCase().replace(/\s+/g, '_')}`,
      name: `${promoName} Promotion`,
      value: 0,
      category: 'Promotion',
      type: 'offer',
    });
  };

  const handleVideoPlay = () => {
    trackViewContent({
      id: 'promotional_video',
      name: 'Promotional Video Play',
      value: 0,
      category: 'Media',
      type: 'video',
    });
  };

  const handleSliderNavigation = (direction) => {
    trackViewContent({
      id: `slider_nav_${direction}`,
      name: `Slider Navigation ${direction}`,
      value: 0,
      category: 'Navigation',
      type: 'interaction',
    });
  };

  return (
    <div className="App">
      <Header />
      
      {/* Video Player with tracking */}
      <div 
        onClick={handleVideoPlay}
        style={{ cursor: 'pointer' }}
      >
        <VideoPlayer />
      </div>
      
      {/* <HeroSection /> */}
      
      <Banner 
        onClick={() => trackViewContent({
          id: 'main_banner',
          name: 'Main Promotional Banner',
          value: 0,
          category: 'Banner',
          type: 'promotion',
        })}
      />
      
      <Features 
        onFeatureClick={(featureName) => trackViewContent({
          id: `feature_${featureName.toLowerCase().replace(/\s+/g, '_')}`,
          name: featureName,
          value: 0,
          category: 'Feature',
          type: 'benefit',
        })}
      />
      
      <div className="spacer"></div>
      
      <Slider 
        onSlideChange={handleSliderNavigation}
        onProductClick={(product) => trackViewContent({
          id: product.id || `product_${Math.random().toString(36).substr(2, 9)}`,
          name: product.name || 'Featured Product',
          value: product.price || 0,
          currency: 'INR',
          category: product.category || 'Medicine',
          type: 'product',
        })}
      />
      
      <Categories 
        onCategoryClick={handleCategoryClick}
      />
      
      {/* <CarouselBanner /> */}
      
      <PromoSection 
        onPromoClick={handlePromoClick}
      />
      
      <Slider2 
        onProductClick={(product) => trackViewContent({
          id: product.id || `product_slider2_${Math.random().toString(36).substr(2, 9)}`,
          name: product.name || 'Slider Product',
          value: product.price || 0,
          currency: 'INR',
          category: product.category || 'Medicine',
          type: 'product',
        })}
      />
      
      <Personal 
        onProductClick={(product) => trackViewContent({
          id: product.id || `personal_product_${Math.random().toString(36).substr(2, 9)}`,
          name: product.name || 'Personal Care Product',
          value: product.price || 0,
          currency: 'INR',
          category: 'Personal Care',
          type: 'product',
        })}
      />
      
      {/* <CarouselBanner /> */}
      {/* <ProductCarousel title="New Arrivals" backgroundColor="#fae2c8" /> */}
      {/* <ProductCarousel title="Personal Care" backgroundColor="#f5bac6" />
      <ProductCarousel title="In the spotlight" backgroundColor="#dfdefb" /> */}
      
      <Footer />
      
      {/* Facebook Pixel NoScript fallback */}
      <noscript>
        <img 
          height="1" 
          width="1" 
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=1131280045595284&ev=PageView&noscript=1"
          alt="Facebook Pixel"
        />
      </noscript>
    </div>
  );
}

export default Dashboard;
import { useEffect, useState } from 'react';
import {
  IndianRupee, Shield, Store, Headphones
} from 'lucide-react';
import 'animate.css/animate.min.css';
import './Landing.css';
import nablLogo from '../../logo/nabl-logo.png';
import whoLogo from '../../logo/who.png';
import fdaLogo from '../../logo/fda.png';
import Footer from '../../components/Footer/Footer';
import Head from '../Head/Head';
import { Link } from 'react-router-dom';
import API_URL from '../../config';
const Landing = () => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);

  // Facebook Pixel Events Functions
  const trackViewContent = (contentData) => {
    // Browser Pixel Event
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

    // Server-side Conversions API Event
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
        clientIp: null, // Will be set on server
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
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Initialize Facebook Pixel
  const initializeFacebookPixel = () => {
    // Check if already initialized
    if (window.fbq) return;
    
    // Create pixel initialization function
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
    
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(script, firstScript);
    
    // Initialize with your Pixel ID
    window.fbq('init', '1131280045595284');
    window.fbq('track', 'PageView');
  };

  // Initialize Facebook Pixel and track initial events
  useEffect(() => {
    // Initialize Pixel
    if (typeof window !== 'undefined' && !window.fbq) {
      initializeFacebookPixel();
    }

    // Track Landing Page as ViewContent
    trackViewContent({
      id: 'landing_page_001',
      name: 'BSK Pharma Landing Page',
      value: 0,
      currency: 'INR',
      type: 'landing_page',
      category: 'Pharmacy',
    });

    // Track featured products
    const featuredProducts = [
      {
        id: 'featured_medicine_001',
        name: 'Featured Generic Medicines',
        value: 0,
        category: 'Medicine',
        type: 'product_group',
      }
    ];

    featuredProducts.forEach(product => {
      setTimeout(() => {
        trackViewContent(product);
      }, 1000);
    });

    // Animate on scroll
    const animateOnScroll = () => {
      const elements = document.querySelectorAll(
        '.feature-card, .certification-item, .about-image, .about-content, .stat-item'
      );

      elements.forEach(element => {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        if (rect.top < windowHeight - 100) {
          if (!element.classList.contains('animated')) {
            element.classList.add('animated');
            
            // Track view for each section
            const sectionName = element.className.split(' ')[0];
            trackViewContent({
              id: `section_${sectionName}`,
              name: `${sectionName.replace('-', ' ')} Section`,
              value: 0,
              category: 'Landing Page Section',
              type: 'content',
            });
          }
        }
      });
    };

    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);
    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  useEffect(() => {
    const timelineInterval = setInterval(() => {
      setCurrentTimelineIndex(prev => (prev + 1) % 7);
    }, 4000);
    return () => clearInterval(timelineInterval);
  }, []);

  useEffect(() => {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const speed = 100;
      const step = Math.ceil(target / speed);
      let count = 0;

      const updateCount = () => {
        count += step;
        if (count >= target) {
          counter.textContent = target;
        } else {
          counter.textContent = count;
          requestAnimationFrame(updateCount);
        }
      };
      updateCount();
    });
  }, []);

  // Event handlers for tracking
  const handleFeatureClick = (featureName, description) => {
    trackViewContent({
      id: `feature_${featureName.toLowerCase().replace(/\s+/g, '_')}`,
      name: featureName,
      value: 0,
      category: 'Feature',
      type: 'content',
      description: description,
    });
  };

  const handleCertificationClick = (certName, description) => {
    trackViewContent({
      id: `cert_${certName.toLowerCase().replace(/\s+/g, '_')}`,
      name: certName,
      value: 0,
      category: 'Certification',
      type: 'content',
      description: description,
    });
  };

  const handleShopNowClick = () => {
    trackViewContent({
      id: 'shop_now_button',
      name: 'Shop Now CTA',
      value: 0,
      category: 'Call to Action',
      type: 'button',
    });
    
    // Also track as InitiateCheckout (since it leads to shopping)
    trackInitiateCheckout({
      value: 0,
      currency: 'INR',
      numItems: 0,
      contentIds: [],
    });
  };

  const handleLearnMoreClick = () => {
    trackViewContent({
      id: 'learn_more_about',
      name: 'Learn More About Us',
      value: 0,
      category: 'About Section',
      type: 'content',
    });
  };

  const handleSocialMediaClick = (platform) => {
    trackViewContent({
      id: `social_${platform}`,
      name: `${platform} Social Media`,
      value: 0,
      category: 'Social Media',
      type: 'external_link',
    });
  };

  const timelineData = [
    { year: "1995", description: "Inception of 'Zota'" },
    { year: "2017", description: "Launched BSK Pharma brand" },
    { year: "2018", description: "Expanded to 50+ stores" },
    { year: "2019", description: "Won TIMES ICON award" },
    { year: "2020", description: "Reached 100+ stores" },
    { year: "2021", description: "Launched e-commerce platform" },
    { year: "2022", description: "2000+ products in portfolio" }
  ];

  return (
    <div className="landing-page">
      <Head />

      {/* Banner Section */}
      <section className="banner-container">
        <div className="banner-text">
          <h1 className="animate__animated animate__fadeInUp">
            <span>Maximum</span>
            <span>Savings</span>
          </h1>
          <p className="subheading animate__animated animate__fadeInUp">on medicine bills</p>
          <p className="description animate__animated animate__fadeInUp">
            <strong>India's largest</strong> private generic pharmacy retail chain offering high-quality medicines at affordable prices.
          </p>
          <Link 
            to='/homePage' 
            className="cta-button animate__animated animate__fadeInUp"
            onClick={handleShopNowClick}
          >
            Shop Now
          </Link>
          <p className="tc animate__animated animate__fadeInUp">* Terms and conditions apply</p>
          <div className="social-icons">
            <a 
              href="https://www.facebook.com/people/Dr-BSKs/61576600531948/" 
              target='_blank' 
              rel="noopener noreferrer"
              aria-label="Facebook"
              onClick={() => handleSocialMediaClick('Facebook')}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png" alt="Facebook" />
            </a>
            <a 
              href="https://www.instagram.com/drbsk_humanhealth?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
              target='_blank' 
              rel="noopener noreferrer"
              aria-label="Instagram"
              onClick={() => handleSocialMediaClick('Instagram')}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
            </a>
            <a 
              href="https://www.youtube.com/@Dr.BSKsURUMEED-w4o" 
              target='_blank' 
              rel="noopener noreferrer"
              aria-label="YouTube"
              onClick={() => handleSocialMediaClick('YouTube')}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" />
            </a>
            <a 
              href="https://www.linkedin.com/company/dr-bsk-s/" 
              target='_blank' 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              onClick={() => handleSocialMediaClick('LinkedIn')}
            >
              <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" />
            </a>
          </div>
        </div>
        <div className="banner-image animate__animated animate__fadeInRight">
          <img 
            src='https://www.ukgermanpharmaceuticals.com/uploaded-files/gallery/photos/thumbs/APJ-Abdul-Kalam-Inspiration-Award-20244-thumbs-800X600.jpg' 
            alt="Brand Ambassador" 
            onClick={() => trackViewContent({
              id: 'brand_ambassador_image',
              name: 'APJ Abdul Kalam Inspiration Award',
              value: 0,
              category: 'Award',
              type: 'image',
            })}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title animate__animated animate__fadeInUp">Why Choose Us</h2>
        <div className="features-grid">
          <div 
            className="feature-card cursor-pointer" 
            onClick={() => handleFeatureClick(
              'Affordable Prices', 
              'Save up to 80% on your medicine bills with our high-quality generic alternatives.'
            )}
          >
            <div className="feature-icon"><IndianRupee size={32} /></div>
            <h3>Affordable Prices</h3>
            <p>Save up to 80% on your medicine bills with our high-quality generic alternatives.</p>
          </div>
          <div 
            className="feature-card cursor-pointer" 
            onClick={() => handleFeatureClick(
              'Quality Assurance', 
              'All our medicines are approved by regulatory authorities and sourced from trusted manufacturers.'
            )}
          >
            <div className="feature-icon"><Shield size={32} /></div>
            <h3>Quality Assurance</h3>
            <p>All our medicines are approved by regulatory authorities and sourced from trusted manufacturers.</p>
          </div>
          <div 
            className="feature-card cursor-pointer" 
            onClick={() => handleFeatureClick(
              'Wide Network', 
              'With 100+ stores across India, quality healthcare is always within your reach.'
            )}
          >
            <div className="feature-icon"><Store size={32} /></div>
            <h3>Wide Network</h3>
            <p>With 100+ stores across India, quality healthcare is always within your reach.</p>
          </div>
          <div 
            className="feature-card cursor-pointer" 
            onClick={() => handleFeatureClick(
              'Expert Support', 
              'Our trained pharmacists are available to guide you and answer your questions.'
            )}
          >
            <div className="feature-icon"><Headphones size={32} /></div>
            <h3>Expert Support</h3>
            <p>Our trained pharmacists are available to guide you and answer your questions.</p>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="certification-section">
        <h2 className="section-title animate__animated animate__fadeInUp">Our Certifications</h2>
        <div className="certification-container">
          <div 
            className="certification-item cursor-pointer" 
            onClick={() => handleCertificationClick(
              'NABL Certified', 
              'Reliable testing and calibration services.'
            )}
          >
            <img src={nablLogo} alt="NABL Certified" />
            <h3>NABL Certified</h3>
            <p>Reliable testing and calibration services.</p>
          </div>
          <div 
            className="certification-item cursor-pointer" 
            onClick={() => handleCertificationClick(
              'WHO GMP', 
              'World Health Organization Good Manufacturing Practices.'
            )}
          >
            <img src={whoLogo} alt="WHO GMP" />
            <h3>WHO GMP</h3>
            <p>World Health Organization Good Manufacturing Practices.</p>
          </div>
          <div 
            className="certification-item cursor-pointer" 
            onClick={() => handleCertificationClick(
              'FDA Approved', 
              'Certified by the Food and Drug Administration.'
            )}
          >
            <img src={fdaLogo} alt="FDA Approved" />
            <h3>FDA Approved</h3>
            <p>Certified by the Food and Drug Administration.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-image animated">
            <img 
              className='objectfitImg' 
              src='https://www.ukgermanpharmaceuticals.com/uploaded-files/banner-image/Result-Oriented-Diabetic-Medicines-Brand-In-India09.jpg' 
              alt="BSK Pharma Store" 
              onClick={() => trackViewContent({
                id: 'about_section_image',
                name: 'BSK Pharma Store Image',
                value: 0,
                category: 'About Us',
                type: 'image',
              })}
            />
          </div>
          <div className="about-content animated">
            <h2>About Us</h2>
            <p>UK German Pharmaceuticals – Established in 1991, we are one of India's most trusted animal healthcare companies...</p>
            <Link 
              to='/aboutus' 
              className='about-btn'
              onClick={handleLearnMoreClick}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section animate__animated animate__fadeInUp">
        <h2 className="section-title" style={{ color: 'white' }}>Our Achievements</h2>
        <div className="stats-container">
          <div 
            className="stat-item animate__animated animate__fadeInUp"
            onClick={() => trackViewContent({
              id: 'stat_products',
              name: '800 Products Stat',
              value: 800,
              category: 'Statistics',
              type: 'metric',
            })}
          >
            <div className="stat-number" data-target="800">0</div>
            <div className="stat-text">Products</div>
          </div>
          <div 
            className="stat-item animate__animated animate__fadeInUp"
            onClick={() => trackViewContent({
              id: 'stat_stores',
              name: '3 Stores Stat',
              value: 3,
              category: 'Statistics',
              type: 'metric',
            })}
          >
            <div className="stat-number" data-target="3">0</div>
            <div className="stat-text">Stores</div>
          </div>
          <div 
            className="stat-item animate__animated animate__fadeInUp"
            onClick={() => trackViewContent({
              id: 'stat_experience',
              name: '45 Years Experience Stat',
              value: 45,
              category: 'Statistics',
              type: 'metric',
            })}
          >
            <div className="stat-number" data-target="45">0</div>
            <div className="stat-text">Years of Experience</div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <div className="timeline-container">
        <div className="timeline-labels">
          {timelineData.map((item, index) => (
            <span 
              key={index}
              onClick={() => {
                trackViewContent({
                  id: `timeline_${item.year}`,
                  name: `Timeline ${item.year}`,
                  value: 0,
                  category: 'Company History',
                  type: 'timeline',
                  description: item.description,
                });
                setCurrentTimelineIndex(index);
              }}
            >
              {item.year}
            </span>
          ))}
        </div>
        <div className="timeline-bar">
          <div className="timeline-progress" style={{ width: `${(currentTimelineIndex / (timelineData.length - 1)) * 100}%` }}></div>
          {timelineData.map((item, index) => (
            <div 
              key={index} 
              className={`timeline-point ${currentTimelineIndex === index ? 'active' : ''}`} 
              style={{ left: `${(index / (timelineData.length - 1)) * 100}%` }}
              onClick={() => {
                trackViewContent({
                  id: `timeline_point_${item.year}`,
                  name: `Timeline Point ${item.year}`,
                  value: 0,
                  category: 'Company History',
                  type: 'timeline',
                  description: item.description,
                });
                setCurrentTimelineIndex(index);
              }}
            ></div>
          ))}
        </div>
        <div 
          className="timeline-description"
          onClick={() => trackViewContent({
            id: `timeline_desc_${timelineData[currentTimelineIndex].year}`,
            name: `Timeline Description ${timelineData[currentTimelineIndex].year}`,
            value: 0,
            category: 'Company History',
            type: 'timeline',
            description: timelineData[currentTimelineIndex].description,
          })}
        >
          <strong>{timelineData[currentTimelineIndex].year}</strong><br />
          {timelineData[currentTimelineIndex].description}
        </div>
      </div>

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
};

export default Landing;
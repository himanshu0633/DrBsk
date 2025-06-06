import React, { useEffect, useState } from 'react';
import { 
  IndianRupee, Shield, Store, Headphones, 
  ClipboardList, ShoppingCart, MapPin, 
  Phone, Mail, Clock, Send 
} from 'lucide-react';
import 'animate.css/animate.min.css';
import './Landing.css';
import logo from '../../logo/logo1.jpg';
import kapidev from '../../logo/kapildev.png';
import nablLogo from '../../logo/nabl-logo.png';
import whoLogo from '../../logo/who.png';
import fdaLogo from '../../logo/fda.png';
import storeImage from '../../logo/store-image.png';
import teamMember from '../../logo/team-member.jpg';
import phoneMap from '../../logo/phone-map.jpg';
import Footer from '../../components/Footer/Footer';
import Head from '../Head/Head';

const Landing = () => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Animate elements when they come into view
    const animateOnScroll = () => {
      const elements = document.querySelectorAll('.feature-card, .certification-item, .about-image, .about-content, .stat-item');
      
      elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementPosition < windowHeight - 100) {
          element.classList.add('animated');
        }
      });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check

    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);

  useEffect(() => {
    // Testimonial slider
    const testimonialInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(testimonialInterval);
  }, []);

  useEffect(() => {
    // Timeline animation
    const timelineInterval = setInterval(() => {
      setCurrentTimelineIndex((prev) => (prev + 1) % 7);
    }, 3000);

    return () => clearInterval(timelineInterval);
  }, []);

  useEffect(() => {
    // Counter animation
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const target = +counter.getAttribute('data-target');
      const speed = 100; // lower is faster
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

  const timelineData = [
    { year: "1995", description: "Inception of 'Zota'" },
    { year: "2017", description: "Launched BSK Pharma brand" },
    { year: "2018", description: "Expanded to 50+ stores" },
    { year: "2019", description: "Won TIMES ICON award" },
    { year: "2020", description: "Reached 100+ stores" },
    { year: "2021", description: "Launched e-commerce platform" },
    { year: "2022", description: "2000+ products in portfolio" }
  ];

  const testimonials = [
    {
      text: "BSK Pharma has helped me save over 60% on my monthly medicine bills. The quality is just as good as branded medicines but at a fraction of the cost.",
      author: "Rajesh Kumar",
      role: "Regular Customer"
    },
    {
      text: "As a doctor, I recommend BSK Pharma to all my patients who need affordable yet effective medication. Their range covers almost all essential medicines.",
      author: "Dr. Priya Sharma",
      role: "General Physician"
    },
    {
      text: "The staff at my local BSK Pharma store is very knowledgeable and helpful. They guide me to the right generic alternatives for my prescriptions.",
      author: "Meena Patel",
      role: "Senior Citizen"
    }
  ];

  const teamMembers = [
    {
      name: "Mr. Arjun Mehta",
      title: "Visionary Founder",
      color: "orange"
    },
    {
      name: "Dr. Neha Kapoor",
      title: "Group CEO – Leader in Action",
      color: "green"
    },
    {
      name: "Mr. Rakesh Sinha",
      title: "Director",
      color: "purple"
    },
    {
      name: "Ms. Tanya Bhatt",
      title: "Director",
      color: "pink"
    },
    {
      name: "Mr. Rajeev Nair",
      title: "Director",
      color: "red"
    },
    {
      name: "Ms. Isha Malhotra",
      title: "Director",
      color: "blue"
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <Head />

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuActive ? 'active' : ''}`}>
        <a href="#">Home</a>
        <a href="#">About Us</a>
        <a href="#">Products</a>
        <a href="#">Stores</a>
        <a href="#">Contact</a>
        <div className="mobile-buttons">
          <a href="franchisee-enquiry.html">
            <ClipboardList size={16} /> Franchise Inquiry
          </a>
          <a href="index.html">
            <ShoppingCart size={16} /> Buy Medicines
          </a>
        </div>
      </div>

      <div className={`overlay ${mobileMenuActive ? 'active' : ''}`} onClick={toggleMobileMenu}></div>

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
          <a href="#" className="cta-button animate__animated animate__fadeInUp">Shop Now</a>
          <p className="tc animate__animated animate__fadeInUp">* Terms and conditions apply</p>
        </div>
        <div className="banner-image animate__animated animate__fadeInRight">
          <img src={kapidev} alt="Brand Ambassador" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title animate__animated animate__fadeInUp">Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <IndianRupee size={32} />
            </div>
            <h3>Affordable Prices</h3>
            <p>Save up to 80% on your medicine bills with our high-quality generic alternatives.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={32} />
            </div>
            <h3>Quality Assurance</h3>
            <p>All our medicines are approved by regulatory authorities and sourced from trusted manufacturers.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Store size={32} />
            </div>
            <h3>Wide Network</h3>
            <p>With 100+ stores across India, quality healthcare is always within your reach.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Headphones size={32} />
            </div>
            <h3>Expert Support</h3>
            <p>Our trained pharmacists are available to guide you and answer your questions.</p>
          </div>
        </div>
      </section>

      {/* Certification Section */}
      <section className="certification-section">
        <h2 className="section-title animate__animated animate__fadeInUp">Our Certifications</h2>
        <div className="certification-container">
          <div className="certification-item">
            <img src={nablLogo} alt="NABL Certified" />
            <h3>NABL Certified</h3>
            <p>Government certification ensuring reliable testing and calibration services.</p>
          </div>
          <div className="certification-item">
            <img src={whoLogo} alt="WHO GMP" />
            <h3>WHO GMP</h3>
            <p>World Health Organization Good Manufacturing Practices certification.</p>
          </div>
          <div className="certification-item">
            <img src={fdaLogo} alt="FDA Approved" />
            <h3>FDA Approved</h3>
            <p>Meeting the standards of the Food and Drug Administration.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-image">
            <img src={storeImage} alt="BSK Pharma Store" />
          </div>
          <div className="about-content">
            <h2>About Us</h2>
            <p>UK German Pharmaceuticals – Established in 1991, we are one of India’s most trusted animal healthcare companies. Under the leadership of Dr. Bhim Sain Kansal, we’ve grown steadily, offering high-quality medicines and supplements for livestock and other animals.


<ul>We focus on:

<li>Research and development</li>

<li>Manufacturing vaccines, antibiotics, and nutritional supplements</li>

<li>Ensuring animal health and productivity</li>
</ul>

Our products are used by veterinarians, farmers, and animal caregivers all over India. We use advanced science and strict quality control to make safe and effective medicines.</p>
            <a href="#" className="about-btn">Learn More</a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <h2 className="section-title" style={{ color: 'white' }}>Our Achievements</h2>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number" data-target="2000">0</div>
            <div className="stat-text">Products</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="100">0</div>
            <div className="stat-text">Stores</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="9">0</div>
            <div className="stat-text">Lakh Sq.Ft Warehouse</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="35">0</div>
            <div className="stat-text">Years of Experience</div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <div className="timeline-container">
        <div className="timeline-labels">
          {timelineData.map((item, index) => (
            <span key={index}>{item.year}</span>
          ))}
        </div>
      
        <div className="timeline-bar">
          <div className="timeline-progress" style={{ width: `${(currentTimelineIndex / (timelineData.length - 1)) * 100}%` }}></div>
      
          {timelineData.map((item, index) => (
            <div 
              key={index}
              className={`timeline-point ${currentTimelineIndex === index ? 'active' : ''}`}
              style={{ left: `${(index / (timelineData.length - 1)) * 100}%` }}
              data-year={item.year}
            ></div>
          ))}
        </div>
      
        <div className="timeline-description">
          <strong>{timelineData[currentTimelineIndex].year}</strong><br/>
          {timelineData[currentTimelineIndex].description}
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h2>Our <strong>Team</strong></h2>
        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div className="team-card" key={index}>
              <img src={teamMember} alt={member.name} />
              <div className={`team-info ${member.color}`}>
                <div className="name">{member.name}</div>
                <div className="title">{member.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Store Section */}
      <div className="section">
        <div className="store-banner">
          <img src={storeImage} alt="BSK Pharma Store" />
          <div className="store-text">
            India's Largest Private<br />
            <span>Our strong leadership helps drive our success.
Dr. Bhim Sain Kansal, our founder, is a well-known expert in the field. He leads a team of skilled professionals focused on research, production, and customer needs.
Together, we aim to provide better solutions for both animal and human health.</span>
          </div>
        </div>
      
        <div className="store-finder">
          <div className="finder-form">
            <h2>Find a Store</h2>
            <div className="dropdowns">
              <select>
                <option>Select State</option>
                <option>Maharashtra</option>
                <option>Punjab</option>
              </select>
              <select>
                <option>Select City</option>
                <option>Mumbai</option>
                <option>Amritsar</option>
              </select>
            </div>
            <div className="finder-stats">
              <div>
                <div id="store-count">1650</div>
                <small>Stores</small>
              </div>
              <div>
                <div id="product-count">2000+</div>
                <small>Products</small>
              </div>
              <div>
                <div id="customer-count">30,00,000+</div>
                <small>Customers</small>
              </div>
            </div>
          </div>
      
          <div className="phone-image">
            <img src={phoneMap} alt="Mobile with Map" />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2 className="section-title animate__animated animate__fadeInUp">What Our Customers Say</h2>
        <div className="testimonials-slider">
          <div 
            className="testimonials-track" 
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div className="testimonial-card" key={index}>
                <div className="testimonial-content">
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      <img src={teamMember} alt={testimonial.author} />
                    </div>
                    <div className="author-info">
                      <h4>{testimonial.author}</h4>
                      <p>{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="slider-nav">
          {[0, 1, 2].map(index => (
            <div 
              key={index}
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Start Saving on Your Medicines?</h2>
          <p>Join thousands of satisfied customers who trust BSK Pharma for affordable, high-quality generic medicines.</p>
          <div className="cta-buttons">
            <a href="#" className="cta-btn primary">
              <MapPin size={18} /> Find a Store Near You
            </a>
            <a href="#" className="cta-btn secondary">
              <ShoppingCart size={18} /> Shop Online
            </a>
          </div>
        </div>
      </section>

    <Footer />
     
    </div>
  );
};

export default Landing;
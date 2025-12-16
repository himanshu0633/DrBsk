import { useEffect, useState } from 'react';
import {
  IndianRupee, Shield, Store, Headphones,
  ClipboardList, ShoppingCart, MapPin
} from 'lucide-react';
import 'animate.css/animate.min.css';
import './Landing.css';
import nablLogo from '../../logo/nabl-logo.png';
import whoLogo from '../../logo/who.png';
import fdaLogo from '../../logo/fda.png';
import Footer from '../../components/Footer/Footer';
import Head from '../Head/Head';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Landing = () => {
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);
  const navigate = useNavigate();


  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
useEffect(() => {

  if (window.fbq) {

    window.fbq("track", "PageView");

  }

}, []);
  useEffect(() => {
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
          }
        }
      });
    };

    animateOnScroll(); // Run once on mount
    window.addEventListener('scroll', animateOnScroll);
    return () => window.removeEventListener('scroll', animateOnScroll);
  }, []);



  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(testimonialInterval);
  }, []);

  useEffect(() => {
    const timelineInterval = setInterval(() => {
      setCurrentTimelineIndex(prev => (prev + 1) % 7);
    }, 3000);
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
    { name: "Mr. Arjun Mehta", title: "Visionary Founder", color: "orange" },
    { name: "Dr. Neha Kapoor", title: "Group CEO – Leader in Action", color: "green" },
    { name: "Mr. Rakesh Sinha", title: "Director", color: "purple" },
    { name: "Ms. Tanya Bhatt", title: "Director", color: "pink" },
    { name: "Mr. Rajeev Nair", title: "Director", color: "red" },
    { name: "Ms. Isha Malhotra", title: "Director", color: "blue" }
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
          {/* <a href="/homepage" className="cta-button animate__animated animate__fadeInUp">Shop Now</a> */}
          <Link to='/homePage' className="cta-button animate__animated animate__fadeInUp">
            Shop Now
          </Link>
          <p className="tc animate__animated animate__fadeInUp">* Terms and conditions apply</p>
          <div className="social-icons">
            {/* Social Icons here */}
            <div className="social-icons">
              <a href="https://www.facebook.com/people/Dr-BSKs/61576600531948/" target='blank' aria-label="Facebook">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png" alt="Facebook" />
              </a>
              <a href="https://www.instagram.com/drbsk_humanhealth?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target='blank' aria-label="Instagram">
                <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
              </a>
              <a href="https://www.youtube.com/@Dr.BSKsURUMEED-w4o" target='blank' aria-label="YouTube">
                <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" />
              </a>
              {/* <a href="#" aria-label="Twitter">
                <img src="https://cdn-icons-png.flaticon.com/512/3670/3670151.png" alt="Twitter" />
              </a> */}
              <a href="https://www.linkedin.com/company/dr-bsk-s/" target='blank' aria-label="LinkedIn">
                <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" />
              </a>
            </div>
          </div>
        </div>
        <div className="banner-image animate__animated animate__fadeInRight">
          <img src='https://www.ukgermanpharmaceuticals.com/uploaded-files/gallery/photos/thumbs/APJ-Abdul-Kalam-Inspiration-Award-20244-thumbs-800X600.jpg' alt="Brand Ambassador" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title animate__animated animate__fadeInUp">Why Choose Us</h2>
        <div className="features-grid">
          <div className="feature-card cursor-pointer">
            <div className="feature-icon"><IndianRupee size={32} /></div>
            <h3>Affordable Prices</h3>
            <p>Save up to 80% on your medicine bills with our high-quality generic alternatives.</p>
          </div>
          <div className="feature-card cursor-pointer">
            <div className="feature-icon"><Shield size={32} /></div>
            <h3>Quality Assurance</h3>
            <p>All our medicines are approved by regulatory authorities and sourced from trusted manufacturers.</p>
          </div>
          <div className="feature-card cursor-pointer">
            <div className="feature-icon"><Store size={32} /></div>
            <h3>Wide Network</h3>
            <p>With 100+ stores across India, quality healthcare is always within your reach.</p>
          </div>
          <div className="feature-card cursor-pointer">
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
          <div className="certification-item cursor-pointer"><img src={nablLogo} alt="NABL Certified" /><h3>NABL Certified</h3><p>Reliable testing and calibration services.</p></div>
          <div className="certification-item cursor-pointer"><img src={whoLogo} alt="WHO GMP" /><h3>WHO GMP</h3><p>World Health Organization Good Manufacturing Practices.</p></div>
          <div className="certification-item cursor-pointer"><img src={fdaLogo} alt="FDA Approved" /><h3>FDA Approved</h3><p>Certified by the Food and Drug Administration.</p></div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-image animated"><img className='objectfitImg' src='https://www.ukgermanpharmaceuticals.com/uploaded-files/banner-image/Result-Oriented-Diabetic-Medicines-Brand-In-India09.jpg' alt="BSK Pharma Store" /></div>
          <div className="about-content animated">
            <h2>About Us</h2>
            <p>UK German Pharmaceuticals – Established in 1991, we are one of India’s most trusted animal healthcare companies...</p>
            {/* <a href="#" className="about-btn">Learn More</a> */}
            <Link to='/aboutus' className='about-btn'>Learn More</Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section animate__animated animate__fadeInUp">
        <h2 className="section-title" style={{ color: 'white' }}>Our Achievements</h2>
        <div className="stats-container">
          <div className="stat-item animate__animated animate__fadeInUp">
            <div className="stat-number" data-target="800">0</div>
            <div className="stat-text">Products</div>
          </div>
          <div className="stat-item animate__animated animate__fadeInUp">
            <div className="stat-number" data-target="3">0</div>
            <div className="stat-text">Stores</div>
          </div>
          {/* <div className="stat-item animate__animated animate__fadeInUp">
            <div className="stat-number" data-target="9">0</div>
            <div className="stat-text">Lakh Sq.Ft Warehouse</div>
          </div> */}
          <div className="stat-item animate__animated animate__fadeInUp">
            <div className="stat-number" data-target="45">0</div>
            <div className="stat-text">Years of Experience</div>
          </div>
        </div>
      </section>


      {/* Timeline Section */}
      <div className="timeline-container">
        <div className="timeline-labels">
          {timelineData.map((item, index) => <span key={index}>{item.year}</span>)}
        </div>
        <div className="timeline-bar">
          <div className="timeline-progress" style={{ width: `${(currentTimelineIndex / (timelineData.length - 1)) * 100}%` }}></div>
          {timelineData.map((item, index) => (
            <div key={index} className={`timeline-point ${currentTimelineIndex === index ? 'active' : ''}`} style={{ left: `${(index / (timelineData.length - 1)) * 100}%` }}></div>
          ))}
        </div>
        <div className="timeline-description">
          <strong>{timelineData[currentTimelineIndex].year}</strong><br />
          {timelineData[currentTimelineIndex].description}
        </div>
      </div>

      {/* Team Section, Store Section, Testimonials, CTA */}
      {/* You already have them correct - no change needed here */}

      <Footer />
    </div>
  );
};

export default Landing;

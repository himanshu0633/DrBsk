import React from "react";
// import './Footer.css';
// import logo from "../../logo/logo1.jpg";

// const Footer = () => {
//   return (
//     <footer className="footer">
//       <div className="footer-wave"></div>
//       <div className="footer-container">
//         {/* Column 1: Logo + Social */}
//         <div className="footer-col">
//           <div className="logo">
//             <img src={logo} alt="Logo" />
//             <p className="company-tagline">Your Health, Our Priority</p>
//           </div>
//           <div className="contact-info">
//             <div className="contact-item">
//               <span className="contact-icon">📞</span>
//               <span>+91 1234567890</span>
//             </div>
//             <div className="contact-item">
//               <span className="contact-icon">✉️</span>
//               <span>info@davaindia.com</span>
//             </div>
//           </div>
//           <div className="social-icons">
//             <a href="#" aria-label="Facebook">
//               <img src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png" alt="Facebook" />
//             </a>
//             <a href="#" aria-label="Instagram">
//               <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
//             </a>
//             <a href="#" aria-label="YouTube">
//               <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" />
//             </a>
//             <a href="#" aria-label="Twitter">
//               <img src="https://cdn-icons-png.flaticon.com/512/3670/3670151.png" alt="Twitter" />
//             </a>
//             <a href="#" aria-label="LinkedIn">
//               <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" />
//             </a>
//           </div>
//         </div>

//         {/* Column 2: Company */}
//         <div className="footer-col">
//           <h4>Company</h4>
//           <ul className="footer-links">
//             <li><a href="#">About Davaindia</a></li>
//             <li><a href="#">Our Products</a></li>
//             <li><a href="#">Customer Speaks</a></li>
//             <li><a href="#">Career</a></li>
//             <li><a href="#">Contact</a></li>
//           </ul>
//         </div>

//         {/* Column 3: Policies */}
//         <div className="footer-col">
//           <h4>Our Policies</h4>
//           <ul className="footer-links">
//             <li><a href="#">Terms and Conditions</a></li>
//             <li><a href="#">Privacy Policy</a></li>
//             <li><a href="#">Grievance Redressal Policy</a></li>
//             <li><a href="#">Shipping and Delivery Policy</a></li>
//             <li><a href="#">Return, Refund and Cancellation Policy</a></li>
//             <li><a href="#">IP Policy</a></li>
//           </ul>
//         </div>

//         {/* Column 4: Shopping */}
//         <div className="footer-col">
//           <h4>Shopping</h4>
//           <ul className="footer-links">
//             <li><a href="#">Health Articles</a></li>
//             <li><a href="#">Offers and Coupons</a></li>
//             <li><a href="#">FAQs</a></li>
//             <li><a href="#">Store Locator</a></li>
//             <li><a href="#">Gift Cards</a></li>
//           </ul>
//         </div>

//         {/* Column 5: Contact */}
//         <div className="footer-col">
//           <h4>Registered Office</h4>
//           <address>
//             123 Business Park,<br />
//             Sector 45, Noida,<br />
//             Uttar Pradesh 201301<br />
//             India
//           </address>

//           <h4>Head Office</h4>
//           <address>
//             456 Corporate Tower,<br />
//             MG Road, Gurugram,<br />
//             Haryana 122002<br />
//             India
//           </address>
//         </div>
//       </div>

//       <div className="footer-bottom">
//         <div className="footer-bottom-container">
//           <p>© {new Date().getFullYear()} Dr.BSK's. All Rights Reserved.</p>
//           <div className="payment-methods">
//             <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" />
//             <img src="https://cdn-icons-png.flaticon.com/512/196/196561.png" alt="Mastercard" />
//             <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="PayPal" />
//             <img src="https://cdn-icons-png.flaticon.com/512/825/825454.png" alt="UPI" />
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import "./Footer.css";
import logo from "../../logo/logo1.jpg";
import { NavLink } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wave"></div>
      <div className="fo oter-container footer_flex1">
        {/* Column 1: Logo */}
        <div className="foot er-col footerLogoSec ">
          <div className=" footerLogo">
            <img src={logo} alt="Logo" className="logo" />
            <p className="company-tagline">Your Health, Our Priority</p>
          </div>
          <div>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <p>+91-911-551-3759 </p>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <p>+91-911-591-5933 </p>
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <span>ukgermanpharmaceutical@gmail.com</span>
              </div>
            </div>
            <div className="social-icons">
              <a
                href="https://www.facebook.com/people/Dr-BSKs/61576600531948/"
                target="blank"
                aria-label="Facebook"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png"
                  alt="Facebook"
                />
              </a>
              <a
                href="https://www.instagram.com/drbsk_humanhealth?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                target="blank"
                aria-label="Instagram"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
                  alt="Instagram"
                />
              </a>
              <a
                href="https://www.youtube.com/@Dr.BSKsURUMEED-w4o"
                target="blank"
                aria-label="YouTube"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
                  alt="YouTube"
                />
              </a>
              {/* <a href="#" aria-label="Twitter">
                <img src="https://cdn-icons-png.flaticon.com/512/3670/3670151.png" alt="Twitter" />
              </a> */}
              <a
                href="https://www.linkedin.com/company/dr-bsk-s/"
                target="blank"
                aria-label="LinkedIn"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png"
                  alt="LinkedIn"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="footer_flex">
          {/* Column 2: Company */}
          <div className="foo ter-col footerLinkSec">
            <h4>Company</h4>
            <ul className="footer-links">
              <li>
                <NavLink to="/aboutus">About us</NavLink>
              </li>
              <li>
                <NavLink to="/fever">Our Products</NavLink>
              </li>
              <li>
                <NavLink to="/testimonial">Customer Speaks</NavLink>
              </li>
              <li>
                <NavLink to="/photo">Photo Gallery</NavLink>
              </li>
              <li>
                <NavLink to="/video">Video Gallery</NavLink>
              </li>
              <li>
                <NavLink to="/blogs">Blogs</NavLink>
              </li>
              <li>
                <NavLink to="/contactus">Contact us</NavLink>
              </li>
              {/* <li><a href="/aboutus">About us</a></li>
              <li><a href="/fever">Our Products</a></li>
              <li><a href="/testimonial">Customer Speaks</a></li>
              <li><a href="#">Career</a></li>
              <li><a href="/contactus">Contact</a></li>
              <li><a href="/photo">Photo Gallery</a></li> */}
            </ul>
          </div>

          {/* Column 3: Policies */}
          {/* <div className="foo ter-col footerLinkSec">
            <h4>Our Policies</h4>
            <ul className="footer-links">
              <li>
                <a href="#">Terms and Conditions</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Grievance Redressal Policy</a>
              </li>
              <li>
                <a href="#">Shipping and Delivery Policy</a>
              </li>
              <li>
                <a href="#">Return, Refund and Cancellation Policy</a>
              </li>
              <li>
                <a href="#">IP Policy</a>
              </li>
            </ul>
          </div> */}

          {/* Column 4: Shopping */}
          <div className="foo ter-col footerLinkSec">
            <h4>Shopping</h4>
            <ul className="footer-links">
              <li>
                {/* <a href="#">Health Articles</a> */}
              </li>
              <li>
                {/* <a href="#">Offers and Coupons</a> */}
              </li>
              <li>
                <a href="/faq">FAQs</a>
              </li>
              <li>
                {/* <a href="#">Store Locator</a> */}
              </li>
              <li>
                {/* <a href="">Gift Cards</a> */}

              </li>
              <li>
                {/* <a href="">Gift Cards</a> */}
                <NavLink to="/pharma-admin">Admin Panel</NavLink>
              </li>
            </ul>
          </div>

          {/* Column 5: Contact */}
          <div className="foo ter-col footerLinkSec">
            <h4>Registered Office</h4>
            <address>
              UK German Pharmaceuticals,
              <br /> Akal Academy Road,
              <br />
              Opp. Malwa Gramin Bank,
              <br /> Cheema Mandi -148029,
              <br />
              Distt. Sangrur (Punjab) India
            </address>

            {/* <h4>Head Office</h4>
            <address>
              456 Corporate Tower,<br />
              MG Road, Gurugram,<br />
              Haryana 122002<br />
              India
            </address> */}
          </div>
        </div>
      </div>
      {/* <div>
        <div className="contact-info">
          <div className="contact-item">
            <span className="contact-icon">📞</span>
            <span>+91 1234567890</span>
          </div>
          <div className="contact-item">
            <span className="contact-icon">✉️</span>
            <span>info@davaindia.com</span>
          </div>
        </div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111392.png" alt="Facebook" />
          </a>
          <a href="#" aria-label="Instagram">
            <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" />
          </a>
          <a href="#" aria-label="YouTube">
            <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" />
          </a>
          <a href="#" aria-label="Twitter">
            <img src="https://cdn-icons-png.flaticon.com/512/3670/3670151.png" alt="Twitter" />
          </a>
          <a href="#" aria-label="LinkedIn">
            <img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" alt="LinkedIn" />
          </a>
        </div>
      </div> */}

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {new Date().getFullYear()} Dr.BSK's. All Rights Reserved.</p>
          <p>Crafted With ❤ by CIIS - Career Infowis IT Solutions Pvt Ltd</p>
          {/* <div className="payment-methods">
            <img
              src="https://cdn-icons-png.flaticon.com/512/196/196578.png"
              alt="Visa"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/196/196561.png"
              alt="Mastercard"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/196/196566.png"
              alt="PayPal"
            />
            <img
              src="https://cdn-icons-png.flaticon.com/512/825/825454.png"
              alt="UPI"
            />
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useEffect } from "react";
import Header from "../../components/Header/Header";
import API_URL from "../../config";
import Features from "../../components/Features/Features";
import Banner from "../../components/Banner/Banner";
import Categories from "../../components/Categories/Categories";
import PromoSection from "../../components/PromoSection/PromoSection";
import Personal from "../../components/Personal/Personal";
import Footer from "../../components/Footer/Footer";
import Slider from "../../components/Slider/Slider";
import Slider2 from "../../components/Slider/Slider2";
import VideoPlayer from "../../components/VideoPlayer";

function Dashboard() {

  // Initialize Facebook Pixel (ONLY PAGEVIEW)
  const initializeFacebookPixel = () => {
    if (typeof window === "undefined" || window.fbq) return;

    window.fbq = function () {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };

    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    // ✅ Pixel Init
    window.fbq("init", "1089413259423195");

    // ✅ ONLY PAGEVIEW
    window.fbq("track", "PageView");
  };

  // Server-side PageView (optional but good)
  const sendServerPageView = async () => {
    try {
      const eventData = {
        eventName: "PageView",
        data: {
          eventSourceUrl: window.location.href,
          actionSource: "website",
          eventTime: Math.floor(Date.now() / 1000),
        },
        clientUserAgent: navigator.userAgent,
      };

      await fetch(`${API_URL}api/facebook-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      console.error("Server PageView error:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !window.fbq) {
      initializeFacebookPixel();
    }

    // ✅ ONLY PAGEVIEW SERVER SIDE
    sendServerPageView();
  }, []);

  return (
    <div className="App">
      <Header />

      <VideoPlayer />
      <Banner />
      <Features />

      <div className="spacer"></div>

      <Slider />
      <Categories />
      <PromoSection />
      <Slider2 />
      <Personal />

      <Footer />

      {/* Facebook Pixel NoScript */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1089413259423195&ev=PageView&noscript=1"
          alt="fb-pixel"
        />
      </noscript>
    </div>
  );
}

export default Dashboard;

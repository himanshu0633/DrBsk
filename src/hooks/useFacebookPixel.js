import { useEffect } from 'react';
import API_URL from '../config';
export const useFacebookPixel = () => {
  useEffect(() => {
    // Initialize Facebook Pixel
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, []);
};

export const trackViewContent = (productData) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: productData.name,
      content_ids: [productData.id],
      content_type: 'product',
      value: productData.price,
      currency: 'INR',
    });
  }
  
  // Server-side event (Conversions API) भी भेजें
  sendServerEvent('ViewContent', productData);
};

export const trackAddToCart = (productData, quantity = 1) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [productData.id],
      content_name: productData.name,
      content_type: 'product',
      value: productData.price * quantity,
      currency: 'INR',
      num_items: quantity,
    });
  }
  
  sendServerEvent('AddToCart', productData, quantity);
};

export const trackPurchase = (orderData) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: orderData.total,
      currency: 'INR',
      content_ids: orderData.products.map(p => p.id),
      content_type: 'product',
      num_items: orderData.products.length,
      order_id: orderData.orderId,
    });
  }
  
  sendServerEvent('Purchase', orderData);
};

// Server-side event भेजने के लिए function
const sendServerEvent = async (eventName, data, quantity = 1) => {
  try {
    const response = await fetch(`${API_URL}api/facebook-events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        data,
        quantity,
        fbp: getCookie('_fbp'), // Get Facebook Pixel cookie
        fbc: getCookie('_fbc'), // Get Facebook Click ID cookie
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to send server event');
    }
  } catch (error) {
    console.error('Error sending server event:', error);
  }
};

// Cookie get करने के लिए helper function
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};
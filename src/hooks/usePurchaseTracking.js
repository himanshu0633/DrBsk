import { useEffect, useRef } from 'react';
import { trackPurchase } from '../utils/fbPixel';

const usePurchaseTracking = (orderData, isSuccessPage = false) => {
  const hasTrackedRef = useRef(false);
  
  // Get unique transaction ID from localStorage to prevent duplicate tracking
  const getStoredTransactions = () => {
    try {
      return JSON.parse(localStorage.getItem('fb_pixel_transactions') || '[]');
    } catch {
      return [];
    }
  };

  useEffect(() => {
    // Only track if we're on success page and have order data
    if (!isSuccessPage || !orderData || hasTrackedRef.current) {
      return;
    }

    const { orderId, totalAmount, items, currency = 'INR' } = orderData;
    
    // Validate required fields
    if (!orderId || !totalAmount) {
      console.error('Purchase tracking failed: Missing orderId or totalAmount');
      return;
    }
    
    // Check if this transaction was already tracked
    const storedTransactions = getStoredTransactions();
    if (storedTransactions.includes(orderId)) {
      console.warn(`Purchase already tracked for order: ${orderId}`);
      hasTrackedRef.current = true;
      return;
    }
    
    // Prepare purchase data
    const purchaseData = {
      value: parseFloat(totalAmount),
      currency: currency,
      transaction_id: orderId.toString(),
      contents: items?.map(item => ({
        id: item.id || item.productId,
        quantity: item.quantity || 1,
        item_price: item.price || item.itemPrice
      })) || [],
      num_items: items?.length || 0
    };
    
    // Track the purchase
    try {
      trackPurchase(purchaseData);
      hasTrackedRef.current = true;
      
      // Store transaction ID to prevent duplicate tracking
      storedTransactions.push(orderId.toString());
      localStorage.setItem('fb_pixel_transactions', JSON.stringify(storedTransactions));
      
      console.log('Purchase tracked successfully:', orderId);
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  }, [orderData, isSuccessPage]);

  // Optional: Reset function if needed
  const resetTracking = () => {
    hasTrackedRef.current = false;
  };

  return { resetTracking };
};

export default usePurchaseTracking;
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color: string;
  };
}

export const useRazorpay = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState<string>('');

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const initializeRazorpay = async () => {
      try {
        // Load Razorpay script
        await loadRazorpayScript();
        
        // Get Razorpay key
        const response = await api.getRazorpayKey();
        if (response.success) {
          setRazorpayKey(response.data.key);
          setIsLoaded(true);
        }
      } catch (error) {
        console.error('Failed to initialize Razorpay:', error);
        // toast.error('Failed to initialize payment system');
      }
    };

    initializeRazorpay();
  }, []);

  const openRazorpay = (options: Omit<RazorpayOptions, 'key'>) => {
    if (!isLoaded || !window.Razorpay) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    const razorpayOptions: RazorpayOptions = {
      ...options,
      key: razorpayKey,
      theme: {
        color: '#3B82F6'
      }
    };

    const razorpay = new window.Razorpay(razorpayOptions);
    razorpay.open();
  };

  return {
    isLoaded,
    razorpayKey,
    openRazorpay
  };
};

export const useCreditPayment = () => {
  const { isLoaded, openRazorpay } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const processCreditPayment = async (credits: any, currency: string, billingInterval: string = 'monthly', couponData?: any) => {
    if (!isLoaded) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    try {
      // Log the coupon data being sent
      console.log("Coupon Data from Frontend:", {
        couponCode: couponData?.coupon?.code,
        discount: couponData?.discount,
        finalAmount: couponData?.finalAmount,
        originalAmount: couponData?.originalAmount
      });

      // Create payment order
      const orderResponse = await api.createCreditOrder({
        credits,
        currency,
        billingInterval,
        couponCode: couponData?.coupon?.code,
        discountAmount: couponData?.discount || 0
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create payment order');
      }

      const orderData = orderResponse.data;
      
      console.log("Order Data from Backend:", {
        planType: orderData.planType,
        amount: orderData.amount,
        originalAmount: orderData.originalAmount,
        discount: orderData.discount,
        currency: orderData.currency,
        credits: orderData.credits
      });
      
      // Open Razorpay payment with the FINAL discounted amount
      const razorpayAmount = Math.round(orderData.amount * 100); // Convert to paise/cents
      
      console.log("Razorpay Amount (in smallest unit):", razorpayAmount);
      console.log("Razorpay Amount (in currency):", orderData.amount);
      
      openRazorpay({
        amount: razorpayAmount,
        currency: orderData.currency,
        name: 'LinkedInPulse',
        description: `${orderData.planType} Plan - ${credits.posts} posts, ${credits.comments} comments, ${credits.ideas} ideas`,
        order_id: orderData.orderId,
        notes: {
          credits: JSON.stringify(credits),
          planType: orderData.planType,
          billingInterval
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await api.verifyPayment({
              orderId: orderData.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            if (verifyResponse.success) {
              toast.success('Payment successful! Your subscription is now active.');
              // Redirect to dashboard or refresh subscription data
              window.location.href = '/dashboard';
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        }
      });
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processCreditPayment,
    isProcessing,
    isLoaded
  };
};

export const usePlanPayment = () => {
  const { isLoaded, openRazorpay } = useRazorpay();
  const [isProcessing, setIsProcessing] = useState(false);

  const processPlanPayment = async (plan: string, currency: string, billingInterval: string = 'monthly') => {
    if (!isLoaded) {
      toast.error('Payment system not ready. Please try again.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create subscription order
      const orderResponse = await api.createPlanOrder({
        plan,
        currency,
        billingInterval
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Failed to create subscription order');
      }

      const orderData = orderResponse.data;

      // For subscription-based payments, we'll use Razorpay's subscription flow
      // This is a simplified version - in production you'd want to handle subscriptions differently
      toast.info('Redirecting to subscription setup...');
      
      // For now, we'll create a one-time payment for the first month
      openRazorpay({
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency,
        name: 'LinkedInPulse',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - Monthly`,
        order_id: orderData.subscriptionId, // Using subscription ID as order ID for now
        notes: {
          plan,
          billingInterval,
          subscriptionId: orderData.subscriptionId
        },
        handler: async (response: any) => {
          try {
            toast.success('Payment successful! Your subscription is now active.');
            window.location.href = '/dashboard';
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        }
      });
    } catch (error) {
      console.error('Plan payment processing error:', error);
      toast.error(error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPlanPayment,
    isProcessing,
    isLoaded
  };
};

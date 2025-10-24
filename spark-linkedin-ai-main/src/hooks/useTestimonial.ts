import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}`;
interface TestimonialState {
  showPopup: boolean;
  triggeredBy: 'first_post' | 'first_comment' | 'profile_analysis' | null;
  isEligible: boolean;
  actionCount: number;
}

export function useTestimonial() {
  const [state, setState] = useState<TestimonialState>({
    showPopup: false,
    triggeredBy: null,
    isEligible: false,
    actionCount: 0
  });

  useEffect(() => {
    checkEligibility();
  }, []);

  const checkEligibility = async () => {
    try {
      // Check if already submitted
      const submitted = localStorage.getItem('testimonialSubmitted');
      if (submitted === 'true') {
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE}/testimonials/check-eligibility`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setState(prev => ({
          ...prev,
          isEligible: result.eligible,
          actionCount: result.actionCount
        }));
      }
    } catch (error) {
      console.error('Error checking testimonial eligibility:', error);
    }
  };

  const triggerTestimonialPopup = (action: 'first_post' | 'first_comment' | 'profile_analysis') => {
    // Check if already shown for this session
    const shownThisSession = sessionStorage.getItem(`testimonial_shown_${action}`);
    if (shownThisSession === 'true') {
      return;
    }

    // Check if already submitted globally
    const submitted = localStorage.getItem('testimonialSubmitted');
    if (submitted === 'true') {
      return;
    }

    // Check if dismissed too many times
    const dismissCount = parseInt(localStorage.getItem('testimonialDismissCount') || '0');
    if (dismissCount >= 3) {
      return;
    }

    // Show popup after a short delay
    setTimeout(() => {
      setState({
        showPopup: true,
        triggeredBy: action,
        isEligible: true,
        actionCount: 0
      });
      
      // Mark as shown for this session
      sessionStorage.setItem(`testimonial_shown_${action}`, 'true');
    }, 2000); // 2 second delay
  };

  const closePopup = () => {
    setState(prev => ({
      ...prev,
      showPopup: false,
      triggeredBy: null
    }));

    // Increment dismiss count
    const dismissCount = parseInt(localStorage.getItem('testimonialDismissCount') || '0');
    localStorage.setItem('testimonialDismissCount', (dismissCount + 1).toString());
  };

  return {
    showPopup: state.showPopup,
    triggeredBy: state.triggeredBy,
    isEligible: state.isEligible,
    actionCount: state.actionCount,
    triggerTestimonialPopup,
    closePopup
  };
}


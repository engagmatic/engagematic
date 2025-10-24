// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  
  // Admin Auth
  ADMIN_LOGIN: `${API_URL}/api/admin/auth/login`,
  ADMIN_VERIFY: `${API_URL}/api/admin/auth/verify`,
  ADMIN_LOGOUT: `${API_URL}/api/admin/auth/logout`,
  
  // Admin
  ADMIN_STATS: `${API_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_URL}/api/admin/users`,
  ADMIN_RECENT_USERS: `${API_URL}/api/admin/recent-users`,
  ADMIN_RECENT_ACTIVITY: `${API_URL}/api/admin/recent-activity`,
  
  // Blog
  BLOG_PUBLIC: `${API_URL}/api/blog/public`,
  BLOG_ADMIN: `${API_URL}/api/blog/admin`,
  
  // Testimonials
  TESTIMONIALS_PUBLIC: `${API_URL}/api/testimonials/public`,
  TESTIMONIALS_SUBMIT: `${API_URL}/api/testimonials/submit`,
  TESTIMONIALS_CHECK: `${API_URL}/api/testimonials/check-eligibility`,
  TESTIMONIALS_ADMIN: `${API_URL}/api/testimonials/admin`,
};


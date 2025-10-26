const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  getToken() {
    return this.token || localStorage.getItem("token");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle rate limiting specifically
      if (response.status === 429) {
        const data = await response
          .json()
          .catch(() => ({ message: "Too many requests" }));
        throw new Error(
          data.message || "Too many requests, please try again later"
        );
      }

      const data = await response.json();

      if (!response.ok) {
        // Log detailed error for debugging
        console.error("❌ API Error Response:", {
          status: response.status,
          endpoint,
          message: data.message,
          errors: data.errors,
          details: data.details,
        });

        // Provide more specific error messages
        if (response.status === 400) {
          // Validation errors - show detailed message
          const errorMsg =
            data.details || data.message || "Invalid request data";
          const validationErrors = data.errors
            ?.map((e) => e.msg || e.message)
            .join(", ");
          throw new Error(validationErrors || errorMsg);
        } else if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(data.message || "Access denied");
        } else if (response.status === 404) {
          throw new Error(data.message || "Resource not found");
        } else if (response.status === 500) {
          throw new Error(
            data.message || "Server error. Please try again later."
          );
        }

        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", {
        endpoint,
        error: error.message,
        url,
      });
      throw error;
    }
  }

  // Auth methods
  async register(userData) {
    const response = await this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(credentials) {
    const response = await this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });

    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  async updateProfile(profileData) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Content generation methods
  async generatePost(postData) {
    return this.request("/content/posts/generate", {
      method: "POST",
      body: JSON.stringify(postData),
    });
  }

  async generateComment(commentData) {
    return this.request("/content/comments/generate", {
      method: "POST",
      body: JSON.stringify(commentData),
    });
  }

  async fetchLinkedInContent(url) {
    return this.request("/content/fetch-linkedin-content", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async analyzeLinkedInProfile(profileUrl) {
    return this.request("/content/analyze-linkedin-profile", {
      method: "POST",
      body: JSON.stringify({ profileUrl }),
    });
  }

  async getContentHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/content/history${queryString ? `?${queryString}` : ""}`
    );
  }

  async saveContent(contentId) {
    return this.request(`/content/save/${contentId}`, {
      method: "POST",
    });
  }

  async getSavedContent(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/content/saved${queryString ? `?${queryString}` : ""}`
    );
  }

  async deleteContent(contentId) {
    return this.request(`/content/${contentId}`, {
      method: "DELETE",
    });
  }

  // Persona methods
  async getPersonas() {
    return this.request("/personas");
  }

  async getSamplePersonas() {
    return this.request("/personas/samples");
  }

  async createPersona(personaData) {
    return this.request("/personas", {
      method: "POST",
      body: JSON.stringify(personaData),
    });
  }

  async updatePersona(personaId, personaData) {
    return this.request(`/personas/${personaId}`, {
      method: "PUT",
      body: JSON.stringify(personaData),
    });
  }

  async deletePersona(personaId) {
    return this.request(`/personas/${personaId}`, {
      method: "DELETE",
    });
  }

  async setDefaultPersona(personaId) {
    return this.request(`/personas/${personaId}/set-default`, {
      method: "POST",
    });
  }

  // Hook methods
  async getHooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/hooks${queryString ? `?${queryString}` : ""}`);
  }

  async getHookCategories() {
    return this.request("/hooks/categories");
  }

  async getPopularHooks() {
    return this.request("/hooks/popular");
  }

  async getTrendingHooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/hooks/trending${queryString ? `?${queryString}` : ""}`
    );
  }

  // Trial management methods
  async getTrialStatus() {
    return this.request("/trial/status");
  }

  async checkTrialAction(action) {
    return this.request("/trial/check-action", "POST", { action });
  }

  async getTrialLimits() {
    return this.request("/trial/limits");
  }

  async getDynamicHooks(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/dynamic-hooks${queryString ? `?${queryString}` : ""}`
    );
  }

  // Analytics methods
  async getDashboardStats() {
    return this.request("/analytics/dashboard");
  }

  async getUsageStats() {
    return this.request("/analytics/usage");
  }

  async getUsageHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/analytics/usage/history${queryString ? `?${queryString}` : ""}`
    );
  }

  async getEngagementAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/analytics/engagement${queryString ? `?${queryString}` : ""}`
    );
  }

  // Subscription methods
  async getCurrentSubscription() {
    return this.request("/subscription/current");
  }

  async createSubscription(subscriptionData) {
    return this.request("/subscription/create", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  }

  async upgradeSubscription(upgradeData) {
    return this.request("/subscription/upgrade", {
      method: "POST",
      body: JSON.stringify(upgradeData),
    });
  }

  async cancelSubscription() {
    return this.request("/subscription/cancel", {
      method: "POST",
    });
  }

  async getInvoices() {
    return this.request("/subscription/invoices");
  }

  // Waitlist methods
  async joinWaitlist(waitlistData) {
    return this.request("/waitlist/join", {
      method: "POST",
      body: JSON.stringify(waitlistData),
    });
  }

  async getWaitlistStats() {
    return this.request("/waitlist/stats");
  }

  // Referral methods
  async generateReferralCode() {
    return this.request("/referrals/generate", {
      method: "POST",
    });
  }

  async getReferralStats() {
    return this.request("/referrals/stats");
  }

  async getMyReferrals() {
    return this.request("/referrals/my-referrals");
  }

  async validateReferralCode(code) {
    return this.request(`/referrals/validate/${code}`);
  }

  async trackReferralClick(code) {
    return this.request("/referrals/track", {
      method: "POST",
      body: JSON.stringify({ referralCode: code }),
    });
  }

  async sendReferralInvites(emailData) {
    return this.request("/referrals/invite", {
      method: "POST",
      body: JSON.stringify(emailData),
    });
  }

  // Testimonial methods
  async collectTestimonial(testimonialData) {
    return this.request("/testimonials/collect", {
      method: "POST",
      body: JSON.stringify(testimonialData),
    });
  }

  async getPublicTestimonials(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(
      `/testimonials/public${queryString ? `?${queryString}` : ""}`
    );
  }

  async submitTestimonial(testimonialData) {
    return this.request("/testimonials/submit", {
      method: "POST",
      body: JSON.stringify(testimonialData),
    });
  }

  // Pricing methods
  async getPricingConfig() {
    return this.request("/pricing/config");
  }

  async calculatePrice(credits, currency) {
    return this.request("/pricing/calculate", {
      method: "POST",
      body: JSON.stringify({ credits, currency }),
    });
  }

  async detectRegion() {
    return this.request("/pricing/detect-region");
  }

  async createCreditSubscription(subscriptionData) {
    return this.request("/pricing/create-subscription", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    });
  }

  async updateSubscriptionCredits(credits, currency) {
    return this.request("/pricing/update-credits", {
      method: "PUT",
      body: JSON.stringify({ credits, currency }),
    });
  }

  async getCurrentSubscriptionWithPricing() {
    return this.request("/pricing/current-subscription");
  }

  async validateCredits(credits) {
    return this.request("/pricing/validate-credits", {
      method: "POST",
      body: JSON.stringify({ credits }),
    });
  }

  // Payment methods
  async createCreditOrder(orderData) {
    return this.request("/payment/create-credit-order", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async verifyPayment(paymentData) {
    return this.request("/payment/verify-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  }

  async createPlanOrder(orderData) {
    return this.request("/payment/create-plan-order", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getRazorpayKey() {
    return this.request("/payment/key");
  }

  // Profile completion methods
  async getProfileStatus() {
    return this.request("/profile/status", {
      method: "GET",
    });
  }

  async getProfileRequirements() {
    return this.request("/profile/requirements", {
      method: "GET",
    });
  }

  async completeBasicProfile(profileData) {
    return this.request("/profile/complete-basic", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  }
}

export default new ApiClient();

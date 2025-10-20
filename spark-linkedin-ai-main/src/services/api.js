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
        // Provide more specific error messages
        if (response.status === 401) {
          throw new Error("Authentication required. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(data.message || "Access denied");
        } else if (response.status === 404) {
          throw new Error(data.message || "Resource not found");
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
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
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
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
}

export default new ApiClient();

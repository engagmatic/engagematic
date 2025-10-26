import { BetaAnalyticsDataClient } from "@google-analytics/data";

class GoogleAnalyticsService {
  constructor() {
    this.analyticsDataClient = null;
    this.propertyId = process.env.GA_PROPERTY_ID || null; // Your GA4 property ID
    this.initialized = false;
  }

  /**
   * Initialize Google Analytics Data API
   * Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
   */
  async initialize() {
    try {
      if (!this.propertyId) {
        console.warn("⚠️  GA_PROPERTY_ID not set. Google Analytics disabled.");
        return false;
      }

      // Initialize the client
      // This uses the GOOGLE_APPLICATION_CREDENTIALS env variable
      // which should point to your service account JSON file
      this.analyticsDataClient = new BetaAnalyticsDataClient();
      this.initialized = true;
      console.log("✅ Google Analytics service initialized");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Google Analytics:", error.message);
      return false;
    }
  }

  /**
   * Get real-time metrics (last 30 minutes)
   */
  async getRealtimeMetrics() {
    if (!this.initialized) {
      return { success: false, message: "Google Analytics not initialized" };
    }

    try {
      const [response] = await this.analyticsDataClient.runRealtimeReport({
        property: `properties/${this.propertyId}`,
        dimensions: [{ name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
      });

      const activeUsers = response.rows?.[0]?.metricValues?.[0]?.value || 0;

      return {
        success: true,
        data: {
          activeUsers: parseInt(activeUsers),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error fetching realtime metrics:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get analytics for a date range (last 7 days, 30 days, etc.)
   */
  async getMetrics(startDate = "7daysAgo", endDate = "today") {
    if (!this.initialized) {
      return { success: false, message: "Google Analytics not initialized" };
    }

    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
          { name: "newUsers" },
        ],
      });

      const metrics = response.rows?.[0]?.metricValues || [];

      return {
        success: true,
        data: {
          activeUsers: parseInt(metrics[0]?.value || 0),
          sessions: parseInt(metrics[1]?.value || 0),
          pageViews: parseInt(metrics[2]?.value || 0),
          bounceRate: parseFloat(metrics[3]?.value || 0).toFixed(2),
          avgSessionDuration: parseFloat(metrics[4]?.value || 0).toFixed(2),
          newUsers: parseInt(metrics[5]?.value || 0),
          period: { startDate, endDate },
        },
      };
    } catch (error) {
      console.error("Error fetching analytics metrics:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get top pages
   */
  async getTopPages(limit = 10) {
    if (!this.initialized) {
      return { success: false, message: "Google Analytics not initialized" };
    }

    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        limit,
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      });

      const pages =
        response.rows?.map((row) => ({
          path: row.dimensionValues[0].value,
          title: row.dimensionValues[1].value,
          views: parseInt(row.metricValues[0].value),
          users: parseInt(row.metricValues[1].value),
        })) || [];

      return {
        success: true,
        data: pages,
      };
    } catch (error) {
      console.error("Error fetching top pages:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get traffic sources
   */
  async getTrafficSources() {
    if (!this.initialized) {
      return { success: false, message: "Google Analytics not initialized" };
    }

    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      });

      const sources =
        response.rows?.map((row) => ({
          source: row.dimensionValues[0].value,
          sessions: parseInt(row.metricValues[0].value),
        })) || [];

      return {
        success: true,
        data: sources,
      };
    } catch (error) {
      console.error("Error fetching traffic sources:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get simple summary for dashboard
   */
  async getDashboardSummary() {
    try {
      const [metrics7d, metrics30d, realtime] = await Promise.all([
        this.getMetrics("7daysAgo", "today"),
        this.getMetrics("30daysAgo", "today"),
        this.getRealtimeMetrics(),
      ]);

      return {
        success: true,
        data: {
          last7Days: metrics7d.success ? metrics7d.data : null,
          last30Days: metrics30d.success ? metrics30d.data : null,
          realtime: realtime.success ? realtime.data : null,
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return { success: false, error: error.message };
    }
  }
}

const googleAnalyticsService = new GoogleAnalyticsService();
export default googleAnalyticsService;

import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api.js";
import { useToast } from "@/hooks/use-toast";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Helper: treat as auth error (don't show generic subscription error toast)
  const isAuthError = (msg) => {
    if (!msg || typeof msg !== "string") return false;
    const s = msg.toLowerCase();
    return s.includes("token") || s.includes("authentication") || s.includes("log in") || s.includes("expired") || s.includes("access token");
  };

  // Fetch subscription details
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [subscriptionResponse, usageResponse] = await Promise.allSettled([
        apiClient.request("/subscription").catch((err) => ({ success: false, error: err?.message || "Failed to fetch" })),
        apiClient.request("/subscription/usage").catch((err) => ({ success: false, error: err?.message || "Failed to fetch" })),
      ]);

      const subResult = subscriptionResponse.status === "fulfilled" ? subscriptionResponse.value : { success: false };
      const usageResult = usageResponse.status === "fulfilled" ? usageResponse.value : { success: false };

      // If subscription fetch succeeded, always set subscription so dashboard works
      if (subResult.success && subResult.data) {
        const mergedData = usageResult.success && usageResult.data
          ? { ...subResult.data, ...usageResult.data }
          : { ...subResult.data };
        setSubscription(mergedData);
        if (usageResult.success && usageResult.data) setUsage(usageResult.data);
        setError(null);
        return;
      }

      // Subscription fetch failed
      const errorMsg = subResult.error || usageResult.error || "Failed to fetch subscription";
      setError(errorMsg);

      // Don't show toast for CORS/network or auth errors (auth flow will redirect or show login)
      if (errorMsg.includes("CORS") || errorMsg.includes("fetch") || errorMsg.includes("Failed to load")) return;
      if (isAuthError(errorMsg)) return;

      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Subscription fetch error:", error);
      const errorMsg = error?.message || "Failed to fetch subscription";
      setError(errorMsg);

      if (errorMsg.includes("CORS") || errorMsg.includes("fetch") || errorMsg.includes("Failed to load")) return;
      if (isAuthError(errorMsg)) return;

      toast({
        title: "Error",
        description: "Failed to fetch subscription details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch usage statistics
  const fetchUsage = useCallback(async () => {
    try {
      const response = await apiClient.request("/subscription/usage");

      if (response.success) {
        setUsage(response.data);
      } else {
        throw new Error(response.message || "Failed to fetch usage stats");
      }
    } catch (error) {
      console.error("Usage fetch error:", error);
      const errorMsg = error.message || "Failed to fetch usage stats";
      setError(errorMsg);
      
      // Don't show errors for network/CORS issues (silent fail)
      // This prevents alert boxes from appearing
    }
  }, []);

  // Check if user can perform an action
  const canPerformAction = useCallback(async (action) => {
    try {
      const response = await apiClient.request("/subscription/check-action", {
        method: "POST",
        body: JSON.stringify({ action }),
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to check action");
      }
    } catch (error) {
      console.error("Action check error:", error);
      return { allowed: false, reason: error.message };
    }
  }, []);

  // Record usage
  const recordUsage = useCallback(async (action) => {
    try {
      const response = await apiClient.request("/subscription/record-usage", {
        method: "POST",
        body: JSON.stringify({ action }),
      });

      if (response.success) {
        // Update local state
        if (response.data.subscription) {
          setSubscription((prev) => ({
            ...prev,
            ...response.data.subscription,
          }));
        }
        return response.data;
      } else {
        throw new Error(response.message || "Failed to record usage");
      }
    } catch (error) {
      console.error("Usage recording error:", error);
      throw error;
    }
  }, []);

  // Upgrade plan
  const upgradePlan = useCallback(
    async (plan, billingInterval = "monthly") => {
      try {
        const response = await apiClient.request("/subscription/upgrade", {
          method: "POST",
          body: JSON.stringify({ plan, billingInterval }),
        });

        if (response.success) {
          setSubscription(response.data);
          toast({
            title: "Plan Upgraded! 🎉",
            description: `Successfully upgraded to ${plan} plan`,
          });
          return response.data;
        } else {
          throw new Error(response.message || "Failed to upgrade plan");
        }
      } catch (error) {
        console.error("Plan upgrade error:", error);
        toast({
          title: "Upgrade Failed",
          description: error.message || "Failed to upgrade plan",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    try {
      const response = await apiClient.request("/subscription/cancel", {
        method: "POST",
      });

      if (response.success) {
        setSubscription(response.data);
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled",
        });
        return response.data;
      } else {
        throw new Error(response.message || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Load subscription data on mount (fetchSubscription already gets subscription + usage)
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Helper functions
  const isTrialActive = subscription?.status === "trial";
  const isTrialExpired = subscription?.status === "expired";
  const isSubscriptionActive = subscription?.status === "active";

  const getTrialDaysRemaining = () => {
    if (!isTrialActive) return 0;
    if (subscription?.trialInfo?.daysRemaining != null) return subscription.trialInfo.daysRemaining;
    if (subscription?.trialEndDate) {
      const days = Math.ceil((new Date(subscription.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24));
      return Math.max(0, days);
    }
    return 0;
  };

  const getUsagePercentage = (type) => {
    if (!subscription?.usage || !subscription?.limits) return 0;

    const used = subscription.usage[type] || 0;
    const limit = subscription.limits[type] || 1;

    return Math.min((used / limit) * 100, 100);
  };

  const getTokensRemaining = () => {
    return subscription?.tokens?.remaining || 0;
  };

  const getTokensUsed = () => {
    return subscription?.tokens?.used || 0;
  };

  const getTokensTotal = () => {
    return subscription?.tokens?.total || 0;
  };

  return {
    // Data
    subscription,
    usage,
    loading,
    error,

    // Actions
    fetchSubscription,
    fetchUsage,
    canPerformAction,
    recordUsage,
    upgradePlan,
    cancelSubscription,

    // Helpers
    isTrialActive,
    isTrialExpired,
    isSubscriptionActive,
    getTrialDaysRemaining,
    getUsagePercentage,
    getTokensRemaining,
    getTokensUsed,
    getTokensTotal,
  };
}

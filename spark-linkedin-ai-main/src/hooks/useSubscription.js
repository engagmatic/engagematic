import { useState, useEffect, useCallback } from "react";
import apiClient from "../services/api.js";
import { useToast } from "@/hooks/use-toast";

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Fetch subscription details
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both subscription and usage stats with error handling
      const [subscriptionResponse, usageResponse] = await Promise.allSettled([
        apiClient.request("/subscription").catch(err => ({ success: false, error: err.message })),
        apiClient.request("/subscription/usage").catch(err => ({ success: false, error: err.message })),
      ]);

      const subResult = subscriptionResponse.status === 'fulfilled' ? subscriptionResponse.value : { success: false };
      const usageResult = usageResponse.status === 'fulfilled' ? usageResponse.value : { success: false };

      if (subResult.success && usageResult.success) {
        // Merge subscription and usage data
        const mergedData = {
          ...subResult.data,
          ...usageResult.data,
        };
        setSubscription(mergedData);
        setUsage(usageResult.data);
      } else {
        // Only set error, don't show toast for CORS/network errors (will be handled silently)
        const errorMsg = subResult.error || usageResult.error || "Failed to fetch subscription";
        setError(errorMsg);
        
        // Only show toast for non-CORS errors
        if (!errorMsg.includes("CORS") && !errorMsg.includes("fetch") && !errorMsg.includes("Failed to load")) {
          toast({
            title: "Error",
            description: "Failed to fetch subscription details",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Subscription fetch error:", error);
      const errorMsg = error.message || "Failed to fetch subscription";
      setError(errorMsg);
      
      // Don't show toast for network/CORS errors
      if (!errorMsg.includes("CORS") && !errorMsg.includes("fetch") && !errorMsg.includes("Failed to load")) {
        toast({
          title: "Error",
          description: "Failed to fetch subscription details",
          variant: "destructive",
        });
      }
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

  // Load subscription data on mount
  useEffect(() => {
    fetchSubscription();
    fetchUsage();
  }, [fetchSubscription, fetchUsage]);

  // Helper functions
  const isTrialActive = subscription?.status === "trial";
  const isTrialExpired = subscription?.status === "expired";
  const isSubscriptionActive = subscription?.status === "active";

  const getTrialDaysRemaining = () => {
    if (!isTrialActive || !subscription?.trialInfo?.daysRemaining) return 0;
    return subscription.trialInfo.daysRemaining;
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

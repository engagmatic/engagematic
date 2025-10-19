import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api.js';

export function useDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getDashboardStats();
      if (response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    isLoading,
    error,
    refetch: fetchDashboardData,
  };
}

export function useUsageStats() {
  const [usageStats, setUsageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsageStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getUsageStats();
      if (response.success) {
        setUsageStats(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch usage stats');
      }
    } catch (error) {
      console.error('Usage stats fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsageStats();
  }, [fetchUsageStats]);

  return {
    usageStats,
    isLoading,
    error,
    refetch: fetchUsageStats,
  };
}

export function useContentHistory() {
  const [contentHistory, setContentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchContentHistory = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getContentHistory(params);
      if (response.success) {
        setContentHistory(response.data.content);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch content history');
      }
    } catch (error) {
      console.error('Content history fetch error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentHistory();
  }, [fetchContentHistory]);

  return {
    contentHistory,
    pagination,
    isLoading,
    error,
    refetch: fetchContentHistory,
  };
}

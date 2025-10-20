import { useState, useCallback } from "react";
import apiClient from "../services/api.js";
import { useToast } from "@/hooks/use-toast";

export function useLinkedInProfile() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const { toast } = useToast();

  const analyzeProfile = useCallback(
    async (profileUrl) => {
      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
        console.log("🔍 Analyzing LinkedIn profile:", profileUrl);

        const response = await apiClient.analyzeLinkedInProfile(profileUrl);

        if (response.success) {
          setProfileData(response.data);
          toast({
            title: "Profile analyzed! 🎯",
            description:
              "LinkedIn insights generated for better content strategy",
          });
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || "Failed to analyze profile");
        }
      } catch (error) {
        console.error("Profile analysis error:", error);
        setAnalysisError(error.message);
        toast({
          title: "Analysis failed",
          description: error.message || "Could not analyze LinkedIn profile",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      } finally {
        setIsAnalyzing(false);
      }
    },
    [toast]
  );

  const clearProfileData = useCallback(() => {
    setProfileData(null);
    setAnalysisError(null);
  }, []);

  return {
    isAnalyzing,
    profileData,
    analysisError,
    analyzeProfile,
    clearProfileData,
  };
}

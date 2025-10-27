import { useState, useCallback } from "react";
import apiClient from "../services/api.js";
import { useToast } from "@/hooks/use-toast";

export function useContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [quotaInfo, setQuotaInfo] = useState(null);
  const { toast } = useToast();

  const generatePost = useCallback(
    async (postData) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.generatePost(postData);
        if (response.success) {
          setGeneratedContent(response.data.content);
          setQuotaInfo(response.data.quota);
          toast({
            title: "Post generated successfully! 🚀",
            description: "Your LinkedIn pulse just got stronger!",
          });
          return { success: true, content: response.data.content };
        } else {
          throw new Error(response.message || "Failed to generate post");
        }
      } catch (error) {
        console.error("Post generation error:", error);

        if (
          error.message.includes("QUOTA_EXCEEDED") ||
          error.message.includes("SUBSCRIPTION_LIMIT_EXCEEDED")
        ) {
          toast({
            title: "⚠️ Monthly Limit Reached",
            description:
              "Upgrade now to keep creating amazing content! Visit /pricing to view plans.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation failed",
            description: error.message || "Failed to generate post content",
            variant: "destructive",
          });
        }

        return { success: false, error: error.message };
      } finally {
        setIsGenerating(false);
      }
    },
    [toast]
  );

  const generatePostCustom = useCallback(
    async (postData) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.generatePostCustom(postData);
        if (response.success) {
          setGeneratedContent(response.data.content);
          setQuotaInfo(response.data.quota);
          toast({
            title: "Post generated successfully! 🚀",
            description: "Your LinkedIn pulse just got stronger!",
          });
          return { success: true, content: response.data.content };
        } else {
          throw new Error(response.message || "Failed to generate post");
        }
      } catch (error) {
        console.error("Custom post generation error:", error);

        if (
          error.message.includes("QUOTA_EXCEEDED") ||
          error.message.includes("SUBSCRIPTION_LIMIT_EXCEEDED")
        ) {
          toast({
            title: "⚠️ Monthly Limit Reached",
            description:
              "Upgrade now to keep creating amazing content! Visit /pricing to view plans.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation failed",
            description: error.message || "Failed to generate post content",
            variant: "destructive",
          });
        }

        return { success: false, error: error.message };
      } finally {
        setIsGenerating(false);
      }
    },
    [toast]
  );

  const generateComment = useCallback(
    async (commentData) => {
      setIsGenerating(true);
      try {
        const response = await apiClient.generateComment(commentData);
        if (response.success) {
          setGeneratedContent(response.data.content);
          setQuotaInfo(response.data.quota);
          toast({
            title: "Comment generated! 💬",
            description: "Ready to build real connections on LinkedIn",
          });
          return { success: true, data: response.data };
        } else {
          throw new Error(response.message || "Failed to generate comment");
        }
      } catch (error) {
        console.error("Comment generation error:", error);

        if (
          error.message.includes("QUOTA_EXCEEDED") ||
          error.message.includes("SUBSCRIPTION_LIMIT_EXCEEDED")
        ) {
          toast({
            title: "⚠️ Monthly Limit Reached",
            description:
              "Upgrade now to keep creating amazing content! Visit /pricing to view plans.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation failed",
            description: error.message || "Failed to generate comment",
            variant: "destructive",
          });
        }

        return { success: false, error: error.message };
      } finally {
        setIsGenerating(false);
      }
    },
    [toast]
  );

  const saveContent = useCallback(
    async (contentId) => {
      try {
        const response = await apiClient.saveContent(contentId);
        if (response.success) {
          toast({
            title: "Content saved! 📌",
            description: "Added to your favorites",
          });
          return { success: true };
        } else {
          throw new Error(response.message || "Failed to save content");
        }
      } catch (error) {
        console.error("Save content error:", error);
        toast({
          title: "Save failed",
          description: error.message || "Failed to save content",
          variant: "destructive",
        });
        return { success: false, error: error.message };
      }
    },
    [toast]
  );

  const copyToClipboard = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied to clipboard! 📋",
          description: "Ready to paste into LinkedIn",
        });
        return true;
      } catch (error) {
        console.error("Copy error:", error);
        toast({
          title: "Copy failed",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
        return false;
      }
    },
    [toast]
  );

  return {
    isGenerating,
    generatedContent,
    quotaInfo,
    generatePost,
    generatePostCustom,
    generateComment,
    saveContent,
    copyToClipboard,
    clearGeneratedContent: () => setGeneratedContent(null),
  };
}

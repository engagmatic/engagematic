import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Loader2,
  Link as LinkIcon,
  X,
  Copy,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/services/api";

interface AnalysisResult {
  score?: number;
  profile_score?: number;
  headline_feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    rewritten_example: string;
  };
  about_feedback?: {
    score: number;
    strengths: string[];
    improvements: string[];
    structure_suggestions: string[];
  };
  top_3_priorities?: string[];
  keywords?: string[];
  recommended_skills?: string[];
}

export const ProfileAnalyzerSection = () => {
  // Component disabled temporarily
  return null;
};

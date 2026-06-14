import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free LinkedIn Profile Analyzer - AI Score & Optimization Tips | Engagematic",
  description: "Get an AI-powered score (0-100) and instant optimization feedback for your LinkedIn profile. Complete, copy-paste ready headline and summary suggestions.",
  alternates: {
    canonical: "https://www.engagematic.com/tools/profile-analyzer",
  },
}

export default function ProfileAnalyzerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

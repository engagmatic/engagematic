import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LinkedIn Profile Analyzer | Engagematic LinkedInPulse",
  description: "AI-powered LinkedIn profile optimization tool. Get instant feedback on your headline, about section, and custom AI recommendations to boost professional visibility.",
  keywords: ["LinkedIn profile analyzer", "LinkedIn optimization", "AI LinkedIn profile builder", "LinkedIn growth tool", "personal branding", "headline optimizer"],
  metadataBase: new URL("https://www.engagematic.com"),
  alternates: {
    canonical: "/tools/profile-analyzer",
  },
  openGraph: {
    title: "LinkedIn Profile Analyzer | Engagematic LinkedInPulse",
    description: "AI-powered LinkedIn profile optimization tool. Get instant feedback on your headline, about section, and custom AI recommendations.",
    url: "https://www.engagematic.com/tools/profile-analyzer",
    siteName: "Engagematic",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "LinkedIn Profile Analyzer",
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkedIn Profile Analyzer | Engagematic LinkedInPulse",
    description: "AI-powered LinkedIn profile optimization tool. Get instant feedback on your headline, about section, and custom AI recommendations.",
    images: ["/og-home.png"],
    creator: "@engagematic",
    site: "@engagematic",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only use ClerkProvider if Clerk is configured
  const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  const content = (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )

  return isClerkConfigured ? (
    <ClerkProvider>{content}</ClerkProvider>
  ) : (
    content
  )
}


import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LinkedIn Profile Analyzer | LinkedInPulse",
  description: "AI-powered LinkedIn profile optimization tool",
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


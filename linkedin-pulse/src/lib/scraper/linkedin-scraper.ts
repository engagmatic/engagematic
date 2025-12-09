/**
 * LinkedIn Profile Scraper using SerpApi
 * Free tier: 250 searches/month
 */

export interface ScrapedProfileData {
  name: string
  headline: string
  about: string
  location: string
  industry?: string
  experience: Array<{
    title?: string
    company?: string
    duration?: string
    description?: string
  }>
  education: Array<{
    school?: string
    degree?: string
    field?: string
  }>
  skills: string[]
}

export interface ScrapeResult {
  success: boolean
  data?: ScrapedProfileData
  error?: string
}

/**
 * Extract username from LinkedIn profile URL
 */
export function extractUsernameFromUrl(profileUrl: string): string | null {
  try {
    if (!profileUrl || typeof profileUrl !== 'string') {
      return null
    }

    // Clean the URL
    profileUrl = profileUrl.trim()
    
    // Add https:// if missing
    if (!profileUrl.startsWith('http://') && !profileUrl.startsWith('https://')) {
      profileUrl = 'https://' + profileUrl
    }

    const url = new URL(profileUrl)
    
    if (!url.hostname.includes("linkedin.com")) {
      return null
    }

    const pathParts = url.pathname.split("/").filter((part) => part && part.length > 0)
    
    if (pathParts.length >= 2 && pathParts[0] === "in" && pathParts[1]) {
      const username = pathParts[1].split('?')[0].split('#')[0].trim()
      if (username.length >= 2 && username.length <= 100) {
        return username
      }
    }
    
    return null
  } catch (error) {
    console.error("Error extracting username:", error)
    return null
  }
}

/**
 * Scrape LinkedIn profile using SerpApi
 */
export async function scrapeLinkedInProfile(
  profileUrl: string
): Promise<ScrapeResult> {
  try {
    // Extract username
    const username = extractUsernameFromUrl(profileUrl)
    if (!username) {
      return {
        success: false,
        error: "Invalid LinkedIn profile URL. Must include 'linkedin.com/in/username'",
      }
    }

    // Get SerpApi key
    const apiKey = process.env.SERPAPI_KEY
    if (!apiKey || apiKey.length < 10) {
      return {
        success: false,
        error: "SERPAPI_KEY not configured. Get a free key from https://serpapi.com (250 free searches/month)",
      }
    }

    // SerpApi LinkedIn profile endpoint
    const encodedUrl = encodeURIComponent(`https://www.linkedin.com/in/${username}`)
    const apiUrl = `https://serpapi.com/search.json?engine=linkedin&q=${encodedUrl}&api_key=${apiKey}`

    // Create timeout controller
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    console.log(`🔍 Fetching profile from SerpApi for: ${username}`)

    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
    } catch (fetchError) {
      clearTimeout(timeoutId)
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return {
          success: false,
          error: "Request to SerpApi timed out after 30 seconds. Please try again.",
        }
      }
      return {
        success: false,
        error: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
      }
    }

    if (!response.ok) {
      let errorMessage = `SerpApi request failed: ${response.status}`
      try {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          if (errorText) {
            errorMessage += ` - ${errorText.substring(0, 200)}`
          }
        }
      } catch (e) {
        // Error reading response
      }

      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid SerpApi key. Please check your API key at https://serpapi.com",
        }
      }

      if (response.status === 429) {
        return {
          success: false,
          error: "SerpApi rate limit exceeded. Free tier allows 250 searches/month. Please try again later.",
        }
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    let data: any
    try {
      data = await response.json()
    } catch (parseError) {
      return {
        success: false,
        error: "Invalid JSON response from SerpApi",
      }
    }

    if (data.error) {
      return {
        success: false,
        error: data.error,
      }
    }

    // Extract profile from SerpApi response
    let profile = data.profiles?.[0] || 
                  data.people_also_viewed?.[0] ||
                  data.organic_results?.find((r: any) => r.link?.includes('linkedin.com/in/')) ||
                  data.profile

    // If not found, try searching by username directly
    if (!profile) {
      console.log("🔍 Profile not found in first response, trying direct search...")
      try {
        const searchUrl = `https://serpapi.com/search.json?engine=linkedin&q=${encodeURIComponent(username)}&api_key=${apiKey}`
        const searchController = new AbortController()
        const searchTimeoutId = setTimeout(() => searchController.abort(), 30000)
        
        const searchResponse = await fetch(searchUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
          },
          signal: searchController.signal,
        })
        
        clearTimeout(searchTimeoutId)
        
        if (searchResponse.ok) {
          const searchData = await searchResponse.json()
          if (!searchData.error) {
            profile = searchData.profiles?.[0] || 
                      searchData.organic_results?.find((r: any) => r.link?.includes('linkedin.com/in/'))
          }
        }
      } catch (searchError) {
        console.warn("Direct search also failed:", searchError)
      }
    }

    if (!profile) {
      return {
        success: false,
        error: `Profile "${username}" not found. Please verify the LinkedIn profile URL is correct and the profile is public.`,
      }
    }

    // Format profile data
    const scrapedData: ScrapedProfileData = {
      name: profile.name || profile.title || "",
      headline: profile.headline || profile.snippet || profile.description || profile.subtitle || "",
      about: profile.about || profile.summary || profile.description || "",
      location: profile.location || "",
      industry: profile.industry || "",
      experience: profile.experience || profile.positions || profile.work_experience || [],
      education: profile.education || profile.schools || [],
      skills: profile.skills || [],
    }

    console.log("✅ Profile data scraped successfully:", {
      name: scrapedData.name,
      hasHeadline: !!scrapedData.headline,
      hasAbout: !!scrapedData.about,
    })

    return {
      success: true,
      data: scrapedData,
    }
  } catch (error) {
    console.error("❌ LinkedIn scraping error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred while scraping profile",
    }
  }
}


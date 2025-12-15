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

    // SerpApi Google search for LinkedIn profile (LinkedIn engine not supported)
    // Try multiple search query formats for better results
    const searchQueries = [
      `"${username}" linkedin`,  // Quoted username - most specific
      `linkedin.com/in/${username}`,  // Direct URL format
      `site:linkedin.com/in/${username}`,  // Site-specific search
      `${username} linkedin profile`,  // General search
    ]
    
    // Try first query
    let encodedQuery = encodeURIComponent(searchQueries[0])
    let apiUrl = `https://serpapi.com/search.json?engine=google&q=${encodedQuery}&api_key=${apiKey}`

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

    // If first query failed with "no results", try alternative queries
    if (data.error && data.error.includes("hasn't returned any results")) {
      console.log(`⚠️ First search query returned no results, trying alternative queries...`)
      
      let foundResults = false
      for (let i = 1; i < searchQueries.length; i++) {
        try {
          encodedQuery = encodeURIComponent(searchQueries[i])
          apiUrl = `https://serpapi.com/search.json?engine=google&q=${encodedQuery}&api_key=${apiKey}`
          
          console.log(`🔍 Trying alternative search query ${i + 1}: ${searchQueries[i]}`)
          
          const altController = new AbortController()
          const altTimeoutId = setTimeout(() => altController.abort(), 20000)
          
          const altResponse = await fetch(apiUrl, {
            method: "GET",
            headers: { "Accept": "application/json" },
            signal: altController.signal,
          })
          
          clearTimeout(altTimeoutId)
          
          if (altResponse.ok) {
            const altData = await altResponse.json()
            if (!altData.error) {
              data = altData
              foundResults = true
              console.log(`✅ Found results with alternative query ${i + 1}`)
              break
            } else if (!altData.error.includes("hasn't returned any results")) {
              // Different error, might be rate limit or other issue
              data = altData
              break
            }
          }
        } catch (altError) {
          console.warn(`Alternative query ${i + 1} failed:`, altError)
          continue
        }
      }
      
      // If all queries failed with "no results"
      if (!foundResults && data.error && data.error.includes("hasn't returned any results")) {
        return {
          success: false,
          error: `LinkedIn profile "${username}" not found in Google search. The profile may be private, not indexed by Google, or the username may be incorrect. Please verify the LinkedIn profile URL is correct and the profile is public. You can also try entering your profile information manually.`,
        }
      }
    }
    
    // Handle other errors
    if (data.error && !data.error.includes("hasn't returned any results")) {
      return {
        success: false,
        error: data.error,
      }
    }

    // Extract profile from Google search results
    // Google search returns results in organic_results array
    let profile = data.organic_results?.find((r: any) => 
      r.link?.includes(`linkedin.com/in/${username}`) || 
      r.link?.includes('linkedin.com/in/')
    ) || 
    data.profiles?.[0] || 
    data.profile ||
    data.people_also_viewed?.[0]

    // If not found, try searching by username directly with multiple strategies
    if (!profile) {
      console.log("🔍 Profile not found in first response, trying alternative search strategies...")
      
      const searchStrategies = [
        // Strategy 1: Google search with quoted username
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`"${username}" linkedin`)}&api_key=${apiKey}`,
        // Strategy 2: Google search with site-specific query (alternative format)
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`linkedin.com/in/${username}`)}&api_key=${apiKey}`,
        // Strategy 3: Google search with full URL
        `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(`https://www.linkedin.com/in/${username}`)}&api_key=${apiKey}`,
      ]

      for (const searchUrl of searchStrategies) {
        try {
          const searchController = new AbortController()
          const searchTimeoutId = setTimeout(() => searchController.abort(), 20000)
          
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
              profile = searchData.organic_results?.find((r: any) => 
                r.link?.includes(`linkedin.com/in/${username}`) || 
                r.link?.includes('linkedin.com/in/')
              ) ||
              searchData.profiles?.[0] || 
              searchData.profile
              
              if (profile) {
                console.log("✅ Profile found using alternative search strategy")
                break
              }
            }
          }
        } catch (searchError) {
          console.warn("Search strategy failed, trying next...", searchError)
          continue
        }
      }
    }

    if (!profile) {
      return {
        success: false,
        error: `Profile "${username}" not found. Please verify the LinkedIn profile URL is correct and the profile is public.`,
      }
    }

    // Format profile data - handle Google search results format
    // Google search results have: title, snippet, link
    // Try to extract name from title (e.g., "John Doe | LinkedIn" or "John Doe - Software Engineer | LinkedIn")
    let profileName = ""
    if (profile.title) {
      // Extract name from title (remove "| LinkedIn" and job title parts)
      profileName = profile.title
        .replace(/\s*\|\s*LinkedIn.*$/i, '')
        .replace(/\s*-\s*[^|]+$/, '')
        .trim()
    }
    
    const scrapedData: ScrapedProfileData = {
      name: profileName || profile.name || profile.title || profile.full_name || "",
      headline: profile.headline || profile.snippet || profile.description || profile.subtitle || profile.job_title || profile.title?.split('|')[1]?.trim() || "",
      about: profile.about || profile.summary || profile.description || profile.bio || profile.snippet || "",
      location: profile.location || profile.geo || "",
      industry: profile.industry || "",
      experience: Array.isArray(profile.experience) ? profile.experience : 
                  Array.isArray(profile.positions) ? profile.positions :
                  Array.isArray(profile.work_experience) ? profile.work_experience :
                  profile.experience ? [profile.experience] : [],
      education: Array.isArray(profile.education) ? profile.education :
                Array.isArray(profile.schools) ? profile.schools :
                profile.education ? [profile.education] : [],
      skills: Array.isArray(profile.skills) ? profile.skills :
              profile.skills ? [profile.skills] : [],
    }
    
    // Ensure arrays are properly formatted
    if (!Array.isArray(scrapedData.experience)) {
      scrapedData.experience = []
    }
    if (!Array.isArray(scrapedData.education)) {
      scrapedData.education = []
    }
    if (!Array.isArray(scrapedData.skills)) {
      scrapedData.skills = []
    }

    console.log("✅ Profile data analyzed successfully:", {
      name: scrapedData.name,
      hasHeadline: !!scrapedData.headline,
      hasAbout: !!scrapedData.about,
    })

    return {
      success: true,
      data: scrapedData,
    }
  } catch (error) {
    console.error("❌ LinkedIn profile analysis error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred while analyzing profile",
    }
  }
}


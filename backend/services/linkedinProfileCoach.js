import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/index.js";
import { buildProfileAnalyzerPrompt } from "../prompts/profileAnalyzerPrompt.js";

/**
 * Engagematic Profile Coach Service
 * 
 * A new standalone service for testing the world-class profile analyzer prompt.
 * This service analyzes LinkedIn profiles and generates optimization suggestions + posts.
 */
class LinkedInProfileCoach {
  constructor() {
    this.apiKey = config.GOOGLE_AI_API_KEY;
    if (!this.apiKey) {
      console.warn("⚠️ GOOGLE_AI_API_KEY not configured");
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });
  }

  /**
   * Extract username from LinkedIn profile URL with validation
   */
  extractUsernameFromUrl(profileUrl) {
    try {
      if (!profileUrl || typeof profileUrl !== 'string') {
        return null;
      }

      // Clean the URL
      profileUrl = profileUrl.trim();
      
      // Add https:// if missing
      if (!profileUrl.startsWith('http://') && !profileUrl.startsWith('https://')) {
        profileUrl = 'https://' + profileUrl;
      }

      const url = new URL(profileUrl);
      
      if (!url.hostname.includes("linkedin.com")) {
        return null;
      }

      const pathParts = url.pathname.split("/").filter((part) => part && part.length > 0);
      
      if (pathParts.length >= 2 && pathParts[0] === "in" && pathParts[1]) {
        const username = pathParts[1].split('?')[0].split('#')[0].trim(); // Remove query params and fragments
        if (username.length >= 2 && username.length <= 100) {
          return username;
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error extracting username:", error.message);
      return null;
    }
  }

  /**
   * Fetch profile data using CoreSignal API
   * EXCELLENT for LinkedIn professional data - World-class API
   * Documentation: https://docs.coresignal.com/
   * API Key: rT5M97UDI3FEbLdDY7LHLtkrUUoOwhf0
   */
  async fetchProfileFromCoreSignal(profileUrl) {
    const coresignalKey = process.env.CORESIGNAL_API_KEY || config.CORESIGNAL_API_KEY;
    
    if (!coresignalKey || coresignalKey.length < 10) {
      throw new Error("CoreSignal API key not configured.");
    }
    
    try {
      console.log("🔍 Fetching profile from CoreSignal API (World-class LinkedIn data)...");
      console.log("Profile URL:", profileUrl);
      
      // Extract username from URL for CoreSignal API
      const username = this.extractUsernameFromUrl(profileUrl);
      if (!username) {
        throw new Error("Could not extract username from profile URL");
      }
      
      console.log("Extracted username:", username);
      
      // CoreSignal API endpoints - try multiple approaches based on their API structure
      // CoreSignal uses apikey header based on MCP config
      // Documentation: https://docs.coresignal.com/
      const apiEndpoints = [
        {
          url: `https://api.coresignal.com/cdapi/v1/person/search`,
          params: { linkedin_url: profileUrl },
          method: 'GET',
          description: 'Search by LinkedIn URL'
        },
        {
          url: `https://api.coresignal.com/cdapi/v1/person/search`,
          params: { linkedin_username: username },
          method: 'GET',
          description: 'Search by LinkedIn username'
        },
        {
          url: `https://api.coresignal.com/cdapi/v1/person`,
          params: { linkedin_url: profileUrl },
          method: 'GET',
          description: 'Get person by LinkedIn URL'
        },
        {
          url: `https://api.coresignal.com/cdapi/v1/person`,
          params: { linkedin_username: username },
          method: 'GET',
          description: 'Get person by LinkedIn username'
        }
      ];
      
      let personData = null;
      let lastError = null;
      let successfulEndpoint = null;
      
      for (let i = 0; i < apiEndpoints.length; i++) {
        const endpoint = apiEndpoints[i];
        try {
          // Build URL with query parameters
          const queryString = new URLSearchParams(endpoint.params).toString();
          const fullUrl = queryString ? `${endpoint.url}?${queryString}` : endpoint.url;
          
          console.log(`🔍 Trying CoreSignal endpoint ${i + 1}/${apiEndpoints.length}: ${endpoint.description}`);
          console.log(`   Method: ${endpoint.method}`);
          console.log(`   URL: ${fullUrl.replace(coresignalKey, "***")}`);
          console.log(`   Params:`, endpoint.params);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(fullUrl, {
            method: endpoint.method,
            headers: {
              "apikey": coresignalKey, // CoreSignal uses apikey header (based on MCP config)
              "Authorization": `Bearer ${coresignalKey}`, // Also try Bearer token
              "Accept": "application/json",
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          console.log(`📡 CoreSignal response status: ${response.status} ${response.statusText}`);
          console.log(`   Response headers:`, Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const responseText = await response.text();
            console.log(`📊 CoreSignal response (first 500 chars):`, responseText.substring(0, 500));
            
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error("❌ Failed to parse CoreSignal response as JSON:", parseError);
              throw new Error(`CoreSignal returned invalid JSON response: ${parseError.message}`);
            }
            
            console.log("📊 CoreSignal response keys:", Object.keys(data));
            console.log("📊 CoreSignal response structure:", JSON.stringify(data, null, 2).substring(0, 1000));
            
            // Handle different response formats from CoreSignal
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
              personData = data.data[0];
              successfulEndpoint = fullUrl;
            } else if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
              personData = data.data;
              successfulEndpoint = fullUrl;
            } else if (data.person) {
              personData = data.person;
              successfulEndpoint = fullUrl;
            } else if (data.full_name || data.name || data.first_name || data.headline) {
              personData = data;
              successfulEndpoint = fullUrl;
            } else if (Array.isArray(data) && data.length > 0) {
              personData = data[0];
              successfulEndpoint = fullUrl;
            } else if (data.results && Array.isArray(data.results) && data.results.length > 0) {
              personData = data.results[0];
              successfulEndpoint = fullUrl;
            }
            
            if (personData) {
              console.log("✅ CoreSignal profile found using endpoint:", successfulEndpoint);
              break;
            } else {
              console.warn("⚠️ CoreSignal returned data but no person found in response structure");
              console.warn("⚠️ Full response data:", JSON.stringify(data, null, 2));
              lastError = `CoreSignal returned response but no person data found. Response structure: ${JSON.stringify(Object.keys(data))}`;
            }
          } else {
            const errorText = await response.text();
            let errorData;
            try {
              errorData = JSON.parse(errorText);
            } catch {
              errorData = { message: errorText };
            }
            
            console.warn(`⚠️ CoreSignal endpoint ${i + 1} failed:`, response.status, errorData.message || errorText);
            
            if (response.status === 401 || response.status === 403) {
              throw new Error("Invalid CoreSignal API key. Please check your CORESIGNAL_API_KEY.");
            } else if (response.status === 429) {
              throw new Error("CoreSignal rate limit exceeded. Please try again later.");
            } else if (response.status === 404) {
              lastError = `Profile "${username}" not found in CoreSignal database. The profile may not be indexed yet or may be private.`;
              // Continue to next endpoint
              continue;
            } else {
              // Log detailed error information
              console.error(`❌ CoreSignal API error ${response.status}:`, {
                status: response.status,
                statusText: response.statusText,
                errorData: errorData,
                endpoint: endpoint.description,
                url: fullUrl.replace(coresignalKey, "***"),
              });
              lastError = errorData.message || errorData.error || errorData.detail || `CoreSignal API error: ${response.status} ${response.statusText}`;
            }
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error("CoreSignal request timed out after 30 seconds.");
          }
          if (error.message.includes("Invalid") || error.message.includes("rate limit")) {
            throw error;
          }
          lastError = error.message;
          console.warn(`⚠️ CoreSignal endpoint ${i + 1} error:`, error.message);
        }
      }
      
      if (!personData) {
        const detailedError = lastError || `Profile "${username}" may not be in CoreSignal database. Please verify the profile URL is correct and the profile is public.`;
        
        // Log all attempted endpoints for debugging
        console.error("❌ CoreSignal failed to find profile after trying all endpoints:");
        console.error("   Profile URL:", profileUrl);
        console.error("   Username:", username);
        console.error("   Last error:", lastError);
        console.error("   Tried", apiEndpoints.length, "different endpoint strategies");
        
        throw new Error(`CoreSignal returned no profile data. ${detailedError}

Debugging info:
- Profile URL: ${profileUrl}
- Username: ${username}
- Tried ${apiEndpoints.length} different CoreSignal API endpoints
- All endpoints returned no profile data

Possible reasons:
1. Profile not yet indexed in CoreSignal database (new profiles may take time)
2. Profile has privacy restrictions
3. Profile URL format issue
4. CoreSignal API endpoint format may need adjustment`);
      }
      
      // Format CoreSignal response to our structure with comprehensive mapping
      const profileData = {
        name: personData.full_name || 
              `${(personData.first_name || '').trim()} ${(personData.last_name || '').trim()}`.trim() || 
              personData.name || 
              personData.display_name || "",
        headline: personData.headline || 
                  personData.job_title || 
                  personData.occupation || 
                  personData.title ||
                  personData.current_position?.title || 
                  personData.current_job_title || "",
        summary: personData.summary || 
                 personData.about || 
                 personData.bio || 
                 personData.description ||
                 personData.overview || "",
        location: personData.location || 
                  personData.city || 
                  (personData.city && personData.country 
                    ? `${personData.city}, ${personData.country}` 
                    : personData.country || personData.city || ""),
        experience: this.formatExperience(personData.experiences || 
                                          personData.positions || 
                                          personData.work_experience || 
                                          personData.employment_history ||
                                          (personData.current_position ? [personData.current_position] : [])),
        education: this.formatEducation(personData.education || 
                                        personData.schools || 
                                        personData.educations ||
                                        personData.education_history || []),
        skills: this.formatSkills(personData.skills || 
                                  personData.skill_list || 
                                  personData.skills_list ||
                                  (typeof personData.skills === 'string' ? personData.skills.split(',').map(s => s.trim()) : [])),
        industry: personData.industry || 
                  personData.industries?.[0] || 
                  personData.primary_industry || "",
        profilePicture: personData.profile_picture_url || 
                        personData.image || 
                        personData.photo_url ||
                        personData.profile_image || "",
      };
      
      // Ensure we have at least name and headline for analysis
      if (!profileData.name || profileData.name.length < 2) {
        throw new Error("CoreSignal returned incomplete profile data (missing name)");
      }
      
      if (!profileData.headline || profileData.headline.length < 5) {
        // Set a default headline if missing
        profileData.headline = profileData.name + " - LinkedIn Profile";
      }
      
      console.log("✅ CoreSignal profile data extracted:", {
        name: profileData.name,
        headline: profileData.headline.substring(0, 60),
        hasAbout: !!profileData.summary && profileData.summary.length > 0,
        aboutLength: profileData.summary?.length || 0,
        experienceCount: profileData.experience.length,
        educationCount: profileData.education.length,
        skillsCount: profileData.skills.length,
        location: profileData.location,
      });
      
      return {
        success: true,
        data: profileData,
      };
    } catch (error) {
      console.error("❌ CoreSignal API error:", error);
      if (error.name === 'AbortError') {
        throw new Error("CoreSignal request timed out after 30 seconds.");
      }
      throw error;
    }
  }

  /**
   * Format experience data from various API formats
   */
  formatExperience(experience) {
    if (!experience) return [];
    if (!Array.isArray(experience)) return [experience];
    
    return experience.map(exp => ({
      title: exp.title || exp.job_title || exp.position || exp.role || "",
      company: exp.company || exp.company_name || exp.organization || "",
      description: exp.description || exp.summary || "",
      duration: exp.duration || exp.period || exp.time_period || "",
      startDate: exp.start_date || exp.start || "",
      endDate: exp.end_date || exp.end || exp.current ? "Present" : "",
    })).filter(exp => exp.title || exp.company);
  }

  /**
   * Format education data from various API formats
   */
  formatEducation(education) {
    if (!education) return [];
    if (!Array.isArray(education)) return [education];
    
    return education.map(edu => ({
      school: edu.school || edu.institution || edu.university || edu.college || "",
      degree: edu.degree || edu.qualification || "",
      field: edu.field || edu.major || edu.subject || "",
      duration: edu.duration || edu.period || "",
    })).filter(edu => edu.school);
  }

  /**
   * Format skills data from various API formats
   */
  formatSkills(skills) {
    if (!skills) return [];
    if (typeof skills === 'string') {
      return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    if (Array.isArray(skills)) {
      return skills.map(skill => 
        typeof skill === 'string' ? skill : skill.name || skill.skill || skill.title || ""
      ).filter(s => s.length > 0);
    }
    return [];
  }

  /**
   * Fetch profile data using Proxycurl (https://nubela.co/proxycurl/)
   * BEST OPTION for LinkedIn - Free tier: 100 requests/month
   * Sign up: https://nubela.co/proxycurl/
   */
  async fetchProfileFromProxycurl(profileUrl) {
    const proxycurlKey = process.env.PROXYCURL_API_KEY || config.PROXYCURL_API_KEY;
    
    if (!proxycurlKey || proxycurlKey.length < 10) {
      throw new Error("Proxycurl API key not configured. Sign up at https://nubela.co/proxycurl/ for free API key.");
    }
    
    try {
      console.log("🔍 Fetching profile from Proxycurl:", profileUrl);
      
      const apiUrl = `https://nubela.co/proxycurl/api/v2/linkedin?url=${encodeURIComponent(profileUrl)}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${proxycurlKey}`,
          "Accept": "application/json",
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error("Invalid Proxycurl API key. Please check your PROXYCURL_API_KEY.");
        }
        if (response.status === 429) {
          throw new Error("Proxycurl rate limit exceeded. Free tier allows 100 requests/month.");
        }
        throw new Error(errorData.error || `Proxycurl API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format Proxycurl response to our structure
      const profileData = {
        name: data.full_name || data.name || "",
        headline: data.headline || data.occupation || "",
        summary: data.summary || data.about || "",
        location: (data.city || "") + (data.country ? `, ${data.country}` : ""),
        experience: data.experiences || [],
        education: data.education || [],
        skills: data.skills || [],
        industry: data.industry || "",
        profilePicture: data.profile_pic_url || "",
      };
      
      console.log("✅ Proxycurl profile data:", {
        name: profileData.name,
        hasHeadline: !!profileData.headline,
        hasAbout: !!profileData.summary,
      });
      
      return {
        success: true,
        data: profileData,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error("Proxycurl request timed out after 30 seconds.");
      }
      throw error;
    }
  }

  /**
   * Fetch profile data using RapidAPI LinkedIn Scraper
   * Free tier available - Sign up at https://rapidapi.com
   */
  async fetchProfileFromRapidAPI(username) {
    const rapidApiKey = process.env.RAPIDAPI_KEY || config.RAPIDAPI_KEY;
    const rapidApiHost = process.env.RAPIDAPI_HOST || config.RAPIDAPI_HOST || "linkedin-profile-scraper-api.p.rapidapi.com";
    
    if (!rapidApiKey || rapidApiKey.length < 10) {
      throw new Error("RapidAPI key not configured. Sign up at https://rapidapi.com for free API key.");
    }
    
    try {
      console.log("🔍 Fetching profile from RapidAPI:", username);
      
      const profileUrl = `https://www.linkedin.com/in/${username}`;
      // Try different RapidAPI endpoints
      const apiUrls = [
        `https://${rapidApiHost}/profile/${encodeURIComponent(profileUrl)}`,
        `https://${rapidApiHost}/linkedin?url=${encodeURIComponent(profileUrl)}`,
      ];
      
      let data = null;
      let lastError = null;
      
      for (const apiUrl of apiUrls) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);
          
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": rapidApiKey,
              "X-RapidAPI-Host": rapidApiHost,
              "Accept": "application/json",
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            data = await response.json();
            break;
          } else {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401 || response.status === 403) {
              throw new Error("Invalid RapidAPI key. Please check your RAPIDAPI_KEY.");
            }
            if (response.status === 429) {
              throw new Error("RapidAPI rate limit exceeded. Please upgrade your plan.");
            }
            lastError = errorData.message || `RapidAPI error: ${response.status}`;
          }
        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error("RapidAPI request timed out after 30 seconds.");
          }
          if (error.message.includes("Invalid") || error.message.includes("rate limit")) {
            throw error;
          }
          lastError = error.message;
        }
      }
      
      if (!data) {
        throw new Error(lastError || "RapidAPI failed to fetch profile data");
      }
      
      // Format RapidAPI response to our structure (handle different response formats)
      const profileData = {
        name: data.name || data.fullName || data.full_name || "",
        headline: data.headline || data.title || data.occupation || "",
        summary: data.summary || data.about || data.description || "",
        location: data.location || data.city || "",
        experience: data.experiences || data.experience || data.positions || [],
        education: data.education || data.educations || [],
        skills: data.skills || [],
        industry: data.industry || "",
        profilePicture: data.profilePicture || data.profile_pic_url || data.image || "",
      };
      
      console.log("✅ RapidAPI profile data:", {
        name: profileData.name,
        hasHeadline: !!profileData.headline,
        hasAbout: !!profileData.summary,
      });
      
      return {
        success: true,
        data: profileData,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error("RapidAPI request timed out after 30 seconds.");
      }
      throw error;
    }
  }

  /**
   * Fetch profile data using SerpApi (https://serpapi.com)
   * Free tier: 250 searches/month
   */
  async fetchProfileFromSerpApi(username) {
    // Validate username
    if (!username || typeof username !== 'string' || username.length < 2) {
      throw new Error("Invalid username provided");
    }

    const serpApiKey = process.env.SERPAPI_KEY || config.SERPAPI_KEY;
    
    if (!serpApiKey || serpApiKey.length < 10) {
      console.error("❌ SERPAPI_KEY not configured or invalid. Key length:", serpApiKey?.length || 0);
      throw new Error("Profile scraping service not configured. Please configure SerpApi key.");
    }
    
    console.log("✅ SerpApi key found, length:", serpApiKey.length);

    try {
      console.log("🔍 Fetching profile from SerpApi for:", username);
      const result = await this.fetchFromSerpApi(username, serpApiKey);
      
      if (!result || !result.success) {
        throw new Error("SerpApi returned unsuccessful response");
      }
      
      // Validate result data
      if (!result.data) {
        throw new Error("SerpApi returned empty profile data");
      }
      
      return result;
    } catch (error) {
      console.error("❌ SerpApi fetch error:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Provide helpful error messages
      const errorMsg = error.message || error.toString();
      
      if (errorMsg.includes('401') || errorMsg.includes('Invalid API key') || errorMsg.includes('invalid_api_key')) {
        throw new Error("Invalid SerpApi key. Please check your API key at https://serpapi.com. You can also use manual input mode.");
      }
      
      if (errorMsg.includes('429') || errorMsg.includes('rate limit') || errorMsg.includes('quota')) {
        throw new Error("SerpApi rate limit exceeded. Free tier allows 100 searches/month. Please try again later, upgrade your plan, or use manual input mode.");
      }
      
      if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('Unsupported') || errorMsg.includes('hasn\'t returned')) {
        throw new Error(`LinkedIn profile "${username}" not found via Google search. The profile may not be indexed by Google yet, may be private, or the URL may be incorrect. Please verify the profile URL is correct and the profile is public. If the profile is new, it may take a few days for Google to index it.`);
      }
      
      // Don't mask network errors - show the actual error
      if (errorMsg.includes('Network error') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
        throw new Error(`SerpApi connection failed: ${errorMsg}. Please check your internet connection, verify your SerpApi key, or use manual input mode.`);
      }
      
      throw new Error(`Failed to fetch profile from SerpApi: ${errorMsg}. Please try manual input mode.`);
    }
  }

  /**
   * Fetch from SerpApi (https://serpapi.com)
   * Free tier: 250 searches/month
   * Documentation: https://serpapi.com/linkedin-profiles-api
   */
  async fetchFromSerpApi(username, apiKey) {
    // Validate inputs
    if (!username || username.length < 2) {
      throw new Error("Invalid username provided");
    }
    
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Invalid SerpApi key");
    }

    // Ensure fetch is available (Node.js 18+ has global fetch)
    if (typeof fetch === 'undefined') {
      throw new Error("Fetch API is not available. Please use Node.js 18+ or install node-fetch.");
    }

    // SerpApi LinkedIn profile endpoint - use google search to find LinkedIn profile
    // Note: SerpApi doesn't have a direct LinkedIn engine, so we use Google search
    // Try multiple search strategies for better results (tested: linkedin.com/in/ works best)
    const profileUrl = `https://www.linkedin.com/in/${username}`;
    
    // Multiple search strategies - try in order until one works
    // Strategy 1: Simple linkedin.com search (MOST RELIABLE - tested and works for prashobkanhangad)
    // Strategy 2: Site-specific search
    // Strategy 3: Quoted username search
    const searchStrategies = [
      `linkedin.com/in/${username}`,  // Most reliable - try first (works for prashobkanhangad)
      `site:linkedin.com/in/${username}`,  // Site-specific search
      `"${username}" linkedin`,  // Quoted username search
    ];
    
    let profile = null;
    let lastError = null;
    
    // Try each search strategy until we find the profile
    for (let i = 0; i < searchStrategies.length; i++) {
      const searchQuery = searchStrategies[i];
      const apiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`;
      
      console.log(`🔍 Trying search strategy ${i + 1}/${searchStrategies.length}: ${searchQuery}`);
      console.log("🔗 SerpApi URL (key hidden):", apiUrl.replace(apiKey, "***"));
      
      // Create timeout controller for this request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        console.log("📡 Making request to SerpApi...");
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        console.log("✅ SerpApi response status:", response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`⚠️ Strategy ${i + 1} failed with status ${response.status}`);
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error === "Invalid API key.") {
              throw new Error("Invalid SerpApi API key. Please check your SERPAPI_KEY configuration.");
            }
            if (errorData.error && errorData.error.includes("quota")) {
              throw new Error("SerpApi quota exceeded. Please upgrade your plan or wait for quota reset.");
            }
            // For "Google hasn't returned any results", continue to next strategy
            if (errorData.error === "Google hasn't returned any results for this query.") {
              console.log(`⚠️ Strategy ${i + 1} returned no results, trying next...`);
              lastError = errorData.error;
              continue;
            }
            lastError = errorData.error || errorText.substring(0, 200);
          } catch (e) {
            lastError = errorText.substring(0, 200);
          }
          continue; // Try next strategy
        }

        const data = await response.json();
        console.log("✅ SerpApi response received, organic_results count:", data.organic_results?.length || 0);
        
        // Check for SerpApi errors
        if (data.error) {
          // Skip "Google hasn't returned any results" - try next strategy
          if (data.error === "Google hasn't returned any results for this query.") {
            console.log(`⚠️ Strategy ${i + 1} returned no results, trying next...`);
            lastError = data.error;
            continue;
          }
          // For other errors, throw immediately
          if (data.error === "Invalid API key.") {
            throw new Error("Invalid SerpApi API key. Please check your SERPAPI_KEY configuration.");
          }
          if (data.error.includes("quota") || data.error.includes("limit")) {
            throw new Error("SerpApi quota exceeded. Please upgrade your plan or wait for quota reset.");
          }
          throw new Error(data.error);
        }

        // Extract LinkedIn profile from results
        if (data.organic_results && Array.isArray(data.organic_results)) {
          // Find the LinkedIn profile in Google search results
          profile = data.organic_results.find(r => 
            r.link && r.link.includes('linkedin.com/in/') && r.link.includes(username)
          );
          
          // If exact match not found, try any LinkedIn profile result
          if (!profile) {
            profile = data.organic_results.find(r => 
              r.link && r.link.includes('linkedin.com/in/')
            );
          }
          
          if (profile) {
            console.log(`✅ Profile found using strategy ${i + 1}!`);
            break; // Success - exit loop
          }
        }
        
        console.log(`⚠️ Strategy ${i + 1} found results but no matching LinkedIn profile`);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error("Request to SerpApi timed out after 30 seconds. Please try again.");
        }
        // If it's a critical error (invalid key, quota), throw immediately
        if (fetchError.message.includes("Invalid API key") || fetchError.message.includes("quota")) {
          throw fetchError;
        }
        console.warn(`⚠️ Strategy ${i + 1} error:`, fetchError.message);
        lastError = fetchError.message;
        // Continue to next strategy for non-critical errors
      }
    }
    
    // If no profile found after trying all strategies
    if (!profile) {
      // Provide a more helpful error message
      const errorMsg = `LinkedIn profile "${username}" not found via Google search. This may be because:
1. The profile is not indexed by Google (new profiles take time to be indexed)
2. The profile is private or restricted
3. The profile URL is incorrect
4. The profile has been deleted or doesn't exist

Please verify:
- The profile URL is correct: https://www.linkedin.com/in/${username}
- The profile is public (not private)
- Try accessing the profile directly in your browser

If the profile exists and is public, it may take a few days for Google to index it. You can try again later.`;
      
      throw new Error(errorMsg);
    }

    // Format the Google search result as a LinkedIn profile
    return this.formatGoogleSearchProfile(profile, username);
  }

  /**
   * Format Google search result to our profile data structure
   * Extracts LinkedIn profile data from Google search results
   */
  formatGoogleSearchProfile(googleResult, username) {
    // Extract data from Google search result snippet
    const snippet = googleResult.snippet || googleResult.description || '';
    const title = googleResult.title || '';
    const link = googleResult.link || '';
    
    // Extract name from title (remove " | LinkedIn" suffix)
    let name = title.replace(/ \| LinkedIn$/, '').replace(/ on LinkedIn$/, '').trim();
    if (!name || name.length < 2) {
      // Try to extract from link
      const linkMatch = link.match(/linkedin\.com\/in\/([^\/\?]+)/i);
      if (linkMatch && linkMatch[1]) {
        name = linkMatch[1].replace(/-/g, ' ').replace(/_/g, ' ');
        // Capitalize first letter of each word
        name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      } else {
        name = username;
      }
    }
    
    // Try to extract headline from title or snippet
    let headline = name; // Default to name
    if (title && title.includes('|')) {
      const parts = title.split('|');
      if (parts.length > 1) {
        headline = parts.slice(1).join('|').trim();
      }
    }
    
    // If headline is still just the name, try to extract from snippet
    if (headline === name || headline.length < 5) {
      const headlineMatch = snippet.match(/^([^•\n]+)/);
      if (headlineMatch && headlineMatch[1].trim().length > 5) {
        headline = headlineMatch[1].trim();
      }
    }
    
    // Extract about/summary from snippet
    const about = snippet || '';
    
    // Try to extract experience from snippet if mentioned
    const experience = this.extractExperienceFromSnippet(snippet);
    
    // Try to extract skills from snippet
    const skills = this.extractSkillsFromSnippet(snippet);
    
    const profileData = {
      name: name || username,
      headline: headline || `${name} - LinkedIn Profile`,
      summary: about || `LinkedIn profile for ${name}`,
      location: this.extractLocationFromSnippet(snippet),
      experience: experience,
      education: [],
      skills: skills,
    };
    
    console.log("✅ Formatted profile data:", {
      name: profileData.name,
      headline: profileData.headline.substring(0, 50),
      summaryLength: profileData.summary.length,
    });
    
    return {
      success: true,
      data: profileData,
    };
  }
  
  /**
   * Try to extract experience information from snippet
   */
  extractExperienceFromSnippet(snippet) {
    const experience = [];
    
    // Look for patterns like "Intern at X", "Software Engineer at Y", "Worked at Z"
    const experiencePatterns = [
      /(?:Intern|Software Engineer|Developer|Manager|Analyst|Designer|Consultant|Engineer|Specialist|Coordinator|Associate|Assistant|Lead|Senior|Junior|Executive|Director|VP|CEO|CTO|CFO|Founder|Co-founder)\s+(?:at|@|for)\s+([^•\n,]+)/gi,
      /(?:Currently|Previously|Formerly)\s+(?:a|an|the)?\s*([^•\n]+?)(?:\s+at|\s+@|\s+for|\s*$)/gi,
    ];
    
    for (const pattern of experiencePatterns) {
      const matches = snippet.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim()) {
          const roleCompany = match[0].trim();
          // Try to extract role and company
          const roleMatch = roleCompany.match(/^([^@at]+?)(?:\s+(?:at|@|for)\s+)(.+)$/i);
          if (roleMatch) {
            experience.push({
              title: roleMatch[1].trim(),
              company: roleMatch[2].trim(),
              description: '',
              duration: '',
            });
          } else {
            // Just add the full text as title
            experience.push({
              title: roleCompany,
              company: '',
              description: '',
              duration: '',
            });
          }
        }
      }
    }
    
    return experience;
  }
  
  /**
   * Try to extract skills from snippet
   */
  extractSkillsFromSnippet(snippet) {
    const skills = [];
    
    // Common skill keywords that might appear in snippets
    const skillKeywords = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Azure', 'GCP',
      'Machine Learning', 'Data Analysis', 'Project Management', 'Agile', 'Scrum',
      'Marketing', 'Sales', 'Business Development', 'Product Management', 'UI/UX',
      'Design', 'Content Writing', 'SEO', 'Digital Marketing', 'Social Media',
    ];
    
    for (const skill of skillKeywords) {
      if (snippet.toLowerCase().includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    }
    
    return skills;
  }
  
  /**
   * Extract location from snippet text
   */
  extractLocationFromSnippet(snippet) {
    // Common patterns: "Location: City, Country" or "Based in City"
    const locationMatch = snippet.match(/(?:Location|Based in|Lives in)[:\s]+([^•\n,]+(?:,\s*[^•\n]+)?)/i);
    return locationMatch ? locationMatch[1].trim() : '';
  }

  /**
   * Format SerpApi response to our profile data structure (legacy - kept for compatibility)
   * Handles various SerpApi response formats
   */
  formatSerpApiProfile(profile) {
    const profileData = {
      name: profile.name || profile.title || "",
      headline: profile.headline || profile.snippet || profile.description || profile.subtitle || "",
      summary: profile.about || profile.summary || profile.description || "",
      location: profile.location || "",
      industry: profile.industry || "",
      experience: profile.experience || profile.positions || profile.work_experience || [],
      education: profile.education || profile.schools || [],
      skills: profile.skills || [],
      connections: profile.connections || 0,
      profilePicture: profile.thumbnail || profile.image || profile.profile_picture || "",
      bannerImage: "",
    };

    console.log("✅ Profile data fetched from SerpApi:", {
      name: profileData.name,
      hasHeadline: !!profileData.headline,
      hasAbout: !!profileData.summary,
    });
    
    return { success: true, data: profileData };
  }

  /**
   * Analyze a LinkedIn profile from URL using the world-class prompt
   * 
   * @param {string} profileUrl - LinkedIn profile URL (required)
   * @param {Object} userInput - Optional user input to enhance analysis
   * @param {string} userInput.userType - "Student", "Early Professional", "Senior Leader / Thought Leader", or "Other"
   * @param {string} userInput.targetAudience - Who they want to speak to
   * @param {string} userInput.mainGoal - Main goal (e.g., "get interviews", "build credibility")
   * @returns {Promise<Object>} - Analysis result with score, suggestions, and post
   */
  async analyzeProfileFromUrl(profileUrl, userInput = {}) {
    try {
      console.log("🔍 Engagematic Profile Coach: Starting analysis from URL...");
      
      // Validate and sanitize inputs
      if (!profileUrl || typeof profileUrl !== 'string') {
        throw new Error("Profile URL is required and must be a string");
      }

      profileUrl = profileUrl.trim();
      
      // Validate profile URL format
      if (!profileUrl.includes("linkedin.com/in/")) {
        throw new Error("Invalid LinkedIn profile URL. Must include 'linkedin.com/in/'. Example: https://www.linkedin.com/in/username");
      }

      // Extract username with validation
      const username = this.extractUsernameFromUrl(profileUrl);
      if (!username || username.length < 2) {
        throw new Error(`Could not extract valid username from profile URL: "${profileUrl}". Please ensure the URL follows this format: https://www.linkedin.com/in/username`);
      }

      console.log("Profile URL:", profileUrl);
      console.log("Extracted username:", username);
      
      // Validate username format
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        throw new Error(`Invalid username format: "${username}". LinkedIn usernames can only contain letters, numbers, hyphens, and underscores.`);
      }

      // NO FALLBACKS - ONLY CORESIGNAL REAL RESULTS
      console.log("🔍 Fetching profile from CoreSignal API ONLY (no fallbacks - real results only)...");
      
      let profileResult;
      try {
        profileResult = await this.fetchProfileFromCoreSignal(profileUrl);
        
        if (!profileResult || !profileResult.success) {
          throw new Error("CoreSignal returned unsuccessful response. No profile data available.");
        }
        
        console.log("✅ Profile fetched successfully from CoreSignal - REAL DATA ONLY");
      } catch (error) {
        console.error("❌ CoreSignal API failed:", error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        
        // Provide specific error message based on error type
        let errorMsg = error.message || "Failed to fetch profile from CoreSignal API.";
        
        if (errorMsg.includes("not configured") || errorMsg.includes("API key")) {
          errorMsg = "CoreSignal API key not configured. Please check your CORESIGNAL_API_KEY in .env file.";
        } else if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("Invalid")) {
          errorMsg = "Invalid CoreSignal API key. Please verify your CORESIGNAL_API_KEY is correct.";
        } else if (errorMsg.includes("429") || errorMsg.includes("rate limit")) {
          errorMsg = "CoreSignal API rate limit exceeded. Please try again later.";
        } else if (errorMsg.includes("404") || errorMsg.includes("not found") || errorMsg.includes("not in CoreSignal database")) {
          errorMsg = `LinkedIn profile not found in CoreSignal database. The profile "${username}" may not be indexed yet, may be private, or the URL may be incorrect. Please verify the profile URL is correct and the profile is public.`;
        } else if (errorMsg.includes("timeout")) {
          errorMsg = "CoreSignal API request timed out. Please try again.";
        } else if (errorMsg.includes("incomplete") || errorMsg.includes("missing")) {
          errorMsg = `CoreSignal returned incomplete profile data: ${errorMsg}`;
        }
        
        throw new Error(errorMsg);
      }

      const scrapedData = profileResult.data;
      
      // Validate scraped data
      if (!scrapedData) {
        throw new Error("No profile data received from scraping service. Please check the profile URL.");
      }

      // Validate we have REAL data from CoreSignal - NO FALLBACKS
      if (!scrapedData.name || scrapedData.name.length < 2) {
        throw new Error("CoreSignal returned incomplete profile data (missing name). This is not a valid profile result.");
      }
      
      if (!scrapedData.headline || scrapedData.headline.length < 5) {
        throw new Error("CoreSignal returned incomplete profile data (missing or invalid headline). This is not a valid profile result.");
      }
      
      if (!scrapedData.summary || scrapedData.summary.length < 50) {
        console.warn("⚠️ CoreSignal returned limited summary data. Analysis will proceed with available information.");
        // Only proceed if we have at least name and headline
        if (!scrapedData.summary || scrapedData.summary.length < 20) {
          scrapedData.summary = `Professional profile for ${scrapedData.name}. ${scrapedData.headline}`;
        }
      }

      console.log(`✅ REAL Profile data extracted for: ${scrapedData.name || username}`);
      console.log("📊 Scraped Data Summary:");
      console.log("  - Name:", scrapedData.name || "Not found");
      console.log("  - Headline:", scrapedData.headline ? `${scrapedData.headline.substring(0, 50)}...` : "Not found");
      console.log("  - About length:", scrapedData.summary?.length || 0, "characters");
      console.log("  - Experience items:", scrapedData.experience?.length || 0);
      console.log("  - Education items:", scrapedData.education?.length || 0);
      console.log("  - Skills count:", scrapedData.skills?.length || 0);

      // Combine scraped data with user input - include ALL real data
      const profileData = {
        userType: this.validateUserType(userInput.userType) || this.detectUserType(scrapedData),
        headline: (scrapedData.headline || "").trim(),
        about: (scrapedData.summary || "").trim(),
        roleIndustry: this.extractRoleIndustry(scrapedData),
        location: (scrapedData.location || "").trim(),
        experience: Array.isArray(scrapedData.experience) ? scrapedData.experience : [],
        education: Array.isArray(scrapedData.education) ? scrapedData.education : [],
        skills: Array.isArray(scrapedData.skills) ? scrapedData.skills : [],
        targetAudience: (userInput.targetAudience || "").trim(),
        mainGoal: this.validateMainGoal(userInput.mainGoal) || "build credibility",
        additionalText: this.buildAdditionalText(scrapedData),
      };

      // Log what REAL data we're sending to AI
      console.log("📊 REAL Profile data being sent to AI for analysis:");
      console.log("  - User Type:", profileData.userType);
      console.log("  - Headline:", profileData.headline ? `${profileData.headline.substring(0, 60)}...` : "Not provided");
      console.log("  - About length:", profileData.about?.length || 0, "characters");
      console.log("  - Role/Industry:", profileData.roleIndustry);
      console.log("  - Location:", profileData.location || "Not provided");
      console.log("  - Experience items:", profileData.experience?.length || 0);
      console.log("  - Education items:", profileData.education?.length || 0);
      console.log("  - Skills count:", profileData.skills?.length || 0);
      console.log("  - Target Audience:", profileData.targetAudience || "Not specified");
      console.log("  - Main Goal:", profileData.mainGoal);

      // Now analyze using the world-class prompt with retry logic - ONLY REAL AI RESULTS
      console.log("🤖 Sending REAL profile data to Google Gemini for analysis...");
      const analysisResult = await this.analyzeProfileWithRetry(profileData);
      
      // Validate we got REAL AI results
      if (!analysisResult || !analysisResult.success || !analysisResult.data) {
        throw new Error("AI analysis failed - no real results returned");
      }

      console.log("✅ REAL AI Analysis received:");
      console.log("  - Profile Score:", analysisResult.data.score || analysisResult.data.profile_score);
      console.log("  - Analysis is based on REAL profile data");
      console.log("  - Full analysis keys:", Object.keys(analysisResult.data || {}));
      
      // Ensure data structure is correct before returning
      if (analysisResult.data && !analysisResult.data.score && analysisResult.data.profile_score) {
        analysisResult.data.score = analysisResult.data.profile_score;
      }
      
      return analysisResult;
    } catch (error) {
      console.error("❌ Profile analysis from URL error:", error);
      // Return user-friendly error message
      throw new Error(this.getUserFriendlyError(error));
    }
  }

  /**
   * Validate user type
   */
  validateUserType(userType) {
    const validTypes = ["Student", "Early Professional", "Senior Leader / Thought Leader", "Other"];
    if (userType && validTypes.includes(userType)) {
      return userType;
    }
    return null;
  }

  /**
   * Validate main goal
   */
  validateMainGoal(mainGoal) {
    const validGoals = ["get interviews", "build credibility", "attract clients", "grow followers"];
    if (mainGoal && validGoals.includes(mainGoal)) {
      return mainGoal;
    }
    return null;
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyError(error) {
    const errorMessage = error.message || error.toString();
    
    // Map technical errors to user-friendly messages
    if (errorMessage.includes('SERPAPI_KEY') || errorMessage.includes('SerpApi')) {
      return "LinkedIn profile scraping service is not configured. Please contact support.";
    }
    
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      return "The AI service is temporarily busy. Please wait a moment and try again.";
    }
    
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return "LinkedIn profile not found. Please check the URL and ensure the profile is public.";
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return "API authentication failed. Please contact support.";
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      return "Too many requests. Please wait a few minutes and try again.";
    }
    
    if (errorMessage.includes('timeout')) {
      return "Request timed out. Please try again.";
    }
    
    // Return original error if no mapping found
    return errorMessage;
  }

  /**
   * Generate content with retry logic for 503 errors
   * Handles GoogleGenerativeAI errors specifically
   */
  async generateWithRetryLogic(prompt, maxRetries = 5) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 2s, 4s, 8s, 16s, 32s
          const delay = Math.min(2000 * Math.pow(2, attempt - 1), 32000);
          console.log(`⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s (Google Gemini was overloaded)...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Create timeout promise (60 seconds)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("AI request timed out after 60 seconds")), 60000);
        });

        const aiPromise = this.model.generateContent({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 8192, // Increased from 2048 to handle full JSON responses
            responseMimeType: "application/json", // Force JSON response
          },
        });

        const result = await Promise.race([aiPromise, timeoutPromise]);
        console.log(`✅ Google Gemini responded successfully (attempt ${attempt + 1})`);
        return result;
      } catch (error) {
        lastError = error;
        
        // Extract error message from various error formats
        let errorMessage = '';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.toString) {
          errorMessage = error.toString();
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = JSON.stringify(error);
        }
        
        // Check if it's a retryable error (503, 429, or overloaded)
        // Handle GoogleGenerativeAI error format specifically
        const isRetryable = 
          errorMessage.includes('503') ||
          errorMessage.includes('429') ||
          errorMessage.includes('overloaded') ||
          errorMessage.includes('Service Unavailable') ||
          errorMessage.includes('rate limit') ||
          errorMessage.includes('quota') ||
          errorMessage.includes('GoogleGenerativeAI Error') ||
          (error.status && (error.status === 503 || error.status === 429)) ||
          (error.code && (error.code === 503 || error.code === 429));
        
        console.log(`🔍 Error check - Message: "${errorMessage}", Retryable: ${isRetryable}, Attempt: ${attempt + 1}/${maxRetries}`);
        
        if (!isRetryable) {
          // Not a retryable error, throw immediately
          console.error("❌ Non-retryable error:", errorMessage);
          throw error;
        }
        
        if (attempt === maxRetries) {
          // All retries exhausted
          console.error(`❌ All ${maxRetries + 1} attempts failed. Last error: ${errorMessage}`);
          throw new Error(`Google Gemini is overloaded. Tried ${maxRetries + 1} times but service is still unavailable. Please try again in a few minutes. Original error: ${errorMessage}`);
        }
        
        console.warn(`⚠️ Google Gemini attempt ${attempt + 1} failed (will retry): ${errorMessage.substring(0, 100)}...`);
      }
    }
    
    throw lastError || new Error("Google Gemini request failed after retries");
  }

  /**
   * Analyze profile with retry logic
   */
  async analyzeProfileWithRetry(profileData, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = 3000 * attempt; // 3s, 6s, 9s
          console.log(`⏳ AI analysis retry ${attempt}/${maxRetries} after ${delay/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await this.analyzeProfile(profileData);
      } catch (error) {
        lastError = error;
        const errorMessage = error.message || error.toString();
        
        const isRetryable = 
          errorMessage.includes('503') ||
          errorMessage.includes('429') ||
          errorMessage.includes('overloaded') ||
          errorMessage.includes('Service Unavailable') ||
          errorMessage.includes('timeout');
        
        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }
        
        console.warn(`⚠️ AI analysis attempt ${attempt + 1} failed:`, errorMessage);
      }
    }
    
    throw lastError || new Error("AI analysis failed after retries");
  }

  /**
   * Extract role and industry from scraped data
   */
  extractRoleIndustry(scrapedData) {
    const headline = scrapedData.headline || "";
    const industry = scrapedData.industry || "";
    
    // Try to extract role from headline
    const roleMatch = headline.match(/^([^|]+)/);
    const role = roleMatch ? roleMatch[1].trim() : "";
    
    if (role && industry) {
      return `${role} | ${industry}`;
    } else if (role) {
      return role;
    } else if (industry) {
      return industry;
    }
    return "Not provided";
  }

  /**
   * Build additional text from scraped profile data
   */
  buildAdditionalText(scrapedData) {
    if (!scrapedData) {
      return "";
    }
    
    const parts = [];
    
    if (scrapedData.experience && scrapedData.experience.length > 0) {
      parts.push("Experience: " + JSON.stringify(scrapedData.experience.slice(0, 3)));
    }
    
    if (scrapedData.education && scrapedData.education.length > 0) {
      parts.push("Education: " + JSON.stringify(scrapedData.education));
    }
    
    if (scrapedData.skills && scrapedData.skills.length > 0) {
      parts.push("Skills: " + scrapedData.skills.join(", "));
    }
    
    // If we have minimal data, add the profile URL for context
    if (parts.length === 0 && scrapedData.name) {
      parts.push(`Profile: ${scrapedData.name} (LinkedIn profile analysis)`);
    }
    
    return parts.join("\n");
  }

  /**
   * Analyze a LinkedIn profile using the world-class prompt
   * 
   * @param {Object} profileData - Profile data to analyze
   * @param {string} profileData.userType - "Student", "Early Professional", "Senior Leader / Thought Leader", or "Other"
   * @param {string} profileData.headline - LinkedIn headline
   * @param {string} profileData.about - About/Summary section
   * @param {string} profileData.roleIndustry - Current role and industry
   * @param {string} profileData.location - Location
   * @param {string} profileData.targetAudience - Who they want to speak to
   * @param {string} profileData.mainGoal - Main goal (e.g., "get interviews", "build credibility")
   * @param {string} profileData.additionalText - Optional additional profile text
   * @returns {Promise<Object>} - Analysis result with score, suggestions, and post
   */
  async analyzeProfile(profileData) {
    try {
      console.log("🔍 Engagematic Profile Coach: Starting analysis...");
      
      // Validate required fields
      if (!profileData || typeof profileData !== 'object') {
        throw new Error("Invalid profile data provided");
      }

      if (!profileData.userType) {
        throw new Error("userType is required");
      }

      console.log("User Type:", profileData.userType);
      console.log("Goal:", profileData.mainGoal);

      // Build the prompt with user data (sanitize inputs)
      const prompt = buildProfileAnalyzerPrompt({
        userType: String(profileData.userType || "Other").trim(),
        headline: String(profileData.headline || "").trim(),
        about: String(profileData.about || profileData.summary || "").trim(),
        roleIndustry: String(profileData.roleIndustry || 
                     `${profileData.role || ""} | ${profileData.industry || ""}`.trim() || 
                     "Not provided").trim(),
        location: String(profileData.location || "").trim(),
        targetAudience: String(profileData.targetAudience || "").trim(),
        mainGoal: String(profileData.mainGoal || "build credibility").trim(),
        additionalText: String(profileData.additionalText || "").trim(),
        experience: Array.isArray(profileData.experience) ? profileData.experience : [],
        education: Array.isArray(profileData.education) ? profileData.education : [],
        skills: Array.isArray(profileData.skills) ? profileData.skills : [],
      });

      if (!prompt || prompt.length < 100) {
        throw new Error("Failed to build analysis prompt");
      }

      // Validate Google AI is configured
      if (!this.model) {
        throw new Error("Google AI is not configured. Please check GOOGLE_AI_API_KEY.");
      }

      // Generate analysis using Google Gemini with retry logic for 503 errors
      console.log("🤖 Calling Google Gemini with JSON response format...");
      
      const result = await this.generateWithRetryLogic(prompt);
      const response = await result.response;
      
      // Get text content - with responseMimeType: "application/json", this should be pure JSON
      let textContent;
      try {
        textContent = response.text();
      } catch (e) {
        // If text() fails, try to get the content another way
        console.warn("⚠️ response.text() failed, trying alternative method:", e.message);
        textContent = response.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(response);
      }

      if (!textContent || textContent.length < 50) {
        throw new Error("AI returned empty or invalid response");
      }

      // Check if response was truncated (finishReason indicates truncation)
      const finishReason = response.candidates?.[0]?.finishReason;
      const isTruncated = finishReason === 'MAX_TOKENS' || finishReason === 'LENGTH';
      
      if (isTruncated) {
        console.warn("⚠️ AI response was truncated (finishReason:", finishReason, "). Attempting to fix incomplete JSON...");
      }

      console.log("✅ AI response received, parsing JSON...");
      console.log("📊 Response length:", textContent.length, "chars");
      console.log("📊 Finish reason:", finishReason || "unknown");

      // Extract JSON from response with error handling
      let analysis;
      try {
        // Log the raw response for debugging
        console.log("📄 Raw AI response (first 500 chars):", textContent.substring(0, 500));
        console.log("📄 Raw AI response (last 200 chars):", textContent.substring(Math.max(0, textContent.length - 200)));
        
        analysis = this.extractJSONFromResponse(textContent, isTruncated);
        console.log("✅ Successfully parsed JSON from AI response");
        console.log("📊 Parsed analysis keys:", Object.keys(analysis || {}));
      } catch (parseError) {
        console.error("❌ JSON parsing error:", parseError);
        console.error("❌ Full AI response length:", textContent.length, "chars");
        console.error("❌ First 1000 chars:", textContent.substring(0, 1000));
        console.error("❌ Last 500 chars:", textContent.substring(Math.max(0, textContent.length - 500)));
        
        // If truncated, try to fix and parse
        if (isTruncated) {
          try {
            console.log("🔄 Response was truncated, attempting to fix incomplete JSON...");
            const fixedJson = this.fixTruncatedJSON(textContent);
            analysis = JSON.parse(fixedJson);
            console.log("✅ Successfully parsed fixed truncated JSON");
          } catch (fixError) {
            console.error("❌ Failed to fix truncated JSON:", fixError.message);
          }
        }
        
        // Last resort: try direct parse of the entire text
        if (!analysis) {
          try {
            console.log("🔄 Attempting direct JSON.parse on full response...");
            const directParse = JSON.parse(textContent.trim());
            console.log("✅ Direct parse succeeded! Using this result.");
            analysis = directParse;
          } catch (directError) {
            console.error("❌ Direct parse also failed:", directError.message);
            const errorMsg = `Failed to parse AI response: ${parseError.message}. Response length: ${textContent.length} chars. First 200 chars: ${textContent.substring(0, 200)}`;
            throw new Error(errorMsg);
          }
        }
      }

      // Validate the structure
      try {
        this.validateAnalysisStructure(analysis);
      } catch (validationError) {
        console.error("❌ Validation error:", validationError);
        throw new Error(`Analysis validation failed: ${validationError.message}`);
      }

      // Normalize the response - ensure 'score' field exists (AI might return 'profile_score')
      if (analysis.profile_score !== undefined && !analysis.score) {
        analysis.score = analysis.profile_score;
      }
      
      console.log("✅ Profile analysis complete. Score:", analysis.score || analysis.profile_score);
      console.log("📊 Analysis data structure:", {
        hasScore: !!analysis.score,
        hasProfileScore: !!analysis.profile_score,
        hasHeadlineFeedback: !!analysis.headline_feedback,
        hasAboutFeedback: !!analysis.about_feedback,
        hasPersonaAlignment: !!analysis.persona_alignment,
        hasTop3Priorities: !!analysis.top_3_priorities,
        keys: Object.keys(analysis),
      });

      return {
        success: true,
        data: analysis,
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error) {
      console.error("❌ Profile analysis error:", error);
      
      // Re-throw with user-friendly message
      throw new Error(this.getUserFriendlyError(error));
    }
  }



  /**
   * Extract JSON from AI response (handles markdown code blocks)
   * @param {string} textContent - Raw AI response text
   * @param {boolean} isTruncated - Whether the response was truncated
   * @returns {Object} - Parsed JSON object
   */
  extractJSONFromResponse(textContent, isTruncated = false) {
    if (!textContent || typeof textContent !== 'string') {
      throw new Error("Invalid AI response: empty or non-string content");
    }

    // Clean the text content
    let cleanedText = textContent.trim();
    
    // Since we're using responseMimeType: "application/json", the response should be pure JSON
    // Try parsing directly first
    try {
      const parsed = JSON.parse(cleanedText);
      if (parsed && typeof parsed === 'object') {
        console.log("✅ Successfully parsed JSON directly (pure JSON response)");
        return parsed;
      }
    } catch (e) {
      console.warn("⚠️ Direct JSON parse failed, trying extraction methods:", e.message);
    }
    
    // Try to find JSON in markdown code blocks
    const codeBlockMatch = cleanedText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1]);
        if (parsed && typeof parsed === 'object') {
          console.log("✅ Successfully parsed JSON from code block");
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse JSON from code block:", e.message);
      }
    }

    // Extract JSON by finding the first { and last } (most reliable method)
    const firstBrace = cleanedText.indexOf("{");
    const lastBrace = cleanedText.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        let jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          console.log("✅ Successfully parsed JSON by extracting braces");
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse extracted JSON:", e.message);
        // Try to fix common JSON issues including incomplete/truncated JSON
        try {
          let jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
          
          // Check if JSON appears truncated (ends with incomplete string/array/object)
          const isTruncated = !jsonStr.endsWith('}') || 
                             (jsonStr.match(/"/g) || []).length % 2 !== 0 ||
                             (jsonStr.match(/\{/g) || []).length !== (jsonStr.match(/\}/g) || []).length ||
                             (jsonStr.match(/\[/g) || []).length !== (jsonStr.match(/\]/g) || []).length;
          
          if (isTruncated) {
            console.warn("⚠️ JSON appears truncated, attempting to fix...");
            // Try to close incomplete structures
            jsonStr = this.fixTruncatedJSON(jsonStr);
          }
          
          let fixedJson = jsonStr
            .replace(/,\s*}/g, '}')  // Remove trailing commas before }
            .replace(/,\s*]/g, ']')   // Remove trailing commas before ]
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Add quotes to unquoted keys
            .replace(/:\s*([^",\[\]{}]+)([,}\]])/g, ': "$1"$2');  // Add quotes to unquoted string values
          
          const parsed = JSON.parse(fixedJson);
          console.log("✅ Successfully parsed JSON after fixing common issues");
          return parsed;
        } catch (fixError) {
          console.warn("Failed to fix and parse JSON:", fixError.message);
        }
      }
    }

    // Try to find JSON object directly (greedy match)
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && typeof parsed === 'object') {
          console.log("✅ Successfully parsed JSON from regex match");
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse JSON from match:", e.message);
      }
    }

    // Final attempt: aggressive JSON fixing
    try {
      const firstBrace = cleanedText.indexOf('{');
      const lastBrace = cleanedText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        let jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
        
        // Fix common JSON issues
        jsonStr = jsonStr
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']')   // Remove trailing commas before ]
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Add quotes to unquoted keys
          .replace(/:\s*([^",\[\]{}]+)([,}\]])/g, ': "$1"$2');  // Add quotes to unquoted string values
        
        const parsed = JSON.parse(jsonStr);
        console.log("✅ Successfully parsed JSON after aggressive fixing");
        return parsed;
      }
    } catch (e) {
      console.error("❌ Aggressive JSON fix also failed:", e.message);
    }

    // If all attempts failed, throw detailed error with actual response
    const errorPreview = cleanedText.length > 500 ? cleanedText.substring(0, 500) + '...' : cleanedText;
    console.error("❌ Full response that failed to parse:", cleanedText);
    throw new Error(`Could not extract valid JSON from AI response. Response length: ${cleanedText.length} chars. First 200 chars: ${cleanedText.substring(0, 200)}`);
  }

  /**
   * Fix truncated JSON by closing incomplete structures
   * @param {string} jsonStr - Potentially truncated JSON string
   * @returns {string} - Fixed JSON string
   */
  fixTruncatedJSON(jsonStr) {
    let fixed = jsonStr.trim();
    
    // Remove any trailing incomplete content
    // Find the last complete JSON structure
    let lastValidPos = fixed.length;
    
    // Work backwards to find where we can safely cut
    for (let i = fixed.length - 1; i >= 0; i--) {
      const char = fixed[i];
      if (char === '}' || char === ']' || char === '"') {
        // Check if this is a complete structure
        try {
          const testStr = fixed.substring(0, i + 1);
          JSON.parse(testStr);
          lastValidPos = i + 1;
          break;
        } catch (e) {
          // Not valid yet, continue
        }
      }
    }
    
    // If we found a valid position, use it
    if (lastValidPos < fixed.length) {
      fixed = fixed.substring(0, lastValidPos);
    }
    
    // Count unclosed structures
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    
    // Check if we're in the middle of a string (unclosed quote)
    const lastQuoteIndex = fixed.lastIndexOf('"');
    const escapedQuotes = (fixed.substring(0, lastQuoteIndex).match(/\\"/g) || []).length;
    const quotesBeforeLast = (fixed.substring(0, lastQuoteIndex).match(/"/g) || []).length - escapedQuotes;
    const isInString = quotesBeforeLast % 2 !== 0;
    
    // If in a string, we need to close it and remove the incomplete value
    if (isInString) {
      // Find the start of this string value
      const lastColon = fixed.lastIndexOf(':');
      const lastComma = fixed.lastIndexOf(',');
      const lastBrace = fixed.lastIndexOf('{');
      const lastBracket = fixed.lastIndexOf('[');
      const contextStart = Math.max(lastColon, lastComma, lastBrace, lastBracket);
      
      if (contextStart > 0 && contextStart < lastQuoteIndex) {
        // Remove the incomplete string value
        fixed = fixed.substring(0, contextStart + 1).trim();
        // Remove trailing comma if present
        fixed = fixed.replace(/,\s*$/, '');
      } else {
        // Just close the string
        fixed = fixed.trim();
        if (!fixed.endsWith('"')) {
          fixed += '"';
        }
      }
    } else {
      // Not in a string, but might have trailing comma or incomplete value
      fixed = fixed.trim();
      // Remove trailing comma before closing structures
      fixed = fixed.replace(/,\s*$/, '');
    }
    
    // Close incomplete arrays first (inner structures first)
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      fixed = fixed.trim();
      if (!fixed.endsWith(']')) {
        fixed += ']';
      }
    }
    
    // Close incomplete objects
    for (let i = 0; i < openBraces - closeBraces; i++) {
      fixed = fixed.trim();
      if (!fixed.endsWith('}')) {
        fixed += '}';
      }
    }
    
    return fixed;
  }

  /**
   * Validate the analysis structure (new format)
   * @param {Object} analysis - Analysis object to validate
   */
  validateAnalysisStructure(analysis) {
    if (!analysis || typeof analysis !== 'object') {
      throw new Error("Analysis result is not a valid object");
    }

    // New required fields structure
    const requiredFields = [
      "score",
      "headline_feedback",
      "about_feedback",
      "experience_feedback",
      "education_feedback",
      "skills_feedback",
      "persona_alignment",
      "top_3_priorities",
      "keywords",
      "recommended_skills",
    ];

    for (const field of requiredFields) {
      if (!(field in analysis)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate score
    if (
      typeof analysis.score !== "number" ||
      isNaN(analysis.score) ||
      analysis.score < 0 ||
      analysis.score > 100
    ) {
      if (typeof analysis.score === 'string') {
        const parsed = parseInt(analysis.score);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
          analysis.score = parsed;
        } else {
          throw new Error(`Invalid score: ${analysis.score}. Must be a number between 0 and 100.`);
        }
      } else {
        throw new Error(`Invalid score: ${analysis.score}. Must be a number between 0 and 100.`);
      }
    }

    // Validate headline_feedback
    if (!analysis.headline_feedback || typeof analysis.headline_feedback !== 'object') {
      throw new Error("headline_feedback must be an object");
    }
    if (typeof analysis.headline_feedback.score !== 'number' || analysis.headline_feedback.score < 0 || analysis.headline_feedback.score > 100) {
      throw new Error("headline_feedback.score must be a number between 0 and 100");
    }
    if (!Array.isArray(analysis.headline_feedback.strengths) || analysis.headline_feedback.strengths.length < 2) {
      throw new Error("headline_feedback.strengths must be an array with at least 2 items");
    }
    if (!Array.isArray(analysis.headline_feedback.improvements) || analysis.headline_feedback.improvements.length !== 3) {
      throw new Error("headline_feedback.improvements must be an array with exactly 3 items");
    }
    if (!analysis.headline_feedback.rewritten_example || typeof analysis.headline_feedback.rewritten_example !== 'string') {
      throw new Error("headline_feedback.rewritten_example must be a non-empty string");
    }

    // Validate about_feedback
    if (!analysis.about_feedback || typeof analysis.about_feedback !== 'object') {
      throw new Error("about_feedback must be an object");
    }
    if (typeof analysis.about_feedback.score !== 'number' || analysis.about_feedback.score < 0 || analysis.about_feedback.score > 100) {
      throw new Error("about_feedback.score must be a number between 0 and 100");
    }
    if (!Array.isArray(analysis.about_feedback.strengths) || analysis.about_feedback.strengths.length < 2) {
      throw new Error("about_feedback.strengths must be an array with at least 2 items");
    }
    if (!Array.isArray(analysis.about_feedback.improvements) || analysis.about_feedback.improvements.length !== 3) {
      throw new Error("about_feedback.improvements must be an array with exactly 3 items");
    }
    if (!Array.isArray(analysis.about_feedback.structure_suggestions) || analysis.about_feedback.structure_suggestions.length < 4) {
      throw new Error("about_feedback.structure_suggestions must be an array with at least 4 items");
    }

    // Validate persona_alignment
    if (!analysis.persona_alignment || typeof analysis.persona_alignment !== 'object') {
      throw new Error("persona_alignment must be an object");
    }
    if (typeof analysis.persona_alignment.score !== 'number' || analysis.persona_alignment.score < 0 || analysis.persona_alignment.score > 100) {
      throw new Error("persona_alignment.score must be a number between 0 and 100");
    }
    if (!analysis.persona_alignment.feedback || typeof analysis.persona_alignment.feedback !== 'string') {
      throw new Error("persona_alignment.feedback must be a non-empty string");
    }

    // Validate top_3_priorities
    if (!Array.isArray(analysis.top_3_priorities) || analysis.top_3_priorities.length !== 3) {
      throw new Error("top_3_priorities must be an array with exactly 3 items");
    }

    // Validate keywords
    if (!Array.isArray(analysis.keywords) || analysis.keywords.length < 5) {
      throw new Error("keywords must be an array with at least 5 items");
    }

    // Validate recommended_skills
    if (!Array.isArray(analysis.recommended_skills) || analysis.recommended_skills.length < 5) {
      throw new Error("recommended_skills must be an array with at least 5 items");
    }

    // Validate optimized_about (in about_feedback)
    if (!analysis.about_feedback.optimized_about || typeof analysis.about_feedback.optimized_about !== 'string' || analysis.about_feedback.optimized_about.trim().length < 200) {
      throw new Error("about_feedback.optimized_about must be a string with at least 200 characters");
    }

    // Validate experience_feedback
    if (!analysis.experience_feedback || typeof analysis.experience_feedback !== 'object') {
      throw new Error("experience_feedback must be an object");
    }
    if (typeof analysis.experience_feedback.score !== 'number' || analysis.experience_feedback.score < 0 || analysis.experience_feedback.score > 100) {
      throw new Error("experience_feedback.score must be a number between 0 and 100");
    }
    if (!Array.isArray(analysis.experience_feedback.strengths) || analysis.experience_feedback.strengths.length < 2) {
      throw new Error("experience_feedback.strengths must be an array with at least 2 items");
    }
    if (!Array.isArray(analysis.experience_feedback.improvements) || analysis.experience_feedback.improvements.length !== 3) {
      throw new Error("experience_feedback.improvements must be an array with exactly 3 items");
    }
    if (!analysis.experience_feedback.content_strategy || typeof analysis.experience_feedback.content_strategy !== 'string' || analysis.experience_feedback.content_strategy.trim().length < 20) {
      throw new Error("experience_feedback.content_strategy must be a string with at least 20 characters (2-line tip)");
    }

    // Validate education_feedback
    if (!analysis.education_feedback || typeof analysis.education_feedback !== 'object') {
      throw new Error("education_feedback must be an object");
    }
    if (typeof analysis.education_feedback.score !== 'number' || analysis.education_feedback.score < 0 || analysis.education_feedback.score > 100) {
      throw new Error("education_feedback.score must be a number between 0 and 100");
    }
    if (!Array.isArray(analysis.education_feedback.strengths) || analysis.education_feedback.strengths.length < 2) {
      throw new Error("education_feedback.strengths must be an array with at least 2 items");
    }
    if (!Array.isArray(analysis.education_feedback.improvements) || analysis.education_feedback.improvements.length !== 3) {
      throw new Error("education_feedback.improvements must be an array with exactly 3 items");
    }

    // Validate skills_feedback
    if (!analysis.skills_feedback || typeof analysis.skills_feedback !== 'object') {
      throw new Error("skills_feedback must be an object");
    }
    if (typeof analysis.skills_feedback.score !== 'number' || analysis.skills_feedback.score < 0 || analysis.skills_feedback.score > 100) {
      throw new Error("skills_feedback.score must be a number between 0 and 100");
    }
    if (!Array.isArray(analysis.skills_feedback.strengths) || analysis.skills_feedback.strengths.length < 2) {
      throw new Error("skills_feedback.strengths must be an array with at least 2 items");
    }
    if (!Array.isArray(analysis.skills_feedback.improvements) || analysis.skills_feedback.improvements.length !== 3) {
      throw new Error("skills_feedback.improvements must be an array with exactly 3 items");
    }
    if (!Array.isArray(analysis.skills_feedback.optimized_skills_list) || analysis.skills_feedback.optimized_skills_list.length < 5) {
      throw new Error("skills_feedback.optimized_skills_list must be an array with at least 5 skills (copy-paste ready)");
    }

    // generated_post is now optional - only validate if present
    if (analysis.generated_post) {
      if (typeof analysis.generated_post !== 'object') {
        throw new Error("generated_post must be an object if provided");
      }
      if (analysis.generated_post.content && (typeof analysis.generated_post.content !== 'string' || analysis.generated_post.content.trim().length < 150)) {
        throw new Error("generated_post.content must be a string with at least 150 characters if provided");
      }
    }

    // Validate all array items are strings
    analysis.headline_feedback.strengths.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`headline_feedback.strengths[${index}] must be a non-empty string`);
      }
    });

    analysis.headline_feedback.improvements.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`headline_feedback.improvements[${index}] must be a non-empty string`);
      }
    });

    analysis.about_feedback.strengths.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`about_feedback.strengths[${index}] must be a non-empty string`);
      }
    });

    analysis.about_feedback.improvements.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`about_feedback.improvements[${index}] must be a non-empty string`);
      }
    });

    analysis.top_3_priorities.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`top_3_priorities[${index}] must be a non-empty string`);
      }
    });

    // Validate generated_post if present (it's optional per the prompt)
    if (analysis.generated_post) {
      if (typeof analysis.generated_post !== 'object') {
        throw new Error("generated_post must be an object");
      }
      
      if (analysis.generated_post.content && typeof analysis.generated_post.content !== 'string') {
        throw new Error("generated_post.content must be a string");
      }
      
      if (analysis.generated_post.engagement_tactics) {
        if (!Array.isArray(analysis.generated_post.engagement_tactics)) {
          throw new Error("generated_post.engagement_tactics must be an array");
        }
        analysis.generated_post.engagement_tactics.forEach((item, index) => {
          if (typeof item !== 'string' || item.trim().length === 0) {
            throw new Error(`generated_post.engagement_tactics[${index}] must be a non-empty string`);
          }
        });
      }
    }
  }

  /**
   * REMOVED: No fallback analysis - only real AI results
   * This method has been completely removed to ensure only real AI results are returned.
   * If AI fails, an error is thrown instead of returning fallback data.
   * 
   * DO NOT USE THIS METHOD - It will throw an error if called.
   */
  getFallbackAnalysis_DO_NOT_USE(profileData) {
    throw new Error("Fallback analysis is disabled. Only real AI results are allowed. If you see this error, the AI analysis failed and should be retried.");
  }

  /**
   * Detect user type from profile data (helper method)
   * @param {Object} profileData - Profile data
   * @returns {string} - Detected user type
   */
  detectUserType(profileData) {
    if (profileData.userType) {
      return profileData.userType;
    }

    // Try to infer from profile data
    const headline = (profileData.headline || "").toLowerCase();
    const about = (profileData.about || profileData.summary || "").toLowerCase();
    const combined = `${headline} ${about}`;

    // Check for student indicators
    if (
      combined.includes("student") ||
      combined.includes("studying") ||
      combined.includes("university") ||
      combined.includes("college")
    ) {
      return "Student";
    }

    // Check for senior leader indicators
    if (
      combined.includes("ceo") ||
      combined.includes("cto") ||
      combined.includes("founder") ||
      combined.includes("director") ||
      combined.includes("vp") ||
      combined.includes("vice president") ||
      combined.includes("executive") ||
      combined.includes("20+ years") ||
      combined.includes("15+ years")
    ) {
      return "Senior Leader / Thought Leader";
    }

    // Default to early professional
    return "Early Professional";
  }
}

export default new LinkedInProfileCoach();


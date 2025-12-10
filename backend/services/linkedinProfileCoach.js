import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/index.js";
import { buildProfileAnalyzerPrompt } from "../prompts/profileAnalyzerPrompt.js";

/**
 * LinkedInPulse Profile Coach Service
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
      
      if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('Unsupported')) {
        throw new Error(`LinkedIn profile "${username}" not found via search. Please verify the profile URL is correct and the profile is public. You can also use manual input mode.`);
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
    // Try multiple search strategies for better results
    const profileUrl = `https://www.linkedin.com/in/${username}`;
    
    // Strategy 1: Direct site search
    let searchQuery = `site:linkedin.com/in/${username}`;
    let apiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}`;
    
    console.log("🔗 SerpApi URL (key hidden):", apiUrl.replace(apiKey, "***"));
    
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let response;
    try {
      console.log("📡 Making request to SerpApi...");
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      console.log("✅ SerpApi response status:", response.status, response.statusText);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error("❌ SerpApi fetch error:", fetchError);
      if (fetchError.name === 'AbortError') {
        throw new Error("Request to SerpApi timed out after 30 seconds. Please try again.");
      }
      throw new Error(`Network error: ${fetchError.message}`);
    }

    if (!response.ok) {
      let errorMessage = `SerpApi request failed: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error("❌ SerpApi error response:", errorText.substring(0, 500));
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || errorMessage;
          // Log specific error codes
          if (errorData.error === "Invalid API key.") {
            throw new Error("Invalid SerpApi API key. Please check your SERPAPI_KEY configuration.");
          }
          if (errorData.error && errorData.error.includes("quota")) {
            throw new Error("SerpApi quota exceeded. Please upgrade your plan or wait for quota reset.");
          }
        } catch (e) {
          if (errorText) {
            errorMessage += ` - ${errorText.substring(0, 200)}`;
          }
        }
      } catch (e) {
        // Error reading response
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = await response.json();
      console.log("✅ SerpApi response received, organic_results count:", data.organic_results?.length || 0);
    } catch (parseError) {
      console.error("❌ Failed to parse SerpApi JSON response:", parseError);
      throw new Error("Invalid JSON response from SerpApi");
    }
    
    if (data.error) {
      console.error("❌ SerpApi returned error:", data.error);
      
      // Handle specific SerpApi errors
      if (data.error === "Google hasn't returned any results for this query.") {
        throw new Error(`Google search did not return results for LinkedIn profile "${username}". The profile may not be indexed by Google or may be private.`);
      }
      
      if (data.error === "Invalid API key.") {
        throw new Error("Invalid SerpApi API key. Please check your SERPAPI_KEY configuration.");
      }
      
      if (data.error.includes("quota") || data.error.includes("limit")) {
        throw new Error("SerpApi quota exceeded. Please upgrade your plan or wait for quota reset.");
      }
      
      throw new Error(data.error);
    }

    // SerpApi Google search response structure for LinkedIn profiles
    // Extract LinkedIn profile from Google search results
    let profile = null;
    
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
    }
    
    // If no profile found, try alternative search strategy
    if (!profile) {
      console.log("⚠️ Profile not found with site: search, trying alternative search...");
      
      // Strategy 2: Search for LinkedIn profile with username
      const altSearchQuery = `linkedin.com/in/${username}`;
      const altApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(altSearchQuery)}&api_key=${apiKey}`;
      
      try {
        const altResponse = await fetch(altApiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        
        if (altResponse.ok) {
          const altData = await altResponse.json();
          
          if (!altData.error && altData.organic_results) {
            profile = altData.organic_results.find(r => 
              r.link && r.link.includes('linkedin.com/in/') && r.link.includes(username)
            );
            
            if (!profile) {
              profile = altData.organic_results.find(r => 
                r.link && r.link.includes('linkedin.com/in/')
              );
            }
          }
        }
      } catch (altError) {
        console.warn("⚠️ Alternative search also failed:", altError.message);
      }
    }
    
    if (!profile) {
      // Try one more time with a simpler query
      console.log("⚠️ Profile not found, trying simpler search query...");
      const simpleQuery = `"${username}" linkedin`;
      const simpleApiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(simpleQuery)}&api_key=${apiKey}`;
      
      try {
        const simpleResponse = await fetch(simpleApiUrl, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        
        if (simpleResponse.ok) {
          const simpleData = await simpleResponse.json();
          
          if (!simpleData.error && simpleData.organic_results) {
            profile = simpleData.organic_results.find(r => 
              r.link && r.link.includes('linkedin.com/in/') && r.link.includes(username)
            );
          }
        }
      } catch (simpleError) {
        console.warn("⚠️ Simple search also failed:", simpleError.message);
      }
    }
    
    if (!profile) {
      throw new Error(`LinkedIn profile "${username}" not found via Google search. This may be because: 1) The profile is not indexed by Google, 2) The profile is private, or 3) The profile URL is incorrect. Please verify the profile URL is correct and the profile is public.`);
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
    
    // Try to extract headline from title or snippet
    let headline = title.replace(/ \| LinkedIn$/, '').replace(/ on LinkedIn$/, '');
    if (headline === title) {
      // Try to extract from snippet
      const headlineMatch = snippet.match(/^([^•\n]+)/);
      if (headlineMatch) {
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
      name: title.split(' | ')[0] || username,
      headline: headline || '',
      summary: about || '',
      location: this.extractLocationFromSnippet(snippet),
      experience: experience,
      education: [],
      skills: skills,
    };
    
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
      console.log("🔍 LinkedInPulse Profile Coach: Starting analysis from URL...");
      
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
        throw new Error("Could not extract valid username from profile URL. Please check the URL format.");
      }

      console.log("Profile URL:", profileUrl);
      console.log("Extracted username:", username);

      // Fetch profile data with retry logic
      let profileResult;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount <= maxRetries) {
        try {
          if (retryCount > 0) {
            const delay = 2000 * retryCount; // 2s, 4s, 6s
            console.log(`⏳ Retry ${retryCount}/${maxRetries} after ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          profileResult = await this.fetchProfileFromSerpApi(username);
          
          if (profileResult && profileResult.success) {
            break;
          } else {
            throw new Error(profileResult?.message || "Failed to fetch profile data");
          }
        } catch (error) {
          retryCount++;
          if (retryCount > maxRetries) {
            throw new Error(`Failed to fetch profile data after ${maxRetries} attempts: ${error.message}`);
          }
          console.warn(`⚠️ Profile fetch attempt ${retryCount} failed:`, error.message);
        }
      }
      
      if (!profileResult || !profileResult.success) {
        throw new Error("Failed to fetch profile data. Please ensure the profile is public and the URL is correct.");
      }

      const scrapedData = profileResult.data;
      
      // Validate scraped data
      if (!scrapedData) {
        throw new Error("No profile data received from scraping service. Please check the profile URL.");
      }

      // For Google search results, we may have limited data - that's okay
      // We'll use what we have and let the AI analyze based on available data
      if (!scrapedData.headline && !scrapedData.summary) {
        console.warn("⚠️ Limited profile data from search. Analysis will proceed with available information.");
        // Don't throw error - allow analysis with minimal data
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
      console.log("  - Profile Score:", analysisResult.data.profile_score);
      console.log("  - Analysis is based on REAL profile data");
      
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
            maxOutputTokens: 2048,
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
      console.log("🔍 LinkedInPulse Profile Coach: Starting analysis...");
      
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

      console.log("✅ AI response received, parsing JSON...");

      // Extract JSON from response with error handling
      let analysis;
      try {
        // Log the raw response for debugging
        console.log("📄 Raw AI response (first 500 chars):", textContent.substring(0, 500));
        console.log("📄 Raw AI response (last 200 chars):", textContent.substring(Math.max(0, textContent.length - 200)));
        
        analysis = this.extractJSONFromResponse(textContent);
        console.log("✅ Successfully parsed JSON from AI response");
        console.log("📊 Parsed analysis keys:", Object.keys(analysis || {}));
      } catch (parseError) {
        console.error("❌ JSON parsing error:", parseError);
        console.error("❌ Full AI response length:", textContent.length, "chars");
        console.error("❌ First 1000 chars:", textContent.substring(0, 1000));
        console.error("❌ Last 500 chars:", textContent.substring(Math.max(0, textContent.length - 500)));
        
        // Last resort: try direct parse of the entire text
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

      // Validate the structure
      try {
        this.validateAnalysisStructure(analysis);
      } catch (validationError) {
        console.error("❌ Validation error:", validationError);
        throw new Error(`Analysis validation failed: ${validationError.message}`);
      }

      console.log("✅ Profile analysis complete. Score:", analysis.profile_score);

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
   * @returns {Object} - Parsed JSON object
   */
  extractJSONFromResponse(textContent) {
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
        const jsonStr = cleanedText.substring(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonStr);
        if (parsed && typeof parsed === 'object') {
          console.log("✅ Successfully parsed JSON by extracting braces");
          return parsed;
        }
      } catch (e) {
        console.warn("Failed to parse extracted JSON:", e.message);
        // Try to fix common JSON issues
        try {
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
      "persona_alignment",
      "top_3_priorities",
      "keywords",
      "recommended_skills",
      "optimized_about",
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

    // Validate optimized_about
    if (!analysis.optimized_about || typeof analysis.optimized_about !== 'string' || analysis.optimized_about.trim().length < 200) {
      throw new Error("optimized_about must be a string with at least 200 characters");
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

    analysis.generated_post.engagement_tactics.forEach((item, index) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        throw new Error(`generated_post.engagement_tactics[${index}] must be a non-empty string`);
      }
    });
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


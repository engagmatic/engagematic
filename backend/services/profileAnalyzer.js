import googleAI from "./googleAI.js";
import ProfileAnalysis from "../models/ProfileAnalysis.js";
import { config } from "../config/index.js";

class ProfileAnalyzer {
  /**
   * Analyze a LinkedIn profile using SerpApi (free API - real results only, no fallbacks)
   */
  async analyzeProfile(profileUrl, userId) {
    try {
      console.log("🔍 Profile Analysis requested:", profileUrl);

      // Extract username from LinkedIn URL
      const username = this.extractUsernameFromUrl(profileUrl);
      if (!username) {
        throw new Error("Invalid LinkedIn profile URL");
      }

      // Fetch profile data using SerpApi (free API - real results only, no fallbacks)
      const profileData = await this.fetchProfileFromSerpApi(username);

      if (!profileData.success) {
        throw new Error(profileData.message || "Failed to fetch profile data");
      }

      console.log(`✅ Profile data extracted for: ${profileData.data.name}`);

      // Calculate scores
      const scores = this.calculateScores(profileData.data);

      // Generate AI recommendations
      const recommendations = await this.generateRecommendations(
        profileData.data,
        scores
      );

      // Save analysis
      const analysis = await ProfileAnalysis.create({
        userId,
        profileUrl,
        profileData: {
          fullName: profileData.data.name || "",
          headline: profileData.data.headline || "",
          about: profileData.data.summary || "",
          location: profileData.data.location || "",
          industry: profileData.data.industry || "",
          experience: profileData.data.experience || [],
          education: profileData.data.education || [],
          skills: profileData.data.skills || [],
        },
        scores,
        recommendations,
        analyzedAt: new Date(),
      });

      console.log("✅ Profile analysis complete:", {
        userId,
        overallScore: scores.overall,
      });

      return {
        success: true,
        data: {
          id: analysis._id,
          scores,
          recommendations,
          profileData: analysis.profileData,
          analyzedAt: analysis.analyzedAt,
        },
      };

      // OLD CODE (disabled):
      // const profileResult = await realLinkedInScraper.extractProfileData(profileUrl);
      // if (!profileResult.success) {
      //   throw new Error("Failed to extract profile data");
      // }
      // const profileData = profileResult.data;
      // const scrapingMethod = profileResult.method;
      // console.log(`✅ Profile data extracted using method: ${scrapingMethod}`);
      // Calculate scores
      // const scores = this.calculateScores(profileData);
      // Generate AI recommendations
      // const recommendations = await this.generateRecommendations(profileData, scores);
      // Save analysis
      /* OLD ANALYSIS CODE (disabled)
      const analysis = await ProfileAnalysis.create({
        userId,
        profileUrl,
        profileData: {
          fullName: profileData.fullName || "",
          headline: profileData.headline || "",
          about: profileData.about || "",
          location: profileData.location || "",
          industry: profileData.industry || "",
          experience: profileData.experience || [],
          education: profileData.education || [],
          skills: profileData.skills || [],
        },
        scores,
        recommendations,
        analyzedAt: new Date(),
      });

      console.log("✅ Profile analysis complete:", {
        userId,
        overallScore: scores.overall,
      });

      return {
        success: true,
        data: {
          id: analysis._id,
          scores,
          recommendations,
          profileData: analysis.profileData,
          analyzedAt: analysis.analyzedAt,
        },
      };
      */
    } catch (error) {
      console.error("❌ Profile analysis error:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Profile analysis is currently unavailable";
      let userMessage = "We encountered an issue analyzing your profile. Please try again.";
      
      if (error.message) {
        if (error.message.includes("RAPIDAPI_KEY") || error.message.includes("not configured")) {
          errorMessage = "Profile scraping service is not configured";
          userMessage = "The profile scraping service needs to be configured. Please contact support or try entering your profile information manually.";
        } else if (error.message.includes("not found") || error.message.includes("404")) {
          errorMessage = "Profile not found";
          userMessage = "The LinkedIn profile could not be found. Please verify the URL is correct and the profile is public.";
        } else if (error.message.includes("rate limit") || error.message.includes("429")) {
          errorMessage = "Rate limit exceeded";
          userMessage = "You've reached the rate limit for profile analysis. Please try again later or upgrade your plan.";
        } else if (error.message.includes("timeout")) {
          errorMessage = "Request timeout";
          userMessage = "The request took too long to complete. Please try again with a different profile or check your internet connection.";
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        message: userMessage,
        error: errorMessage,
      };
    }
  }

  /**
   * Extract username from LinkedIn profile URL
   */
  extractUsernameFromUrl(profileUrl) {
    try {
      // Handle cases where URL might not have protocol
      let url;
      if (!profileUrl.startsWith('http://') && !profileUrl.startsWith('https://')) {
        profileUrl = 'https://' + profileUrl;
      }
      
      url = new URL(profileUrl);
      if (!url.hostname.includes("linkedin.com")) {
        return null;
      }

      // Extract username from path like /in/username or /company/companyname
      const pathParts = url.pathname.split("/").filter((part) => part);

      if (pathParts[0] === "in" && pathParts[1]) {
        // Clean username: remove query parameters, hash fragments, etc.
        const username = pathParts[1].split('?')[0].split('#')[0];
        return username;
      }

      // Also handle URLs like linkedin.com/in/username/
      if (pathParts.length > 0 && pathParts[0] === "in" && pathParts[1]) {
        const username = pathParts[1].split('?')[0].split('#')[0];
        return username;
      }

      // Try to extract from full path pattern
      const pathMatch = url.pathname.match(/\/in\/([^\/\?\#]+)/);
      if (pathMatch && pathMatch[1]) {
        return pathMatch[1];
      }

      return null;
    } catch (error) {
      console.error("Error extracting username:", error);
      // Try regex fallback for malformed URLs
      try {
        const match = profileUrl.match(/linkedin\.com\/in\/([^\/\?\#\s]+)/i);
        if (match && match[1]) {
          return match[1];
        }
      } catch (e) {
        // Ignore regex errors
      }
      return null;
    }
  }

  /**
   * Fetch profile data from SerpApi (free API - 100 searches/month free tier)
   * NO FALLBACKS - Only real results from SerpApi Google search
   */
  async fetchProfileFromSerpApi(username) {
    try {
      const serpApiKey = process.env.SERPAPI_KEY || config.SERPAPI_KEY;
      
      // Check if SerpApi key is configured
      if (!serpApiKey || serpApiKey === "your-serpapi-key-here" || serpApiKey.length < 10) {
        return {
          success: false,
          message: "SerpApi key not configured. Please configure SERPAPI_KEY in your environment variables. Get a free key from https://serpapi.com (100 free searches/month).",
        };
      }

      console.log("🔍 Fetching profile from SerpApi (free API) for:", username);

      // Multiple search strategies for better results
      const searchStrategies = [
        `linkedin.com/in/${username}`,  // Most reliable
        `site:linkedin.com/in/${username}`,  // Site-specific search
        `"${username}" linkedin`,  // Quoted username search
        `https://www.linkedin.com/in/${username}`,  // Full URL search
      ];

      let profile = null;
      let lastError = null;

      // Try each search strategy
      for (let i = 0; i < searchStrategies.length; i++) {
        const searchQuery = searchStrategies[i];
        const apiUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${serpApiKey}`;

        console.log(`🔍 Trying search strategy ${i + 1}/${searchStrategies.length}: ${searchQuery}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error === "Invalid API key.") {
                throw new Error("Invalid SerpApi API key. Please check your SERPAPI_KEY configuration.");
              }
              if (errorData.error && errorData.error.includes("quota")) {
                throw new Error("SerpApi quota exceeded. Free tier allows 100 searches/month. Please try again later.");
              }
              if (errorData.error === "Google hasn't returned any results for this query.") {
                console.log(`⚠️ Strategy ${i + 1} returned no results, trying next...`);
                lastError = errorData.error;
                continue;
              }
              lastError = errorData.error || errorText.substring(0, 200);
            } catch (e) {
              lastError = errorText.substring(0, 200);
            }
            continue;
          }

          const data = await response.json();

          if (data.error) {
            if (data.error === "Google hasn't returned any results for this query.") {
              console.log(`⚠️ Strategy ${i + 1} returned no results, trying next...`);
              lastError = data.error;
              continue;
            }
            if (data.error === "Invalid API key.") {
              throw new Error("Invalid SerpApi API key. Please check your SERPAPI_KEY configuration.");
            }
            if (data.error.includes("quota") || data.error.includes("limit")) {
              throw new Error("SerpApi quota exceeded. Free tier allows 100 searches/month. Please try again later.");
            }
            throw new Error(data.error);
          }

          // Extract LinkedIn profile from results
          if (data.organic_results && Array.isArray(data.organic_results)) {
            // Normalize username for matching (handle case-insensitive, with/without dashes)
            const normalizedUsername = username.toLowerCase().replace(/[-_]/g, '');
            
            // Find exact match first (exact username in URL)
            profile = data.organic_results.find(r => {
              if (!r.link || !r.link.includes('linkedin.com/in/')) return false;
              const urlMatch = r.link.match(/linkedin\.com\/in\/([^\/\?]+)/i);
              if (!urlMatch) return false;
              const urlUsername = urlMatch[1].toLowerCase().replace(/[-_]/g, '');
              return urlUsername === normalizedUsername || r.link.toLowerCase().includes(username.toLowerCase());
            });

            // If exact match not found, try partial match
            if (!profile) {
              profile = data.organic_results.find(r => {
                if (!r.link || !r.link.includes('linkedin.com/in/')) return false;
                const urlMatch = r.link.match(/linkedin\.com\/in\/([^\/\?]+)/i);
                if (!urlMatch) return false;
                const urlUsername = urlMatch[1].toLowerCase();
                return urlUsername.includes(username.toLowerCase()) || username.toLowerCase().includes(urlUsername);
              });
            }

            // If still not found, try any LinkedIn profile result (last resort)
            if (!profile) {
              profile = data.organic_results.find(r =>
                r.link && r.link.includes('linkedin.com/in/')
              );
            }

            if (profile) {
              console.log(`✅ Profile found using search strategy ${i + 1}!`);
              break;
            }
          }

          console.log(`⚠️ Strategy ${i + 1} found results but no matching LinkedIn profile`);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError.name === 'AbortError') {
            throw new Error("Request to SerpApi timed out after 30 seconds. Please try again.");
          }
          if (fetchError.message.includes("Invalid API key") || fetchError.message.includes("quota")) {
            throw fetchError;
          }
          console.warn(`⚠️ Strategy ${i + 1} error:`, fetchError.message);
          lastError = fetchError.message;
        }
      }

      if (!profile) {
        throw new Error(
          `LinkedIn profile "${username}" not found via Google search. The profile may not be indexed by Google yet, may be private, or the URL may be incorrect. Please verify the LinkedIn profile URL is correct and the profile is public.`
        );
      }

      // Format the Google search result - REAL DATA ONLY (throws error if data is insufficient)
      return this.formatGoogleSearchProfile(profile, username);
    } catch (error) {
      console.error("❌ SerpApi fetch error:", error.message);
      return {
        success: false,
        message: error.message || "Failed to fetch profile from SerpApi. Please verify the LinkedIn profile URL is correct and the profile is public.",
      };
    }
  }

  /**
   * Calculate profile scores
   */
  calculateScores(profile) {
    let overall = 0;

    // Headline score (0-10)
    const headlineScore = this.scoreHeadline(profile.headline);
    overall += headlineScore * 2; // Weight: 20%

    // About section score (0-10)
    const aboutScore = this.scoreAbout(profile.about);
    overall += aboutScore * 2.5; // Weight: 25%

    // Completeness score (0-10)
    const completenessScore = this.scoreCompleteness(profile);
    overall += completenessScore * 2; // Weight: 20%

    // Keywords score (0-10)
    const keywordsScore = this.scoreKeywords(profile);
    overall += keywordsScore * 1.5; // Weight: 15%

    // Engagement potential score (0-10)
    const engagementScore = this.scoreEngagement(profile);
    overall += engagementScore * 2; // Weight: 20%

    return {
      overall: Math.round(overall),
      headline: headlineScore,
      about: aboutScore,
      completeness: completenessScore,
      keywords: keywordsScore,
      engagement: engagementScore,
    };
  }

  scoreHeadline(headline) {
    if (!headline) return 0;

    let score = 0;
    const length = headline.length;

    // Length check (ideal: 50-120 characters)
    if (length >= 50 && length <= 120) score += 4;
    else if (length >= 30 && length < 50) score += 2;
    else if (length > 120) score += 1;

    // Contains keywords
    if (/\b(expert|specialist|manager|director|founder|lead)\b/i.test(headline))
      score += 2;

    // Contains value proposition
    if (/\b(help|helping|building|creating|driving|growing)\b/i.test(headline))
      score += 2;

    // Not generic
    if (!/^(seeking|looking for|open to)\b/i.test(headline)) score += 2;

    return Math.min(score, 10);
  }

  scoreAbout(about) {
    if (!about) return 0;

    let score = 0;
    const length = about.length;
    const wordCount = about.split(/\s+/).length;

    // Length check (ideal: 200-500 words)
    if (wordCount >= 200 && wordCount <= 500) score += 4;
    else if (wordCount >= 100 && wordCount < 200) score += 2;
    else if (wordCount > 0) score += 1;

    // Has storytelling elements
    if (/\b(I|my|journey|story|passion|experience)\b/i.test(about)) score += 2;

    // Has call to action
    if (/\b(reach out|contact|connect|email|message)\b/i.test(about))
      score += 2;

    // Has quantifiable achievements
    if (/\d+(%|x|\+|years|months|clients|projects)/i.test(about)) score += 2;

    return Math.min(score, 10);
  }

  scoreCompleteness(profile) {
    let score = 0;

    if (profile.headline) score += 2;
    if (profile.about && profile.about.length > 100) score += 3;
    if (profile.location) score += 1;
    if (profile.industry) score += 1;
    if (profile.experience) score += 2;
    if (profile.skills && profile.skills.length > 5) score += 1;

    return Math.min(score, 10);
  }

  scoreKeywords(profile) {
    const text = `${profile.headline || ""} ${
      profile.about || ""
    }`.toLowerCase();
    const importantKeywords = [
      "leadership",
      "management",
      "strategy",
      "growth",
      "innovation",
      "results",
      "team",
      "data",
      "digital",
      "technology",
    ];

    let keywordCount = 0;
    importantKeywords.forEach((keyword) => {
      if (text.includes(keyword)) keywordCount++;
    });

    return Math.min(keywordCount, 10);
  }

  scoreEngagement(profile) {
    let score = 5; // Base score

    // Has engaging headline
    if (profile.headline && profile.headline.length > 50) score += 2;

    // Has substantive about section
    if (profile.about && profile.about.length > 300) score += 2;

    // Has relevant skills
    if (profile.skills && profile.skills.length > 10) score += 1;

    return Math.min(score, 10);
  }

  /**
   * Generate AI-powered recommendations using Google Generative AI
   */
  async generateRecommendations(profileData, scores) {
    try {
      const prompt = `You are a TOP 1% LinkedIn growth strategist with 10+ years of experience optimizing profiles for executives, founders, and thought leaders. You understand the LinkedIn algorithm inside-out (2024 updates), SSI scoring, and what makes profiles rank #1 in recruiter/buyer searches.

📊 PROFILE TO ANALYZE:

Headline: ${profileData.headline || "❌ MISSING (CRITICAL!)"}
About: ${profileData.about || "❌ MISSING (CRITICAL!)"}
Industry: ${profileData.industry || "Unknown"}
Location: ${profileData.location || "Unknown"}
Skills: ${profileData.skills?.join(", ") || "None"}
Experience: ${profileData.experience || "Not provided"}

Current Scores:
- Headline: ${scores.headline}/10 | About: ${scores.about}/10 | Completeness: ${
        scores.completeness
      }/10
- Keywords: ${scores.keywords}/10 | Engagement: ${
        scores.engagement
      }/10 | **OVERALL: ${scores.overall}/100**

---

🎯 YOUR MISSION: Transform this into a TOP 1% LinkedIn profile that:
✅ Ranks #1 in recruiter/client searches
✅ Gets 10x more profile views
✅ Drives inbound opportunities daily
✅ Builds trust and authority instantly

🔥 LINKEDIN ALGORITHM SECRETS (Apply These):
1. **Keyword Density**: LinkedIn searches prioritize first 3-5 words in headline + about section
2. **SSI Score Boost**: Complete profiles with 10+ skills, custom URL, and rich media get priority
3. **Engagement Signals**: Profiles with recent activity (posts, comments) rank 5x higher
4. **Semantic Search**: Use BOTH role titles AND outcome/value keywords (not just job titles!)
5. **Mobile-First**: 60% of profile views are mobile - keep headlines concise, about sections scannable

📝 CRITICAL REQUIREMENTS:

**HEADLINES (3 options, each 80-120 chars):**
- Start with ROLE | VALUE PROPOSITION | KEY SKILL/NICHE
- Use power words: "Helping", "Building", "Scaling", "Driving", "Transforming"
- Include 1-2 niche keywords for SEO
- NO generic buzzwords ("passionate", "results-driven", "dedicated")
- Make it sound HUMAN, not corporate

**ABOUT SECTION (250-300 words, ultra-scannable):**
Structure:
1. **HOOK (1-2 sentences)**: Start with a bold statement or relatable problem
2. **CREDIBILITY (2-3 sentences)**: Years of experience, big wins, numbers/metrics
3. **VALUE (3-4 bullet points)**: What you help clients/teams achieve (be SPECIFIC)
4. **PERSONAL TOUCH (1-2 sentences)**: What drives you, unique perspective
5. **CTA (1 sentence)**: Clear next step (DM, email, book a call)

Write like a human having coffee with someone - NO corporate jargon, NO fluff!

**SKILLS (10 most relevant):**
- Mix of hard skills (technical) + soft skills (leadership, strategy)
- Prioritize skills with high search volume in ${
        profileData.industry || "your industry"
      }
- Skills that appear in job descriptions for senior roles

**SEO KEYWORDS (8-12):**
- Job titles people search for (e.g., "Senior Data Scientist", "Marketing Director")
- Industry terms (e.g., "SaaS Marketing", "Fintech", "AI/ML")
- Skill combinations (e.g., "Python + AWS", "Growth Marketing + Analytics")

**IMPROVEMENTS (5-7 actionable steps):**
- Each must be SPECIFIC and IMMEDIATELY ACTIONABLE (not vague advice)
- Explain exactly HOW to do it (step-by-step if needed)
- Quantify expected impact (e.g., "20% more views", "2x connection rate")
- Focus on LinkedIn algorithm hacks, not generic profile tips

**INDUSTRY INSIGHTS:**
- 3 REAL trends happening NOW in ${
        profileData.industry || "this industry"
      } (not generic BS)
- Specific opportunities for professionals in this field
- Tactical advice on how to stand out (not "be authentic" - give REAL tactics!)

---

🚨 CRITICAL: Return ONLY valid JSON (no markdown, no explanations):

{
  "headlines": [
    "Option 1 here (80-120 chars, starts with role|value|skill)",
    "Option 2 here (different angle, same format)",
    "Option 3 here (bold/unique, same format)"
  ],
  "aboutSection": "Full rewritten about section here (250-300 words, ultra-scannable with line breaks, NO corporate jargon, sounds like a real human)",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9", "skill10"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "improvements": [
    {
      "priority": "critical",
      "category": "headline",
      "suggestion": "EXACT step-by-step what to do (be ULTRA specific, include examples)",
      "expectedImpact": "Quantified result (e.g., '3x more recruiter searches')"
    }
  ],
  "industryInsights": {
    "trends": ["Real trend 1 happening NOW", "Real trend 2", "Real trend 3"],
    "opportunities": "Specific opportunities in this industry RIGHT NOW (2024)",
    "competitiveEdge": "TACTICAL advice to stand out (no fluff - real strategies!)"
  }
}

Make it SO GOOD that the person immediately feels the value and implements your suggestions today!`;

      // Use the correct Google AI method
      const response = await googleAI.generatePost(
        "LinkedIn profile optimization",
        prompt,
        {
          name: "LinkedIn Expert",
          tone: "professional",
          writingStyle: "analytical",
        }
      );

      console.log("✅ AI recommendations generated, parsing response...");

      // Parse AI response
      let recommendations;
      try {
        // The response from generatePost is an object with text property
        let textContent = response.text || response.content || JSON.stringify(response);

        console.log("📄 Raw AI response length:", textContent.length);
        console.log("📄 Raw AI response (first 500 chars):", textContent.substring(0, 500));

        // Remove markdown code blocks if present
        textContent = textContent
          .replace(/```json\n?/gi, "")
          .replace(/```\n?/g, "")
          .trim();

        // Try to extract JSON from response - look for the JSON object
        // Use a more robust pattern that handles nested structures
        let jsonMatch = textContent.match(/\{[\s\S]*\}/);
        
        // If no match, try to find JSON array or other JSON structures
        if (!jsonMatch) {
          jsonMatch = textContent.match(/\[[\s\S]*\]/);
        }
        
        if (!jsonMatch) {
          console.error("❌ No JSON structure found in response");
          console.error("❌ Response content:", textContent);
          throw new Error("No JSON found in AI response. The AI may not have returned valid JSON format.");
        }

        let jsonString = jsonMatch[0];

        // Try to fix common JSON issues
        // Remove trailing commas before closing brackets/braces
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix unescaped newlines in strings (replace literal \n with actual newline, but keep string context)
        // This is tricky - we need to be careful not to break valid JSON
        jsonString = jsonString.replace(/\\n/g, ' ');
        
        // Try to parse JSON
        try {
          recommendations = JSON.parse(jsonString);
          console.log("✅ Successfully parsed AI recommendations");
        } catch (jsonError) {
          console.error("❌ JSON parse error:", jsonError.message);
          
          // Get the problematic line for debugging
          const errorMatch = jsonError.message.match(/position (\d+)/);
          if (errorMatch) {
            const errorPos = parseInt(errorMatch[1]);
            const startPos = Math.max(0, errorPos - 200);
            const endPos = Math.min(jsonString.length, errorPos + 200);
            console.error("❌ Problematic JSON section:", jsonString.substring(startPos, endPos));
          }
          
          // Try more aggressive fixes
          try {
            // Remove comments
            let fixedJson = jsonString.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
            
            // Fix common JSON issues in arrays and objects
            // Fix trailing commas
            fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');
            
            // Try to fix unclosed strings (if there's a quote issue)
            // Count quotes and try to balance them
            const quoteCount = (fixedJson.match(/'/g) || []).length;
            if (quoteCount % 2 !== 0) {
              // Odd number of single quotes - try to replace single quotes with escaped double quotes in strings
              fixedJson = fixedJson.replace(/'/g, '\\"');
            }
            
            // Try parsing the fixed JSON
            recommendations = JSON.parse(fixedJson);
            console.log("✅ Successfully parsed AI recommendations after aggressive cleanup");
          } catch (secondError) {
            console.error("❌ Second JSON parse attempt also failed:", secondError.message);
            
            // Last resort: Try to extract just the essential parts using regex
            try {
              const headlinesMatch = jsonString.match(/"headlines"\s*:\s*\[(.*?)\]/s);
              const aboutMatch = jsonString.match(/"aboutSection"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
              const skillsMatch = jsonString.match(/"skills"\s*:\s*\[(.*?)\]/s);
              
              if (headlinesMatch || aboutMatch) {
                // Create a minimal valid JSON structure
                recommendations = {
                  headlines: headlinesMatch ? JSON.parse('[' + headlinesMatch[1] + ']') : [],
                  aboutSection: aboutMatch ? aboutMatch[1].replace(/\\"/g, '"') : '',
                  skills: skillsMatch ? JSON.parse('[' + skillsMatch[1] + ']') : [],
                  keywords: [],
                  improvements: [],
                  industryInsights: { trends: [], opportunities: '', competitiveEdge: '' }
                };
                console.log("✅ Created minimal recommendations from extracted data");
              } else {
                throw new Error("Could not extract any data from malformed JSON");
              }
            } catch (extractError) {
              console.error("❌ Could not extract data from malformed JSON:", extractError.message);
              throw new Error(`Failed to parse AI response as JSON: ${jsonError.message}. The AI may have returned malformed JSON.`);
            }
          }
        }
      } catch (parseError) {
        console.error("❌ AI response parsing failed:", parseError);
        throw new Error(`Failed to parse AI recommendations: ${parseError.message}`);
      }

      return recommendations;
    } catch (error) {
      console.error("❌ Recommendation generation error:", error.message);
      throw new Error(`Failed to generate recommendations: ${error.message}`);
    }
  }

  /**
   * Enhanced fallback recommendations with industry-specific insights
   */
  getFallbackRecommendations(profileData, scores) {
    const improvements = [];
    const industry = profileData.industry || "Professional Services";
    const experienceLevel = profileData.experienceLevel || "Mid-level";

    // Generate specific, actionable improvements
    if (scores.headline < 7) {
      improvements.push({
        priority: "high",
        category: "headline",
        suggestion: `Your headline needs optimization. Include: (1) Your role/title, (2) Key value you provide, (3) Industry expertise. Current headline scores ${scores.headline}/10. Target 80-120 characters with keywords like "${industry}".`,
        expectedImpact: "3x more profile views and better recruiter targeting",
      });
    }

    if (scores.about < 7) {
      improvements.push({
        priority: "high",
        category: "about",
        suggestion: `Rewrite your about section with this structure: Opening hook (2 sentences) → Your story/journey (3-4 sentences) → Key achievements with numbers (3-5 bullet points) → What makes you unique → Clear CTA. Current score: ${scores.about}/10.`,
        expectedImpact: "5x higher engagement and connection acceptance rate",
      });
    }

    if (scores.keywords < 5) {
      improvements.push({
        priority: "high",
        category: "keywords",
        suggestion: `Add ${industry}-specific keywords throughout your profile. Top keywords to include: ${this.getIndustryKeywords(
          industry
        )
          .slice(0, 5)
          .join(", ")}. Current keyword score: ${scores.keywords}/10.`,
        expectedImpact: "2x better search visibility and ranking",
      });
    }

    if (scores.completeness < 8) {
      improvements.push({
        priority: "medium",
        category: "completeness",
        suggestion:
          "Complete all profile sections: Add a professional photo, custom banner, featured section, skills (aim for 20+), accomplishments, and licenses/certifications.",
        expectedImpact:
          "LinkedIn algorithm favors complete profiles - expect 40% more visibility",
      });
    }

    if (scores.engagement < 7) {
      improvements.push({
        priority: "medium",
        category: "engagement",
        suggestion:
          "Boost engagement potential: (1) Post 2-3x per week, (2) Comment on 10+ posts daily, (3) Use carousel/video content, (4) Share personal stories and insights, not just articles.",
        expectedImpact: "Build thought leadership and 10x your network reach",
      });
    }

    improvements.push({
      priority: "medium",
      category: "networking",
      suggestion: `Connect with ${industry} leaders. Send 10-15 personalized connection requests daily. Join and participate in 5+ ${industry}-related LinkedIn groups.`,
      expectedImpact:
        "Expand your network by 500+ quality connections in 3 months",
    });

    improvements.push({
      priority: "low",
      category: "photo",
      suggestion:
        "Update your profile photo to a professional headshot with: good lighting, solid background, smiling face, business casual attire. Add a custom banner image related to your industry.",
      expectedImpact: "14x more profile views (LinkedIn data)",
    });

    // Industry-specific headline options
    const headlines = this.generateIndustryHeadlines(
      industry,
      experienceLevel,
      profileData
    );

    // Industry-specific about section
    const aboutSection = this.generateIndustryAboutSection(
      industry,
      experienceLevel,
      profileData
    );

    // Industry-specific skills
    const skills = this.getIndustrySkills(industry, experienceLevel);

    // Industry-specific keywords
    const keywords = this.getIndustryKeywords(industry);

    // Industry insights
    const industryInsights = this.getIndustryInsights(industry);

    return {
      headlines,
      aboutSection,
      skills,
      keywords,
      improvements,
      industryInsights,
    };
  }

  /**
   * Generate industry-specific headlines
   */
  generateIndustryHeadlines(industry, level, profile) {
    const name = profile.fullName || "Professional";
    const location = profile.location || "";

    const templates = {
      Technology: [
        `${level} ${industry} Leader | Building Scalable Solutions | ${location}`,
        `Software Engineer | Transforming Ideas into Code | AI & Cloud Expert`,
        `Tech Innovator | Driving Digital Transformation | Open to Opportunities`,
      ],
      Marketing: [
        `${industry} Strategist | Growing Brands Through Data-Driven Campaigns`,
        `Digital Marketing Expert | 3x ROI on Ad Spend | B2B/B2C Specialist`,
        `Growth Marketer | Helping Startups Scale | Content & SEO Expert`,
      ],
      Business: [
        `${level} Business Leader | Strategy & Operations | Driving 20%+ Growth`,
        `Management Consultant | Transforming Organizations | MBA | ${location}`,
        `Business Development Expert | Building Partnerships | Revenue Growth`,
      ],
      Sales: [
        `Top 10% Sales Leader | $5M+ Revenue Generated | B2B SaaS Specialist`,
        `Sales Executive | Closing 7-Figure Deals | Helping Teams Hit Quota`,
        `Enterprise Sales | Building Client Relationships | Consistent Achiever`,
      ],
      Finance: [
        `${industry} Professional | CFO Advisory | Strategic Financial Planning`,
        `Financial Analyst | Data-Driven Insights | Investment Strategy`,
        `Finance Leader | M&A Expert | Driving Business Value`,
      ],
      Healthcare: [
        `${industry} Professional | Improving Patient Outcomes | ${location}`,
        `Healthcare Leader | Clinical Excellence | Quality Improvement`,
        `Medical Professional | Evidence-Based Practice | Patient-Centered Care`,
      ],
      Education: [
        `Educator & Mentor | Inspiring Future Leaders | ${location}`,
        `${level} Education Professional | Curriculum Design | Student Success`,
        `Teacher & Coach | Building Confidence Through Learning`,
      ],
    };

    return (
      templates[industry] || [
        `${level} ${industry} Professional | Driving Results | ${location}`,
        `Experienced ${industry} Leader | Strategy & Execution | Let's Connect`,
        `${industry} Expert | Helping Organizations Succeed | Open to Connect`,
      ]
    );
  }

  /**
   * Generate industry-specific about section
   */
  generateIndustryAboutSection(industry, level, profile) {
    const sections = {
      Technology: `I'm a passionate technology professional with a track record of building innovative solutions that solve real problems.

🚀 What I Do:
• Design and develop scalable software systems
• Lead technical teams and drive product strategy
• Bridge the gap between business needs and technical execution

💡 My Approach:
I believe in clean code, continuous learning, and collaborative problem-solving. Whether it's architecting cloud infrastructure or mentoring junior developers, I focus on creating long-term value.

📊 Impact:
Throughout my career, I've helped companies accelerate their digital transformation, improve system performance by 3x+, and build engineering cultures that attract top talent.

🤝 Let's Connect:
I'm always interested in discussing technology trends, exploring new opportunities, and connecting with fellow innovators. Feel free to reach out!`,

      Marketing: `I help brands grow through data-driven marketing strategies that deliver real ROI.

🎯 My Expertise:
• Digital marketing strategy and execution
• Content marketing and SEO optimization
• Performance analytics and conversion optimization
• Brand positioning and messaging

📈 Track Record:
I've helped companies increase their online presence by 300%+, reduce customer acquisition costs by 40%, and build engaged communities that drive sustainable growth.

💪 My Philosophy:
Great marketing tells a story, solves a problem, and builds relationships. I combine creativity with analytics to create campaigns that resonate and convert.

🚀 Let's Collaborate:
Whether you're a startup looking to scale or an established brand seeking fresh perspectives, I'd love to connect and explore how we can create value together.`,

      Business: `I'm a strategic business leader focused on driving growth, operational excellence, and organizational transformation.

🎯 Core Competencies:
• Business strategy and market expansion
• Operations optimization and process improvement
• Team leadership and talent development
• P&L management and financial planning

📊 Proven Results:
I've led initiatives that delivered 20%+ revenue growth, improved operational efficiency by 30%, and built high-performing teams that consistently exceed targets.

💡 Leadership Philosophy:
I believe in empowering teams, making data-informed decisions, and creating sustainable competitive advantages through innovation and execution excellence.

🤝 Open to Connect:
I'm passionate about solving complex business challenges and mentoring the next generation of leaders. Let's connect and share insights!`,
    };

    return (
      sections[industry] ||
      `I'm a ${level.toLowerCase()} ${industry.toLowerCase()} professional with a passion for excellence and continuous improvement.

Throughout my career, I've focused on delivering results, building relationships, and creating value for organizations and teams I work with.

🎯 My Expertise:
• Strategic thinking and problem-solving
• Team collaboration and leadership
• Industry knowledge and best practices
• Continuous learning and adaptation

💪 My Approach:
I believe in combining analytical thinking with creative solutions. Whether working independently or as part of a team, I'm committed to achieving outstanding results.

📈 Professional Impact:
I've successfully contributed to projects that drive growth, improve efficiency, and create positive change within organizations.

🤝 Let's Connect:
I'm always open to connecting with fellow professionals, exploring new opportunities, and sharing insights. Feel free to reach out!`
    );
  }

  /**
   * Get industry-specific skills
   */
  getIndustrySkills(industry, level) {
    const skillSets = {
      Technology: [
        "Software Development",
        "Cloud Computing",
        "System Architecture",
        "Agile/Scrum",
        "DevOps",
        "API Design",
        "Database Management",
        "Cybersecurity",
        "AI/Machine Learning",
        "Technical Leadership",
      ],
      Marketing: [
        "Digital Marketing",
        "Content Strategy",
        "SEO/SEM",
        "Marketing Analytics",
        "Social Media Marketing",
        "Brand Management",
        "Campaign Management",
        "Marketing Automation",
        "Copywriting",
        "Growth Hacking",
      ],
      Business: [
        "Strategic Planning",
        "Business Development",
        "P&L Management",
        "Operations Management",
        "Change Management",
        "Stakeholder Management",
        "Financial Analysis",
        "Market Research",
        "Negotiation",
        "Executive Leadership",
      ],
      Sales: [
        "B2B Sales",
        "Enterprise Sales",
        "Account Management",
        "Sales Strategy",
        "CRM (Salesforce)",
        "Lead Generation",
        "Pipeline Management",
        "Consultative Selling",
        "Relationship Building",
        "Contract Negotiation",
      ],
      Finance: [
        "Financial Analysis",
        "Financial Modeling",
        "Budgeting & Forecasting",
        "Corporate Finance",
        "Risk Management",
        "Investment Analysis",
        "Financial Reporting",
        "M&A",
        "Excel/Financial Tools",
        "Strategic Planning",
      ],
      Healthcare: [
        "Patient Care",
        "Clinical Excellence",
        "Healthcare Management",
        "Medical Documentation",
        "HIPAA Compliance",
        "Quality Improvement",
        "Evidence-Based Practice",
        "Team Collaboration",
        "Patient Safety",
        "Healthcare Technology",
      ],
      Education: [
        "Curriculum Development",
        "Student Engagement",
        "Assessment & Evaluation",
        "Instructional Design",
        "Classroom Management",
        "Educational Technology",
        "Differentiated Instruction",
        "Mentoring",
        "Educational Leadership",
        "Learning Analytics",
      ],
    };

    return (
      skillSets[industry] || [
        "Leadership",
        "Strategic Thinking",
        "Communication",
        "Project Management",
        "Team Building",
        "Problem Solving",
        "Data Analysis",
        "Process Improvement",
        "Stakeholder Management",
        "Innovation",
      ]
    );
  }

  /**
   * Get industry-specific keywords
   */
  getIndustryKeywords(industry) {
    const keywordSets = {
      Technology: [
        "Software Engineer",
        "Full Stack",
        "Cloud",
        "DevOps",
        "Agile",
        "Tech Lead",
        "Solutions Architect",
        "API",
        "Microservices",
        "AI",
        "Data",
        "Innovation",
      ],
      Marketing: [
        "Digital Marketing",
        "Growth",
        "SEO",
        "Content Marketing",
        "Brand Strategy",
        "Marketing Analytics",
        "Social Media",
        "Campaigns",
        "ROI",
        "Lead Generation",
        "Conversion Optimization",
      ],
      Business: [
        "Business Strategy",
        "Leadership",
        "Operations",
        "Growth",
        "P&L",
        "Management",
        "Transformation",
        "Innovation",
        "Execution",
        "Strategic Planning",
        "Business Development",
      ],
      Sales: [
        "Sales Leadership",
        "B2B",
        "Enterprise Sales",
        "Revenue Growth",
        "Account Executive",
        "Sales Strategy",
        "Quota Attainment",
        "Pipeline",
        "Client Relationships",
        "Deal Closing",
      ],
      Finance: [
        "Financial Analysis",
        "CFO",
        "Finance",
        "Investment",
        "M&A",
        "Financial Modeling",
        "Corporate Finance",
        "FP&A",
        "Strategic Finance",
        "Risk Management",
      ],
      Healthcare: [
        "Healthcare",
        "Patient Care",
        "Clinical",
        "Medical",
        "Healthcare Management",
        "Quality Improvement",
        "Patient Safety",
        "Healthcare IT",
        "Compliance",
      ],
      Education: [
        "Education",
        "Teaching",
        "Learning",
        "Curriculum",
        "Student Success",
        "Educational Leadership",
        "Instructional Design",
        "EdTech",
        "Assessment",
        "Mentoring",
      ],
    };

    return (
      keywordSets[industry] || [
        "Professional",
        "Leadership",
        "Strategy",
        "Management",
        "Innovation",
        "Excellence",
        "Results-Driven",
        "Team Player",
        "Growth",
        "Industry Expert",
      ]
    );
  }

  /**
   * Get industry-specific insights
   */
  getIndustryInsights(industry) {
    const insights = {
      Technology: {
        trends: [
          "AI & Machine Learning adoption accelerating",
          "Cloud-native architectures becoming standard",
          "DevSecOps and security-first development",
          "Low-code/no-code platforms growing",
          "Remote-first engineering teams",
        ],
        opportunities:
          "High demand for full-stack developers with cloud expertise. Specialize in AI/ML, cybersecurity, or cloud architecture for premium opportunities.",
        competitiveEdge:
          "Build in public, contribute to open source, create technical content, and showcase real projects. Certifications in AWS/Azure/GCP highly valued.",
      },
      Marketing: {
        trends: [
          "AI-powered marketing automation",
          "Short-form video content dominance",
          "Privacy-first marketing strategies",
          "Influencer marketing maturation",
          "Personalization at scale",
        ],
        opportunities:
          "Growth marketing roles in B2B SaaS are booming. Performance marketing with strong analytics skills commands premium salaries.",
        competitiveEdge:
          "Demonstrate ROI with case studies, build your personal brand on LinkedIn/Twitter, stay ahead with emerging platforms, and master marketing analytics.",
      },
      Business: {
        trends: [
          "Digital transformation acceleration",
          "Sustainable business practices",
          "Remote/hybrid work models",
          "Data-driven decision making",
          "Agile organization structures",
        ],
        opportunities:
          "Strategy consulting, digital transformation leadership, and interim executive roles are in high demand.",
        competitiveEdge:
          "Get an MBA or executive education, build a strong professional network, publish thought leadership content, and develop cross-functional expertise.",
      },
    };

    return (
      insights[industry] || {
        trends: [
          "Digital transformation",
          "Remote work",
          "Sustainability focus",
          "Data-driven decisions",
          "Innovation imperative",
        ],
        opportunities:
          "Focus on developing in-demand skills, building your professional network, and staying current with industry trends.",
        competitiveEdge:
          "Continuous learning, thought leadership, strong professional brand, and demonstrable results will set you apart.",
      }
    );
  }

  /**
   * Get analysis history for user
   */
  async getAnalysisHistory(userId, limit = 10) {
    try {
      const analyses = await ProfileAnalysis.find({ userId })
        .sort({ analyzedAt: -1 })
        .limit(limit)
        .select("-__v");

      return {
        success: true,
        data: analyses,
      };
    } catch (error) {
      console.error("❌ Error fetching analysis history:", error);
      throw error;
    }
  }


  /**
   * Format Google search result to our profile data structure
   */
  formatGoogleSearchProfile(googleResult, username) {
    const snippet = googleResult.snippet || googleResult.description || '';
    const title = googleResult.title || '';
    const link = googleResult.link || '';

    // Extract name from title
    let name = title.replace(/ \| LinkedIn$/, '').replace(/ on LinkedIn$/, '').trim();
    if (!name || name.length < 2) {
      const linkMatch = link.match(/linkedin\.com\/in\/([^\/\?]+)/i);
      if (linkMatch && linkMatch[1]) {
        name = linkMatch[1].replace(/-/g, ' ').replace(/_/g, ' ');
        name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
      } else {
        name = username;
      }
    }

    // Extract headline
    let headline = name;
    if (title && title.includes('|')) {
      const parts = title.split('|');
      if (parts.length > 1) {
        headline = parts.slice(1).join('|').trim();
      }
    }

    if (headline === name || headline.length < 5) {
      const headlineMatch = snippet.match(/^([^•\n]+)/);
      if (headlineMatch && headlineMatch[1].trim().length > 5) {
        headline = headlineMatch[1].trim();
      }
    }

    // Extract about/summary
    const about = snippet || '';

    // Extract experience from snippet
    const experience = this.extractExperienceFromSnippet(snippet);

    // Extract skills from snippet
    const skills = this.extractSkillsFromSnippet(snippet);

    const profileData = {
      name: name || username,
      headline: headline, // NO FALLBACK - must be real extracted data
      summary: about, // NO FALLBACK - must be real extracted data
      location: this.extractLocationFromSnippet(snippet),
      experience: experience,
      education: [],
      skills: skills,
      industry: '',
      connections: 0,
      profilePicture: '',
      bannerImage: '',
    };

    // Validate that we have REAL data - NO FALLBACKS or placeholder data
    if (!profileData.headline || profileData.headline.length < 10) {
      throw new Error("Profile headline is missing or too short from search results. The profile may be incomplete or private.");
    }

    if (!profileData.summary || profileData.summary.length < 30) {
      throw new Error("Profile about section is missing or too short from search results. The profile may be incomplete or private.");
    }

    if (!profileData.name || profileData.name.length < 2) {
      throw new Error("Profile name could not be extracted from search results. The profile may not exist or may be private.");
    }

    console.log("✅ Formatted Google search profile data:", {
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
   * Extract experience information from snippet
   */
  extractExperienceFromSnippet(snippet) {
    const experience = [];

    const experiencePatterns = [
      /(?:Intern|Software Engineer|Developer|Manager|Analyst|Designer|Consultant|Engineer|Specialist|Coordinator|Associate|Assistant|Lead|Senior|Junior|Executive|Director|VP|CEO|CTO|CFO|Founder|Co-founder)\s+(?:at|@|for)\s+([^•\n,]+)/gi,
      /(?:Currently|Previously|Formerly)\s+(?:a|an|the)?\s*([^•\n]+?)(?:\s+at|\s+@|\s+for|\s*$)/gi,
    ];

    for (const pattern of experiencePatterns) {
      const matches = snippet.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim()) {
          const roleCompany = match[0].trim();
          const roleMatch = roleCompany.match(/^([^@at]+?)(?:\s+(?:at|@|for)\s+)(.+)$/i);
          if (roleMatch) {
            experience.push({
              title: roleMatch[1].trim(),
              company: roleMatch[2].trim(),
              description: '',
              duration: '',
            });
          } else {
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
   * Extract skills from snippet
   */
  extractSkillsFromSnippet(snippet) {
    const skills = [];

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
   * Extract location from snippet
   */
  extractLocationFromSnippet(snippet) {
    // Common patterns: "Location: City, Country" or "Based in City"
    const locationPatterns = [
      /(?:Location|Based in|Lives in|Located in)[:\s]+([^•\n,]+(?:,\s*[^•\n]+)?)/i,
      /([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?)\s*(?:•|$)/,
    ];

    for (const pattern of locationPatterns) {
      const match = snippet.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }
}

export default new ProfileAnalyzer();

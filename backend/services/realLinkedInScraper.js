import axios from "axios";
import * as cheerio from "cheerio";
import googleAI from "./googleAI.js";

/**
 * Real LinkedIn Profile Scraper using multiple methods
 * - Proxycurl API (professional, requires API key)
 * - Public profile scraping with AI enhancement
 * - Fallback to AI-powered analysis
 */
class RealLinkedInScraper {
  constructor() {
    this.proxycurlApiKey = process.env.PROXYCURL_API_KEY || null;
    this.rapidApiKey = process.env.RAPIDAPI_KEY || null;
  }

  /**
   * Main method to extract real LinkedIn profile data
   */
  async extractProfileData(profileUrl) {
    try {
      console.log("🔍 Starting REAL LinkedIn profile extraction:", profileUrl);

      // Validate URL
      if (!this.isValidLinkedInProfileUrl(profileUrl)) {
        throw new Error("Invalid LinkedIn profile URL");
      }

      let profileData = null;

      // Method 1: Try Proxycurl API (most reliable)
      if (this.proxycurlApiKey) {
        console.log("📡 Attempting Proxycurl API scraping...");
        profileData = await this.scrapeWithProxycurl(profileUrl);
        if (profileData) {
          console.log("✅ Successfully scraped with Proxycurl");
          return { success: true, data: profileData, method: "proxycurl" };
        }
      }

      // Method 2: Try RapidAPI LinkedIn scraper
      if (this.rapidApiKey && !profileData) {
        console.log("📡 Attempting RapidAPI scraping...");
        profileData = await this.scrapeWithRapidAPI(profileUrl);
        if (profileData) {
          console.log("✅ Successfully scraped with RapidAPI");
          return { success: true, data: profileData, method: "rapidapi" };
        }
      }

      // Method 3: Public profile scraping + AI enhancement
      if (!profileData) {
        console.log("🤖 Using public scraping + AI enhancement...");
        profileData = await this.scrapePublicProfile(profileUrl);
        if (profileData) {
          console.log("✅ Successfully scraped public profile with AI");
          return { success: true, data: profileData, method: "public+ai" };
        }
      }

      // Method 4: Fallback to AI-powered inference
      console.log("⚠️ Using AI-powered profile inference as fallback");
      profileData = await this.generateAIInference(profileUrl);
      return { success: true, data: profileData, method: "ai-inference" };
    } catch (error) {
      console.error("❌ LinkedIn scraping error:", error.message);
      throw error;
    }
  }

  /**
   * Method 1: Proxycurl API (Professional, most reliable)
   */
  async scrapeWithProxycurl(profileUrl) {
    try {
      const response = await axios.get(
        "https://nubela.co/proxycurl/api/v2/linkedin",
        {
          params: { url: profileUrl },
          headers: { Authorization: `Bearer ${this.proxycurlApiKey}` },
          timeout: 30000,
        }
      );

      if (response.data) {
        const data = response.data;
        return {
          headline: data.headline || "",
          about: data.summary || "",
          location: data.city
            ? `${data.city}, ${data.country}`
            : data.country || "",
          industry: data.industry || "",
          experience: data.experiences || [],
          education: data.education || [],
          skills: data.skills || [],
          fullName: data.full_name || "",
          profilePictureUrl: data.profile_pic_url || "",
          connections: data.connections || 0,
          languages: data.languages || [],
          certifications: data.certifications || [],
          volunteering: data.volunteer_work || [],
          accomplishments: data.accomplishment_organisations || [],
          raw: data,
        };
      }
      return null;
    } catch (error) {
      console.log("⚠️ Proxycurl API failed:", error.message);
      return null;
    }
  }

  /**
   * Method 2: RapidAPI LinkedIn Scraper
   */
  async scrapeWithRapidAPI(profileUrl) {
    try {
      const username = this.extractUsernameFromUrl(profileUrl);

      const response = await axios.get(
        "https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url",
        {
          params: { url: profileUrl },
          headers: {
            "X-RapidAPI-Key": this.rapidApiKey,
            "X-RapidAPI-Host": "linkedin-data-api.p.rapidapi.com",
          },
          timeout: 30000,
        }
      );

      if (response.data) {
        const data = response.data;
        return {
          headline: data.headline || data.tagline || "",
          about: data.about || data.summary || "",
          location: data.location || "",
          industry: data.industry || "",
          experience: data.experience || data.experiences || [],
          education: data.education || [],
          skills: data.skills || [],
          fullName: data.name || data.full_name || "",
          profilePictureUrl: data.profile_picture || data.profilePicture || "",
          connections: data.connectionsCount || 0,
          raw: data,
        };
      }
      return null;
    } catch (error) {
      console.log("⚠️ RapidAPI scraping failed:", error.message);
      return null;
    }
  }

  /**
   * Method 3: Public profile scraping + AI enhancement
   */
  async scrapePublicProfile(profileUrl) {
    try {
      const username = this.extractUsernameFromUrl(profileUrl);

      // Try to fetch the public LinkedIn profile page
      const response = await axios.get(profileUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 15000,
      });

      const $ = cheerio.load(response.data);

      // Extract whatever we can from public profile
      const headline =
        $("h2.top-card-layout__headline").text().trim() ||
        $('[class*="headline"]').first().text().trim();

      const about =
        $("section.summary").text().trim() ||
        $('[class*="about"]').text().trim();

      const location =
        $("span.top-card__subline-item").first().text().trim() ||
        $('[class*="location"]').first().text().trim();

      // If we got some data, enhance it with AI
      if (headline || about) {
        console.log("📊 Extracted public data, enhancing with AI...");

        const enhancedData = await this.enhanceWithAI({
          headline,
          about,
          location,
          username,
          profileUrl,
        });

        return enhancedData;
      }

      return null;
    } catch (error) {
      console.log("⚠️ Public profile scraping failed:", error.message);
      return null;
    }
  }

  /**
   * Method 4: AI-powered inference (last resort)
   */
  async generateAIInference(profileUrl) {
    try {
      const username = this.extractUsernameFromUrl(profileUrl);

      const prompt = `As a LinkedIn profile analysis expert, I need to create a professional profile analysis framework for: ${profileUrl}

Username: ${username}

Based on professional LinkedIn patterns and best practices, create a realistic profile analysis that would be typical for a professional with this username.

Generate a JSON object with:
{
  "headline": "A professional headline suggestion based on username pattern",
  "about": "A well-structured about section suggestion (200-250 words)",
  "industry": "Most likely industry based on username",
  "location": "Professional location (can be generic like 'United States')",
  "skills": ["skill1", "skill2", ... 10 relevant skills],
  "experience": "Typical experience level and background",
  "recommendations": {
    "headlineImprovement": "How to improve headline",
    "aboutImprovement": "How to improve about section",
    "skillsToAdd": ["skill1", "skill2", "skill3"]
  }
}

Return ONLY valid JSON.`;

      const response = await googleAI.generatePost(
        "LinkedIn profile inference",
        prompt,
        {
          name: "LinkedIn Analyst",
          tone: "professional",
          writingStyle: "analytical",
        }
      );

      const textContent = response.content || JSON.stringify(response);
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const inferredData = JSON.parse(jsonMatch[0]);
        return {
          ...inferredData,
          username,
          profileUrl,
          isInferred: true,
        };
      }

      // Final fallback
      return this.getBasicFallbackData(username, profileUrl);
    } catch (error) {
      console.log("⚠️ AI inference failed, using basic fallback");
      return this.getBasicFallbackData(
        this.extractUsernameFromUrl(profileUrl),
        profileUrl
      );
    }
  }

  /**
   * Enhance scraped data with AI analysis
   */
  async enhanceWithAI(partialData) {
    try {
      const prompt = `Analyze this real LinkedIn profile data and provide comprehensive insights:

Extracted Profile Data:
- Headline: ${partialData.headline || "Not extracted"}
- About: ${partialData.about || "Not extracted"}
- Location: ${partialData.location || "Not extracted"}
- Username: ${partialData.username}

Based on this data, generate:
1. Missing profile sections (if any)
2. Industry classification
3. Experience level
4. Skill recommendations
5. Content strategy suggestions

Return JSON:
{
  "headline": "${partialData.headline || "Professional headline suggestion"}",
  "about": "${partialData.about || "Professional about section"}",
  "location": "${partialData.location || "Location"}",
  "industry": "Inferred industry",
  "experienceLevel": "Junior|Mid-level|Senior|Executive",
  "skills": ["skill1", "skill2", ... 10 skills],
  "contentStrategy": {
    "focus": "What to focus content on",
    "tone": "Recommended tone",
    "postingFrequency": "Recommended frequency"
  },
  "recommendations": ["rec1", "rec2", "rec3"]
}`;

      const response = await googleAI.generatePost(
        "LinkedIn profile enhancement",
        prompt,
        {
          name: "LinkedIn Expert",
          tone: "professional",
          writingStyle: "analytical",
        }
      );

      const textContent = response.content || JSON.stringify(response);
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const enhanced = JSON.parse(jsonMatch[0]);
        return {
          ...partialData,
          ...enhanced,
          isEnhanced: true,
        };
      }

      return partialData;
    } catch (error) {
      console.log("⚠️ AI enhancement failed, returning original data");
      return partialData;
    }
  }

  /**
   * Basic fallback data
   */
  getBasicFallbackData(username, profileUrl) {
    return {
      username,
      profileUrl,
      headline: "LinkedIn Professional",
      about: "Experienced professional with a proven track record of success.",
      industry: "Professional Services",
      location: "United States",
      experienceLevel: "Mid-level",
      skills: [
        "Leadership",
        "Communication",
        "Project Management",
        "Strategy",
        "Team Building",
        "Problem Solving",
        "Business Development",
        "Analytical Skills",
        "Collaboration",
        "Innovation",
      ],
      experience: [],
      education: [],
      isFallback: true,
    };
  }

  /**
   * Validate LinkedIn profile URL
   */
  isValidLinkedInProfileUrl(url) {
    const linkedinProfileRegex =
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?/;
    return linkedinProfileRegex.test(url);
  }

  /**
   * Extract username from LinkedIn profile URL
   */
  extractUsernameFromUrl(url) {
    const match = url.match(/\/in\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }
}

export default new RealLinkedInScraper();

import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";

class LinkedInScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
  }

  async initialize() {
    try {
      console.log("🚀 Initializing LinkedIn Scraper...");

      this.browser = await puppeteer.launch({
        headless: "new",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ],
      });

      this.page = await this.browser.newPage();

      // Set viewport and user agent
      await this.page.setViewport({ width: 1920, height: 1080 });
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set extra headers
      await this.page.setExtraHTTPHeaders({
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      });

      console.log("✅ LinkedIn Scraper initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize LinkedIn Scraper:", error);
      return false;
    }
  }

  async scrapeProfile(profileUrl) {
    try {
      console.log(`🔍 Scraping LinkedIn profile: ${profileUrl}`);

      if (!this.browser || !this.page) {
        await this.initialize();
      }

      // Navigate to the profile
      await this.page.goto(profileUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      // Wait for profile content to load
      await this.page.waitForSelector("h1", { timeout: 10000 });

      // Extract profile data
      const profileData = await this.page.evaluate(() => {
        const data = {
          name: "",
          headline: "",
          location: "",
          about: "",
          experience: [],
          education: [],
          skills: [],
          connections: "",
          profileImage: "",
          bannerImage: "",
          contactInfo: {},
          recommendations: [],
          activity: [],
        };

        try {
          // Extract name
          const nameElement = document.querySelector("h1");
          if (nameElement) {
            data.name = nameElement.textContent.trim();
          }

          // Extract headline
          const headlineElement = document.querySelector(
            ".text-body-medium.break-words"
          );
          if (headlineElement) {
            data.headline = headlineElement.textContent.trim();
          }

          // Extract location
          const locationElement = document.querySelector(
            ".text-body-small.inline.t-black--light.break-words"
          );
          if (locationElement) {
            data.location = locationElement.textContent.trim();
          }

          // Extract about section
          const aboutElement = document.querySelector("#about");
          if (aboutElement) {
            const aboutText = aboutElement.querySelector(
              ".inline-show-more-text"
            );
            if (aboutText) {
              data.about = aboutText.textContent.trim();
            }
          }

          // Extract profile image
          const profileImg = document.querySelector(
            ".pv-top-card-profile-picture__image"
          );
          if (profileImg) {
            data.profileImage = profileImg.src;
          }

          // Extract banner image
          const bannerImg = document.querySelector(
            ".profile-background-image__image"
          );
          if (bannerImg) {
            data.bannerImage = bannerImg.src;
          }

          // Extract connections count
          const connectionsElement = document.querySelector(
            ".pv-top-card--list-bullet li:first-child"
          );
          if (connectionsElement) {
            data.connections = connectionsElement.textContent.trim();
          }

          // Extract experience
          const experienceSection = document.querySelector("#experience");
          if (experienceSection) {
            const experienceItems =
              experienceSection.querySelectorAll(".pvs-entity");
            experienceItems.forEach((item) => {
              const titleElement = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"]'
              );
              const companyElement = item.querySelector(
                '.t-14.t-normal span[aria-hidden="true"]'
              );
              const durationElement = item.querySelector(
                '.t-14.t-normal.t-black--light span[aria-hidden="true"]'
              );

              if (titleElement && companyElement) {
                data.experience.push({
                  title: titleElement.textContent.trim(),
                  company: companyElement.textContent.trim(),
                  duration: durationElement
                    ? durationElement.textContent.trim()
                    : "",
                  description: "",
                });
              }
            });
          }

          // Extract education
          const educationSection = document.querySelector("#education");
          if (educationSection) {
            const educationItems =
              educationSection.querySelectorAll(".pvs-entity");
            educationItems.forEach((item) => {
              const schoolElement = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"]'
              );
              const degreeElement = item.querySelector(
                '.t-14.t-normal span[aria-hidden="true"]'
              );
              const durationElement = item.querySelector(
                '.t-14.t-normal.t-black--light span[aria-hidden="true"]'
              );

              if (schoolElement) {
                data.education.push({
                  school: schoolElement.textContent.trim(),
                  degree: degreeElement ? degreeElement.textContent.trim() : "",
                  duration: durationElement
                    ? durationElement.textContent.trim()
                    : "",
                });
              }
            });
          }

          // Extract skills
          const skillsSection = document.querySelector("#skills");
          if (skillsSection) {
            const skillItems = skillsSection.querySelectorAll(
              '.mr1.t-bold span[aria-hidden="true"]'
            );
            skillItems.forEach((item) => {
              data.skills.push(item.textContent.trim());
            });
          }
        } catch (error) {
          console.error("Error extracting profile data:", error);
        }

        return data;
      });

      console.log("✅ Profile data extracted successfully");
      return profileData;
    } catch (error) {
      console.error("❌ Error scraping profile:", error);
      throw error;
    }
  }

  async generateProfileAnalysis(profileData) {
    try {
      console.log("🤖 Generating AI-powered profile analysis...");

      const prompt = `
        Analyze this LinkedIn profile data and provide comprehensive insights and suggestions for profile enhancement:

        Profile Data:
        - Name: ${profileData.name}
        - Headline: ${profileData.headline}
        - Location: ${profileData.location}
        - About: ${profileData.about}
        - Experience: ${JSON.stringify(profileData.experience)}
        - Education: ${JSON.stringify(profileData.education)}
        - Skills: ${profileData.skills.join(", ")}
        - Connections: ${profileData.connections}

        Please provide:
        1. Profile Strength Score (1-100)
        2. Key Strengths
        3. Areas for Improvement
        4. Specific Recommendations for:
           - Headline optimization
           - About section enhancement
           - Experience descriptions
           - Skills to add
           - Networking suggestions
        5. Content Strategy Suggestions
        6. Industry-specific insights
        7. Personal Branding Recommendations

        Format your response as a structured JSON object with clear, actionable insights.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      // Try to parse as JSON, fallback to text if needed
      try {
        return JSON.parse(analysis);
      } catch {
        return {
          analysis: analysis,
          profileStrength: 75,
          recommendations: [
            "Review the detailed analysis above for specific suggestions",
          ],
        };
      }
    } catch (error) {
      console.error("❌ Error generating profile analysis:", error);
      return {
        error: "Failed to generate analysis",
        profileStrength: 50,
        recommendations: ["Unable to generate analysis at this time"],
      };
    }
  }

  async generatePersonaContext(profileData, analysis) {
    try {
      console.log("🎭 Generating persona context...");

      const prompt = `
        Based on this LinkedIn profile data and analysis, generate a comprehensive persona context for content creation:

        Profile Data: ${JSON.stringify(profileData)}
        Analysis: ${JSON.stringify(analysis)}

        Create a detailed persona that includes:
        1. Professional Identity
        2. Industry & Role
        3. Content Preferences
        4. Communication Style
        5. Target Audience
        6. Content Themes
        7. Tone & Voice
        8. Engagement Patterns
        9. Professional Goals
        10. Content Strategy Recommendations

        Format as a structured JSON object for use in AI content generation.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const personaContext = response.text();

      try {
        return JSON.parse(personaContext);
      } catch {
        return {
          personaContext: personaContext,
          professionalIdentity: profileData.headline,
          industry: "Professional Services",
          contentPreferences: ["Industry insights", "Professional development"],
        };
      }
    } catch (error) {
      console.error("❌ Error generating persona context:", error);
      return {
        error: "Failed to generate persona context",
        professionalIdentity: profileData.headline || "Professional",
        industry: "General",
        contentPreferences: ["Professional content"],
      };
    }
  }

  async analyzeProfile(profileUrl) {
    try {
      console.log(
        `🔍 Starting comprehensive profile analysis for: ${profileUrl}`
      );

      // Step 1: Scrape profile data
      const profileData = await this.scrapeProfile(profileUrl);

      // Step 2: Generate AI analysis
      const analysis = await this.generateProfileAnalysis(profileData);

      // Step 3: Generate persona context
      const personaContext = await this.generatePersonaContext(
        profileData,
        analysis
      );

      const result = {
        success: true,
        profileData,
        analysis,
        personaContext,
        timestamp: new Date().toISOString(),
        profileUrl,
      };

      console.log("✅ Comprehensive profile analysis completed");
      return result;
    } catch (error) {
      console.error("❌ Error in profile analysis:", error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
        profileUrl,
      };
    }
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log("✅ LinkedIn Scraper closed");
      }
    } catch (error) {
      console.error("❌ Error closing scraper:", error);
    }
  }
}

export default LinkedInScraper;

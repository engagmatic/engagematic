import puppeteer from "puppeteer";
import { GoogleGenerativeAI } from "@google/generative-ai";

class LinkedInProfileAnalyzer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async initialize() {
    try {
      console.log("🚀 Initializing LinkedIn Profile Analyzer...");

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

      console.log("✅ LinkedIn Profile Analyzer initialized successfully");
      return true;
    } catch (error) {
      console.error(
        "❌ Failed to initialize LinkedIn Profile Analyzer:",
        error
      );
      return false;
    }
  }

  async scanProfile(profileUrl) {
    try {
      console.log(`🔍 Scanning LinkedIn profile: ${profileUrl}`);

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

      // Comprehensive profile data extraction
      const profileData = await this.page.evaluate(() => {
        const data = {
          // Basic Information
          name: "",
          headline: "",
          location: "",
          about: "",
          profileImage: "",
          bannerImage: "",

          // Professional Information
          experience: [],
          education: [],
          skills: [],
          endorsements: [],
          certifications: [],
          languages: [],
          volunteerExperience: [],

          // Network & Engagement
          connections: "",
          followers: "",
          recommendations: [],
          recentActivity: [],

          // Contact & Additional Info
          contactInfo: {},
          interests: [],
          accomplishments: [],

          // Profile Completeness
          profileCompleteness: {
            hasProfileImage: false,
            hasBannerImage: false,
            hasAbout: false,
            hasExperience: false,
            hasEducation: false,
            hasSkills: false,
            hasRecommendations: false,
            completenessScore: 0,
          },
        };

        try {
          // Extract name
          const nameElement = document.querySelector("h1");
          if (nameElement) {
            data.name = nameElement.textContent.trim();
          }

          // Extract headline with multiple selectors
          const headlineSelectors = [
            ".text-body-medium.break-words",
            ".pv-text-details__left-panel h2",
            ".top-card-layout__headline",
            ".pv-top-card--list-bullet .text-body-medium",
          ];

          for (const selector of headlineSelectors) {
            const headlineElement = document.querySelector(selector);
            if (headlineElement && headlineElement.textContent.trim()) {
              data.headline = headlineElement.textContent.trim();
              break;
            }
          }

          // Extract location with multiple selectors
          const locationSelectors = [
            ".text-body-small.inline.t-black--light.break-words",
            ".pv-text-details__left-panel .text-body-small",
            ".top-card-layout__first-subline",
            ".pv-top-card--list-bullet .text-body-small",
          ];

          for (const selector of locationSelectors) {
            const locationElement = document.querySelector(selector);
            if (locationElement && locationElement.textContent.trim()) {
              data.location = locationElement.textContent.trim();
              break;
            }
          }

          // Extract about section
          const aboutElement = document.querySelector("#about");
          if (aboutElement) {
            const aboutText =
              aboutElement.querySelector(".inline-show-more-text") ||
              aboutElement.querySelector(".pv-about__summary-text") ||
              aboutElement.querySelector(".break-words");
            if (aboutText) {
              data.about = aboutText.textContent.trim();
            }
          }

          // Extract profile image
          const profileImgSelectors = [
            ".pv-top-card-profile-picture__image",
            ".profile-photo-edit__preview",
            ".presence-entity__image",
          ];

          for (const selector of profileImgSelectors) {
            const profileImg = document.querySelector(selector);
            if (profileImg && profileImg.src) {
              data.profileImage = profileImg.src;
              break;
            }
          }

          // Extract banner image
          const bannerImg = document.querySelector(
            ".profile-background-image__image"
          );
          if (bannerImg) {
            data.bannerImage = bannerImg.src;
          }

          // Extract connections count
          const connectionsSelectors = [
            ".pv-top-card--list-bullet li:first-child",
            ".top-card-layout__first-subline",
            ".pv-top-card--list-bullet .text-body-small",
          ];

          for (const selector of connectionsSelectors) {
            const connectionsElement = document.querySelector(selector);
            if (
              connectionsElement &&
              connectionsElement.textContent.includes("connection")
            ) {
              data.connections = connectionsElement.textContent.trim();
              break;
            }
          }

          // Extract experience with enhanced selectors
          const experienceSection = document.querySelector("#experience");
          if (experienceSection) {
            const experienceItems = experienceSection.querySelectorAll(
              ".pvs-entity, .pv-entity__summary-info"
            );
            experienceItems.forEach((item) => {
              const titleElement = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"], .pv-entity__summary-info h3'
              );
              const companyElement = item.querySelector(
                '.t-14.t-normal span[aria-hidden="true"], .pv-entity__summary-info .pv-entity__secondary-title'
              );
              const durationElement = item.querySelector(
                '.t-14.t-normal.t-black--light span[aria-hidden="true"], .pv-entity__summary-info .pv-entity__dates'
              );
              const descriptionElement = item.querySelector(
                ".pv-entity__description, .show-more-less-text"
              );

              if (titleElement && companyElement) {
                data.experience.push({
                  title: titleElement.textContent.trim(),
                  company: companyElement.textContent.trim(),
                  duration: durationElement
                    ? durationElement.textContent.trim()
                    : "",
                  description: descriptionElement
                    ? descriptionElement.textContent.trim()
                    : "",
                  location: "",
                });
              }
            });
          }

          // Extract education
          const educationSection = document.querySelector("#education");
          if (educationSection) {
            const educationItems = educationSection.querySelectorAll(
              ".pvs-entity, .pv-entity__summary-info"
            );
            educationItems.forEach((item) => {
              const schoolElement = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"], .pv-entity__summary-info h3'
              );
              const degreeElement = item.querySelector(
                '.t-14.t-normal span[aria-hidden="true"], .pv-entity__summary-info .pv-entity__secondary-title'
              );
              const durationElement = item.querySelector(
                '.t-14.t-normal.t-black--light span[aria-hidden="true"], .pv-entity__summary-info .pv-entity__dates'
              );

              if (schoolElement) {
                data.education.push({
                  school: schoolElement.textContent.trim(),
                  degree: degreeElement ? degreeElement.textContent.trim() : "",
                  duration: durationElement
                    ? durationElement.textContent.trim()
                    : "",
                  description: "",
                });
              }
            });
          }

          // Extract skills with endorsements
          const skillsSection = document.querySelector("#skills");
          if (skillsSection) {
            const skillItems = skillsSection.querySelectorAll(
              ".pvs-entity, .pv-skill-category-entity"
            );
            skillItems.forEach((item) => {
              const skillElement = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"], .pv-skill-category-entity__name'
              );
              const endorsementElement = item.querySelector(
                ".pv-skill-category-entity__endorsement-count"
              );

              if (skillElement) {
                data.skills.push({
                  name: skillElement.textContent.trim(),
                  endorsements: endorsementElement
                    ? endorsementElement.textContent.trim()
                    : "0",
                });
              }
            });
          }

          // Extract recommendations
          const recommendationsSection =
            document.querySelector("#recommendations");
          if (recommendationsSection) {
            const recommendationItems =
              recommendationsSection.querySelectorAll(".pvs-entity");
            recommendationItems.forEach((item) => {
              const recommenderElement = item.querySelector(
                '.mr1.t-bold span[aria-hidden="true"]'
              );
              const recommendationTextElement = item.querySelector(
                ".pv-entity__description"
              );

              if (recommenderElement && recommendationTextElement) {
                data.recommendations.push({
                  recommender: recommenderElement.textContent.trim(),
                  text: recommendationTextElement.textContent.trim(),
                });
              }
            });
          }

          // Calculate profile completeness
          data.profileCompleteness = {
            hasProfileImage: !!data.profileImage,
            hasBannerImage: !!data.bannerImage,
            hasAbout: !!data.about,
            hasExperience: data.experience.length > 0,
            hasEducation: data.education.length > 0,
            hasSkills: data.skills.length > 0,
            hasRecommendations: data.recommendations.length > 0,
            completenessScore: 0,
          };

          // Calculate completeness score
          const completenessFactors = [
            data.profileCompleteness.hasProfileImage,
            data.profileCompleteness.hasBannerImage,
            data.profileCompleteness.hasAbout,
            data.profileCompleteness.hasExperience,
            data.profileCompleteness.hasEducation,
            data.profileCompleteness.hasSkills,
            data.profileCompleteness.hasRecommendations,
          ];

          data.profileCompleteness.completenessScore = Math.round(
            (completenessFactors.filter(Boolean).length /
              completenessFactors.length) *
              100
          );
        } catch (error) {
          console.error("Error extracting profile data:", error);
        }

        return data;
      });

      console.log("✅ Profile data extracted successfully");
      return profileData;
    } catch (error) {
      console.error("❌ Error scanning profile:", error);
      throw error;
    }
  }

  async generateComprehensiveAnalysis(profileData) {
    try {
      console.log("🤖 Generating comprehensive AI analysis...");

      // Simplified prompt for better reliability
      const prompt = `Analyze this LinkedIn profile and return JSON with:
      {
        "profileStrengthScore": 85,
        "keyStrengths": ["Strong experience", "Good skills"],
        "areasForImprovement": ["Better headline", "More skills"],
        "specificRecommendations": {
          "headline": ["Add keywords", "Be specific"],
          "about": ["Add achievements", "Tell story"],
          "experience": ["Add metrics", "Use action verbs"],
          "skills": ["Add more skills", "Get endorsements"]
        },
        "contentStrategy": {
          "contentThemes": ["Industry insights", "Career tips"],
          "postingFrequency": "2-3 times per week",
          "engagementTips": ["Engage with others", "Use hashtags"]
        },
        "industryInsights": {
          "trends": ["Remote work", "Digital skills"],
          "opportunities": "Focus on networking",
          "competitiveEdge": "Build unique skills"
        }
      }

      Profile: ${profileData.name} - ${profileData.headline}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      // Parse the JSON response
      const parsedAnalysis = JSON.parse(analysis);
      return {
        ...parsedAnalysis,
        analysisType: "comprehensive",
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error generating comprehensive analysis:", error);
      
      // Fallback analysis when AI fails
      return {
        profileStrengthScore: this.calculateProfileScore(profileData),
        keyStrengths: this.generateFallbackStrengths(profileData),
        areasForImprovement: this.generateFallbackImprovements(profileData),
        specificRecommendations: this.generateFallbackRecommendations(profileData),
        contentStrategy: this.generateFallbackContentStrategy(profileData),
        industryInsights: this.generateFallbackIndustryInsights(profileData),
        personalBrandingRecommendations: this.generateFallbackBrandingRecommendations(profileData),
        analysisType: "comprehensive_fallback",
        generatedAt: new Date().toISOString(),
      };
    }
  }

  async generatePersonaContext(profileData, analysis) {
    try {
      console.log("🎭 Generating detailed persona context...");

      const prompt = `Generate persona context for content creation. Return JSON:
      {
        "professionalIdentity": "Professional",
        "industry": "Technology",
        "contentPreferences": ["Industry insights", "Career tips"],
        "communicationStyle": "Professional",
        "targetAudience": "Industry peers",
        "contentThemes": ["Professional growth", "Industry trends"],
        "toneAndVoice": "Professional and engaging",
        "engagementPatterns": "Regular posting",
        "professionalGoals": ["Build network", "Share insights"]
      }

      Profile: ${profileData.name} - ${profileData.headline}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const personaContext = response.text();

      try {
        return JSON.parse(personaContext);
      } catch {
        return {
          personaContext: personaContext,
          professionalIdentity: profileData.headline || "Professional",
          industry: "Professional Services",
          contentPreferences: ["Industry insights", "Professional development"],
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("❌ Error generating persona context:", error);
      return {
        professionalIdentity: profileData.headline || "Professional",
        industry: this.detectIndustry(profileData),
        contentPreferences: this.generateContentPreferences(profileData),
        communicationStyle: "Professional and engaging",
        targetAudience: "Industry professionals and peers",
        contentThemes: this.generateContentThemes(profileData),
        toneAndVoice: "Professional, knowledgeable, and approachable",
        engagementPatterns: "Regular posting with meaningful interactions",
        professionalGoals: this.generateProfessionalGoals(profileData),
        generatedAt: new Date().toISOString(),
      };
    }
  }

  async analyzeProfile(profileUrl) {
    try {
      console.log(
        `🔍 Starting comprehensive profile analysis for: ${profileUrl}`
      );

      // Step 1: Comprehensive profile scanning
      const profileData = await this.scanProfile(profileUrl);

      // Step 2: Generate comprehensive AI analysis
      const analysis = await this.generateComprehensiveAnalysis(profileData);

      // Step 3: Generate detailed persona context
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
        analysisType: "comprehensive_linkedin_analyzer",
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
        analysisType: "comprehensive_linkedin_analyzer",
      };
    }
  }

  // Helper methods for persona context generation
  detectIndustry(profileData) {
    const headline = (profileData.headline || "").toLowerCase();
    const about = (profileData.about || "").toLowerCase();
    const skills = (profileData.skills || []).join(" ").toLowerCase();

    if (
      headline.includes("tech") ||
      headline.includes("software") ||
      headline.includes("developer")
    ) {
      return "Technology";
    } else if (headline.includes("marketing") || headline.includes("sales")) {
      return "Marketing & Sales";
    } else if (headline.includes("finance") || headline.includes("banking")) {
      return "Finance";
    } else if (
      headline.includes("healthcare") ||
      headline.includes("medical")
    ) {
      return "Healthcare";
    } else if (headline.includes("education") || headline.includes("teacher")) {
      return "Education";
    } else {
      return "Professional Services";
    }
  }

  generateContentPreferences(profileData) {
    const preferences = ["Professional insights", "Industry trends"];

    if (profileData.experience && profileData.experience.length > 0) {
      preferences.push("Career advice", "Leadership insights");
    }
    if (profileData.skills && profileData.skills.length > 5) {
      preferences.push("Skill development", "Technical content");
    }

    return preferences;
  }

  generateContentThemes(profileData) {
    const themes = ["Professional growth", "Industry insights"];

    if (profileData.experience && profileData.experience.length > 0) {
      themes.push("Career development", "Leadership");
    }
    if (profileData.skills && profileData.skills.length > 5) {
      themes.push("Skill building", "Technical expertise");
    }

    return themes;
  }

  generateProfessionalGoals(profileData) {
    const goals = ["Build professional network", "Share industry insights"];

    if (profileData.experience && profileData.experience.length > 0) {
      goals.push("Advance career", "Develop leadership skills");
    }
    if (profileData.skills && profileData.skills.length < 10) {
      goals.push("Expand skill set", "Learn new technologies");
    }

    return goals;
  }

  // Fallback analysis methods when AI fails
  calculateProfileScore(profileData) {
    let score = 0;

    // Basic scoring based on profile completeness
    if (profileData.name && profileData.name !== "Join LinkedIn") score += 20;
    if (profileData.headline && profileData.headline !== "N/A") score += 20;
    if (profileData.about && profileData.about.length > 50) score += 15;
    if (profileData.experience && profileData.experience.length > 0)
      score += 20;
    if (profileData.skills && profileData.skills.length > 5) score += 15;
    if (profileData.education && profileData.education.length > 0) score += 10;

    return Math.min(score, 100);
  }

  generateFallbackStrengths(profileData) {
    const strengths = [];

    if (profileData.experience && profileData.experience.length > 0) {
      strengths.push("Strong professional experience");
    }
    if (profileData.skills && profileData.skills.length > 5) {
      strengths.push("Comprehensive skill set");
    }
    if (profileData.about && profileData.about.length > 100) {
      strengths.push("Detailed professional summary");
    }
    if (profileData.education && profileData.education.length > 0) {
      strengths.push("Educational background listed");
    }

    return strengths.length > 0 ? strengths : ["Profile has basic information"];
  }

  generateFallbackImprovements(profileData) {
    const improvements = [];

    if (!profileData.headline || profileData.headline === "N/A") {
      improvements.push("Add a compelling professional headline");
    }
    if (!profileData.about || profileData.about.length < 50) {
      improvements.push("Expand your professional summary");
    }
    if (!profileData.skills || profileData.skills.length < 5) {
      improvements.push("Add more relevant skills");
    }
    if (!profileData.experience || profileData.experience.length === 0) {
      improvements.push("Add your work experience");
    }

    return improvements.length > 0
      ? improvements
      : ["Profile looks good overall"];
  }

  generateFallbackRecommendations(profileData) {
    return {
      headline: [
        "Create a compelling headline that highlights your expertise",
        "Include key skills and industry focus",
        "Keep it under 120 characters for optimal display",
      ],
      about: [
        "Write a compelling professional summary",
        "Highlight your key achievements and skills",
        "Include a call-to-action for networking",
      ],
      experience: [
        "Add detailed job descriptions",
        "Include quantifiable achievements",
        "Use action verbs to describe responsibilities",
      ],
      skills: [
        "Add industry-relevant skills",
        "Include both technical and soft skills",
        "Get endorsements from colleagues",
      ],
    };
  }

  generateFallbackContentStrategy(profileData) {
    return {
      contentThemes: [
        "Professional insights",
        "Industry trends",
        "Career advice",
      ],
      postingFrequency: "2-3 times per week",
      engagementTips: [
        "Share valuable industry insights",
        "Engage with others' content",
        "Use relevant hashtags",
      ],
    };
  }

  generateFallbackIndustryInsights(profileData) {
    return {
      trends: [
        "Remote work is becoming standard",
        "Digital skills are increasingly important",
        "Networking remains crucial for career growth",
      ],
      opportunities:
        "Focus on building digital presence and professional network",
      competitiveEdge:
        "Develop unique skills and maintain active professional engagement",
    };
  }

  generateFallbackBrandingRecommendations(profileData) {
    return [
      "Maintain consistent professional messaging",
      "Share thought leadership content",
      "Engage authentically with your network",
      "Keep profile information up-to-date",
    ];
  }

  async close() {
    try {
      if (this.browser) {
        await this.browser.close();
        console.log("✅ LinkedIn Profile Analyzer closed");
      }
    } catch (error) {
      console.error("❌ Error closing analyzer:", error);
    }
  }
}

export default LinkedInProfileAnalyzer;

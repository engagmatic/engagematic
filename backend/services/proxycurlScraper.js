import axios from "axios";
import config from "../config/index.js";

class ProxycurlScraper {
  constructor() {
    this.apiKey = config.PROXYCURL_API_KEY;
    this.baseUrl = "https://nubela.co/proxycurl/api/v2/linkedin";
  }

  /**
   * Extract username from LinkedIn URL
   */
  extractUsername(linkedinUrl) {
    try {
      const url = new URL(linkedinUrl);
      const pathParts = url.pathname.split("/").filter(Boolean);

      // Handle formats: /in/username or just username
      if (pathParts[0] === "in" && pathParts[1]) {
        return pathParts[1];
      }

      return pathParts[0] || linkedinUrl;
    } catch (error) {
      // If not a valid URL, assume it's already a username
      return linkedinUrl.replace(/^\/+|\/+$/g, "");
    }
  }

  /**
   * Fetch LinkedIn profile data using Proxycurl
   */
  async extractProfileData(linkedinUrl) {
    try {
      console.log("\n🔍 FETCHING LINKEDIN PROFILE DATA (Proxycurl)");
      console.log("═══════════════════════════════════════");
      console.log("LinkedIn URL:", linkedinUrl);

      if (!this.apiKey) {
        throw new Error("Proxycurl API key not configured");
      }

      // Proxycurl accepts full LinkedIn URLs
      const fullUrl = linkedinUrl.startsWith("http")
        ? linkedinUrl
        : `https://www.linkedin.com/in/${linkedinUrl}`;

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          url: fullUrl,
          fallback_to_cache: "on-error",
          use_cache: "if-present",
          skills: "include",
          inferred_salary: "include",
          personal_email: "include",
          personal_contact_number: "include",
          twitter_profile_id: "include",
          facebook_profile_id: "include",
          github_profile_id: "include",
          extra: "include",
        },
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      });

      console.log("✅ Profile data fetched successfully");
      console.log("Profile:", response.data.full_name || "Unknown");

      return this.mapProfileData(response.data);
    } catch (error) {
      console.error("❌ Error fetching profile data:", error.message);

      if (error.response?.status === 404) {
        throw new Error("LinkedIn profile not found. Please check the URL.");
      } else if (error.response?.status === 401) {
        throw new Error("Invalid Proxycurl API key.");
      } else if (error.response?.status === 429) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }

      throw new Error(`Failed to fetch profile data: ${error.message}`);
    }
  }

  /**
   * Map Proxycurl data to our schema
   */
  mapProfileData(apiData) {
    try {
      console.log("\n🔄 MAPPING PROFILE DATA");
      console.log("═══════════════════════════════════════");

      const fullName = apiData.full_name || "Unknown";
      console.log("👤 Full Name:", fullName);

      const headline = apiData.headline || "Professional";
      console.log("📌 Headline:", headline);

      const about = apiData.summary || "";
      console.log(
        "📝 Summary:",
        about ? `${about.length} characters` : "(empty)"
      );

      const location =
        apiData.city && apiData.country
          ? `${apiData.city}, ${apiData.country}`
          : apiData.city || apiData.country || "";
      console.log("📍 Location:", location || "(not provided)");

      // Map experiences
      const experience = (apiData.experiences || []).map((exp, index) => {
        console.log(
          `💼 Experience ${index + 1}:`,
          exp.title,
          "at",
          exp.company
        );
        return {
          title: exp.title || "Position not specified",
          company: exp.company || "Company not specified",
          description: exp.description || "",
          duration:
            exp.starts_at && exp.ends_at
              ? `${exp.starts_at.month}/${exp.starts_at.year} - ${
                  exp.ends_at
                    ? `${exp.ends_at.month}/${exp.ends_at.year}`
                    : "Present"
                }`
              : "",
          employmentType: "",
          location: exp.location || "",
        };
      });

      // Map education
      const education = (apiData.education || []).map((edu, index) => {
        console.log(
          `🎓 Education ${index + 1}:`,
          edu.degree_name,
          "at",
          edu.school
        );
        return {
          school: edu.school || "School not specified",
          degree: edu.degree_name || "",
          field: edu.field_of_study || "",
          startDate: edu.starts_at
            ? `${edu.starts_at.month}/${edu.starts_at.year}`
            : "",
          endDate: edu.ends_at
            ? `${edu.ends_at.month}/${edu.ends_at.year}`
            : "",
        };
      });

      // Map skills
      const skills = (apiData.skills || [])
        .map((skill) => skill)
        .filter(Boolean);
      console.log("🎯 Skills Count:", skills.length);

      const industry =
        apiData.industry || this.inferIndustry(headline, experience);
      console.log("🏢 Industry:", industry);

      // Additional valuable data from Proxycurl
      const profileInfo = {
        isPremium: false, // Proxycurl doesn't provide this
        isOpenToWork: false,
        isHiring: false,
        isInfluencer: apiData.influencer || false,
        isTopVoice: false,
        isCreator: false,
        followerCount: apiData.follower_count || 0,
        connectionCount: apiData.connections || 0,
        urn: "",
        publicIdentifier: apiData.public_identifier || "",
        // Extra Proxycurl data
        languages: apiData.languages || [],
        certifications: apiData.certifications || [],
        volunteer: apiData.volunteer_work || [],
        accomplishments: apiData.accomplishment_publications || [],
        recommendations: apiData.recommendations || [],
      };

      const mappedResult = {
        fullName,
        headline,
        about,
        location,
        industry,
        experience,
        education,
        skills,
        profileInfo,
        rawData: {
          linkedInId: apiData.linkedin_internal_id,
          ...profileInfo,
        },
      };

      console.log("\n✅ MAPPING COMPLETE");
      console.log("═══════════════════════════════════════");
      console.log("📊 Summary:");
      console.log("  ✓ Name:", mappedResult.fullName);
      console.log("  ✓ Headline:", mappedResult.headline);
      console.log("  ✓ Location:", mappedResult.location || "N/A");
      console.log("  ✓ Industry:", mappedResult.industry);
      console.log("  ✓ Experiences:", mappedResult.experience.length);
      console.log("  ✓ Education:", mappedResult.education.length);
      console.log("  ✓ Skills:", mappedResult.skills.length);
      console.log("  ✓ Network:", `${profileInfo.followerCount} followers`);
      console.log("═══════════════════════════════════════\n");

      return mappedResult;
    } catch (error) {
      console.error("❌ Error mapping profile data:", error);
      throw new Error("Failed to map profile data: " + error.message);
    }
  }

  /**
   * Infer industry from headline and experience
   */
  inferIndustry(headline, experiences) {
    const text = (
      headline +
      " " +
      experiences.map((e) => e.title).join(" ")
    ).toLowerCase();

    const industries = {
      Technology: [
        "software",
        "developer",
        "engineer",
        "tech",
        "programming",
        "ai",
        "data science",
      ],
      Marketing: ["marketing", "digital marketing", "seo", "content", "brand"],
      Sales: ["sales", "business development", "account manager"],
      Design: ["design", "ux", "ui", "creative", "graphic"],
      Finance: ["finance", "accounting", "investment", "banking"],
      Healthcare: ["healthcare", "medical", "doctor", "nurse", "health"],
      Education: ["teacher", "education", "professor", "instructor"],
      Consulting: ["consultant", "consulting", "advisory"],
      "Human Resources": ["hr", "human resources", "recruitment", "talent"],
      Operations: ["operations", "logistics", "supply chain"],
    };

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return industry;
      }
    }

    return "Professional Services";
  }
}

export default new ProxycurlScraper();

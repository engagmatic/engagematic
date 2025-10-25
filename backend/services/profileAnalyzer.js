import googleAI from "./googleAI.js";
import ProfileAnalysis from "../models/ProfileAnalysis.js";

class ProfileAnalyzer {
  /**
   * Analyze a LinkedIn profile and generate recommendations
   * NOTE: Profile scraping temporarily disabled - using manual input
   */
  async analyzeProfile(profileUrl, userId) {
    try {
      console.log(
        "🔍 Profile Analysis requested (manual input mode):",
        profileUrl
      );

      // Profile scraping is disabled - return guidance for manual input
      return {
        success: false,
        message:
          "Profile analysis is temporarily unavailable. Please use manual profile data entry.",
        method: "manual",
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
      return {
        success: false,
        message: "Profile analysis is currently unavailable",
        error: error.message,
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
        // The response from generatePost is an object with content property
        const textContent = response.content || JSON.stringify(response);

        // Try to extract JSON from response
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
          console.log("✅ Successfully parsed AI recommendations");
        } else {
          throw new Error("No JSON found in AI response");
        }
      } catch (parseError) {
        console.log("⚠️ AI response parsing failed, using enhanced fallback");
        recommendations = this.getFallbackRecommendations(profileData, scores);
      }

      return recommendations;
    } catch (error) {
      console.error("❌ Recommendation generation error:", error.message);
      console.log("📝 Using enhanced fallback recommendations");
      return this.getFallbackRecommendations(profileData, scores);
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
}

export default new ProfileAnalyzer();

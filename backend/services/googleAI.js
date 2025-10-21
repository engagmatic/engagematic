import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/index.js";

class GoogleAIService {
  constructor() {
    this.apiKey = config.GOOGLE_AI_API_KEY;
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });
  }

  async generatePost(
    topic,
    hook,
    persona,
    linkedinInsights = null,
    profileInsights = null
  ) {
    try {
      console.log("🤖 Generating post with Google AI...");
      console.log("Topic:", topic);
      console.log("Hook:", hook);
      console.log("Persona:", persona.name);
      if (linkedinInsights) {
        console.log(
          "LinkedIn Insights:",
          linkedinInsights.industry,
          linkedinInsights.experienceLevel
        );
      }

      const prompt = this.buildPostPrompt(
        topic,
        hook,
        persona,
        linkedinInsights
      );

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      console.log("✅ Google AI response received");
      const response = await result.response;
      const generatedText = response.text();
      const engagementScore = this.calculateEngagementScore(generatedText);

      console.log(
        "✅ Post generated successfully, length:",
        generatedText.length
      );

      return {
        content: generatedText,
        engagementScore,
        tokensUsed: response.usageMetadata?.totalTokenCount || 150,
      };
    } catch (error) {
      console.error("❌ Google AI API Error:", {
        message: error.message,
        apiKey: this.apiKey ? "Set" : "Missing",
      });
      throw new Error("Failed to generate post content: " + error.message);
    }
  }

  async generateComment(postContent, persona, profileInsights = null) {
    try {
      console.log("💬 Generating comments with Google AI...");
      console.log("Post content:", postContent.substring(0, 100) + "...");
      console.log("Persona:", persona.name);

      const prompt = this.buildCommentPrompt(
        postContent,
        persona,
        profileInsights
      );

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const response = await result.response;
      const generatedText = response.text();

      console.log("✅ AI comment response received");
      console.log("Generated text length:", generatedText.length);

      // Parse multiple comments from the response
      const comments = this.parseGeneratedComments(generatedText);

      return {
        content: comments, // Return array of comments
        comments: comments, // Also include for compatibility
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
      };
    } catch (error) {
      console.error("Google AI API Error:", error.message);
      throw new Error("Failed to generate comment content");
    }
  }

  buildPostPrompt(
    topic,
    hook,
    persona,
    linkedinInsights = null,
    profileInsights = null
  ) {
    let basePrompt = `You are a LinkedIn content creator with the following persona:
    
Name: ${persona.name}
Industry: ${persona.industry}
Experience Level: ${persona.experience}
Tone: ${persona.tone}
Writing Style: ${persona.writingStyle}
Description: ${persona.description}`;

    // Add LinkedIn insights if available
    if (linkedinInsights) {
      basePrompt += `

LinkedIn Profile Insights:
- Industry: ${linkedinInsights.industry}
- Experience Level: ${linkedinInsights.experienceLevel}
- Content Strategy Focus: ${linkedinInsights.contentStrategy?.focus}
- Recommended Tone: ${linkedinInsights.contentStrategy?.tone}
- Content Types: ${linkedinInsights.contentStrategy?.contentTypes?.join(", ")}
- Optimal Posting Times: ${linkedinInsights.optimalPostingTimes?.bestTimes?.join(
        ", "
      )}
- Industry Hashtags: ${linkedinInsights.hashtagSuggestions?.industry?.join(
        ", "
      )}`;
    }

    // Add profile analyzer insights if available (from Profile Analyzer tool)
    if (profileInsights) {
      basePrompt += `\n\n${profileInsights}`;
    }

    basePrompt += `

Create a LinkedIn post about: "${topic}"

Use this hook to start: "${hook}"

Requirements:
1. Start with the provided hook
2. Write in the persona's authentic voice and style
3. Make it engaging and professional
4. Include relevant insights or personal experiences
5. End with a call-to-action or thought-provoking question
6. Keep it between 150-300 words
7. Use line breaks for readability
8. Make it sound human and authentic, not AI-generated`;

    if (linkedinInsights?.contentStrategy?.contentTypes) {
      basePrompt += `
9. Focus on these content types: ${linkedinInsights.contentStrategy.contentTypes.join(
        ", "
      )}`;
    }

    if (linkedinInsights?.hashtagSuggestions?.industry) {
      basePrompt += `
10. Use these industry-specific hashtags: ${linkedinInsights.hashtagSuggestions.industry.join(
        ", "
      )}`;
    }

    basePrompt += `

Generate only the post content, no additional explanations.`;

    return basePrompt;
  }

  buildCommentPrompt(postContent, persona, profileInsights = null) {
    let prompt = `You are commenting on this LinkedIn post as someone with the following persona:
    
Name: ${persona.name}
Industry: ${persona.industry}
Experience Level: ${persona.experience}
Tone: ${persona.tone}
Writing Style: ${persona.writingStyle}
Description: ${persona.description}

${profileInsights ? `\n${profileInsights}\n` : ""}
Post content: "${postContent}"

Generate 3 different genuine, thoughtful comments that:
1. Show you've read and understood the post
2. Add value or share relevant experiences
3. Maintain the persona's authentic voice
4. Are supportive and professional
5. Encourage further discussion
6. Are between 50-150 words each
7. Sound human and genuine, not AI-generated
8. Each comment should have a different angle/approach

Return ONLY a JSON array with engagement scores like this:
[
  {
    "text": "This resonates so much! I've experienced the exact same journey...",
    "engagementScore": 8.5,
    "type": "personal_story"
  },
  {
    "text": "Incredibly valuable perspective. Your point about consistency...",
    "engagementScore": 7.8,
    "type": "value_add"
  },
  {
    "text": "Love this! The authenticity piece is so underrated...",
    "engagementScore": 9.2,
    "type": "enthusiastic_support"
  }
]

Engagement score range: 1-10 (10 being highest engagement potential)
Types: personal_story, value_add, enthusiastic_support, question, insight, experience_share

JSON only, no other text.`;

    return prompt;
  }

  parseGeneratedComments(generatedText) {
    try {
      console.log("🔍 Parsing comments from:", generatedText);

      // Remove markdown code blocks if present
      let cleanText = generatedText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // Try to extract JSON array from the text
      const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        cleanText = jsonMatch[0];
      }

      console.log("🧹 Cleaned text:", cleanText);

      // Parse JSON
      const comments = JSON.parse(cleanText);

      // Validate and format comments with engagement scores
      const formattedComments = comments
        .map((comment) => {
          if (typeof comment === "string") {
            // Handle old format (just text)
            return {
              text: comment.trim(),
              engagementScore: this.calculateEngagementScore(comment),
              type: "general",
            };
          } else if (comment.text) {
            // Handle new format (with engagement score)
            return {
              text: comment.text.trim(),
              engagementScore:
                comment.engagementScore ||
                this.calculateEngagementScore(comment.text),
              type: comment.type || "general",
            };
          }
          return null;
        })
        .filter((comment) => comment && comment.text.length > 0);

      console.log("✅ Parsed comments with scores:", formattedComments);
      return formattedComments;
    } catch (error) {
      console.error("❌ Failed to parse generated comments:", error.message);
      console.log("Raw text was:", generatedText);

      // Try to extract comments from natural language
      const lines = generatedText
        .split("\n")
        .filter(
          (line) =>
            line.trim().length > 0 &&
            (line.includes('"') || line.includes("'") || line.match(/^\d+\./))
        );

      if (lines.length > 0) {
        console.log("🔄 Trying to extract from natural language...");
        const extractedComments = lines
          .slice(0, 4)
          .map((line) => {
            // Clean up the line
            let text = line
              .replace(/^\d+\.\s*/, "")
              .replace(/^[-•]\s*/, "")
              .replace(/^["']|["']$/g, "")
              .trim();
            return text;
          })
          .filter((comment) => comment.length > 0);

        if (extractedComments.length > 0) {
          console.log(
            "✅ Extracted comments from natural language:",
            extractedComments
          );
          return extractedComments;
        }
      }

      // Return fallback comments with engagement scores
      console.log("🔄 Using fallback comments");
      return [
        {
          text: "This resonates so much! I've experienced the exact same journey. The moment you shift from perfection to authenticity, everything changes. Thanks for sharing this insight!",
          engagementScore: 8.5,
          type: "personal_story",
        },
        {
          text: "Incredibly valuable perspective. Your point about consistency over perfection is something I needed to hear today. Saving this for future reference!",
          engagementScore: 7.8,
          type: "value_add",
        },
        {
          text: "Love this! The authenticity piece is so underrated. People connect with real stories, not polished corporate speak. Keep sharing these gems!",
          engagementScore: 9.2,
          type: "enthusiastic_support",
        },
      ];
    }
  }

  generateMockPost(topic, hook, persona) {
    // Generate realistic mock content based on topic, hook, and persona
    const industry = persona.industry || "Technology";
    const experience = persona.experience || "Senior";
    const tone = persona.tone || "professional";

    const mockPosts = [
      `${hook}

After ${experience.toLowerCase()} years in ${industry.toLowerCase()}, I've learned that ${topic.toLowerCase()} isn't just about technical skills—it's about understanding the bigger picture.

Here's what changed everything for me:

• **Focus on impact over perfection** - Early in my career, I spent weeks perfecting code that nobody used. Now I ship fast, iterate quickly, and measure real impact.

• **Build relationships, not just products** - The best ${industry.toLowerCase()} professionals I know aren't just technically brilliant—they're amazing collaborators who bring people together.

• **Embrace continuous learning** - The ${industry.toLowerCase()} landscape changes fast. What worked yesterday might be obsolete tomorrow.

The key insight? Success in ${industry.toLowerCase()} isn't about knowing everything—it's about knowing how to learn and adapt.

What's been your biggest learning moment in ${industry.toLowerCase()}? I'd love to hear your story in the comments below.

#${industry.replace(/\s+/g, "")} #CareerGrowth #ProfessionalDevelopment`,

      `${hook}

${topic} has been a game-changer in my ${industry.toLowerCase()} journey.

As a ${experience.toLowerCase()} ${industry.toLowerCase()} professional, I've seen firsthand how this approach transforms not just projects, but entire teams.

Here's what I've discovered:

→ **The 80/20 rule applies everywhere** - Focus on the 20% of work that drives 80% of results
→ **Communication is everything** - Technical skills matter, but clear communication matters more
→ **Fail fast, learn faster** - Every mistake is a stepping stone to mastery

The most successful ${industry.toLowerCase()} leaders I know share one trait: they never stop asking "Why?"

Why are we building this?
Why does this approach work?
Why should our users care?

This curiosity-driven mindset has opened doors I never knew existed.

What questions are you asking in your ${industry.toLowerCase()} career right now?

#${industry.replace(/\s+/g, "")} #Leadership #Innovation`,

      `${hook}

${topic} taught me more about ${industry.toLowerCase()} than any course or certification ever could.

After ${experience.toLowerCase()} years in this field, I can confidently say: the best learning happens in the trenches, not in textbooks.

Here's my framework for success:

**1. Start with the problem, not the solution**
Too many ${industry.toLowerCase()} professionals jump straight to building without understanding the real need.

**2. Build in public**
Share your journey, your failures, your wins. The ${industry.toLowerCase()} community is incredibly supportive when you're authentic.

**3. Measure what matters**
Vanity metrics are everywhere. Focus on impact, not impressions.

**4. Never stop learning**
The ${industry.toLowerCase()} landscape evolves daily. What's cutting-edge today might be standard practice tomorrow.

The biggest lesson? Success in ${industry.toLowerCase()} isn't about being the smartest person in the room—it's about being the most curious.

What's the most valuable lesson you've learned in your ${industry.toLowerCase()} career?

#${industry.replace(/\s+/g, "")} #CareerAdvice #ProfessionalGrowth`,
    ];

    // Select a random mock post
    const randomIndex = Math.floor(Math.random() * mockPosts.length);
    return mockPosts[randomIndex];
  }

  calculateEngagementScore(content) {
    let score = 50; // Base score

    // Check for engagement elements
    if (content.includes("?")) score += 10; // Questions
    if (content.includes("!")) score += 5; // Excitement
    if (content.includes("→") || content.includes("•")) score += 5; // Structure
    if (content.match(/\d+/)) score += 5; // Numbers/statistics
    if (content.includes("story") || content.includes("experience"))
      score += 10; // Personal elements

    // Length bonus (optimal length)
    const wordCount = content.split(" ").length;
    if (wordCount >= 150 && wordCount <= 300) score += 10;

    // Ensure score is within bounds
    return Math.min(Math.max(score, 0), 100);
  }
}

export default new GoogleAIService();

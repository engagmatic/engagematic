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
    profileInsights = null,
    userProfile = null
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
      if (userProfile) {
        console.log("👤 User Profile:", userProfile);
      }

      const prompt = this.buildPostPrompt(
        topic,
        hook,
        persona,
        linkedinInsights,
        profileInsights,
        userProfile
      );

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Increased from 1024 to ensure complete posts
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

  async generateText(prompt, options = {}) {
    try {
      const {
        temperature = 0.8,
        maxOutputTokens = 2048,
        topK = 40,
        topP = 0.95,
      } = options;

      console.log("🤖 Generating text with Google AI...");

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          topK,
          topP,
          maxOutputTokens,
        },
      });

      console.log("✅ Google AI response received");
      const response = await result.response;
      const generatedText = response.text();

      return {
        text: generatedText,
        tokensUsed: response.usageMetadata?.totalTokenCount || 150,
      };
    } catch (error) {
      console.error("❌ Google AI Text Generation Error:", {
        message: error.message,
        apiKey: this.apiKey ? "Set" : "Missing",
      });
      throw new Error(`Google AI Error: ${error.message}`);
    }
  }

  async generateComment(
    postContent,
    persona,
    profileInsights = null,
    commentType = "value_add"
  ) {
    try {
      console.log("💬 Generating comments with Google AI...");
      console.log("Post content:", postContent.substring(0, 100) + "...");
      console.log("Persona:", persona.name);
      console.log("Comment type:", commentType);

      const prompt = this.buildCommentPrompt(
        postContent,
        persona,
        profileInsights,
        commentType
      );

      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Increased to ensure complete comments
        },
      });

      const response = await result.response;
      const generatedText = response.text();

      console.log("AI comment response received");
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
    profileInsights = null,
    userProfile = null
  ) {
    let basePrompt = `You are a LinkedIn content creator with the following persona:
    
Name: ${persona.name}
Industry: ${persona.industry}
Experience Level: ${persona.experience}
Tone: ${persona.tone}
Writing Style: ${persona.writingStyle}
Description: ${persona.description}`;

    // Add user profile for DEEP personalization
    if (
      userProfile &&
      (userProfile.jobTitle || userProfile.industry || userProfile.goals)
    ) {
      basePrompt += `

🎯 USER PROFILE CONTEXT (Use this to deeply personalize the content):
${userProfile.jobTitle ? `- Current Role: ${userProfile.jobTitle}` : ""}
${userProfile.company ? `- Company: ${userProfile.company}` : ""}
${userProfile.industry ? `- Industry: ${userProfile.industry}` : ""}
${userProfile.experience ? `- Experience Level: ${userProfile.experience}` : ""}
${userProfile.goals ? `- Professional Goals: ${userProfile.goals}` : ""}
${
  userProfile.targetAudience
    ? `- Target Audience: ${userProfile.targetAudience}`
    : ""
}
${userProfile.expertise ? `- Areas of Expertise: ${userProfile.expertise}` : ""}

**CRITICAL**: Use these details to:
1. Reference their specific role/industry in examples
2. Align content with their professional goals
3. Target their specific audience
4. Showcase their expertise areas
5. Make the post feel authentically theirs (not generic)`;
    }

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

Create a high-quality, engaging LinkedIn post about: "${topic}"

Start with this exact hook: "${hook}"

🎯 CRITICAL REQUIREMENTS - Must complete ALL of these:

**PROFESSIONAL & HUMAN-LIKE:**
1. Write like a REAL professional, not an AI - avoid phrases like "delve into", "in conclusion", "furthermore", "moreover"
2. Use natural language, contractions (I'm, you're, it's), and conversational flow
3. NO corporate jargon or buzzwords ("synergy", "leverage", "paradigm shift", "disrupt")
4. Sound 100% authentic - like you're sharing insights over coffee, not writing a business report

**VOICE & TONE:**
5. Write in ${persona.name}'s voice (${persona.tone} tone, ${persona.writingStyle} style)
6. Be genuinely helpful - provide REAL insights people can act on today
7. Share specific examples, numbers, or personal experiences (make it relatable)

**FORMATTING & STRUCTURE:**
8. Structure: Hook → Brief Context → Main Insights (3-5 bullet points) → Strong CTA
9. Use **bold** for 3-5 KEY PHRASES that deserve emphasis (e.g., **game-changing**, **critical mistake**, **biggest lesson**)
10. Short paragraphs (2-3 sentences max) with line breaks for readability
11. Use bullet points (→ or •) for lists - makes content scannable

**EMOJIS - USE WISELY:**
12. Use 1-3 emojis MAXIMUM, and ONLY where they add genuine emphasis or emotion
13. Place them strategically: after impactful statements, before key insights, or in the CTA
14. DO NOT use generic emojis (✨🚀💡) - prefer context-specific ones (🎯📊💰🔥⚡)
15. If emojis feel forced, DON'T use them at all

**LENGTH & COMPLETION:**
16. **LENGTH**: 200-300 words (max 200 characters including spaces)
17. End with a thought-provoking question or clear call-to-action
18. COMPLETE THE ENTIRE POST - never cut off mid-sentence

**LINKEDIN-READY OUTPUT:**
19. Format must be copy-paste ready - no encoding issues, clean text
20. Preserve bold (**text**) for easy copying to LinkedIn
21. No hashtags unless specifically requested (they look spammy)
22. Every word should add value - zero fluff, zero filler

GENERATE A PROFESSIONAL POST THAT REQUIRES ZERO EDITING AND LOOKS INDISTINGUISHABLE FROM A TOP 1% LINKEDIN CREATOR.`;

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

  buildCommentPrompt(
    postContent,
    persona,
    profileInsights = null,
    commentType = "value_add"
  ) {
    // Define comment type specific instructions
    const typeInstructions = {
      personal_story:
        "Share a brief personal story or experience (15-20 words max) that directly relates to the post. Make it authentic and relatable.",
      value_add:
        "Provide a quick actionable tip, insight, or framework (15-20 words max) that adds value to the discussion. Be specific and practical.",
      question:
        "Ask a thoughtful, engaging question (15-20 words max) that encourages discussion and shows genuine interest. Reference specific points from the post.",
      insight:
        "Offer a sharp, unique perspective or observation (15-20 words max) that makes people think. Be direct and insightful.",
      experience_share:
        "Share how you've experienced or applied this concept (15-20 words max) in your professional journey. Be specific and concise.",
      enthusiastic_support:
        "Show strong agreement with specific reasoning (15-20 words max). Explain WHY you agree, citing specific aspects from the post.",
    };

    const typeExamples = {
      personal_story:
        "This! We lost 6 months because we couldn't let go of the original vision. Ego is expensive. 💯",
      value_add:
        "Love this framework. We call it 'Strategic Refinement' - same concept, same results. 🎯",
      question:
        "The 'evolving without ego' part hit hard. Been there. How do you handle pushback from stakeholders?",
      insight:
        "Spot on. Momentum needs process, not just passion. Learned this the hard way!",
      experience_share:
        "Seen this play out 100 times. The daily grind > initial hype. Every. Single. Time.",
      enthusiastic_support:
        "This is gold. The 'evolving without ego' mindset separates good teams from great ones.",
    };

    let prompt = `You are writing SHORT LinkedIn comments as ${persona.name} (${
      persona.tone
    } tone, ${persona.writingStyle} style).

POST:
"${postContent}"

🎯 FOCUS: Generate "${commentType}" style comments
${typeInstructions[commentType] || typeInstructions.value_add}

CRITICAL COMMENT REQUIREMENTS:
1. **ULTRA SHORT**: STRICT 15-20 words MAXIMUM (count every word - this is critical!)
2. **DIRECTLY ADDRESS THE POST**: Reference specific points from the post content
3. **BE RELATABLE**: Share a quick personal insight or experience that connects
4. **NATURAL & CONVERSATIONAL**: Write like you're texting a colleague, not writing an essay
5. **ADD VALUE**: Give a quick tip, insight, or perspective - but keep it SUPER BRIEF
6. **AUTHENTIC TONE**: Use ${
      persona.tone
    } tone naturally - no corporate buzzwords
7. **NO FLUFF**: Cut ALL unnecessary words - get straight to the point
8. **HUMAN-LIKE**: Use contractions, casual language, real emotions
9. **EMOJIS**: Use 1 emoji MAX, and ONLY if it adds emphasis or emotion (🎯💯🔥👏). Don't force it!
10. **WORD LIMIT**: If over 20 words, CUT IT DOWN. Brevity is critical for LinkedIn comments!

BAD EXAMPLE (too long):
"Absolutely spot on! The greatest killer of sustained growth is a leader or team clinging too tightly to the initial perfect vision. Your emphasis on 'evolving without ego' hits the nail..."

GOOD EXAMPLE for "${commentType}" style (15-20 words):
"${typeExamples[commentType] || typeExamples.value_add}"

MORE PERFECT EXAMPLES (15-20 words each, super short, emojis optional!):
- "This! Lost 6 months clinging to our vision. Ego is expensive. 💯" (11 words, 1 emoji)
- "The 'evolving without ego' part hit hard. How do you handle stakeholder pushback?" (13 words, no emoji)
- "Love this framework. We call it 'Strategic Refinement' - same results. 🎯" (11 words, 1 emoji)
- "Spot on. Momentum needs process, not passion. Learned this the hard way!" (12 words, no emoji)
- "This is gold. Daily grind beats initial hype. Every. Single. Time." (11 words, no emoji)
- "Been there! The pivot moment is terrifying but necessary. 🔥" (10 words, 1 emoji)

Generate 3 ULTRA SHORT, crisp "${commentType}" style comments (15-20 words each - COUNT THE WORDS!):

Return ONLY JSON (each comment MUST be 15-20 words):
[
  {
    "text": "Your 15-20 word ${commentType} comment - count words, keep it super short!",
    "engagementScore": 8.5,
    "type": "${commentType}"
  },
  {
    "text": "Another ultra-short ${commentType} comment - max 20 words, direct and valuable",
    "engagementScore": 9.0,
    "type": "${commentType}"
  },
  {
    "text": "Third brief ${commentType} comment - remember 15-20 word limit strictly!",
    "engagementScore": 8.8,
    "type": "${commentType}"
  }
]

Types: personal_story, value_add, question, insight, experience_share, enthusiastic_support
Scores: 7.5-9.5 (higher for more engaging)

JSON ONLY.`;

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
          let commentText = "";
          let commentData = {};

          if (typeof comment === "string") {
            commentText = comment.trim();
            commentData = {
              engagementScore: this.calculateEngagementScore(comment),
              type: "general",
            };
          } else if (comment.text) {
            commentText = comment.text.trim();
            commentData = {
              engagementScore:
                comment.engagementScore ||
                this.calculateEngagementScore(comment.text),
              type: comment.type || "general",
            };
          } else {
            return null;
          }

          // Enforce 15-20 word limit
          const wordCount = commentText.split(/\s+/).length;
          if (wordCount > 20) {
            // Truncate to 20 words
            const words = commentText.split(/\s+/);
            commentText = words.slice(0, 20).join(" ") + "...";
            console.log(`⚠️ Comment truncated from ${wordCount} to 20 words`);
          }

          return {
            text: commentText,
            ...commentData,
          };
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

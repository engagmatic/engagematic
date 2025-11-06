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
    userProfile = null,
    postFormatting = "plain",
    trainingPosts = []
  ) {
    try {
      console.log("🤖 Generating post with Google AI...");
      console.log("Topic:", topic);
      console.log("Hook:", hook);
      console.log("Persona:", persona.name);
      console.log("Formatting:", postFormatting);
      console.log("Training posts:", trainingPosts.length);
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
        userProfile,
        postFormatting,
        trainingPosts
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
    userProfile = null,
    postFormatting = "plain",
    trainingPosts = []
  ) {
    let basePrompt = `You are a LinkedIn content creator with the following persona:
    
Name: ${persona.name}
Industry: ${persona.industry}
Experience Level: ${persona.experience}
Tone: ${persona.tone}
Writing Style: ${persona.writingStyle}
Description: ${persona.description}`;

    // Add user profile for DEEP personalization with contextual relevance
    if (
      userProfile &&
      (userProfile.jobTitle || userProfile.industry || userProfile.goals)
    ) {
      // Build contextual persona description
      let personaContext = "";
      if (userProfile.jobTitle && userProfile.industry) {
        personaContext = `a ${userProfile.experience || persona.experience || "professional"} ${userProfile.jobTitle} in ${userProfile.industry}`;
      } else if (userProfile.jobTitle) {
        personaContext = `a ${userProfile.jobTitle}`;
      } else if (userProfile.industry) {
        personaContext = `a professional in ${userProfile.industry}`;
      }

      basePrompt += `

🎯 USER PROFILE CONTEXT (CRITICAL - Inject this naturally throughout the post):
**Who you're writing as**: ${personaContext || "a professional"}
${userProfile.jobTitle ? `**Current Role**: ${userProfile.jobTitle}` : ""}
${userProfile.company ? `**Company**: ${userProfile.company}` : ""}
${userProfile.industry ? `**Industry**: ${userProfile.industry} - Use industry-specific examples, pain points, and terminology` : ""}
${userProfile.experience ? `**Experience Level**: ${userProfile.experience} - Write from this perspective (${userProfile.experience.includes("entry") || userProfile.experience.includes("junior") ? "learning, growing, asking questions" : userProfile.experience.includes("senior") || userProfile.experience.includes("executive") ? "leading, mentoring, sharing wisdom" : "experienced professional sharing insights"})` : ""}
${userProfile.goals ? `**Professional Goals**: ${userProfile.goals} - Every insight should align with achieving these goals` : ""}
${
  userProfile.targetAudience
    ? `**Target Audience**: ${userProfile.targetAudience} - Write TO these people, address their specific needs`
    : ""
}
${userProfile.expertise ? `**Areas of Expertise**: ${userProfile.expertise} - Reference these naturally, don't force them` : ""}

**HOW TO USE THIS CONTEXT (Make it feel authentic, not forced):**
1. **Role-specific examples**: If they're a ${userProfile.jobTitle || "professional"}, use examples from their daily work
2. **Industry context**: Reference ${userProfile.industry || "industry"}-specific challenges, trends, or opportunities
3. **Experience-appropriate voice**: ${userProfile.experience?.includes("entry") ? "Write with curiosity and eagerness to learn" : userProfile.experience?.includes("senior") ? "Write with authority and wisdom from experience" : "Write with confidence and practical insights"}
4. **Goal alignment**: Every piece of advice should help them achieve: ${userProfile.goals || "their professional goals"}
5. **Audience targeting**: Write as if speaking directly to ${userProfile.targetAudience || "their target audience"}
6. **Natural integration**: Don't list these facts - weave them into stories, examples, and insights naturally
7. **Authenticity check**: Would a real ${userProfile.jobTitle || "professional"} in ${userProfile.industry || "this field"} actually say this? If not, rewrite it.`;
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

    // Determine engagement goal based on user profile
    const engagementGoal = this.determineEngagementGoal(userProfile, persona);
    
    basePrompt += `

Create a VIRAL-WORTHY, high-engagement LinkedIn post about: "${topic}"

Start with this exact hook: "${hook}"

🎯 ENGAGEMENT GOAL: ${engagementGoal.description}
**Your post must achieve**: ${engagementGoal.objectives.join(", ")}

🔥 VIRAL CONTENT STRATEGY - Apply these proven patterns:

**1. HOOK OPTIMIZATION (First 125 characters are CRITICAL):**
- Your hook "${hook}" must create IMMEDIATE curiosity, emotion, or cognitive dissonance
- Use one of these viral patterns:
  * Contrarian take: Challenge common belief
  * Personal revelation: "I made a mistake that cost me..."
  * Surprising stat: "90% of people don't know..."
  * Emotional trigger: "This changed everything for me..."
  * Question that makes people pause: "What if everything you know about X is wrong?"
- First sentence MUST stop the scroll - make them think "Wait, what?"

**2. ENGAGEMENT TRIGGERS (Include 3-4 of these):**
- **Emotional resonance**: Tap into frustration, excitement, fear, hope, or pride
- **Relatability**: "If you've ever...", "We've all been there..."
- **Specificity**: Use exact numbers, dates, names, or scenarios (not vague)
- **Vulnerability**: Share a real struggle, failure, or learning moment
- **Controversy (tasteful)**: Take a stance that makes people think
- **Value promise**: "Here's what I learned that saved me 10 hours/week..."

**3. NATURAL LANGUAGE & AUTHENTICITY:**
- Write like a REAL professional, not an AI - avoid phrases like "delve into", "in conclusion", "furthermore", "moreover"
- Use natural language, contractions (I'm, you're, it's), and conversational flow
- NO corporate jargon or buzzwords ("synergy", "leverage", "paradigm shift", "disrupt")
- Sound 100% authentic - like you're sharing insights over coffee, not writing a business report
- Use "I" statements for personal stories, "you" for direct engagement
- Include conversational fillers naturally: "Here's the thing...", "Look, I get it...", "The reality is..."

**4. VOICE & PERSONA ALIGNMENT:**
- Write in ${persona.name}'s voice (${persona.tone} tone, ${persona.writingStyle} style)
- Match their career stage: ${persona.experience} professionals speak differently than entry-level
- Reflect their industry context: ${persona.industry} professionals have specific pain points
- Be genuinely helpful - provide REAL insights people can act on today
- Share specific examples, numbers, or personal experiences (make it relatable)

**5. STRUCTURE FOR MAXIMUM ENGAGEMENT:**
- **Hook** (125 chars): Stop the scroll with curiosity/emotion
- **Context** (1-2 sentences): Why this matters NOW
- **Story/Insight** (3-5 bullet points): The meat - specific, actionable, relatable
- **CTA** (1-2 sentences): Drive engagement with question or call-to-action

**6. FORMATTING & VISUAL APPEAL (Based on user preference: ${postFormatting}):**
${postFormatting === "bold" ? 
  "- Use **bold** extensively (8-10 KEY PHRASES) for emphasis - this is the user's preferred style\n- Make key insights, numbers, and action items stand out with bold formatting\n- Bold the most shareable quotes and takeaways" : 
  postFormatting === "italic" ? 
  "- Use *italics* strategically for quotes, emphasis, and subtle highlights\n- Prefer italics over bold for a more refined, elegant tone\n- Use for internal thoughts or emphasis" : 
  postFormatting === "emoji" ? 
  "- Use emojis liberally (5-8 total) for visual appeal - this is the user's preferred style\n- Place emojis strategically: after impactful statements, before key insights, and in CTAs\n- Use context-specific emojis (🎯📊💰🔥⚡💡🚀) not generic ones (✨🌟⭐)\n- Emojis increase engagement by 25% - use them wisely" : 
  "- Use **bold** for 3-5 KEY PHRASES that deserve emphasis (e.g., **game-changing**, **critical mistake**, **biggest lesson**)\n- Use emojis sparingly (1-3 max) and only where they add genuine value\n- Bold numbers, key insights, and action items"}
- Short paragraphs (2-3 sentences max) with line breaks for readability
- Use bullet points (→ or •) for lists - makes content scannable
- White space is your friend - break up text for easy reading

**7. VALUE-FIRST CONTENT (Every sentence must earn its place):**
- Offer actionable advice, avoid generic content
- Introduce helpful resources or next steps in every post
- Every insight should be something the reader can use TODAY
- No fluff - if it doesn't add value, cut it
- Include specific examples, frameworks, or tactics
- Make it shareable - would someone want to save/bookmark this?

**8. GOAL-DRIVEN ENGAGEMENT:**
${engagementGoal.ctaStrategy}
- End with a thought-provoking question that invites discussion
- OR a clear call-to-action that drives the desired outcome
- Make it easy for people to engage - ask for opinions, experiences, or advice
- Questions that start with "What's been your experience with...?" get 3x more comments

**9. PERSONA TRAINING (Learn from user's saved posts):**
${trainingPosts.length > 0 ? `STUDY these examples of the user's preferred writing style:\n${trainingPosts.map((post, idx) => `Example ${idx + 1}:\n${post.content?.substring(0, 200)}...`).join('\n\n')}\n\nMATCH the tone, structure, and voice from these examples in your generated content\nLearn their preferred sentence length, paragraph structure, and CTA style\nNotice what made these posts successful - replicate those patterns` : ""}

**10. LENGTH & COMPLETION:**
- **LENGTH**: 200-300 words (sweet spot for engagement)
- COMPLETE THE ENTIRE POST - never cut off mid-sentence
- Every paragraph should build on the previous one
- End strong - your last sentence is what people remember

**11. LINKEDIN-READY OUTPUT:**
- Format must be copy-paste ready - no encoding issues, clean text
- Preserve bold (**text**) for easy copying to LinkedIn
- No hashtags unless specifically requested (they look spammy)
- Every word should add value - zero fluff, zero filler

**12. VIRAL CHECKLIST (Before finalizing, ensure your post has):**
✅ Hook that stops the scroll (first 125 chars)
✅ At least 3 engagement triggers (emotion, relatability, specificity, vulnerability, value)
✅ Specific examples/numbers (not vague)
✅ Clear value proposition (what will reader gain?)
✅ Strong CTA that invites engagement
✅ Natural, conversational tone (not AI-generated)
✅ Scannable format (short paragraphs, bullets, white space)
✅ Authentic voice matching ${persona.name}'s style

GENERATE A POST THAT:
- Gets saved/bookmarked (high value)
- Gets shared (relatable/controversial)
- Gets commented on (asks questions, invites discussion)
- Gets liked (emotional resonance)
- Looks INDISTINGUISHABLE from a top 1% LinkedIn creator
- Requires ZERO editing - ready to post immediately`;

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

    let prompt = `You are writing HIGH-ENGAGEMENT LinkedIn comments as ${persona.name} (${
      persona.tone
    } tone, ${persona.writingStyle} style).

POST TO COMMENT ON:
"${postContent}"

🎯 COMMENT TYPE: "${commentType}"
${typeInstructions[commentType] || typeInstructions.value_add}

🔥 ENGAGEMENT STRATEGY FOR COMMENTS:
- Comments that get the most replies are: personal, specific, and add genuine value
- Reference EXACT points from the post (not generic agreement)
- Share a micro-story or specific example (15-20 words can still tell a story)
- Ask a follow-up question if appropriate for the comment type
- Show you actually READ the post, not just skimmed it

CRITICAL COMMENT REQUIREMENTS:
1. **ULTRA SHORT**: STRICT 15-20 words MAXIMUM (count every word - this is critical!)
2. **DIRECTLY ADDRESS THE POST**: Reference specific points, quotes, or ideas from the post content
3. **BE RELATABLE**: Share a quick personal insight, experience, or "me too" moment that connects
4. **NATURAL & CONVERSATIONAL**: Write like you're texting a colleague, not writing an essay
5. **ADD VALUE**: Give a quick tip, insight, framework, or perspective - but keep it SUPER BRIEF
6. **AUTHENTIC TONE**: Use ${
      persona.tone
    } tone naturally - no corporate buzzwords, no AI-sounding phrases
7. **NO FLUFF**: Cut ALL unnecessary words - get straight to the point
8. **HUMAN-LIKE**: Use contractions (I'm, you're, it's), casual language, real emotions
9. **EMOJIS**: Use 1 emoji MAX, and ONLY if it adds emphasis or emotion (🎯💯🔥👏). Don't force it!
10. **WORD LIMIT**: If over 20 words, CUT IT DOWN. Brevity is critical for LinkedIn comments!
11. **ENGAGEMENT TRIGGER**: Make the post author WANT to reply to you
12. **SPECIFICITY**: Use exact numbers, names, or scenarios when possible (not vague)

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

  /**
   * Determine engagement goal based on user profile and persona
   * This helps tailor the prompt for maximum engagement
   */
  determineEngagementGoal(userProfile, persona) {
    // Default goal
    let goal = {
      description: "Drive meaningful engagement and profile visibility",
      objectives: ["Increase profile visits", "Attract quality connections", "Start meaningful conversations"],
      ctaStrategy: "- Ask questions that invite personal experiences\n- Encourage sharing of similar stories\n- Request actionable advice from the community"
    };

    // Analyze user profile for goal inference
    if (userProfile) {
      const goals = userProfile.goals?.toLowerCase() || "";
      const targetAudience = userProfile.targetAudience?.toLowerCase() || "";
      const experience = userProfile.experience?.toLowerCase() || persona?.experience?.toLowerCase() || "";

      // Job seeker / Entry level
      if (goals.includes("job") || goals.includes("career") || experience.includes("entry") || experience.includes("junior")) {
        goal = {
          description: "Attract recruiter attention and showcase expertise",
          objectives: ["Get noticed by recruiters", "Increase profile views from hiring managers", "Demonstrate value and skills"],
          ctaStrategy: "- Ask about industry experiences or career advice\n- Invite connections to share their journey\n- Request feedback on the topic from experienced professionals"
        };
      }
      // Networking / Connections
      else if (goals.includes("network") || goals.includes("connect") || targetAudience.includes("peer")) {
        goal = {
          description: "Build meaningful professional connections",
          objectives: ["Increase connection requests", "Start conversations with peers", "Build industry relationships"],
          ctaStrategy: "- Ask for opinions and experiences from the community\n- Invite people to share their perspectives\n- Create discussion around common challenges"
        };
      }
      // Thought leadership / Authority
      else if (goals.includes("authority") || goals.includes("thought leader") || experience.includes("senior") || experience.includes("executive")) {
        goal = {
          description: "Establish thought leadership and industry authority",
          objectives: ["Increase shares and saves", "Position as industry expert", "Drive meaningful discussions"],
          ctaStrategy: "- Pose thought-provoking questions that challenge assumptions\n- Invite debate and diverse perspectives\n- Ask for real-world applications of the insights shared"
        };
      }
      // Business / Client acquisition
      else if (goals.includes("client") || goals.includes("business") || goals.includes("sales") || targetAudience.includes("client")) {
        goal = {
          description: "Attract potential clients and business opportunities",
          objectives: ["Generate leads", "Showcase expertise to prospects", "Build trust with potential clients"],
          ctaStrategy: "- Ask about challenges they face in this area\n- Invite DMs for deeper conversations\n- Request examples of how they've applied similar strategies"
        };
      }
    }

    // Persona-based adjustments
    if (persona) {
      const personaName = persona.name?.toLowerCase() || "";
      const personaDesc = persona.description?.toLowerCase() || "";

      if (personaName.includes("marketer") || personaDesc.includes("marketing")) {
        goal.ctaStrategy += "\n- Ask about marketing challenges or successes\n- Invite sharing of campaign results";
      } else if (personaName.includes("developer") || personaDesc.includes("tech")) {
        goal.ctaStrategy += "\n- Ask about technical implementations\n- Invite code examples or technical insights";
      } else if (personaName.includes("founder") || personaDesc.includes("entrepreneur")) {
        goal.ctaStrategy += "\n- Ask about startup challenges\n- Invite sharing of entrepreneurial experiences";
      }
    }

    return goal;
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

  /**
   * Analyze content for LinkedIn optimization insights using AI
   * Returns real-time, data-driven insights for virality, engagement, and optimal posting times
   */
  async analyzeContentOptimization(content, topic = null, audience = null) {
    try {
      console.log("🔍 Analyzing content for optimization insights...");

      const prompt = `You are a LinkedIn content optimization expert. Analyze the following LinkedIn post content and provide real, data-driven insights.

CONTENT TO ANALYZE:
${content}

${topic ? `TOPIC: ${topic}` : ''}
${audience ? `TARGET AUDIENCE: ${audience}` : ''}

Analyze this content and provide a JSON response with the following structure:
{
  "viralityScore": <number between 0-100>, // Based on: hook strength, engagement elements (questions, CTAs, numbers), personal storytelling, length optimization, emotional triggers
  "engagementPrediction": "<Very High|High|Medium|Low>", // Based on content quality and engagement elements
  "bestTimeToPost": "<Day HH:MM AM/PM>", // Calculate based on current day/time and optimal LinkedIn engagement patterns (Tuesday-Thursday, 8-10 AM or 12-1 PM are best)
  "optimalDay": "<Day of week>", // Best day for this type of content
  "peakHours": ["HH:MM AM/PM", "HH:MM AM/PM"], // Top 2 peak engagement hours
  "audienceActivity": "<description>", // When the target audience is most active
  "keyStrengths": ["strength1", "strength2"], // Top 2-3 content strengths
  "improvementAreas": ["area1", "area2"], // Areas for improvement
  "estimatedReach": "<High|Medium|Low>", // Estimated reach potential
  "recommendations": ["rec1", "rec2"] // 2-3 actionable recommendations
}

IMPORTANT:
- Calculate viralityScore based on REAL content analysis: hook quality (first sentence), question count, CTA presence, numbers/statistics, personal elements, optimal length (150-300 words), emotional impact
- For bestTimeToPost: Calculate the NEXT optimal time (Tuesday-Thursday 8-10 AM or 12-1 PM EST/PST). If current time is already optimal, suggest next window.
- Use current date/time context: Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.
- Be specific and data-driven, not generic.

Return ONLY valid JSON, no markdown formatting.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();
      
      // Extract JSON from response (handle markdown code blocks if present)
      let jsonStr = response.trim();
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }

      const analysis = JSON.parse(jsonStr);

      // Calculate optimal posting time based on current time
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentHour = now.getHours();
      
      // Best days: Tuesday (2), Wednesday (3), Thursday (4)
      let optimalDay = "Tuesday";
      if (currentDay === 2 || currentDay === 3 || currentDay === 4) {
        optimalDay = ["Tuesday", "Wednesday", "Thursday"][currentDay - 2];
      } else if (currentDay < 2) {
        optimalDay = "Tuesday"; // If Sunday/Monday, suggest Tuesday
      } else {
        optimalDay = "Tuesday"; // If Friday/Saturday, suggest next Tuesday
      }

      // Best hours: 8-10 AM or 12-1 PM (in user's timezone)
      const bestHours = [8, 9, 12];
      let bestHour = 9;
      if (currentHour < 8) {
        bestHour = 9;
      } else if (currentHour < 10) {
        bestHour = 10;
      } else if (currentHour < 12) {
        bestHour = 12;
      } else if (currentHour < 13) {
        bestHour = 13;
      } else {
        bestHour = 9; // Next day
      }

      // Format time
      const formatTime = (hour) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
        return `${displayHour}:00 ${period}`;
      };

      // Override with AI-suggested values if present, otherwise use calculated
      const finalAnalysis = {
        viralityScore: analysis.viralityScore || this.calculateEngagementScore(content),
        engagementPrediction: analysis.engagementPrediction || "Medium",
        bestTimeToPost: analysis.bestTimeToPost || `${optimalDay} ${formatTime(bestHour)}`,
        optimalDay: analysis.optimalDay || optimalDay,
        peakHours: analysis.peakHours || [formatTime(9), formatTime(12)],
        audienceActivity: analysis.audienceActivity || (audience || "General professionals"),
        keyStrengths: analysis.keyStrengths || [],
        improvementAreas: analysis.improvementAreas || [],
        estimatedReach: analysis.estimatedReach || "Medium",
        recommendations: analysis.recommendations || []
      };

      console.log("✅ Content optimization analysis complete:", {
        viralityScore: finalAnalysis.viralityScore,
        engagementPrediction: finalAnalysis.engagementPrediction
      });

      return {
        success: true,
        data: finalAnalysis
      };
    } catch (error) {
      console.error("❌ Content optimization analysis error:", error);
      
      // Fallback to calculated analysis if AI fails
      const fallbackScore = this.calculateEngagementScore(content);
      const now = new Date();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const optimalDay = now.getDay() >= 2 && now.getDay() <= 4 ? days[now.getDay()] : "Tuesday";
      
      return {
        success: true,
        data: {
          viralityScore: fallbackScore,
          engagementPrediction: fallbackScore >= 80 ? "Very High" : fallbackScore >= 60 ? "High" : "Medium",
          bestTimeToPost: `${optimalDay} 9:00 AM`,
          optimalDay: optimalDay,
          peakHours: ["9:00 AM", "12:00 PM"],
          audienceActivity: audience || "General professionals",
          keyStrengths: [],
          improvementAreas: [],
          estimatedReach: "Medium",
          recommendations: []
        }
      };
    }
  }
}

export default new GoogleAIService();

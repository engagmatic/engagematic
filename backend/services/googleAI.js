import axios from 'axios';
import { config } from '../config/index.js';

class GoogleAIService {
  constructor() {
    this.apiKey = config.GOOGLE_AI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generatePost(topic, hook, persona) {
    try {
      const prompt = this.buildPostPrompt(topic, hook, persona);
      
      const response = await axios.post(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      const engagementScore = this.calculateEngagementScore(generatedText);
      
      return {
        content: generatedText,
        engagementScore,
        tokensUsed: response.data.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Google AI API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate post content');
    }
  }

  async generateComment(postContent, persona) {
    try {
      const prompt = this.buildCommentPrompt(postContent, persona);
      
      const response = await axios.post(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000
        }
      );

      const generatedText = response.data.candidates[0].content.parts[0].text;
      
      return {
        content: generatedText,
        tokensUsed: response.data.usageMetadata?.totalTokenCount || 0
      };
    } catch (error) {
      console.error('Google AI API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate comment content');
    }
  }

  buildPostPrompt(topic, hook, persona) {
    return `You are a LinkedIn content creator with the following persona:
    
Name: ${persona.name}
Industry: ${persona.industry}
Experience Level: ${persona.experience}
Tone: ${persona.tone}
Writing Style: ${persona.writingStyle}
Description: ${persona.description}

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
8. Make it sound human and authentic, not AI-generated

Generate only the post content, no additional explanations.`;
  }

  buildCommentPrompt(postContent, persona) {
    return `You are commenting on this LinkedIn post as someone with the following persona:
    
Name: ${persona.name}
Industry: ${persona.industry}
Experience Level: ${persona.experience}
Tone: ${persona.tone}
Writing Style: ${persona.writingStyle}
Description: ${persona.description}

Post content: "${postContent}"

Create a genuine, thoughtful comment that:
1. Shows you've read and understood the post
2. Adds value or shares a relevant experience
3. Maintains the persona's authentic voice
4. Is supportive and professional
5. Encourages further discussion
6. Is between 50-150 words
7. Sounds human and genuine, not AI-generated

Generate only the comment content, no additional explanations.`;
  }

  calculateEngagementScore(content) {
    let score = 50; // Base score
    
    // Check for engagement elements
    if (content.includes('?')) score += 10; // Questions
    if (content.includes('!')) score += 5; // Excitement
    if (content.includes('→') || content.includes('•')) score += 5; // Structure
    if (content.match(/\d+/)) score += 5; // Numbers/statistics
    if (content.includes('story') || content.includes('experience')) score += 10; // Personal elements
    
    // Length bonus (optimal length)
    const wordCount = content.split(' ').length;
    if (wordCount >= 150 && wordCount <= 300) score += 10;
    
    // Ensure score is within bounds
    return Math.min(Math.max(score, 0), 100);
  }
}

export default new GoogleAIService();

/**
 * Comment Types for LinkedIn Comment Generation
 * Each type represents a different approach to commenting on posts
 */

export interface CommentType {
  value: string;
  label: string;
  description: string;
  icon: string;
  example: string;
}

export const COMMENT_TYPES: CommentType[] = [
  {
    value: "personal_story",
    label: "Personal Story",
    description: "Share a quick relevant experience that connects to the post",
    icon: "PS",
    example: "This! We lost 6 months because we couldn't let go of the original vision. Ego is expensive."
  },
  {
    value: "question",
    label: "Thoughtful Question",
    description: "Ask an engaging question that sparks discussion",
    icon: "TQ",
    example: "The 'evolving without ego' part hit hard. Been there. How do you handle pushback from stakeholders?"
  },
  {
    value: "insight",
    label: "Sharp Insight",
    description: "Offer a unique perspective or observation",
    icon: "SI",
    example: "Spot on. Momentum needs process, not just passion. Learned this the hard way!"
  },
  {
    value: "experience_share",
    label: "Experience Share",
    description: "Relate the post to your professional journey",
    icon: "ES",
    example: "Seen this play out 100 times. The daily grind > initial hype. Every. Single. Time."
  },
  {
    value: "enthusiastic_support",
    label: "Enthusiastic Support",
    description: "Show strong agreement with specific reasoning",
    icon: "ES",
    example: "This is gold. The 'evolving without ego' mindset separates good teams from great ones."
  }
];

export const DEFAULT_COMMENT_TYPE = "personal_story";


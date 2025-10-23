/**
 * Curated Persona Options - 15 Best & Most Used Personas
 * Based on common LinkedIn use cases and ICP
 */

export interface PersonaOption {
  id: string;
  name: string;
  industry: string;
  experience: string;
  tone: string;
  writingStyle: string;
  description: string;
  icon: string;
  category: string;
}

export const EXPANDED_PERSONAS: PersonaOption[] = [
  // Tech & Startup (4 personas)
  {
    id: "startup-founder",
    name: "Startup Founder",
    industry: "Technology",
    experience: "Senior",
    tone: "confident",
    writingStyle: "storyteller",
    description: "Shares journey of building from 0 to 1, pivots, and lessons learned",
    icon: "🚀",
    category: "Tech & Startup"
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    industry: "Technology",
    experience: "Mid-level",
    tone: "thoughtful",
    writingStyle: "analytical",
    description: "Technical insights, coding best practices, and career growth",
    icon: "💻",
    category: "Tech & Startup"
  },
  {
    id: "product-manager",
    name: "Product Manager",
    industry: "Technology",
    experience: "Mid-level",
    tone: "strategic",
    writingStyle: "analytical",
    description: "Product strategy, user research, and cross-functional leadership",
    icon: "📱",
    category: "Tech & Startup"
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    industry: "Technology",
    experience: "Senior",
    tone: "technical",
    writingStyle: "analytical",
    description: "ML insights, data storytelling, and AI applications",
    icon: "📊",
    category: "Tech & Startup"
  },
  
  // Sales & Business (3 personas)
  {
    id: "sales-leader",
    name: "Sales Leader",
    industry: "Sales",
    experience: "Senior",
    tone: "enthusiastic",
    writingStyle: "conversational",
    description: "Sales strategies, deal-closing techniques, and team motivation",
    icon: "💰",
    category: "Sales & Business"
  },
  {
    id: "business-development",
    name: "Business Development Manager",
    industry: "Business",
    experience: "Mid-level",
    tone: "strategic",
    writingStyle: "analytical",
    description: "Partnerships, market expansion, and revenue growth strategies",
    icon: "📈",
    category: "Sales & Business"
  },
  {
    id: "entrepreneur",
    name: "Entrepreneur",
    industry: "Business",
    experience: "Senior",
    tone: "authentic",
    writingStyle: "storyteller",
    description: "Building businesses, lessons from failures, and startup journey",
    icon: "💡",
    category: "Sales & Business"
  },
  
  // Marketing & Content (3 personas)
  {
    id: "content-creator",
    name: "Content Creator",
    industry: "Marketing",
    experience: "Mid-level",
    tone: "creative",
    writingStyle: "storyteller",
    description: "Content strategy, storytelling, and audience engagement",
    icon: "✍️",
    category: "Marketing & Content"
  },
  {
    id: "digital-marketer",
    name: "Digital Marketer",
    industry: "Marketing",
    experience: "Mid-level",
    tone: "enthusiastic",
    writingStyle: "conversational",
    description: "SEO, paid ads, growth hacking, and conversion optimization",
    icon: "🎨",
    category: "Marketing & Content"
  },
  {
    id: "brand-strategist",
    name: "Brand Strategist",
    industry: "Marketing",
    experience: "Senior",
    tone: "creative",
    writingStyle: "storyteller",
    description: "Brand positioning, messaging, and market differentiation",
    icon: "🌟",
    category: "Marketing & Content"
  },
  
  // Career & Professional Growth (2 personas)
  {
    id: "job-seeker",
    name: "Job Seeker",
    industry: "Various",
    experience: "Mid-level",
    tone: "authentic",
    writingStyle: "personal",
    description: "Job search journey, career transitions, and networking",
    icon: "🔍",
    category: "Career Growth"
  },
  {
    id: "career-coach",
    name: "Career Coach",
    industry: "Coaching",
    experience: "Senior",
    tone: "empathetic",
    writingStyle: "motivational",
    description: "Career advice, job search strategies, and professional growth",
    icon: "🎓",
    category: "Career Growth"
  },
  
  // Consulting & Leadership (2 personas)
  {
    id: "consultant",
    name: "Management Consultant",
    industry: "Consulting",
    experience: "Senior",
    tone: "strategic",
    writingStyle: "analytical",
    description: "Strategy frameworks, change management, and business transformation",
    icon: "💼",
    category: "Consulting & Leadership"
  },
  {
    id: "hr-leader",
    name: "HR Leader",
    industry: "Human Resources",
    experience: "Senior",
    tone: "empathetic",
    writingStyle: "conversational",
    description: "Culture building, talent acquisition, and employee engagement",
    icon: "👥",
    category: "Consulting & Leadership"
  },
  
  // Freelance & Independent (1 persona)
  {
    id: "freelancer",
    name: "Freelancer",
    industry: "Various",
    experience: "Mid-level",
    tone: "authentic",
    writingStyle: "personal",
    description: "Freelance journey, client management, and work-life balance",
    icon: "💼",
    category: "Freelance & Independent"
  },
];

// Group personas by category for easier navigation
export const PERSONA_CATEGORIES = [
  "Tech & Startup",
  "Sales & Business",
  "Marketing & Content",
  "Career Growth",
  "Consulting & Leadership",
  "Freelance & Independent"
];

// Helper function to get personas by category
export const getPersonasByCategory = (category: string) => {
  return EXPANDED_PERSONAS.filter(p => p.category === category);
};

// Helper function to get all persona names
export const getAllPersonaNames = () => {
  return EXPANDED_PERSONAS.map(p => p.name);
};

// Export for backward compatibility
export default EXPANDED_PERSONAS;


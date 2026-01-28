/**
 * Hook-to-Outcome Content Planner Templates
 * 30 curated templates (10 per goal type) with human-crafted patterns
 * No AI fluff - real, actionable content that drives outcomes
 */

export type GoalType = 'calls' | 'followers' | 'sell' | 'custom';
export type SpiceLevel = 'safe' | 'balanced' | 'bold';
export type CTAType = 'dm' | 'comment' | 'link' | 'save';
export type ContentMix = 'educational' | 'story' | 'opinion' | 'case_study' | 'tactical';

export interface PlannerTemplate {
  id: string;
  goalType: GoalType;
  hookPattern: string;
  angleNote: string;
  ctaType: CTAType;
  commentPromptPattern: string;
  toneVariations: {
    safe: string;
    balanced: string;
    bold: string;
  };
  contentMix: ContentMix[];
  exampleVariables?: {
    [key: string]: string[];
  };
}

// BOOK MORE CALLS TEMPLATES (10 templates)
const callsTemplates: PlannerTemplate[] = [
  {
    id: 'calls_1',
    goalType: 'calls',
    hookPattern: 'Most {audience} think they need more {surface_metric}. What they actually need is {real_lever}.',
    angleNote: 'Explain why focusing on the surface metric is wrong, show the alternative lever, add 1 concrete example from your experience.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "What\'s the one metric you\'re obsessing over right now?"',
    toneVariations: {
      safe: 'Many professionals focus on {surface_metric}, but {real_lever} drives better results.',
      balanced: 'Most {audience} chase {surface_metric}. The real game-changer? {real_lever}.',
      bold: 'Stop obsessing over {surface_metric}. {Real_lever} is what actually moves the needle.'
    },
    contentMix: ['educational', 'opinion'],
    exampleVariables: {
      surface_metric: ['traffic', 'followers', 'leads', 'views', 'impressions'],
      real_lever: ['conversations', 'qualified DMs', 'actual demos', 'real relationships', 'closed deals']
    }
  },
  {
    id: 'calls_2',
    goalType: 'calls',
    hookPattern: 'I used to {common_mistake}. Then I discovered {better_approach} and {specific_result}.',
    angleNote: 'Share a specific mistake you made, the pivot moment, and the measurable result. Be vulnerable but confident.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "If you want my {resource_name}, DM me {specific_benefit}."',
    toneVariations: {
      safe: 'I learned that {better_approach} works better than {common_mistake}.',
      balanced: 'After {common_mistake}, I switched to {better_approach}. Results: {specific_result}.',
      bold: '{Common_mistake} was costing me {cost}. {Better_approach} changed everything.'
    },
    contentMix: ['story', 'educational'],
    exampleVariables: {
      common_mistake: ['spend hours on content', 'chase vanity metrics', 'post randomly', 'ignore engagement'],
      better_approach: ['batch content', 'track conversations', 'post strategically', 'engage authentically'],
      specific_result: ['3x more DMs', '10 booked calls', '50% conversion rate', '2x revenue']
    }
  },
  {
    id: 'calls_3',
    goalType: 'calls',
    hookPattern: 'The {number} mistake {audience} make when {common_scenario}: {mistake}.',
    angleNote: 'Call out a specific, relatable mistake. Explain why it happens, the cost, and the fix. Use numbers.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "Have you made this mistake? What happened?"',
    toneVariations: {
      safe: 'Many {audience} struggle with {common_scenario} because of {mistake}.',
      balanced: 'The biggest mistake in {common_scenario}? {Mistake}. Here\'s why it happens.',
      bold: '{Mistake} is killing your {common_scenario}. Here\'s what to do instead.'
    },
    contentMix: ['educational', 'tactical'],
    exampleVariables: {
      common_scenario: ['trying to grow', 'building authority', 'getting clients', 'scaling'],
      mistake: ['posting without strategy', 'ignoring engagement', 'being too salesy', 'not following up']
    }
  },
  {
    id: 'calls_4',
    goalType: 'calls',
    hookPattern: '{Number} months ago, I {struggle}. Today, {current_state}. Here\'s what changed.',
    angleNote: 'Before/after story with specific timeline. Focus on the transformation moment, not just the result.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "If you\'re struggling with {struggle}, DM me \'{specific_offer}\'."',
    toneVariations: {
      safe: 'I\'ve learned a lot about {topic} over the past {number} months.',
      balanced: '{Number} months ago: {struggle}. Today: {current_state}. The shift? {key_change}.',
      bold: 'From {struggle} to {current_state} in {number} months. Here\'s exactly what I did.'
    },
    contentMix: ['story', 'case_study'],
    exampleVariables: {
      struggle: ['getting zero DMs', 'no one booking calls', 'struggling to convert', 'invisible online'],
      current_state: ['booked out 3 weeks', '10+ DMs daily', 'closing deals consistently', 'recognized authority']
    }
  },
  {
    id: 'calls_5',
    goalType: 'calls',
    hookPattern: 'Everyone talks about {popular_topic}. Nobody talks about {hidden_truth}.',
    angleNote: 'Reveal an unpopular truth. Back it with logic or experience. Make people think "I never thought of that."',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "What\'s the unpopular truth in your industry?"',
    toneVariations: {
      safe: 'While {popular_topic} gets attention, {hidden_truth} matters more.',
      balanced: 'Everyone focuses on {popular_topic}. The real game-changer? {Hidden_truth}.',
      bold: 'Forget {popular_topic}. {Hidden_truth} is what actually matters.'
    },
    contentMix: ['opinion', 'educational'],
    exampleVariables: {
      popular_topic: ['going viral', 'posting daily', 'having 10K followers', 'getting featured'],
      hidden_truth: ['quality conversations beat reach', 'consistency beats frequency', 'engagement beats followers', 'results beat visibility']
    }
  },
  {
    id: 'calls_6',
    goalType: 'calls',
    hookPattern: 'If you\'re {audience} struggling with {pain_point}, this {framework/approach} will help.',
    angleNote: 'Direct value proposition. Explain the framework in 3-4 steps. Make it actionable immediately.',
    ctaType: 'comment',
    commentPromptPattern: 'End with: "Comment {specific_word} if you want the full {resource_type}."',
    toneVariations: {
      safe: 'For {audience} dealing with {pain_point}, here\'s a helpful approach.',
      balanced: 'Struggling with {pain_point}? This {framework} changed how I {outcome}.',
      bold: 'If {pain_point} is killing your results, use this {framework}.'
    },
    contentMix: ['tactical', 'educational'],
    exampleVariables: {
      pain_point: ['getting no responses', 'low conversion', 'time management', 'content ideas'],
      framework: ['3-step system', 'framework', 'method', 'approach']
    }
  },
  {
    id: 'calls_7',
    goalType: 'calls',
    hookPattern: 'The {number} types of {audience} I see: {type_1}, {type_2}, {type_3}. Which are you?',
    angleNote: 'Create 3-4 categories. Describe each clearly. Make it relatable. End with a question that drives self-reflection.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "Which type resonates? What\'s your experience?"',
    toneVariations: {
      safe: 'I notice {audience} tend to fall into {number} categories.',
      balanced: 'After working with {number} {audience}, I see {number} patterns: {types}.',
      bold: 'Every {audience} fits one of {number} types. Which one are you?'
    },
    contentMix: ['educational', 'opinion'],
    exampleVariables: {
      type_1: ['the perfectionist', 'the hustler', 'the analyzer', 'the networker'],
      type_2: ['the experimenter', 'the strategist', 'the builder', 'the connector'],
      type_3: ['the optimizer', 'the creator', 'the seller', 'the educator']
    }
  },
  {
    id: 'calls_8',
    goalType: 'calls',
    hookPattern: 'I spent {time/money} on {wrong_approach}. Then I tried {right_approach} and {result}.',
    angleNote: 'Cost of wrong approach + better alternative + specific outcome. Use exact numbers when possible.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "If you\'re wasting {resource} on {wrong_approach}, DM me \'{solution_offer}\'."',
    toneVariations: {
      safe: 'I learned that {right_approach} works better than {wrong_approach}.',
      balanced: '{Wrong_approach} cost me {cost}. {Right_approach} delivered {result}.',
      bold: 'Stop wasting {resource} on {wrong_approach}. {Right_approach} gets {result}.'
    },
    contentMix: ['story', 'case_study'],
    exampleVariables: {
      wrong_approach: ['paid ads', 'cold outreach', 'content without strategy', 'vanity metrics'],
      right_approach: ['organic engagement', 'warm introductions', 'strategic content', 'conversation metrics']
    }
  },
  {
    id: 'calls_9',
    goalType: 'calls',
    hookPattern: 'The question {audience} should ask: "{powerful_question}".',
    angleNote: 'Pose a thought-provoking question. Explain why it matters. Give context. Make it actionable.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "What\'s your answer to this question? Share below."',
    toneVariations: {
      safe: 'Here\'s an important question for {audience} to consider.',
      balanced: 'The question that changed my approach: "{powerful_question}".',
      bold: 'Stop asking "{wrong_question}". Start asking "{powerful_question}".'
    },
    contentMix: ['opinion', 'educational'],
    exampleVariables: {
      powerful_question: ['What problem am I actually solving?', 'Who needs this most?', 'What would make them say yes?', 'What\'s the real bottleneck?']
    }
  },
  {
    id: 'calls_10',
    goalType: 'calls',
    hookPattern: '{Number} {audience} asked me "{common_question}". Here\'s my honest answer.',
    angleNote: 'Address a frequently asked question. Give a direct, valuable answer. Add nuance. Show expertise.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "If you have {related_question}, DM me \'{specific_offer}\'."',
    toneVariations: {
      safe: 'Many {audience} ask about {topic}. Here\'s what I\'ve learned.',
      balanced: '{Number} people asked: "{common_question}". Here\'s my take.',
      bold: 'Everyone asks "{common_question}". Here\'s the answer nobody gives.'
    },
    contentMix: ['educational', 'tactical'],
    exampleVariables: {
      common_question: ['How do I get more clients?', 'What\'s the best strategy?', 'How long until I see results?', 'What should I focus on?']
    }
  }
];

// GROW FOLLOWERS TEMPLATES (10 templates)
const followersTemplates: PlannerTemplate[] = [
  {
    id: 'followers_1',
    goalType: 'followers',
    hookPattern: 'The {number} content types that get {audience} to follow: {type_1}, {type_2}, {type_3}.',
    angleNote: 'List 3-4 content types that drive follows. Explain why each works. Give examples. Make it actionable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this post if you want more followers."',
    toneVariations: {
      safe: 'Here are {number} types of content that help grow followers.',
      balanced: 'The {number} posts that got me {follower_count} followers: {types}.',
      bold: 'Want followers? Post these {number} content types. Nothing else works.'
    },
    contentMix: ['tactical', 'educational'],
    exampleVariables: {
      type_1: ['behind-the-scenes', 'mistake stories', 'quick wins', 'industry insights'],
      type_2: ['case studies', 'tactical tips', 'personal lessons', 'trend analysis'],
      type_3: ['controversial takes', 'frameworks', 'before/after', 'expert opinions']
    }
  },
  {
    id: 'followers_2',
    goalType: 'followers',
    hookPattern: 'I went from {old_state} to {new_state} by {specific_action}. Here\'s how.',
    angleNote: 'Transformation story with specific numbers. Focus on the action that made the difference. Make it replicable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this if you want to {achieve_similar}."',
    toneVariations: {
      safe: 'I\'ve grown from {old_state} to {new_state} by focusing on {specific_action}.',
      balanced: '{Old_state} → {new_state} in {timeframe}. The game-changer? {Specific_action}.',
      bold: 'From {old_state} to {new_state}. Here\'s exactly what I did.'
    },
    contentMix: ['story', 'case_study'],
    exampleVariables: {
      old_state: ['200 followers', 'zero engagement', 'invisible', 'no one sharing'],
      new_state: ['10K followers', 'viral posts', 'recognized', 'shares daily'],
      specific_action: ['posting 3x/week', 'engaging authentically', 'sharing value', 'being consistent']
    }
  },
  {
    id: 'followers_3',
    goalType: 'followers',
    hookPattern: 'Everyone says "{common_advice}". But {unpopular_truth} is what actually works.',
    angleNote: 'Challenge conventional wisdom. Back it with experience or data. Make people rethink their approach.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "What\'s the advice you\'ve heard that didn\'t work?"',
    toneVariations: {
      safe: 'While {common_advice} is popular, {unpopular_truth} works better.',
      balanced: 'Forget "{common_advice}". {Unpopular_truth} is what gets results.',
      bold: '"{Common_advice}" is wrong. Here\'s what actually works: {unpopular_truth}.'
    },
    contentMix: ['opinion', 'educational'],
    exampleVariables: {
      common_advice: ['post daily', 'go viral', 'be consistent', 'post at peak times'],
      unpopular_truth: ['quality beats frequency', 'niche beats broad', 'engagement beats posting', 'value beats timing']
    }
  },
  {
    id: 'followers_4',
    goalType: 'followers',
    hookPattern: 'The {number} mistakes killing your follower growth: {mistake_1}, {mistake_2}, {mistake_3}.',
    angleNote: 'List common mistakes. Explain why each hurts growth. Give the fix. Make it actionable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this to avoid these mistakes."',
    toneVariations: {
      safe: 'Here are {number} common mistakes that slow follower growth.',
      balanced: 'These {number} mistakes are why you\'re not growing: {mistakes}.',
      bold: 'Stop making these {number} mistakes. They\'re killing your growth.'
    },
    contentMix: ['educational', 'tactical'],
    exampleVariables: {
      mistake_1: ['posting inconsistently', 'ignoring engagement', 'being too salesy', 'copying others'],
      mistake_2: ['no clear value', 'posting randomly', 'not engaging back', 'being generic'],
      mistake_3: ['giving up too soon', 'chasing trends', 'ignoring analytics', 'not building relationships']
    }
  },
  {
    id: 'followers_5',
    goalType: 'followers',
    hookPattern: 'I analyzed {number} accounts that grew to {follower_count}. They all {common_pattern}.',
    angleNote: 'Pattern recognition from successful accounts. Share the pattern. Explain why it works. Make it actionable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this pattern if you want to grow."',
    toneVariations: {
      safe: 'Successful accounts tend to {common_pattern}.',
      balanced: 'After analyzing {number} growing accounts, one pattern stands out: {common_pattern}.',
      bold: 'Every account that hits {follower_count} does this: {common_pattern}.'
    },
    contentMix: ['educational', 'case_study'],
    exampleVariables: {
      common_pattern: ['post value consistently', 'engage authentically', 'share stories', 'build community']
    }
  },
  {
    id: 'followers_6',
    goalType: 'followers',
    hookPattern: 'Why {popular_strategy} doesn\'t work (and what to do instead).',
    angleNote: 'Debunk a popular strategy. Explain why it fails. Offer a better alternative. Make it practical.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "Have you tried {popular_strategy}? What happened?"',
    toneVariations: {
      safe: '{Popular_strategy} seems effective, but {better_alternative} works better.',
      balanced: 'Everyone tries {popular_strategy}. Here\'s why it fails and what works instead.',
      bold: '{Popular_strategy} is a waste of time. Do this instead: {better_alternative}.'
    },
    contentMix: ['opinion', 'tactical'],
    exampleVariables: {
      popular_strategy: ['posting 5x/day', 'using trending hashtags', 'buying followers', 'automated engagement'],
      better_alternative: ['posting 3x/week with value', 'niche-specific hashtags', 'organic growth', 'authentic engagement']
    }
  },
  {
    id: 'followers_7',
    goalType: 'followers',
    hookPattern: 'The {number}-day experiment: I {experiment_action} and {result}.',
    angleNote: 'Share a specific experiment. What you tested, the timeframe, the result. Make it replicable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this experiment if you want to try it."',
    toneVariations: {
      safe: 'I tried {experiment_action} for {number} days. Here\'s what happened.',
      balanced: '{Number}-day experiment: {experiment_action} → {result}.',
      bold: 'I tested {experiment_action} for {number} days. The result shocked me.'
    },
    contentMix: ['story', 'case_study'],
    exampleVariables: {
      experiment_action: ['posting at 6 AM', 'engaging 30 min/day', 'sharing only stories', 'posting frameworks'],
      result: ['2x engagement', '500 new followers', 'viral posts', '10x shares']
    }
  },
  {
    id: 'followers_8',
    goalType: 'followers',
    hookPattern: 'The {number} things {audience} should post to grow: {thing_1}, {thing_2}, {thing_3}.',
    angleNote: 'List specific content types. Explain why each drives follows. Give examples. Make it actionable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this list for your content calendar."',
    toneVariations: {
      safe: 'Here are {number} types of content that help {audience} grow.',
      balanced: 'The {number} posts that drive follower growth: {things}.',
      bold: 'Want followers? Post these {number} things. Nothing else matters.'
    },
    contentMix: ['tactical', 'educational'],
    exampleVariables: {
      thing_1: ['mistake stories', 'behind-the-scenes', 'quick wins', 'industry insights'],
      thing_2: ['case studies', 'frameworks', 'personal lessons', 'trend analysis'],
      thing_3: ['controversial takes', 'tactical tips', 'before/after', 'expert opinions']
    }
  },
  {
    id: 'followers_9',
    goalType: 'followers',
    hookPattern: 'I used to {old_behavior}. Now I {new_behavior} and {specific_result}.',
    angleNote: 'Personal transformation. Old vs new behavior. Specific outcome. Make it relatable and actionable.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "What behavior change made the biggest difference for you?"',
    toneVariations: {
      safe: 'I\'ve changed from {old_behavior} to {new_behavior}, and it\'s helped me {specific_result}.',
      balanced: 'Old me: {old_behavior}. New me: {new_behavior}. Result: {specific_result}.',
      bold: 'I stopped {old_behavior}. Started {new_behavior}. {Specific_result} happened.'
    },
    contentMix: ['story', 'educational'],
    exampleVariables: {
      old_behavior: ['posting randomly', 'chasing trends', 'ignoring engagement', 'being generic'],
      new_behavior: ['posting strategically', 'staying authentic', 'engaging daily', 'sharing value'],
      specific_result: ['3x followers', 'viral posts', 'recognized authority', 'engaged community']
    }
  },
  {
    id: 'followers_10',
    goalType: 'followers',
    hookPattern: 'The {number} posts that got me {follower_count} followers: {post_type_1}, {post_type_2}, {post_type_3}.',
    angleNote: 'Share specific post types that worked. Explain why. Give examples. Make it replicable.',
    ctaType: 'save',
    commentPromptPattern: 'End with: "Save this if you want {follower_count} followers."',
    toneVariations: {
      safe: 'These {number} types of posts helped me grow to {follower_count} followers.',
      balanced: 'The {number} posts that got me {follower_count} followers: {post_types}.',
      bold: 'Want {follower_count} followers? Post these {number} types. That\'s it.'
    },
    contentMix: ['case_study', 'tactical'],
    exampleVariables: {
      post_type_1: ['mistake stories', 'behind-the-scenes', 'quick wins', 'industry insights'],
      post_type_2: ['case studies', 'frameworks', 'personal lessons', 'trend analysis'],
      post_type_3: ['controversial takes', 'tactical tips', 'before/after', 'expert opinions']
    }
  }
];

// SELL PRODUCT/SERVICE TEMPLATES (10 templates)
const sellTemplates: PlannerTemplate[] = [
  {
    id: 'sell_1',
    goalType: 'sell',
    hookPattern: 'The {number} objections {audience} have about {product/service}: {objection_1}, {objection_2}, {objection_3}.',
    angleNote: 'List common objections. Address each directly. Show understanding. Provide solutions. Build trust.',
    ctaType: 'link',
    commentPromptPattern: 'End with: "Which objection resonates? Comment and I\'ll address it."',
    toneVariations: {
      safe: 'Many {audience} have concerns about {product/service}. Here\'s how we address them.',
      balanced: 'The {number} objections I hear most: {objections}. Here\'s my take.',
      bold: 'Stop worrying about {objections}. Here\'s the truth about {product/service}.'
    },
    contentMix: ['educational', 'case_study'],
    exampleVariables: {
      objection_1: ['too expensive', 'not sure if it works', 'don\'t have time', 'tried before'],
      objection_2: ['not right fit', 'too complicated', 'results take too long', 'not convinced'],
      objection_3: ['need to think', 'budget constraints', 'timing wrong', 'competition']
    }
  },
  {
    id: 'sell_2',
    goalType: 'sell',
    hookPattern: 'How {client_name} went from {before_state} to {after_state} using {product/service}.',
    angleNote: 'Case study format. Specific client (can be anonymized). Before/after with numbers. Process. Results.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "If you want similar results, DM me \'{specific_offer}\'."',
    toneVariations: {
      safe: 'Here\'s how {product/service} helped {client_name} achieve {after_state}.',
      balanced: '{Client_name}: {before_state} → {after_state} with {product/service}.',
      bold: 'How {client_name} went from {before_state} to {after_state} in {timeframe}.'
    },
    contentMix: ['case_study', 'story'],
    exampleVariables: {
      before_state: ['struggling to convert', 'low revenue', 'no clients', 'invisible'],
      after_state: ['booked out', '3x revenue', 'consistent clients', 'recognized authority']
    }
  },
  {
    id: 'sell_3',
    goalType: 'sell',
    hookPattern: 'The {number} signs {audience} need {product/service}: {sign_1}, {sign_2}, {sign_3}.',
    angleNote: 'Identify pain points. Make them relatable. Show how product/service solves each. Create urgency.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "How many of these signs do you have? Comment below."',
    toneVariations: {
      safe: 'If you\'re experiencing {signs}, {product/service} might help.',
      balanced: 'The {number} signs you need {product/service}: {signs}.',
      bold: 'If you have {number} of these signs, you need {product/service}.'
    },
    contentMix: ['educational', 'tactical'],
    exampleVariables: {
      sign_1: ['spending too much time', 'not seeing results', 'feeling stuck', 'losing clients'],
      sign_2: ['working 24/7', 'low conversion', 'no system', 'competition winning'],
      sign_3: ['burnout', 'revenue plateau', 'manual processes', 'missing opportunities']
    }
  },
  {
    id: 'sell_4',
    goalType: 'sell',
    hookPattern: 'Why {audience} choose {product/service} over {alternative}: {reason_1}, {reason_2}, {reason_3}.',
    angleNote: 'Comparison format. Highlight advantages. Be honest about trade-offs. Show value. Build confidence.',
    ctaType: 'link',
    commentPromptPattern: 'End with: "Have you tried {alternative}? What was your experience?"',
    toneVariations: {
      safe: '{Product/service} offers {reasons} compared to {alternative}.',
      balanced: 'Why {audience} pick {product/service} over {alternative}: {reasons}.',
      bold: 'Stop using {alternative}. {Product/service} gives you {reasons}.'
    },
    contentMix: ['educational', 'opinion'],
    exampleVariables: {
      alternative: ['DIY', 'competitor', 'free tools', 'old method'],
      reason_1: ['saves time', 'better results', 'proven system', 'expert support'],
      reason_2: ['faster outcomes', 'less stress', 'higher quality', 'more reliable'],
      reason_3: ['scalable', 'cost-effective', 'comprehensive', 'tailored']
    }
  },
  {
    id: 'sell_5',
    goalType: 'sell',
    hookPattern: 'The {number}-step framework to {achieve_outcome} using {product/service}.',
    angleNote: 'Educational framework. Break down process. Show how product/service fits. Make it actionable.',
    ctaType: 'comment',
    commentPromptPattern: 'End with: "Comment {specific_word} if you want the full {resource_type}."',
    toneVariations: {
      safe: 'Here\'s a {number}-step approach to {achieve_outcome}.',
      balanced: 'The {number}-step framework that gets {achieve_outcome}: {steps}.',
      bold: 'Want {achieve_outcome}? Follow this {number}-step framework.'
    },
    contentMix: ['tactical', 'educational'],
    exampleVariables: {
      achieve_outcome: ['get more clients', 'increase revenue', 'build authority', 'scale business']
    }
  },
  {
    id: 'sell_6',
    goalType: 'sell',
    hookPattern: 'I spent {time/money} building {product/service} because {problem} was costing me {cost}.',
    angleNote: 'Origin story. Problem that led to creation. Cost of problem. Solution. Results. Build credibility.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "If {problem} is costing you {cost}, DM me \'{solution_offer}\'."',
    toneVariations: {
      safe: 'I created {product/service} to solve {problem}.',
      balanced: '{Problem} was costing me {cost}. So I built {product/service}.',
      bold: 'I spent {time/money} solving {problem}. Here\'s what I built: {product/service}.'
    },
    contentMix: ['story', 'case_study'],
    exampleVariables: {
      problem: ['wasting time', 'losing money', 'missing opportunities', 'inefficiency'],
      cost: ['$10K/month', '20 hours/week', '50% revenue', 'burnout']
    }
  },
  {
    id: 'sell_7',
    goalType: 'sell',
    hookPattern: 'The {number} questions {audience} ask before buying {product/service}: {question_1}, {question_2}, {question_3}.',
    angleNote: 'Address buyer concerns proactively. Answer each question. Show expertise. Build trust. Remove friction.',
    ctaType: 'comment',
    commentPromptPattern: 'Ask: "What questions do you have? Comment below."',
    toneVariations: {
      safe: 'Many {audience} ask these questions about {product/service}.',
      balanced: 'The {number} questions I get most: {questions}. Here are honest answers.',
      bold: 'Before buying {product/service}, {audience} ask {number} questions. Here\'s the truth.'
    },
    contentMix: ['educational', 'tactical'],
    exampleVariables: {
      question_1: ['How long until results?', 'What\'s included?', 'Is it worth it?', 'Will it work for me?'],
      question_2: ['What if it doesn\'t work?', 'Can I customize?', 'What\'s the ROI?', 'Is support included?'],
      question_3: ['How is it different?', 'What\'s the process?', 'Can I see results?', 'Is there a guarantee?']
    }
  },
  {
    id: 'sell_8',
    goalType: 'sell',
    hookPattern: 'The {number} mistakes {audience} make when {common_scenario}: {mistake_1}, {mistake_2}, {mistake_3}.',
    angleNote: 'Identify mistakes. Explain cost. Show how product/service prevents them. Create awareness.',
    ctaType: 'link',
    commentPromptPattern: 'End with: "Have you made these mistakes? What happened?"',
    toneVariations: {
      safe: 'Many {audience} struggle with {common_scenario} because of {mistakes}.',
      balanced: 'The {number} mistakes in {common_scenario}: {mistakes}. Here\'s how to avoid them.',
      bold: 'Stop making these {number} mistakes. They\'re costing you {cost}.'
    },
    contentMix: ['educational', 'tactical'],
    exampleVariables: {
      common_scenario: ['trying to grow', 'hiring help', 'scaling', 'building systems'],
      mistake_1: ['doing it alone', 'choosing wrong solution', 'rushing', 'not planning'],
      mistake_2: ['ignoring systems', 'cutting corners', 'not investing', 'being reactive'],
      mistake_3: ['giving up early', 'not measuring', 'no strategy', 'trying everything']
    }
  },
  {
    id: 'sell_9',
    goalType: 'sell',
    hookPattern: 'How {product/service} helped {number} {audience} achieve {specific_outcome}.',
    angleNote: 'Social proof with numbers. Aggregate results. Show patterns. Build credibility. Create FOMO.',
    ctaType: 'dm',
    commentPromptPattern: 'End with: "Want to join {number} {audience}? DM me \'{specific_offer}\'."',
    toneVariations: {
      safe: '{Product/service} has helped many {audience} achieve {specific_outcome}.',
      balanced: '{Number} {audience} used {product/service} to {specific_outcome}.',
      bold: '{Number} {audience} got {specific_outcome} with {product/service}. Here\'s how.'
    },
    contentMix: ['case_study', 'story'],
    exampleVariables: {
      specific_outcome: ['double revenue', 'book out 3 months', 'scale to 6-figures', 'build authority']
    }
  },
  {
    id: 'sell_10',
    goalType: 'sell',
    hookPattern: 'The {number} things {product/service} does differently: {difference_1}, {difference_2}, {difference_3}.',
    angleNote: 'Unique value proposition. Highlight differentiators. Explain benefits. Show superiority. Build desire.',
    ctaType: 'link',
    commentPromptPattern: 'End with: "What makes {product/service} different? Comment your thoughts."',
    toneVariations: {
      safe: '{Product/service} offers {differences} compared to alternatives.',
      balanced: 'What makes {product/service} different: {differences}.',
      bold: 'Why {product/service} beats everything else: {differences}.'
    },
    contentMix: ['educational', 'opinion'],
    exampleVariables: {
      difference_1: ['proven system', 'expert support', 'faster results', 'better outcomes'],
      difference_2: ['comprehensive', 'tailored', 'scalable', 'reliable'],
      difference_3: ['backed by results', 'continuously updated', 'community access', 'lifetime value']
    }
  }
];

export const PLANNER_TEMPLATES: PlannerTemplate[] = [
  ...callsTemplates,
  ...followersTemplates,
  ...sellTemplates
];

// Helper function to get templates by goal type
export const getTemplatesByGoal = (goalType: GoalType): PlannerTemplate[] => {
  return PLANNER_TEMPLATES.filter(t => t.goalType === goalType);
};

// Helper function to get random template
export const getRandomTemplate = (goalType: GoalType, contentMix?: ContentMix[]): PlannerTemplate => {
  let templates = getTemplatesByGoal(goalType);
  
  if (contentMix && contentMix.length > 0) {
    templates = templates.filter(t => 
      contentMix.some(mix => t.contentMix.includes(mix))
    );
  }
  
  if (templates.length === 0) {
    templates = getTemplatesByGoal(goalType);
  }
  
  return templates[Math.floor(Math.random() * templates.length)];
};

// Variable injection helpers
export const injectVariables = (
  pattern: string,
  variables: Record<string, string>
): string => {
  let result = pattern;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, value);
  });
  return result;
};

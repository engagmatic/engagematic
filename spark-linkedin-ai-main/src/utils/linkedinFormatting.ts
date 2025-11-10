/**
 * LinkedIn Formatting Utilities
 * Converts text to LinkedIn-compatible formatting
 */

/**
 * Unicode Bold Characters
 * LinkedIn doesn't support HTML bold or markdown, so we use Unicode bold characters
 */
const boldMap: Record<string, string> = {
  'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛',
  'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣',
  'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫',
  'Y': '𝗬', 'Z': '𝗭',
  'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵',
  'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽',
  'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅',
  'y': '𝘆', 'z': '𝘇',
  '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳',
  '8': '𝟴', '9': '𝟵'
};

/**
 * Convert text to Unicode bold for LinkedIn
 * Example: "Hello World" → "𝗛𝗲𝗹𝗹𝗼 𝗪𝗼𝗿𝗹𝗱"
 */
export function toBold(text: string): string {
  return text.split('').map(char => boldMap[char] || char).join('');
}

/**
 * Apply LinkedIn-compatible formatting to AI-generated content
 * Looks for patterns like **text** and converts to Unicode bold
 */
export function applyLinkedInFormatting(text: string): string {
  // Pattern 1: **bold text** → 𝗯𝗼𝗹𝗱 𝘁𝗲𝘅𝘁
  text = text.replace(/\*\*([^*]+)\*\*/g, (match, content) => {
    return toBold(content);
  });

  // Pattern 2: __bold text__ → 𝗯𝗼𝗹𝗱 𝘁𝗲𝘅𝘁
  text = text.replace(/__([^_]+)__/g, (match, content) => {
    return toBold(content);
  });

  // Pattern 3: Bold entire headings (lines ending with :)
  text = text.split('\n').map(line => {
    // If line ends with : and is not too long (likely a heading)
    if (line.trim().endsWith(':') && line.trim().length < 100) {
      return toBold(line.trim());
    }
    return line;
  }).join('\n');

  return text;
}

/**
 * Format numbers with emojis for better engagement
 * Example: "1. Point one" → "1️⃣ Point one"
 */
export function formatNumberedList(text: string): string {
  const numberEmojis: Record<string, string> = {
    '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣',
    '6': '6️⃣', '7': '7️⃣', '8': '8️⃣', '9': '9️⃣', '10': '🔟'
  };

  return text.replace(/^(\d+)\.\s/gm, (match, num) => {
    return numberEmojis[num] ? `${numberEmojis[num]} ` : match;
  });
}

/**
 * Clean up text - remove excessive line breaks and normalize spacing
 */
function cleanText(text: string): string {
  // Remove excessive line breaks (more than 2 consecutive)
  text = text.replace(/\n{3,}/g, '\n\n');
  
  // Remove trailing whitespace from lines
  text = text.split('\n').map(line => line.trimEnd()).join('\n');
  
  // Normalize spaces (remove multiple spaces but keep single spaces)
  text = text.replace(/[ \t]+/g, ' ');
  
  return text.trim();
}

/**
 * Complete LinkedIn post formatting pipeline
 */
export function formatForLinkedIn(text: string): string {
  let formatted = text;
  
  // Clean up text first
  formatted = cleanText(formatted);
  
  // Apply bold formatting
  formatted = applyLinkedInFormatting(formatted);
  
  // Format numbered lists (optional - can be enabled/disabled)
  // formatted = formatNumberedList(formatted);
  
  return formatted;
}

/**
 * Check if text contains LinkedIn-compatible bold characters
 */
export function hasBoldFormatting(text: string): boolean {
  const boldChars = Object.values(boldMap);
  return text.split('').some(char => boldChars.includes(char));
}

/**
 * Remove bold formatting (convert back to regular text)
 */
export function removeBold(text: string): string {
  const reverseBoldMap: Record<string, string> = {};
  Object.entries(boldMap).forEach(([regular, bold]) => {
    reverseBoldMap[bold] = regular;
  });
  
  return text.split('').map(char => reverseBoldMap[char] || char).join('');
}

export default {
  toBold,
  applyLinkedInFormatting,
  formatNumberedList,
  formatForLinkedIn,
  hasBoldFormatting,
  removeBold
};


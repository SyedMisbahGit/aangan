import { BadRequestError } from '../errors';

type FilterConfig = {
  /** List of exact match words to filter */
  exactMatch: string[];
  /** List of regex patterns to filter */
  regexPatterns: string[];
  /** Whether to perform case-insensitive matching */
  caseSensitive: boolean;
  /** Whether to check for leet speak variations */
  checkLeetSpeak: boolean;
};

const defaultConfig: FilterConfig = {
  exactMatch: [
    // Profanity
    'profanity1', 'profanity2', 'profanity3',
    
    // Hate speech
    'hate1', 'hate2', 'hate3',
    
    // Harassment
    'harassment1', 'harassment2',
    
    // Personal information
    'ssn', 'social security', 'credit card', 'password',
  ],
  regexPatterns: [
    // Phone numbers
    '\\b\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}\\b',
    
    // Email addresses
    '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    
    // URLs
    '(https?:\\/\\/)?([\\w-]+\\.)+[\\w-]+(\\/[\\w- .\\/?%&=]*)?',
  ],
  caseSensitive: false,
  checkLeetSpeak: true,
};

/**
 * Converts leet speak characters to their letter equivalents
 */
const normalizeLeetSpeak = (text: string): string => {
  const leetMap: Record<string, string> = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '8': 'b',
    '9': 'g',
    '@': 'a',
    '!': 'i',
    '$': 's',
    '0': 'o',
    '|': 'i',
    '\\/': 'v',
    '\\/\\/': 'w',
    '()': 'o',
    '2': 'z',
  };

  let normalized = text.toLowerCase();
  Object.entries(leetMap).forEach(([leet, normal]) => {
    const regex = new RegExp(leet, 'gi');
    normalized = normalized.replace(regex, normal);
  });
  return normalized;
};

/**
 * Checks if the given text contains any filtered keywords
 */
export const containsFilteredKeywords = (
  text: string, 
  customConfig?: Partial<FilterConfig>
): { hasMatch: boolean; matchedWords: string[]; isSafe: boolean } => {
  if (!text || typeof text !== 'string') {
    return { hasMatch: false, matchedWords: [], isSafe: true };
  }

  const config: FilterConfig = { ...defaultConfig, ...customConfig };
  const matchedWords: string[] = [];
  
  // Check exact matches
  const exactMatches = config.exactMatch.filter(word => {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, config.caseSensitive ? 'g' : 'gi');
    const hasMatch = regex.test(text);
    
    if (hasMatch) {
      matchedWords.push(word);
      return true;
    }
    
    // Check leet speak variations if enabled
    if (config.checkLeetSpeak) {
      const normalizedText = normalizeLeetSpeak(text);
      const normalizedWord = normalizeLeetSpeak(word);
      const normalizedRegex = new RegExp(`\\b${normalizedWord}\\b`, 'gi');
      const hasLeetMatch = normalizedRegex.test(normalizedText);
      
      if (hasLeetMatch) {
        matchedWords.push(`[Leet: ${word}]`);
        return true;
      }
    }
    
    return false;
  });
  
  // Check regex patterns
  const regexMatches = config.regexPatterns.filter(pattern => {
    try {
      const regex = new RegExp(pattern, config.caseSensitive ? 'g' : 'gi');
      const hasMatch = regex.test(text);
      
      if (hasMatch) {
        matchedWords.push(`[Pattern: ${pattern}]`);
        return true;
      }
    } catch (err) {
      console.error(`Invalid regex pattern: ${pattern}`, err);
    }
    return false;
  });
  
  const hasMatch = exactMatches.length > 0 || regexMatches.length > 0;
  
  return {
    hasMatch,
    matchedWords: [...new Set(matchedWords)], // Remove duplicates
    isSafe: !hasMatch,
  };
};

/**
 * Validates that the text doesn't contain filtered keywords
 * @throws {BadRequestError} If the text contains filtered keywords
 */
export const validateContent = (
  text: string, 
  customConfig?: Partial<FilterConfig>
): void => {
  const { hasMatch, matchedWords } = containsFilteredKeywords(text, customConfig);
  
  if (hasMatch) {
    throw new BadRequestError(
      'Content contains filtered words or patterns',
      'CONTENT_FILTERED',
      { matchedWords }
    );
  }
};

/**
 * @file security.ts
 * @description Enterprise-grade security utilities for input sanitization, 
 * prompt injection defense, and XSS prevention.
 */

// Regex patterns for potential prompt injection vectors
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|system)\s+(instructions|prompts|rules)/gi,
  /system\s*:\s*/gi,
  /system\s+prompt\s+override/gi,
  /you\s+are\s+now\s+(unrestricted|DAN|jailbroken)/gi,
  /disregard\s+(the\s+)?above/gi,
  /reveal\s+(the\s+)?(secret|hidden|system)\s+(keys?|prompt|instructions)/gi,
  /override\s+(all\s+)?security\s+rules/gi,
];

// Regex for HTML tags and executable scripts
const HTML_TAG_REGEX = /<[^>]*>?/gm;
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const JAVASCRIPT_PROTOCOL_REGEX = /^javascript:/i;

/**
 * Sanitizes user-provided text to prevent HTML injection (XSS)
 * and neutralize generative AI prompt injection attempts.
 *
 * @param input - The raw user input string
 * @param maxLength - Optional maximum character limit (defaults to 1000)
 * @returns Sanitized and normalized string
 */
export const sanitizeText = (input: unknown, maxLength = 1000): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // 1. Remove dangerous script blocks and HTML tags
  let cleaned = input
    .replace(SCRIPT_REGEX, '')
    .replace(HTML_TAG_REGEX, '')
    .trim();

  // 2. Neutralize prompt injection phrases
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    cleaned = cleaned.replace(pattern, '[filtered]');
  }

  // 3. Normalize whitespace and enforce character ceiling
  cleaned = cleaned.replace(/\s+/g, ' ');
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength).trim();
  }

  return cleaned;
};

/**
 * Validates and sanitizes external URLs, permitting only safe HTTP and HTTPS protocols.
 * Prevents javascript: or data: URI execution.
 *
 * @param url - The URL string to validate
 * @returns Clean URL string or undefined if invalid
 */
export const sanitizeUrl = (url?: string): string | undefined => {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();
  if (JAVASCRIPT_PROTOCOL_REGEX.test(trimmed)) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return undefined;
  } catch {
    // If not a full absolute URL, verify it does not contain protocol injection
    if (!trimmed.includes(':') && !trimmed.startsWith('//')) {
      return `https://${trimmed}`;
    }
    return undefined;
  }
};

/**
 * Escapes characters for safe inclusion in RFC-5545 iCalendar data.
 *
 * @param text - The raw text
 * @returns Escaped string
 */
export const escapeCalendarText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
};

/**
 * Escapes a cell value for standard CSV spreadsheets (RFC-4180).
 *
 * @param value - Cell value to format
 * @returns Escaped CSV string
 */
export const escapeCsvCell = (value: string | number | boolean | undefined | null): string => {
  if (value === null || value === undefined) {
    return '""';
  }
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
};


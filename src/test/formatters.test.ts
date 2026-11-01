/**
 * @file formatters.test.ts
 * @description Unit tests for display and calculation formatters.
 */

import { describe, it, expect } from 'vitest';
import { formatCurrency, calculatePercentage, formatDateReadable } from '../utils/formatters';

describe('Formatters Utility Suite', () => {
  describe('formatCurrency', () => {
    it('formats USD values correctly', () => {
      expect(formatCurrency(1500, 'USD')).toBe('$1,500');
      expect(formatCurrency(0, 'USD')).toBe('$0');
    });

    it('formats EUR values correctly', () => {
      expect(formatCurrency(2500, 'EUR')).toBe('€2,500');
    });

    it('formats GBP values correctly', () => {
      expect(formatCurrency(12000, 'GBP')).toBe('£12,000');
    });

    it('formats INR values correctly', () => {
      expect(formatCurrency(500000, 'INR')).toBe('₹5,00,000');
    });

    it('defaults to USD if unknown currency code is provided', () => {
      expect(formatCurrency(350, 'XYZ' as unknown as 'USD')).toBe('$350');
    });

    it('handles negative amounts cleanly', () => {
      expect(formatCurrency(-500, 'USD')).toBe('$-500');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates rounded percentages correctly', () => {
      expect(calculatePercentage(50, 200)).toBe(25);
      expect(calculatePercentage(1, 3)).toBe(33);
      expect(calculatePercentage(2, 3)).toBe(67);
    });

    it('handles zero denominator without throwing NaN or Infinity', () => {
      expect(calculatePercentage(100, 0)).toBe(0);
      expect(calculatePercentage(0, 0)).toBe(0);
    });

    it('handles zero numerator', () => {
      expect(calculatePercentage(0, 500)).toBe(0);
    });

    it('caps percentage at 100% for progress gauge bounds', () => {
      expect(calculatePercentage(150, 100)).toBe(100);
    });
  });

  describe('formatDateReadable', () => {
    it('formats ISO date strings into human-readable strings', () => {
      const formatted = formatDateReadable('2026-10-15');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Oct');
    });

    it('returns original input if date string is invalid', () => {
      expect(formatDateReadable('')).toBe('');
      expect(formatDateReadable('invalid-date')).toBe('invalid-date');
    });
  });
});

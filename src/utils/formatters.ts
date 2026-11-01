/**
 * @file formatters.ts
 * @description Standardized formatting utilities for currencies, dates, and percentages.
 */

import { CurrencyCode, CURRENCY_MAP } from '../types/event';

/**
 * Formats a numerical currency amount with symbol and locale grouping.
 *
 * @param amount - The numeric value
 * @param currencyCode - The ISO-like CurrencyCode
 * @returns Formatted currency string (e.g. "$42,000")
 */
export const formatCurrency = (amount: number, currencyCode: CurrencyCode = 'USD'): string => {
  const config = CURRENCY_MAP[currencyCode] || CURRENCY_MAP.USD;
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${config.symbol}${Math.round(safeAmount).toLocaleString()}`;
};

/**
 * Calculates a bounded percentage (0% to 100%).
 *
 * @param part - The numerator value
 * @param total - The total denominator value
 * @returns Rounded percentage between 0 and 100
 */
export const calculatePercentage = (part: number, total: number): number => {
  if (!total || total <= 0 || !Number.isFinite(part) || part <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((part / total) * 100)));
};

/**
 * Formats an ISO date string (YYYY-MM-DD) into an accessible, human-readable format.
 *
 * @param isoDate - Date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g. "Saturday, June 19, 2027")
 */
export const formatDateReadable = (isoDate: string): string => {
  if (!isoDate || typeof isoDate !== 'string') return '';
  try {
    const [year, month, day] = isoDate.split('-').map(Number);
    if (!year || !month || !day) return isoDate;
    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
};

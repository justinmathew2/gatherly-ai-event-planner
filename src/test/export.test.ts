/**
 * @file export.test.ts
 * @description Unit tests for RFC-5545 iCalendar generation and RFC-4180 CSV export pipelines.
 */

import { describe, it, expect } from 'vitest';
import { generateICalendar, generateBudgetCsv, generateVendorsCsv } from '../services/export';
import { SAMPLE_WEDDING } from '../services/mockData';

describe('Export Service Suite', () => {
  describe('RFC-5545 iCalendar Generation', () => {
    it('produces compliant VCALENDAR envelope structure', () => {
      const ics = generateICalendar(SAMPLE_WEDDING);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//Gatherly AI//Event Planning Assistant//EN');
      expect(ics).toContain('CALSCALE:GREGORIAN');
      expect(ics).toContain('METHOD:PUBLISH');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('generates a VEVENT for the master event and each day-of schedule and milestone item', () => {
      const ics = generateICalendar(SAMPLE_WEDDING);
      const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;

      // Count of dayOfSchedule items + count of milestones
      const expectedCount = SAMPLE_WEDDING.dayOfSchedule.length + SAMPLE_WEDDING.milestones.length;
      expect(veventCount).toBe(expectedCount);
    });

    it('sanitizes and escapes special characters in iCalendar summaries and descriptions', () => {
      const planWithSpecials = {
        ...SAMPLE_WEDDING,
        details: {
          ...SAMPLE_WEDDING.details,
          title: 'Cocktails; Dinner, & Dancing',
          vibe: 'Fun, lively; music!',
        },
      };

      const ics = generateICalendar(planWithSpecials);
      expect(ics).toContain('Cocktails\\; Dinner\\, & Dancing');
    });
  });

  describe('RFC-4180 CSV Generation', () => {
    it('generates well-structured Budget CSV with proper headers', () => {
      const csv = generateBudgetCsv(SAMPLE_WEDDING);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Category,Item Name,Allocated Amount,Actual Amount,Paid Amount,Status,Notes');
      expect(lines.length).toBeGreaterThan(SAMPLE_WEDDING.budgetItems.length);
    });

    it('escapes fields containing commas or quotes in CSV output', () => {
      const planWithCommas = {
        ...SAMPLE_WEDDING,
        budgetItems: [
          {
            id: 'b-1',
            category: 'venue' as const,
            name: 'Grand Ballroom, Terrace & "VIP" Lounge',
            allocatedAmount: 10000,
            actualAmount: 9500,
            paidAmount: 5000,
            isPaid: false,
            notes: 'Includes tables, chairs, and cleanup',
          },
        ],
      };

      const csv = generateBudgetCsv(planWithCommas);
      expect(csv).toContain('"Grand Ballroom, Terrace & ""VIP"" Lounge"');
      expect(csv).toContain('"Includes tables, chairs, and cleanup"');
    });

    it('generates well-structured Vendors CSV with proper headers', () => {
      const csv = generateVendorsCsv(SAMPLE_WEDDING);
      const lines = csv.split('\n');

      expect(lines[0]).toBe('Vendor Name,Category,Contact Person,Email,Phone,Status,Estimated Cost,Final Cost,Deposit Paid,Notes');
      expect(lines.length).toBeGreaterThanOrEqual(SAMPLE_WEDDING.vendors.length + 1);
    });
  });
});

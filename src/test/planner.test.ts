import { describe, it, expect } from 'vitest';
import { SAMPLE_WEDDING, SAMPLE_BIRTHDAY, SAMPLE_COMMUNITY } from '../services/mockData';
import { FullEventPlanSchema, EventDetailsSchema, BudgetItemSchema } from '../types/schema';
import { generateICalendar, generateBudgetCsv, generateVendorsCsv } from '../services/export';
import { generateOfflineEventPlan } from '../services/gemini';

describe('Gatherly AI Event Planner Test Suite', () => {
  describe('Zod Schema & Data Integrity', () => {
    it('validates the sample wedding plan against FullEventPlanSchema', () => {
      const result = FullEventPlanSchema.safeParse(SAMPLE_WEDDING);
      expect(result.success).toBe(true);
    });

    it('validates the sample birthday plan against FullEventPlanSchema', () => {
      const result = FullEventPlanSchema.safeParse(SAMPLE_BIRTHDAY);
      expect(result.success).toBe(true);
    });

    it('validates the sample community festival against FullEventPlanSchema', () => {
      const result = FullEventPlanSchema.safeParse(SAMPLE_COMMUNITY);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid event with missing title or negative budget', () => {
      const invalidEvent = {
        id: 'bad-1',
        title: '',
        eventType: 'wedding',
        date: '2026-12-01',
        location: 'Hall',
        guestCount: -5,
        totalBudget: -100,
        currency: 'USD',
        vibe: 'Fun',
        themeDescription: 'Test',
        primaryPriorities: [],
        dietaryRestrictions: [],
        accessibilityNeeds: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };
      const result = EventDetailsSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);
    });
  });

  describe('Budget Calculations & Allocation Logic', () => {
    it('calculates correct budget totals and remaining amounts', () => {
      const budgetItems = SAMPLE_WEDDING.budgetItems;
      const totalBudget = SAMPLE_WEDDING.details.totalBudget;
      const totalAllocated = budgetItems.reduce((acc, i) => acc + i.allocatedAmount, 0);
      const totalActual = budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
      const totalPaid = budgetItems.reduce((acc, i) => acc + i.paidAmount, 0);
      
      expect(totalAllocated).toBeGreaterThan(0);
      expect(totalActual).toBeGreaterThan(0);
      expect(totalPaid).toBeLessThanOrEqual(totalActual);
      expect(totalBudget).toBe(42000);
      
      const remaining = totalBudget - totalActual;
      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    it('ensures each budget item conforms to schema', () => {
      SAMPLE_WEDDING.budgetItems.forEach((item) => {
        const parsed = BudgetItemSchema.safeParse(item);
        expect(parsed.success).toBe(true);
      });
    });
  });

  describe('Export & Calendar Generators', () => {
    it('generates valid RFC-5545 iCalendar (.ics) content', () => {
      const ics = generateICalendar(SAMPLE_WEDDING);
      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('VERSION:2.0');
      expect(ics).toContain('PRODID:-//Gatherly AI//Event Planning Assistant//EN');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('Elena & Julian’s Napa Vineyard Celebration');
      expect(ics).toContain('END:VCALENDAR');
    });

    it('generates accurate Budget CSV headers and rows', () => {
      const csv = generateBudgetCsv(SAMPLE_WEDDING);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('Category,Item Name,Allocated Amount,Actual Amount,Paid Amount,Status,Notes');
      expect(lines.length).toBeGreaterThan(5);
      expect(csv).toContain('venue');
      expect(csv).toContain('catering');
    });

    it('generates accurate Vendors CSV', () => {
      const csv = generateVendorsCsv(SAMPLE_WEDDING);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('Vendor Name,Category,Contact Person,Email,Phone,Status,Estimated Cost,Final Cost,Deposit Paid,Notes');
      expect(csv).toContain('St. Helena Vintners Estate');
      expect(csv).toContain('Venue');
    });
  });

  describe('GenAI Offline Fallback Engine', () => {
    it('creates a mathematically consistent event plan for custom parameters', () => {
      const generated = generateOfflineEventPlan({
        title: 'Tech Summer Picnic',
        eventType: 'community',
        date: '2026-08-15',
        location: 'Sunnyvale Baylands Park',
        guestCount: 200,
        totalBudget: 8000,
        currency: 'USD',
        vibe: 'Relaxed Tech Mixer with Food Trucks and Lawn Games',
        primaryPriorities: ['Great Food Trucks', 'Lawn Tournaments'],
        dietaryRestrictions: ['Vegetarian', 'Nut-Free'],
        accessibilityNeeds: ['Wheelchair Ramps'],
      });

      expect(generated.details.title).toBe('Tech Summer Picnic');
      expect(generated.details.eventType).toBe('community');
      expect(generated.details.totalBudget).toBe(8000);
      expect(generated.budgetItems.length).toBeGreaterThanOrEqual(4);
      expect(generated.dayOfSchedule.length).toBeGreaterThanOrEqual(4);
      expect(generated.vendors.length).toBeGreaterThanOrEqual(2);
      expect(generated.ideas.palette.length).toBe(5);
      expect(generated.ideas.palette[0].hex).toMatch(/^#[0-9A-Fa-f]{6}$/);

      // Verify schema validity of generated plan
      const validation = FullEventPlanSchema.safeParse(generated);
      expect(validation.success).toBe(true);
    });
  });
});


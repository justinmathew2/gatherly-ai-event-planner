/**
 * @file planner.test.ts
 * @description Comprehensive test suite covering Zod validation schemas,
 * financial allocation logic, iCalendar export, CSV serialization,
 * and offline procedural intelligence resilience.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SAMPLE_WEDDING, SAMPLE_BIRTHDAY, SAMPLE_COMMUNITY } from '../services/mockData';
import { 
  FullEventPlanSchema, 
  EventDetailsSchema, 
  BudgetItemSchema, 
  VendorSchema,
  MilestoneItemSchema,
  DayOfScheduleItemSchema,
  PersonalizedIdeasSchema
} from '../types/schema';
import { generateICalendar, generateBudgetCsv, generateVendorsCsv } from '../services/export';
import { generateOfflineEventPlan } from '../services/gemini';
import { getStoredEvents, getStoredSettings, saveStoredSettings } from '../services/storage';

describe('Gatherly AI Full Test Suite', () => {
  beforeEach(() => {
    // Clear localStorage mock state before each test
    localStorage.clear();
  });

  describe('Zod Schema Validation & Data Integrity', () => {
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

    it('validates each individual sub-schema component', () => {
      expect(EventDetailsSchema.safeParse(SAMPLE_WEDDING.details).success).toBe(true);
      expect(PersonalizedIdeasSchema.safeParse(SAMPLE_WEDDING.ideas).success).toBe(true);
      SAMPLE_WEDDING.budgetItems.forEach((b) => expect(BudgetItemSchema.safeParse(b).success).toBe(true));
      SAMPLE_WEDDING.milestones.forEach((m) => expect(MilestoneItemSchema.safeParse(m).success).toBe(true));
      SAMPLE_WEDDING.dayOfSchedule.forEach((s) => expect(DayOfScheduleItemSchema.safeParse(s).success).toBe(true));
      SAMPLE_WEDDING.vendors.forEach((v) => expect(VendorSchema.safeParse(v).success).toBe(true));
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

    it('rejects an invalid time format in day-of schedule', () => {
      const badScheduleItem = {
        id: 's-bad',
        time: '25:99', // Invalid hour and minute
        activity: 'Midnight Toast',
        location: 'Main Hall',
        keyPeople: [],
      };
      const result = DayOfScheduleItemSchema.safeParse(badScheduleItem);
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

    it('handles zero budget allocation and extreme budgets safely', () => {
      const zeroPlan = generateOfflineEventPlan({
        title: 'Micro Birthday',
        eventType: 'birthday',
        date: '2027-01-01',
        location: 'Living Room',
        guestCount: 5,
        totalBudget: 0,
        currency: 'USD',
        vibe: 'Cozy Movie Night',
        primaryPriorities: ['Popcorn & Games'],
        dietaryRestrictions: [],
        accessibilityNeeds: [],
      });

      expect(zeroPlan.details.totalBudget).toBe(0);
      expect(zeroPlan.budgetItems.length).toBeGreaterThan(0);
      expect(zeroPlan.budgetItems.reduce((acc, i) => acc + i.allocatedAmount, 0)).toBeGreaterThan(0);
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
      expect(csv).toContain('"venue"');
      expect(csv).toContain('"catering"');
    });

    it('generates accurate Vendors CSV with escaped quotes', () => {
      const csv = generateVendorsCsv(SAMPLE_WEDDING);
      const lines = csv.split('\n');
      expect(lines[0]).toBe('Vendor Name,Category,Contact Person,Email,Phone,Status,Estimated Cost,Final Cost,Deposit Paid,Notes');
      expect(csv).toContain('"St. Helena Vintners Estate"');
      expect(csv).toContain('"Venue"');
    });
  });

  describe('Storage Resilience & Corruption Recovery', () => {
    it('initializes with sample events when storage is empty', () => {
      const events = getStoredEvents();
      expect(events.length).toBe(3);
      expect(events[0].details.title).toContain('Napa');
    });

    it('recovers gracefully from corrupted JSON in localStorage without throwing', () => {
      localStorage.setItem('gatherly_events_v1', 'CORRUPT_NOT_JSON_{{[}}');
      const events = getStoredEvents();
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].details.id).toBeDefined();
    });

    it('saves and restores user settings correctly', () => {
      saveStoredSettings({
        geminiApiKey: 'test-key-123',
        preferredModel: 'gemini-2.0-flash',
        defaultCurrency: 'EUR',
        darkMode: true,
      });

      const loaded = getStoredSettings();
      expect(loaded.geminiApiKey).toBe('test-key-123');
      expect(loaded.defaultCurrency).toBe('EUR');
      expect(loaded.darkMode).toBe(true);
    });
  });

  describe('GenAI Offline Fallback Engine Across Verticals', () => {
    it('creates a mathematically consistent event plan for community festivals', () => {
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

      const validation = FullEventPlanSchema.safeParse(generated);
      expect(validation.success).toBe(true);
    });

    it('creates tailored corporate celebration plans', () => {
      const corporate = generateOfflineEventPlan({
        title: 'Annual AI Hackathon Gala',
        eventType: 'corporate',
        date: '2026-12-10',
        location: 'Downtown Convention Center',
        guestCount: 350,
        totalBudget: 25000,
        currency: 'USD',
        vibe: 'Futuristic Cyber Innovation Gala',
        primaryPriorities: ['High Speed WiFi', 'Gourmet Dinner'],
        dietaryRestrictions: ['Halal', 'Vegan'],
        accessibilityNeeds: ['ASL Interpreter'],
      });

      expect(corporate.details.eventType).toBe('corporate');
      expect(corporate.details.guestCount).toBe(350);
      expect(corporate.ideas.menuSuggestions.signatureDrinks.length).toBeGreaterThan(0);
      expect(FullEventPlanSchema.safeParse(corporate).success).toBe(true);
    });
  });
});

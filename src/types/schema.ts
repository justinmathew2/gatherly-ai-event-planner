/**
 * @file schema.ts
 * @description Zod runtime validation schemas for Gatherly AI.
 * Validates external AI inputs, user-submitted forms, and storage payloads.
 */

import { z } from 'zod';

export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community', 'corporate']);
export const CurrencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']);

export const EventDetailsSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2, 'Event title must be at least 2 characters').max(120),
  eventType: EventTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(2, 'Location is required').max(200),
  guestCount: z.number().int().positive('Guest count must be at least 1').max(50000),
  totalBudget: z.number().nonnegative('Budget cannot be negative').max(100000000),
  currency: CurrencyCodeSchema,
  vibe: z.string().min(2, 'Vibe or theme description is required').max(250),
  themeDescription: z.string().max(1000),
  primaryPriorities: z.array(z.string().max(100)).max(15),
  dietaryRestrictions: z.array(z.string().max(80)).default([]),
  accessibilityNeeds: z.array(z.string().max(80)).default([]),
  notes: z.string().max(2000).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BudgetItemSchema = z.object({
  id: z.string(),
  category: z.enum([
    'venue', 
    'catering', 
    'photography', 
    'entertainment', 
    'decor', 
    'attire', 
    'stationery', 
    'transport', 
    'contingency', 
    'other'
  ]),
  name: z.string().min(1).max(150),
  allocatedAmount: z.number().nonnegative().max(100000000),
  actualAmount: z.number().nonnegative().max(100000000).default(0),
  paidAmount: z.number().nonnegative().max(100000000).default(0),
  isPaid: z.boolean().default(false),
  notes: z.string().max(500).optional(),
});

export const MilestoneItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  phase: z.enum([
    '12_months_out', 
    '6_months_out', 
    '3_months_out', 
    '1_month_out', 
    '2_weeks_out', 
    '1_week_out', 
    'day_before', 
    'post_event'
  ]),
  dueDate: z.string(),
  completed: z.boolean().default(false),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  assignedTo: z.string().max(100).optional(),
});

export const DayOfScheduleItemSchema = z.object({
  id: z.string(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be HH:MM format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be HH:MM format').optional(),
  activity: z.string().min(1).max(200),
  location: z.string().max(200),
  keyPeople: z.array(z.string().max(100)).default([]),
  notes: z.string().max(500).optional(),
  completed: z.boolean().default(false),
});

export const VendorSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(150),
  category: z.enum([
    'Venue', 
    'Catering & Bar', 
    'Photography & Video', 
    'Music & DJ', 
    'Flowers & Decor', 
    'Attire & Beauty', 
    'Cake & Dessert', 
    'Transportation', 
    'Rentals & Audio', 
    'Permits & Security', 
    'Other'
  ]),
  contactPerson: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum([
    'researching', 
    'contacted', 
    'quote_received', 
    'contract_signed', 
    'deposit_paid', 
    'fully_paid'
  ]),
  estimatedCost: z.number().nonnegative().max(100000000),
  finalCost: z.number().nonnegative().max(100000000).optional(),
  depositPaid: z.number().nonnegative().max(100000000).optional(),
  depositDueDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const ColorPaletteItemSchema = z.object({
  name: z.string().max(80),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Hex code must be valid #RRGGBB'),
  role: z.string().max(100),
});

export const SignatureDrinkSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(300),
  isAlcoholic: z.boolean(),
});

export const MenuSuggestionsSchema = z.object({
  appetizers: z.array(z.string().max(200)),
  mains: z.array(z.string().max(200)),
  desserts: z.array(z.string().max(200)),
  signatureDrinks: z.array(SignatureDrinkSchema),
});

export const InvitationWordingSchema = z.object({
  formal: z.string().max(1000),
  modernPlayful: z.string().max(1000),
  casual: z.string().max(1000),
});

export const ActivityItemSchema = z.object({
  title: z.string().max(150),
  description: z.string().max(400),
  timing: z.string().max(100),
});

export const MusicPlaylistVibeSchema = z.object({
  style: z.string().max(100),
  sampleTracks: z.array(z.string().max(150)),
});

export const PersonalizedIdeasSchema = z.object({
  themeName: z.string().max(150),
  tagline: z.string().max(250),
  palette: z.array(ColorPaletteItemSchema).min(3).max(8),
  decorConcepts: z.array(z.string().max(400)),
  menuSuggestions: MenuSuggestionsSchema,
  invitationWording: InvitationWordingSchema,
  activitiesAndEntertainment: z.array(ActivityItemSchema),
  musicPlaylistVibes: z.array(MusicPlaylistVibeSchema),
  costSavingHacks: z.array(z.string().max(400)),
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(4000),
  timestamp: z.string(),
  suggestedAction: z.object({
    type: z.enum(['apply_budget_rebalance', 'add_milestone', 'add_vendor', 'update_theme']),
    label: z.string(),
    payload: z.record(z.unknown()).optional(),
  }).optional(),
});

export const FullEventPlanSchema = z.object({
  details: EventDetailsSchema,
  budgetItems: z.array(BudgetItemSchema),
  milestones: z.array(MilestoneItemSchema),
  dayOfSchedule: z.array(DayOfScheduleItemSchema),
  vendors: z.array(VendorSchema),
  ideas: PersonalizedIdeasSchema,
  chatHistory: z.array(ChatMessageSchema).default([]),
});

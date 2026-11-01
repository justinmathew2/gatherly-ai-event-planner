import { z } from 'zod';

export const EventTypeSchema = z.enum(['wedding', 'birthday', 'community', 'corporate']);
export const CurrencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']);

export const EventDetailsSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2, 'Event title must be at least 2 characters'),
  eventType: EventTypeSchema,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  guestCount: z.number().int().positive('Guest count must be at least 1'),
  totalBudget: z.number().nonnegative('Budget cannot be negative'),
  currency: CurrencyCodeSchema,
  vibe: z.string().min(2, 'Vibe or theme description is required'),
  themeDescription: z.string(),
  primaryPriorities: z.array(z.string()),
  dietaryRestrictions: z.array(z.string()).default([]),
  accessibilityNeeds: z.array(z.string()).default([]),
  notes: z.string().optional(),
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
  name: z.string().min(1),
  allocatedAmount: z.number().nonnegative(),
  actualAmount: z.number().nonnegative().default(0),
  paidAmount: z.number().nonnegative().default(0),
  isPaid: z.boolean().default(false),
  notes: z.string().optional(),
});

export const MilestoneItemSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
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
  assignedTo: z.string().optional(),
});

export const DayOfScheduleItemSchema = z.object({
  id: z.string(),
  time: z.string(),
  endTime: z.string().optional(),
  activity: z.string(),
  location: z.string(),
  keyPeople: z.array(z.string()).default([]),
  notes: z.string().optional(),
  completed: z.boolean().default(false),
});

export const VendorSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
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
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum([
    'researching', 
    'contacted', 
    'quote_received', 
    'contract_signed', 
    'deposit_paid', 
    'fully_paid'
  ]),
  estimatedCost: z.number().nonnegative(),
  finalCost: z.number().nonnegative().optional(),
  depositPaid: z.number().nonnegative().optional(),
  depositDueDate: z.string().optional(),
  notes: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export const ColorPaletteItemSchema = z.object({
  name: z.string(),
  hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Hex code must be valid #RRGGBB'),
  role: z.string(),
});

export const PersonalizedIdeasSchema = z.object({
  themeName: z.string(),
  tagline: z.string(),
  palette: z.array(ColorPaletteItemSchema),
  decorConcepts: z.array(z.string()),
  menuSuggestions: z.object({
    appetizers: z.array(z.string()),
    mains: z.array(z.string()),
    desserts: z.array(z.string()),
    signatureDrinks: z.array(z.object({
      name: z.string(),
      description: z.string(),
      isAlcoholic: z.boolean(),
    })),
  }),
  invitationWording: z.object({
    formal: z.string(),
    modernPlayful: z.string(),
    casual: z.string(),
  }),
  activitiesAndEntertainment: z.array(z.object({
    title: z.string(),
    description: z.string(),
    timing: z.string(),
  })),
  musicPlaylistVibes: z.array(z.object({
    style: z.string(),
    sampleTracks: z.array(z.string()),
  })),
  costSavingHacks: z.array(z.string()),
});

export const FullEventPlanSchema = z.object({
  details: EventDetailsSchema,
  budgetItems: z.array(BudgetItemSchema),
  milestones: z.array(MilestoneItemSchema),
  dayOfSchedule: z.array(DayOfScheduleItemSchema),
  vendors: z.array(VendorSchema),
  ideas: PersonalizedIdeasSchema,
  chatHistory: z.array(z.any()).default([]),
});

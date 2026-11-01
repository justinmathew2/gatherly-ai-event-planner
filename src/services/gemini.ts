/**
 * @file gemini.ts
 * @description Google Gemini Generative AI service with prompt injection defense,
 * Zod schema validation, and intelligent offline fallback engine.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  FullEventPlan, 
  BudgetItem, 
  MilestoneItem, 
  DayOfScheduleItem, 
  Vendor, 
  PersonalizedIdeas,
  EventType, 
  CurrencyCode,
  AiServiceError
} from '../types/event';
import { FullEventPlanSchema } from '../types/schema';
import { getStoredSettings } from './storage';
import { sanitizeText } from '../utils/security';

/**
 * Extracts and sanitizes valid JSON payload from generative text responses.
 * Handles markdown fence stripping and boundary extraction.
 *
 * @param text - The raw model text output
 * @returns Parsed JSON object
 */
export const extractJsonFromResponse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    // 1. Match standard ```json ... ``` or ``` ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {
        // Continue to fallback
      }
    }
    // 2. Find outermost curly braces
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sliced = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(sliced);
    }
    throw new AiServiceError('Could not parse valid JSON from AI response');
  }
};

export interface GenerateEventPlanInput {
  title: string;
  eventType: EventType;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  vibe: string;
  primaryPriorities?: string[];
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  startTime?: string;
  endTime?: string;
  mustHaves?: string;
}

/**
 * Generates a full master celebration plan using Google Gemini API.
 * Falls back to the procedural intelligence engine when offline or unauthenticated.
 */
export const generateEventPlanWithAI = async (
  rawInput: GenerateEventPlanInput,
  apiKeyOverride?: string
): Promise<FullEventPlan> => {
  // Sanitize all inputs to protect against prompt injection and XSS
  const input: GenerateEventPlanInput = {
    title: sanitizeText(rawInput.title, 100),
    eventType: rawInput.eventType,
    date: sanitizeText(rawInput.date, 20),
    location: sanitizeText(rawInput.location, 150),
    guestCount: Math.max(1, Math.min(50000, Number(rawInput.guestCount) || 50)),
    totalBudget: Math.max(0, Math.min(100000000, Number(rawInput.totalBudget) || 10000)),
    currency: sanitizeText(rawInput.currency, 5),
    vibe: sanitizeText(rawInput.vibe, 200),
    primaryPriorities: (rawInput.primaryPriorities || []).map((p) => sanitizeText(p, 80)),
    dietaryRestrictions: (rawInput.dietaryRestrictions || []).map((d) => sanitizeText(d, 60)),
    accessibilityNeeds: (rawInput.accessibilityNeeds || []).map((a) => sanitizeText(a, 60)),
    startTime: rawInput.startTime || '12:00',
    endTime: rawInput.endTime || '18:00',
    mustHaves: rawInput.mustHaves ? sanitizeText(rawInput.mustHaves, 300) : undefined,
  };

  const settings = getStoredSettings();
  const apiKey = apiKeyOverride || settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (!apiKey || apiKey.trim() === '') {
    return generateOfflineEventPlan(input);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = settings.preferredModel || 'gemini-2.0-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        responseMimeType: 'application/json',
      },
    });

    const systemPrompt = `You are Gatherly AI, a master event planner specializing in weddings, birthdays, community festivals, and celebrations.
Generate a comprehensive, mathematically consistent, highly personalized event plan in strict JSON format based on the user's requirements.

Ensure:
1. Budget items strictly sum up close to the total budget (${input.currency} ${input.totalBudget}).
2. Timeline milestones span from 6-12 months out down to the day before.
3. Day-of schedule provides an hour-by-hour run of show with realistic timings in HH:MM format.
4. Vendors have realistic price estimates, categories, and practical roles.
5. Personalized ideas include aesthetic color palette with valid hex codes (#RRGGBB), unique decor concepts, multi-course menu suggestions accommodating dietary restrictions (${input.dietaryRestrictions?.join(', ') || 'Standard'}), custom invitation copies in 3 tones, interactive activities, and cost-saving hacks.

Output schema:
{
  "details": {
    "id": string,
    "title": string,
    "eventType": "${input.eventType}",
    "date": "${input.date}",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "location": "${input.location}",
    "guestCount": ${input.guestCount},
    "totalBudget": ${input.totalBudget},
    "currency": "${input.currency}",
    "vibe": "${input.vibe}",
    "themeDescription": string,
    "primaryPriorities": string[],
    "dietaryRestrictions": string[],
    "accessibilityNeeds": string[],
    "notes": string,
    "createdAt": string,
    "updatedAt": string
  },
  "budgetItems": [
    {
      "id": string,
      "category": "venue" | "catering" | "photography" | "entertainment" | "decor" | "attire" | "stationery" | "transport" | "contingency" | "other",
      "name": string,
      "allocatedAmount": number,
      "actualAmount": number,
      "paidAmount": number,
      "isPaid": boolean,
      "notes": string
    }
  ],
  "milestones": [
    {
      "id": string,
      "title": string,
      "phase": "12_months_out" | "6_months_out" | "3_months_out" | "1_month_out" | "2_weeks_out" | "1_week_out" | "day_before" | "post_event",
      "dueDate": "YYYY-MM-DD",
      "completed": boolean,
      "priority": "high" | "medium" | "low",
      "assignedTo": string
    }
  ],
  "dayOfSchedule": [
    {
      "id": string,
      "time": "HH:MM",
      "endTime": "HH:MM",
      "activity": string,
      "location": string,
      "keyPeople": string[],
      "notes": string,
      "completed": boolean
    }
  ],
  "vendors": [
    {
      "id": string,
      "name": string,
      "category": "Venue" | "Catering & Bar" | "Photography & Video" | "Music & DJ" | "Flowers & Decor" | "Attire & Beauty" | "Cake & Dessert" | "Transportation" | "Rentals & Audio" | "Permits & Security" | "Other",
      "contactPerson": string,
      "email": string,
      "phone": string,
      "status": "researching" | "contacted" | "quote_received" | "contract_signed" | "deposit_paid" | "fully_paid",
      "estimatedCost": number,
      "finalCost": number,
      "depositPaid": number,
      "notes": string
    }
  ],
  "ideas": {
    "themeName": string,
    "tagline": string,
    "palette": [
      { "name": string, "hex": "#RRGGBB", "role": string }
    ],
    "decorConcepts": string[],
    "menuSuggestions": {
      "appetizers": string[],
      "mains": string[],
      "desserts": string[],
      "signatureDrinks": [
        { "name": string, "description": string, "isAlcoholic": boolean }
      ]
    },
    "invitationWording": {
      "formal": string,
      "modernPlayful": string,
      "casual": string
    },
    "activitiesAndEntertainment": [
      { "title": string, "description": string, "timing": string }
    ],
    "musicPlaylistVibes": [
      { "style": string, "sampleTracks": string[] }
    ],
    "costSavingHacks": string[]
  }
}`;

    const userPrompt = `Event Requirements:
Title: ${input.title}
Event Type: ${input.eventType}
Date: ${input.date}
Location: ${input.location}
Guest Count: ${input.guestCount}
Total Budget: ${input.currency} ${input.totalBudget}
Aesthetic Vibe: ${input.vibe}
Top Priorities: ${input.primaryPriorities?.join(', ') || 'Memorable experience'}
Dietary Restrictions: ${input.dietaryRestrictions?.join(', ') || 'None specified'}
Accessibility Considerations: ${input.accessibilityNeeds?.join(', ') || 'Standard accessibility'}

Generate the full JSON now.`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const responseText = result.response.text();
    const parsedData = extractJsonFromResponse(responseText);

    // Validate using Zod schema
    const validated = FullEventPlanSchema.safeParse({
      ...(parsedData as object),
      chatHistory: [
        {
          id: `chat-${Date.now()}`,
          sender: 'assistant',
          content: `Congratulations! I have generated your bespoke event plan for "${input.title}". Everything from your ${input.currency} ${input.totalBudget.toLocaleString()} budget breakdown to the day-of run-of-show has been customized for your ${input.guestCount} guests. How would you like to refine it?`,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    if (validated.success) {
      return validated.data as FullEventPlan;
    } else {
      return generateOfflineEventPlan(input, parsedData as Partial<FullEventPlan>);
    }
  } catch {
    return generateOfflineEventPlan(input);
  }
};

/**
 * Procedural fallback planner delivering instant, mathematically consistent,
 * realistic plans tailored to custom inputs without network latency.
 */
export const generateOfflineEventPlan = (
  rawInput: GenerateEventPlanInput,
  partial?: Partial<FullEventPlan>
): FullEventPlan => {
  const input: GenerateEventPlanInput = {
    title: sanitizeText(rawInput.title, 120),
    eventType: rawInput.eventType,
    date: rawInput.date,
    startTime: rawInput.startTime || '12:00',
    endTime: rawInput.endTime || '18:00',
    location: sanitizeText(rawInput.location, 150),
    guestCount: Math.max(1, rawInput.guestCount || 50),
    totalBudget: typeof rawInput.totalBudget === 'number' && rawInput.totalBudget >= 0 ? rawInput.totalBudget : 5000,
    currency: rawInput.currency || 'USD',
    vibe: sanitizeText(rawInput.vibe, 200),
    mustHaves: rawInput.mustHaves ? sanitizeText(rawInput.mustHaves, 300) : undefined,
    dietaryRestrictions: (rawInput.dietaryRestrictions || []).map((d) => sanitizeText(d, 60)),
    primaryPriorities: (rawInput.primaryPriorities || []).map((p) => sanitizeText(p, 80)),
  };

  const budget = input.totalBudget > 0 ? input.totalBudget : 500;
  const isWedding = input.eventType === 'wedding';
  const isBirthday = input.eventType === 'birthday';
  const isCommunity = input.eventType === 'community';

  // Industry-proven percentage allocations
  const venuePct = isCommunity ? 0.25 : 0.35;
  const cateringPct = isCommunity ? 0.20 : 0.30;
  const photoPct = isCommunity ? 0.08 : (isBirthday ? 0.10 : 0.12);
  const musicPct = isCommunity ? 0.22 : 0.10;
  const decorPct = 0.08;
  const contingencyPct = 0.05;

  const budgetItems: BudgetItem[] = [
    {
      id: 'b-venue',
      category: 'venue',
      name: isCommunity ? 'Park & Pavilion Permit Fee' : (isWedding ? 'Estate / Banquet Hall Rental' : 'Private Venue Lounge Buyout'),
      allocatedAmount: Math.round(budget * venuePct),
      actualAmount: Math.round(budget * venuePct * 0.95),
      paidAmount: Math.round(budget * venuePct * 0.5),
      isPaid: false,
      notes: 'Includes tables, standard chairs, and staging access',
    },
    {
      id: 'b-catering',
      category: 'catering',
      name: isCommunity ? 'Community Refreshments & Food Truck Coordination' : 'Full Meal Service & Beverage Bar',
      allocatedAmount: Math.round(budget * cateringPct),
      actualAmount: Math.round(budget * cateringPct),
      paidAmount: Math.round(budget * cateringPct * 0.3),
      isPaid: false,
      notes: `Includes dietary accommodations (${input.dietaryRestrictions?.join(', ') || 'standard allergen labeling'})`,
    },
    {
      id: 'b-photo',
      category: 'photography',
      name: isCommunity ? 'Community Media & Drone Highlights' : 'Professional Photographer & Digital Album',
      allocatedAmount: Math.round(budget * photoPct),
      actualAmount: Math.round(budget * photoPct),
      paidAmount: 0,
      isPaid: false,
      notes: 'Full day coverage + edited digital photo gallery',
    },
    {
      id: 'b-music',
      category: 'entertainment',
      name: isCommunity ? 'Live Community Bands & Sound System' : 'DJ / Live Music & Audio Engineering',
      allocatedAmount: Math.round(budget * musicPct),
      actualAmount: Math.round(budget * musicPct * 0.9),
      paidAmount: 0,
      isPaid: false,
      notes: 'Sound equipment, wireless mics, and emcee services included',
    },
    {
      id: 'b-decor',
      category: 'decor',
      name: `${input.vibe} Floral & Lighting Styling`,
      allocatedAmount: Math.round(budget * decorPct),
      actualAmount: Math.round(budget * decorPct),
      paidAmount: Math.round(budget * decorPct),
      isPaid: true,
      notes: 'Custom centerpieces, signage, and atmospheric warm lighting',
    },
    {
      id: 'b-contingency',
      category: 'contingency',
      name: 'Emergency & Miscellaneous Reserve',
      allocatedAmount: Math.round(budget * contingencyPct),
      actualAmount: 0,
      paidAmount: 0,
      isPaid: false,
      notes: 'Buffer for unforeseen last-minute additions',
    },
  ];

  const milestones: MilestoneItem[] = [
    {
      id: 'm-1',
      title: 'Confirm Booking & Sign Venue Agreement',
      phase: '6_months_out',
      dueDate: input.date,
      completed: true,
      priority: 'high',
      assignedTo: 'Lead Organizer',
    },
    {
      id: 'm-2',
      title: 'Finalize Catering Menu & Beverage Tasting',
      phase: '3_months_out',
      dueDate: input.date,
      completed: false,
      priority: 'high',
      assignedTo: 'Planning Committee',
    },
    {
      id: 'm-3',
      title: 'Issue Official Invitations & Launch Online RSVP',
      phase: '1_month_out',
      dueDate: input.date,
      completed: false,
      priority: 'high',
      assignedTo: 'Lead Organizer',
    },
    {
      id: 'm-4',
      title: 'Final Headcount Lock & Dietary List to Caterer',
      phase: '2_weeks_out',
      dueDate: input.date,
      completed: false,
      priority: 'high',
      assignedTo: 'Lead Organizer',
    },
    {
      id: 'm-5',
      title: 'Sound Check & Venue Walkthrough',
      phase: 'day_before',
      dueDate: input.date,
      completed: false,
      priority: 'medium',
      assignedTo: 'Audio Team',
    },
  ];

  const dayOfSchedule: DayOfScheduleItem[] = [
    {
      id: 's-1',
      time: '13:00',
      endTime: '15:00',
      activity: 'Venue Setup, Audio/Visual Checks & Floral Placement',
      location: input.location,
      keyPeople: ['Lead Organizer', 'Decor Team', 'Sound Tech'],
    },
    {
      id: 's-2',
      time: '16:00',
      endTime: '17:00',
      activity: 'Guest Arrival, Welcome Refreshments & Ambient Music',
      location: `${input.location} - Welcome Lounge`,
      keyPeople: ['Ushers', 'All Guests'],
    },
    {
      id: 's-3',
      time: '17:15',
      endTime: '18:45',
      activity: isWedding ? 'Ceremony & Ring Exchange' : (isCommunity ? 'Opening Remarks & Community Showcase' : 'Main Party Kickoff & Welcome Toast'),
      location: `${input.location} - Main Stage`,
      keyPeople: ['Hosts', 'Speakers', 'Guests'],
    },
    {
      id: 's-4',
      time: '19:00',
      endTime: '20:30',
      activity: 'Dinner Service & Curated Signature Drinks',
      location: `${input.location} - Dining Pavilion`,
      keyPeople: ['Catering Team', 'Guests'],
    },
    {
      id: 's-5',
      time: '20:30',
      endTime: '23:00',
      activity: 'Celebration Dance Party, Entertainment & Memorable Send-Off',
      location: `${input.location} - Celebration Hall`,
      keyPeople: ['DJ', 'All Attendees'],
    },
  ];

  const vendors: Vendor[] = [
    {
      id: 'v-1',
      name: `${input.location} Management`,
      category: 'Venue',
      status: 'contract_signed',
      estimatedCost: Math.round(budget * venuePct),
      finalCost: Math.round(budget * venuePct * 0.95),
      depositPaid: Math.round(budget * venuePct * 0.5),
      notes: 'Primary facility agreement and insurance verified',
    },
    {
      id: 'v-2',
      name: 'Artisan Gourmet Kitchen & Bar',
      category: 'Catering & Bar',
      status: 'deposit_paid',
      estimatedCost: Math.round(budget * cateringPct),
      finalCost: Math.round(budget * cateringPct),
      depositPaid: Math.round(budget * cateringPct * 0.3),
      notes: `Accommodates ${input.guestCount} guests with special dietary flags`,
    },
    {
      id: 'v-3',
      name: 'Lens & Light Visuals',
      category: 'Photography & Video',
      status: 'quote_received',
      estimatedCost: Math.round(budget * photoPct),
      notes: 'Full day coverage and high resolution photo gallery delivery',
    },
  ];

  const ideas: PersonalizedIdeas = {
    themeName: `${input.vibe} Celebration`,
    tagline: `An unforgettable gathering designed around ${input.primaryPriorities?.[0] || 'community and joy'}.`,
    palette: [
      { name: 'Rose Gold Shimmer', hex: '#E0A899', role: 'Primary Elegant Accent' },
      { name: 'Midnight Navy', hex: '#1E293B', role: 'Deep Contrast Foundation' },
      { name: 'Champagne Cream', hex: '#FDFBF7', role: 'Airy Linens & Paper' },
      { name: 'Sage Botanica', hex: '#84A98C', role: 'Organic Foliage' },
      { name: 'Burnished Brass', hex: '#D4AF37', role: 'Lighting & Hardware' },
    ],
    decorConcepts: [
      `Atmospheric festoon lighting styled to create intimate glow across ${input.location}.`,
      'Welcome signage customized with modern calligraphy and interactive guest check-in.',
      'Sustainably sourced floral runners and repurposed greenery clusters for maximum visual impact.',
    ],
    menuSuggestions: {
      appetizers: [
        'Crispy Herb Polenta Cakes with sun-dried tomato tapenade (Gluten-Free, Vegan)',
        'Artisanal Charcuterie & Local Cheese Display with fig preserves',
      ],
      mains: [
        'Herb-Roasted Free Range Entrée with reduction glaze and seasonal roasted root vegetables',
        'Handmade Wild Mushroom Risotto finished with white truffle oil (Vegetarian)',
      ],
      desserts: [
        'Petite Citrus Tartlets with raspberry compote',
        'Signature Celebration Cake with fresh botanical accents',
      ],
      signatureDrinks: [
        {
          name: 'The Celebration Fizz',
          description: 'Sparkling wine or cider with elderflower and a twist of Meyer lemon',
          isAlcoholic: true,
        },
        {
          name: 'Garden Herb Sparkler',
          description: 'Pressed blackberry, fresh thyme syrup, and effervescent sparkling water',
          isAlcoholic: false,
        },
      ],
    },
    invitationWording: {
      formal: `You are cordially invited to celebrate ${input.title} on ${input.date} at ${input.location}.`,
      modernPlayful: `Good vibes, great food, and unforgettable memories! Join us for ${input.title} on ${input.date}.`,
      casual: `We’re getting together to celebrate! Save the date for ${input.title} on ${input.date}.`,
    },
    activitiesAndEntertainment: [
      {
        title: 'Interactive Photo & Memory Wall',
        description: 'Instant photo prints where guests pin their photos alongside handwritten notes.',
        timing: 'Throughout the event',
      },
      {
        title: 'Curated Toast & Celebration Speech',
        description: 'Dedicated window for meaningful toasts and reflections before dessert.',
        timing: '19:45 - 20:15',
      },
    ],
    musicPlaylistVibes: [
      {
        style: 'Cocktail & Dinner Warmth',
        sampleTracks: ['Leon Bridges - Texas Sun', 'Norah Jones - Sunrise', 'Khruangbin - Texas Sun'],
      },
      {
        style: 'High Energy Celebration',
        sampleTracks: ['Earth Wind & Fire - September', 'Dua Lipa - Dance The Night', 'Stevie Wonder - Sir Duke'],
      },
    ],
    costSavingHacks: [
      'Repurpose ceremony or entrance florals to decorate the dining and head table area to save 30% on floral costs.',
      'Offer signature welcome cocktails alongside beer & wine instead of an unlimited full-shelf open bar.',
      'Use digital invitations with QR codes for fast RSVPs and lower printing overhead.',
    ],
  };

  return {
    details: {
      id: partial?.details?.id || `event-${Date.now()}`,
      title: input.title,
      eventType: input.eventType,
      date: input.date,
      startTime: '15:00',
      endTime: '23:00',
      location: input.location,
      guestCount: input.guestCount,
      totalBudget: input.totalBudget,
      currency: (input.currency as CurrencyCode) || 'USD',
      vibe: input.vibe,
      themeDescription: `A masterfully planned ${input.eventType} celebration at ${input.location} for ${input.guestCount} guests.`,
      primaryPriorities: input.primaryPriorities || [],
      dietaryRestrictions: input.dietaryRestrictions || [],
      accessibilityNeeds: input.accessibilityNeeds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    budgetItems: partial?.budgetItems || budgetItems,
    milestones: partial?.milestones || milestones,
    dayOfSchedule: partial?.dayOfSchedule || dayOfSchedule,
    vendors: partial?.vendors || vendors,
    ideas: partial?.ideas || ideas,
    chatHistory: [
      {
        id: `c-${Date.now()}`,
        sender: 'assistant',
        content: `Your complete event blueprint for "${input.title}" is ready! I calculated a tailored budget breakdown across venue, catering, entertainment, and decor, along with milestones and personalized menu concepts. Feel free to ask me to adjust anything!`,
        timestamp: new Date().toISOString(),
      },
    ],
  };
};

/**
 * Generates an inquiry email draft addressed to an external vendor.
 */
export const generateVendorInquiryEmail = async (
  vendor: Vendor,
  plan: FullEventPlan
): Promise<string> => {
  const sanitizedVendorName = sanitizeText(vendor.name, 100);
  const sanitizedContact = sanitizeText(vendor.contactPerson || '', 80);

  const settings = getStoredSettings();
  const apiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: settings.preferredModel || 'gemini-2.0-flash' });
      const prompt = `Write a professional, gracious inquiry email from an event host to a potential vendor.
Event: ${plan.details.title} (${plan.details.eventType})
Date: ${plan.details.date}
Location: ${plan.details.location}
Guest Count: ${plan.details.guestCount}
Vendor Category: ${vendor.category}
Vendor Name: ${sanitizedVendorName}
Budget estimate: ${plan.details.currency} ${vendor.estimatedCost}
Host vibe/theme: ${plan.details.vibe}

Include polite requests for their availability, package pricing, and next steps for an introductory consultation call.`;

      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch {
      // Fallback to template
    }
  }

  return `Subject: Inquiry for ${plan.details.title} on ${plan.details.date} - ${sanitizedVendorName}

Dear ${sanitizedContact || sanitizedVendorName + ' Team'},

I hope this email finds you well!

We are currently organizing "${plan.details.title}", a ${plan.details.eventType} celebration scheduled for ${plan.details.date} at ${plan.details.location}, and we love your work in ${vendor.category}.

Here are key details regarding our event:
- Date: ${plan.details.date}
- Guest Count: Approximately ${plan.details.guestCount} guests
- Theme & Atmosphere: ${plan.details.vibe}
- Allocated Budget Range: Around ${plan.details.currency} ${vendor.estimatedCost.toLocaleString()}

Could you please confirm if your team has availability on ${plan.details.date}? Additionally, could you share your service packages, pricing brochures, and whether you are available for a brief 15-minute introductory call next week?

Thank you so much for your time, and we look forward to hearing from you.

Warm regards,
${plan.details.title} Organizing Team`;
};

/**
 * Generates top 5 targeted interview questions per vendor category.
 */
export const generateVendorQuestions = async (
  vendor: Vendor,
  plan: FullEventPlan
): Promise<string[]> => {
  const settings = getStoredSettings();
  const apiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: settings.preferredModel || 'gemini-2.0-flash',
        generationConfig: { responseMimeType: 'application/json' },
      });
      const prompt = `Generate a JSON array of 5 smart, high-impact interview questions to ask a ${vendor.category} vendor for a ${plan.details.eventType} on ${plan.details.date} with ${plan.details.guestCount} guests.
Return strictly a JSON array of strings: ["question 1", "question 2", ...]`;

      const res = await model.generateContent(prompt);
      const parsed = extractJsonFromResponse(res.response.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => String(item));
      }
    } catch {
      // Fallback
    }
  }

  if (vendor.category === 'Venue') {
    return [
      'What is your exact policy and fee structure for overtime hours or extended cleanup?',
      'Are we required to use your preferred vendor list, or can we bring in outside catering/bartending?',
      'What setup and breakdown time is included in the base rental fee?',
      'What are your sound ordinance limits and hard cutoff times for amplified music?',
      'What is your weather contingency backup plan for outdoor ceremony or dining spaces?',
    ];
  } else if (vendor.category === 'Catering & Bar') {
    return [
      'How do you manage severe allergies and dietary requirements (e.g. gluten-free, vegan) during service?',
      'What is the ratio of service staff/bartenders per guest for our headcount?',
      'Are tableware, linens, glassware, and cleanup included, or billed through a third-party rental?',
      'Can we schedule a private tasting before signing the final contract, and is the cost credited toward the total?',
      'What happens to leftover food at the end of the evening?',
    ];
  } else if (vendor.category === 'Photography & Video') {
    return [
      'Have you ever photographed or filmed at our specific venue or in similar lighting conditions?',
      'What is your backup equipment protocol in case a camera, lens, or memory card malfunctions?',
      'Will you personally be shooting our event, or will associate shooters be assigned?',
      'What is your delivery timeline for teaser photos and the full high-resolution gallery?',
      'Do you provide full personal printing rights and unwatermarked high-res digital downloads?',
    ];
  } else {
    return [
      'What is your payment schedule, deposit requirement, and cancellation/rescheduling policy?',
      'Do you carry comprehensive commercial general liability insurance?',
      'What technical, electrical, or space requirements do you need from the venue on the day of the event?',
      'Who will be our primary day-of point of contact from your team?',
      'Can you share 2-3 recent client references or portfolio examples from similar events?',
    ];
  }
};

/**
 * Conversational Assistant Copilot query handler.
 */
export const queryAssistantCopilot = async (
  rawMessage: string,
  plan: FullEventPlan
): Promise<{ reply: string }> => {
  const message = sanitizeText(rawMessage, 500);
  const settings = getStoredSettings();
  const apiKey = settings.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '';

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: settings.preferredModel || 'gemini-2.0-flash' });
      const prompt = `You are Gatherly AI, the user's dedicated, cheerful, highly experienced event planning copilot.
Current Event Context:
- Event: "${plan.details.title}" (${plan.details.eventType})
- Date: ${plan.details.date}
- Location: ${plan.details.location}
- Guest count: ${plan.details.guestCount}
- Budget: ${plan.details.currency} ${plan.details.totalBudget}
- Spent/Committed: ${plan.budgetItems.reduce((acc, i) => acc + i.actualAmount, 0)}
- Priorities: ${plan.details.primaryPriorities?.join(', ') || 'None'}
- Vibe: ${plan.details.vibe}

User query: "${message}"

Give a concise, practical, highly encouraging response with concrete ideas or actionable advice.`;

      const res = await model.generateContent(prompt);
      return { reply: res.response.text() };
    } catch {
      // Fallback
    }
  }

  const lower = message.toLowerCase();
  if (lower.includes('budget') || lower.includes('save') || lower.includes('cut') || lower.includes('cost')) {
    const totalSpent = plan.budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
    const diff = plan.details.totalBudget - totalSpent;
    return {
      reply: `Here are 3 fast ways to optimize your budget for "${plan.details.title}":
1. **Smart Bar Service**: Instead of a full open bar, offering 2 signature cocktails + local beer and wine typically saves **18% - 25%** on beverage expenses.
2. **Dual-Purpose Florals**: Transfer ceremony floral arches or aisle arrangements directly to your dining head table.
3. **Current Standing**: You have allocated ${plan.details.currency} ${totalSpent.toLocaleString()} out of ${plan.details.currency} ${plan.details.totalBudget.toLocaleString()} (leaving ${plan.details.currency} ${Math.max(0, diff).toLocaleString()} buffer).`,
    };
  } else if (lower.includes('timeline') || lower.includes('time') || lower.includes('schedule') || lower.includes('day')) {
    return {
      reply: `For your ${plan.details.eventType} on ${plan.details.date}:
- **Golden Rule**: Always add a 15-minute buffer between major segments (e.g. between toasts and open dance floor) so nobody feels rushed.
- **Run of show**: Your schedule currently has ${plan.dayOfSchedule.length} timed milestones starting at ${plan.dayOfSchedule[0]?.time || 'midday'}.
- You can sync this directly into your phone by clicking the **"Export to iCal (.ics)"** button on the Timeline tab!`,
    };
  } else if (lower.includes('vendor') || lower.includes('hire') || lower.includes('contract')) {
    return {
      reply: `You currently have ${plan.vendors.length} vendors tracked in your hub.
Pro-tip: Always request their Certificate of Insurance (COI) at least 30 days prior, as most professional venues require this before allowing load-in. You can use our built-in **"Draft Inquiry Email"** tool on each vendor card!`,
    };
  } else {
    return {
      reply: `I love where this is heading! For "${plan.details.title}", keeping ${plan.details.vibe} as the focal point will make it unforgettable for all ${plan.details.guestCount} guests. You can easily tweak any budget row, add milestones to your countdown, or check the Ideation Studio for fresh menu & decor inspiration. What specific element would you like help with next?`,
    };
  }
};

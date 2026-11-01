export type EventType = 'wedding' | 'birthday' | 'community' | 'corporate';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCY_MAP: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar' },
};

export interface EventDetails {
  id: string;
  title: string;
  eventType: EventType;
  date: string; // ISO date string (YYYY-MM-DD)
  startTime?: string; // HH:mm
  endTime?: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: CurrencyCode;
  vibe: string; // e.g. "Rustic BoHo Chic", "Neon Cyberpunk 80s", "Warm Autumn Community Festival"
  themeDescription: string;
  primaryPriorities: string[]; // e.g. ["Great Food", "Memorable Photography", "Dancing"]
  dietaryRestrictions: string[]; // e.g. ["Vegan", "Gluten-Free", "Nut-Free"]
  accessibilityNeeds: string[]; // e.g. ["Wheelchair Accessible", "Sensory Quiet Zone"]
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetCategoryType = 
  | 'venue' 
  | 'catering' 
  | 'photography' 
  | 'entertainment' 
  | 'decor' 
  | 'attire' 
  | 'stationery' 
  | 'transport' 
  | 'contingency' 
  | 'other';

export interface BudgetItem {
  id: string;
  category: BudgetCategoryType;
  name: string;
  allocatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  isPaid: boolean;
  notes?: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalActual: number;
  totalPaid: number;
  remainingBudget: number;
  contingencyReserve: number;
}

export type MilestonePhase = 
  | '12_months_out' 
  | '6_months_out' 
  | '3_months_out' 
  | '1_month_out' 
  | '2_weeks_out' 
  | '1_week_out' 
  | 'day_before' 
  | 'post_event';

export interface MilestoneItem {
  id: string;
  title: string;
  description?: string;
  phase: MilestonePhase;
  dueDate: string; // ISO date string
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  assignedTo?: string;
}

export interface DayOfScheduleItem {
  id: string;
  time: string; // e.g. "14:00" or "2:00 PM"
  endTime?: string;
  activity: string;
  location: string;
  keyPeople: string[];
  notes?: string;
  completed?: boolean;
}

export type VendorCategory = 
  | 'Venue' 
  | 'Catering & Bar' 
  | 'Photography & Video' 
  | 'Music & DJ' 
  | 'Flowers & Decor' 
  | 'Attire & Beauty' 
  | 'Cake & Dessert' 
  | 'Transportation' 
  | 'Rentals & Audio' 
  | 'Permits & Security' 
  | 'Other';

export type VendorStatus = 
  | 'researching' 
  | 'contacted' 
  | 'quote_received' 
  | 'contract_signed' 
  | 'deposit_paid' 
  | 'fully_paid';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  status: VendorStatus;
  estimatedCost: number;
  finalCost?: number;
  depositPaid?: number;
  depositDueDate?: string;
  notes?: string;
  rating?: number; // 1 to 5
}

export interface ColorPaletteItem {
  name: string;
  hex: string;
  role: string; // e.g. "Primary Accent", "Soft Neutral", "Gilded Trim"
}

export interface PersonalizedIdeas {
  themeName: string;
  tagline: string;
  palette: ColorPaletteItem[];
  decorConcepts: string[];
  menuSuggestions: {
    appetizers: string[];
    mains: string[];
    desserts: string[];
    signatureDrinks: { name: string; description: string; isAlcoholic: boolean }[];
  };
  invitationWording: {
    formal: string;
    modernPlayful: string;
    casual: string;
  };
  activitiesAndEntertainment: {
    title: string;
    description: string;
    timing: string;
  }[];
  musicPlaylistVibes: {
    style: string;
    sampleTracks: string[];
  }[];
  costSavingHacks: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_budget_rebalance' | 'add_milestone' | 'add_vendor' | 'update_theme';
    label: string;
    payload: any;
  };
}

export interface FullEventPlan {
  details: EventDetails;
  budgetItems: BudgetItem[];
  milestones: MilestoneItem[];
  dayOfSchedule: DayOfScheduleItem[];
  vendors: Vendor[];
  ideas: PersonalizedIdeas;
  chatHistory: ChatMessage[];
}

export interface UserSettings {
  geminiApiKey: string;
  preferredModel: 'gemini-2.0-flash' | 'gemini-1.5-flash';
  defaultCurrency: CurrencyCode;
  darkMode: boolean;
}

import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Cake, 
  Users, 
  Building, 
  Calendar, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventType, CurrencyCode, CURRENCY_MAP, FullEventPlan } from '../types/event';
import { generateEventPlanWithAI } from '../services/gemini';

interface EventSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanCreated: (plan: FullEventPlan) => void;
}

const EVENT_TYPE_OPTIONS: { type: EventType; title: string; subtitle: string; icon: any; color: string }[] = [
  {
    type: 'wedding',
    title: 'Wedding Celebration',
    subtitle: 'Ceremonies, receptions, rehearsal dinners & bridal party timelines',
    icon: Heart,
    color: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600',
  },
  {
    type: 'birthday',
    title: 'Birthday & Milestones',
    subtitle: 'Sweet 16, 21st, 30th/50th/80th jubilees, themed arcade/dinner parties',
    icon: Cake,
    color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-600',
  },
  {
    type: 'community',
    title: 'Community & Cultural',
    subtitle: 'Neighborhood festivals, charity galas, block parties, zero-waste events',
    icon: Users,
    color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600',
  },
  {
    type: 'corporate',
    title: 'Corporate & Gatherings',
    subtitle: 'Team retreats, holiday galas, product launches & hackathon banquets',
    icon: Building,
    color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600',
  },
];

const VIBE_PRESETS: Record<EventType, string[]> = {
  wedding: [
    'Sun-Drenched Tuscan Vineyard Elegance',
    'Modern Minimalist Black-Tie Rooftop',
    'Enchanted Forest Whimsical Boho',
    'Coastal Sunset Romance with Lanterns',
  ],
  birthday: [
    '80s Synthwave & Neon Cyber Arcade Glow',
    'Cozy Speakeasy Jazz & Craft Cocktail Lounge',
    'Golden Glamour Hollywood Red Carpet',
    'Tropical Boho Picnic in the Park',
  ],
  community: [
    'Warm Neighborhood Autumn Harvest Festival',
    'Zero-Waste Sustainable Eco Fair',
    'Multicultural Street Food & Music Carnival',
    'Family Fun Day & Lawn Games Olympiad',
  ],
  corporate: [
    'Tech Horizon Innovation Gala & Awards',
    'Rustic Mountain Leadership Retreat',
    'Cocktail Soirée & Charity Auction',
    'Summer Outdoor Hackathon Celebration',
  ],
};

const PRIORITY_OPTIONS = [
  'Exceptional Farm-to-Table Food & Cocktails',
  'Breath-Taking Photography & Video',
  'High-Energy Live Music & Dancing',
  'Gorgeous Floral & Lighting Decor',
  'Effortless Guest Accessibility & Shuttles',
  'Low-Stress Flawless Day-Of Schedule',
  'Kid & Family Inclusive Activities',
  'Zero-Waste & Eco-Friendly Design',
];

const DIETARY_OPTIONS = [
  'Vegetarian Options',
  'Vegan Designated',
  'Gluten-Free Designated',
  'Halal Friendly',
  'Kosher Friendly',
  'Nut-Free Safe',
  'Dairy-Free Desserts',
];

const ACCESSIBILITY_OPTIONS = [
  'Step-Free & Wheelchair Ramps',
  'Designated Quiet / Sensory Room',
  'ASL Sign Language Interpreter',
  'Accessible Restroom Trailers',
  'Guest Cart / Shuttle Transport',
];

export const EventSetupWizard: React.FC<EventSetupWizardProps> = ({
  isOpen,
  onClose,
  onPlanCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2027-05-15');
  const [location, setLocation] = useState('Sonoma Valley, CA');
  const [guestCount, setGuestCount] = useState<number>(100);

  // Vibe & Priorities
  const [vibe, setVibe] = useState('Sun-Drenched Tuscan Vineyard Elegance');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Exceptional Farm-to-Table Food & Cocktails',
    'Breath-Taking Photography & Video',
  ]);

  // Budget & Inclusivity
  const [totalBudget, setTotalBudget] = useState<number>(35000);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [dietary, setDietary] = useState<string[]>(['Vegetarian Options', 'Gluten-Free Designated']);
  const [accessibility, setAccessibility] = useState<string[]>(['Step-Free & Wheelchair Ramps']);

  // Loading generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');

  if (!isOpen) return null;

  const toggleArrayItem = (arr: string[], item: string, setter: (val: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleCreatePlan = async () => {
    setIsGenerating(true);
    setGenerationStepText('Gatherly AI is analyzing headcount & venue constraints...');

    const timer1 = setTimeout(() => {
      setGenerationStepText('Calculating benchmark budget proportions & contingency buffer...');
    }, 1100);

    const timer2 = setTimeout(() => {
      setGenerationStepText('Structuring hour-by-hour day-of itinerary & vendor milestones...');
    }, 2200);

    const timer3 = setTimeout(() => {
      setGenerationStepText('Curating customized color palette, invitation drafts & menu pairings...');
    }, 3300);

    try {
      const generated = await generateEventPlanWithAI({
        title: title.trim() || `${vibe} ${eventType.toUpperCase()}`,
        eventType,
        date,
        location: location.trim() || 'Central Venue',
        guestCount: Number(guestCount) || 50,
        totalBudget: Number(totalBudget) || 10000,
        currency,
        vibe,
        primaryPriorities: selectedPriorities,
        dietaryRestrictions: dietary,
        accessibilityNeeds: accessibility,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d74e84', '#f59e0b', '#10b981', '#6366f1', '#0284c7'],
        });
      } catch (e) {
        // ignore in test
      }

      onPlanCreated(generated);
      onClose();
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative my-8">
        
        {/* Close Button */}
        {!isGenerating && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isGenerating ? (
          /* Generation Progress Animation */
          <div className="py-16 text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-brand-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 animate-pulse">
              <Sparkles className="w-10 h-10 animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Gatherly AI Architect at Work
              </h2>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400 h-6">
                {generationStepText}
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Synthesizing budget formulas, vendor matrices, and personalized styling for your {guestCount} guests.
              </p>
            </div>
          </div>
        ) : (
          /* Step-by-Step Intake Form */
          <div>
            {/* Wizard Step Indicator */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center">
                  {step}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {step === 1 && 'Event Details & Type'}
                  {step === 2 && 'Atmosphere, Vibe & Priorities'}
                  {step === 3 && 'Budget Cap & Inclusivity'}
                </span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Step {step} of 3</span>
            </div>

            {/* STEP 1: Event Type & Basics */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Select Event Vertical *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {EVENT_TYPE_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = eventType === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => {
                            setEventType(opt.type);
                            setVibe(VIBE_PRESETS[opt.type][0]);
                          }}
                          className={`p-3.5 rounded-2xl border-2 text-left transition flex items-start space-x-3 ${
                            isSelected
                              ? `${opt.color} shadow-sm ring-1 ring-brand-500`
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex-shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white">{opt.title}</div>
                            <div className="text-[11px] text-slate-500 leading-snug mt-0.5">{opt.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Celebration Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam & Chloe's Coastal Sunset Wedding"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Event Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Location / Venue City *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Napa Valley, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Estimated Guest Count
                    </label>
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                      {guestCount} Guests
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="5"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>10 (Intimate)</span>
                    <span>100 (Medium)</span>
                    <span>500+ (Festival/Gala)</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Atmosphere, Vibe & Priorities */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Theme / Atmosphere Vibe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Tuscan Bohemian with Terracotta and Olive Accents"
                    value={vibe}
                    onChange={(e) => setVibe(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium mb-2"
                  />
                  
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Or choose a curated vibe:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {VIBE_PRESETS[eventType].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setVibe(preset)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                          vibe === preset
                            ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-brand-950 dark:border-brand-800 dark:text-brand-300 font-bold'
                            : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Top Priorities for Your Guests (Select up to 3)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRIORITY_OPTIONS.map((priority) => {
                      const isSelected = selectedPriorities.includes(priority);
                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() => toggleArrayItem(selectedPriorities, priority, setSelectedPriorities)}
                          className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-50 border-brand-400 text-brand-700 dark:bg-brand-950/60 dark:border-brand-800 dark:text-brand-300'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <span className="truncate pr-2">{priority}</span>
                          {isSelected && <Check className="w-4 h-4 text-brand-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Budget Cap & Inclusivity */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Total Target Budget Cap *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="500"
                        step="500"
                        required
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(Number(e.target.value) || 0)}
                        className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="w-full text-xs sm:text-sm font-semibold px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                      {Object.values(CURRENCY_MAP).map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dietary Requirements to Cater For
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETARY_OPTIONS.map((item) => {
                      const isSelected = dietary.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleArrayItem(dietary, item, setDietary)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border transition ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isSelected ? `✓ ${item}` : item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Accessibility & Inclusivity Features
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCESSIBILITY_OPTIONS.map((item) => {
                      const isSelected = accessibility.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleArrayItem(accessibility, item, setAccessibility)}
                          className={`text-xs px-2.5 py-1.5 rounded-xl border transition ${
                            isSelected
                              ? 'bg-sky-50 border-sky-400 text-sky-800 dark:bg-sky-950 dark:border-sky-800 dark:text-sky-300 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {isSelected ? `✓ ${item}` : item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreatePlan}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-brand-600 to-rose-500 hover:from-brand-700 hover:to-rose-600 text-white shadow-lg shadow-brand-500/25 transition transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full Event Plan with AI</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FileDown
} from 'lucide-react';
import { FullEventPlan, CURRENCY_MAP } from '../types/event';
import { generateICalendar, downloadFile } from '../services/export';

interface DashboardProps {
  plan: FullEventPlan;
  onNavigateTab: (tab: 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'ideas') => void;
  onOpenCopilot: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  plan,
  onNavigateTab,
  onOpenCopilot,
}) => {
  const { details, budgetItems, milestones, dayOfSchedule, vendors, ideas } = plan;
  const currency = CURRENCY_MAP[details.currency] || CURRENCY_MAP.USD;

  // Countdown calculations
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(`${details.date}T${details.startTime || '12:00'}:00`).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [details.date, details.startTime]);

  // Financial calculations
  const totalAllocated = budgetItems.reduce((acc, i) => acc + i.allocatedAmount, 0);
  const totalActual = budgetItems.reduce((acc, i) => acc + i.actualAmount, 0);
  const totalPaid = budgetItems.reduce((acc, i) => acc + i.paidAmount, 0);
  const remainingBudget = details.totalBudget - totalActual;
  const budgetUtilizationPct = Math.min(100, Math.round((totalActual / details.totalBudget) * 100)) || 0;
  const costPerGuest = details.guestCount > 0 ? Math.round(details.totalBudget / details.guestCount) : 0;

  // Milestone statistics
  const completedMilestones = milestones.filter((m) => m.completed).length;
  const milestoneProgressPct = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

  // Vendor statistics
  const contractedVendors = vendors.filter((v) => ['contract_signed', 'deposit_paid', 'fully_paid'].includes(v.status)).length;

  const handleExportCalendar = () => {
    const icsData = generateICalendar(plan);
    downloadFile(icsData, `${details.title.replace(/\s+/g, '_')}_schedule.ics`, 'text/calendar');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Hero Celebration Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-slate-900 to-indigo-950 text-white p-6 sm:p-10 shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="capitalize">{details.eventType} Celebration</span>
              <span>•</span>
              <span>{details.vibe}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {details.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-brand-300" />
                <span>{details.date} {details.startTime ? `at ${details.startTime}` : ''}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-rose-300" />
                <span>{details.location}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-amber-300" />
                <span>{details.guestCount} Estimated Guests</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300/90 italic pt-1">
              "{ideas.tagline || details.themeDescription}"
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col items-center justify-center min-w-[280px]">
            <div className="text-xs font-semibold tracking-wider text-slate-300 uppercase mb-2 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-300" />
              <span>Event Countdown</span>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              <div className="bg-black/30 rounded-xl p-2 min-w-[55px]">
                <div className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</div>
                <div className="text-[10px] text-slate-400 font-medium">Days</div>
              </div>
              <div className="bg-black/30 rounded-xl p-2 min-w-[55px]">
                <div className="text-xl sm:text-2xl font-black text-white">{timeLeft.hours}</div>
                <div className="text-[10px] text-slate-400 font-medium">Hours</div>
              </div>
              <div className="bg-black/30 rounded-xl p-2 min-w-[55px]">
                <div className="text-xl sm:text-2xl font-black text-white">{timeLeft.minutes}</div>
                <div className="text-[10px] text-slate-400 font-medium">Mins</div>
              </div>
              <div className="bg-black/30 rounded-xl p-2 min-w-[55px]">
                <div className="text-xl sm:text-2xl font-black text-brand-300">{timeLeft.seconds}</div>
                <div className="text-[10px] text-slate-400 font-medium">Secs</div>
              </div>
            </div>
            <button
              onClick={handleExportCalendar}
              className="mt-3.5 w-full flex items-center justify-center space-x-1.5 text-xs font-semibold text-white/90 bg-white/10 hover:bg-white/20 py-1.5 rounded-lg border border-white/10 transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Add to Apple / Google Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* High Impact KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Budget Health Card */}
        <div 
          onClick={() => onNavigateTab('budget')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Budget
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {currency.symbol}{details.totalBudget.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {currency.code}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Spent: {currency.symbol}{totalActual.toLocaleString()}</span>
              <span>{budgetUtilizationPct}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilizationPct > 100 ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, budgetUtilizationPct)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition">
            <span>{currency.symbol}{Math.max(0, remainingBudget).toLocaleString()} remaining buffer</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Guest Allocation Card */}
        <div 
          onClick={() => onNavigateTab('budget')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Guest Capacity
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {details.guestCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Attendees</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Average cost target:
            <span className="font-semibold text-slate-700 dark:text-slate-300 ml-1">
              {currency.symbol}{costPerGuest} / guest
            </span>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition">
            <span>{details.dietaryRestrictions.length > 0 ? `${details.dietaryRestrictions.length} Dietary flags noted` : 'No dietary restrictions'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Milestone Tracker Card */}
        <div 
          onClick={() => onNavigateTab('timeline')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Checklist Milestones
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {completedMilestones} / {milestones.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Completed</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-slate-500 mb-1">
              <span>Readiness</span>
              <span>{milestoneProgressPct}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${milestoneProgressPct}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-sky-600 dark:text-sky-400 group-hover:translate-x-1 transition">
            <span>{milestones.length - completedMilestones} action items pending</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>

        {/* Vendor Status Card */}
        <div 
          onClick={() => onNavigateTab('vendors')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vendor Partners
            </span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {contractedVendors} / {vendors.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">Confirmed</span>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {vendors.length - contractedVendors > 0
              ? `${vendors.length - contractedVendors} vendors in quote/research stage`
              : 'All vendors contracted & locked in'}
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition">
            <span>View contacts & quote tools</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </div>
      </div>

      {/* Two-Column Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Day-Of Run-of-Show Sneak Peek & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Day-of Itinerary Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Day-Of Itinerary Highlights
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center space-x-1"
              >
                <span>Full Timeline ({dayOfSchedule.length})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {dayOfSchedule.slice(0, 4).map((item, idx) => (
                <div 
                  key={item.id}
                  className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-brand-200 transition"
                >
                  <div className="w-16 flex-shrink-0 text-center py-1 px-2 rounded-lg bg-white dark:bg-slate-700 shadow-xs border border-slate-200/60 dark:border-slate-600">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.time}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.activity}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                      {item.keyPeople.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{item.keyPeople.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Color Palette & Moodboard Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Curated Aesthetic Palette: {ideas.themeName}
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('ideas')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center space-x-1"
              >
                <span>Ideation Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {details.themeDescription}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ideas.palette.map((color, idx) => (
                <div key={idx} className="rounded-xl p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
                  <div 
                    className="w-full h-12 rounded-lg shadow-inner mb-2 border border-black/5"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {color.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    {color.hex}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: AI Co-Pilot Recommendation Widget */}
        <div className="space-y-6">
          
          {/* Smart AI Recommendations Box */}
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-rose-50 dark:from-slate-900 dark:to-brand-950/40 p-6 border border-brand-100 dark:border-brand-900/40 shadow-sm">
            <div className="flex items-center space-x-2 text-brand-700 dark:text-brand-300 font-bold text-sm mb-3">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
              <span>Gatherly AI Smart Insights</span>
            </div>

            <div className="space-y-3">
              {ideas.costSavingHacks.slice(0, 3).map((hack, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{hack}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenCopilot}
              className="mt-5 w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Copilot to Optimize Plan</span>
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Instant Actions
            </h3>
            
            <button
              onClick={() => onNavigateTab('budget')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left border border-slate-100 dark:border-slate-800 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Record an Expense</div>
                  <div className="text-[11px] text-slate-400">Track paid receipts & quotes</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onNavigateTab('vendors')}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left border border-slate-100 dark:border-slate-800 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/60">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Draft Vendor Inquiry</div>
                  <div className="text-[11px] text-slate-400">AI email & interview cheat sheet</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={handleExportCalendar}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left border border-slate-100 dark:border-slate-800 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/60">
                  <FileDown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">Download iCal Calendar</div>
                  <div className="text-[11px] text-slate-400">Import to Google or Apple Cal</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

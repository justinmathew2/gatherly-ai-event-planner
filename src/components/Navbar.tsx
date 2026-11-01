import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users, 
  Palette, 
  Download, 
  Settings as SettingsIcon, 
  PlusCircle, 
  MessageSquareText, 
  ChevronDown,
  PartyPopper,
  Heart,
  Cake,
  Building
} from 'lucide-react';
import { FullEventPlan, EventType } from '../types/event';

interface NavbarProps {
  allEvents: FullEventPlan[];
  activeEvent: FullEventPlan;
  activeTab: 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'ideas';
  setActiveTab: (tab: 'dashboard' | 'budget' | 'timeline' | 'vendors' | 'ideas') => void;
  onSelectEvent: (eventId: string) => void;
  onOpenCreateWizard: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  allEvents,
  activeEvent,
  activeTab,
  setActiveTab,
  onSelectEvent,
  onOpenCreateWizard,
  onOpenSettings,
  onOpenExport,
  isChatOpen,
  setIsChatOpen,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'wedding':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'birthday':
        return <Cake className="w-4 h-4 text-amber-500" />;
      case 'community':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'corporate':
        return <Building className="w-4 h-4 text-indigo-500" />;
      default:
        return <PartyPopper className="w-4 h-4 text-brand-500" />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Calendar },
    { id: 'budget', label: 'Budget Planner', icon: DollarSign },
    { id: 'timeline', label: 'Timeline & Schedule', icon: Clock },
    { id: 'vendors', label: 'Vendor Hub', icon: Users },
    { id: 'ideas', label: 'Ideation Studio', icon: Palette },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Event Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Sparkles className="w-5 h-5 animate-pulse-subtle" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                  Gatherly<span className="text-slate-900 dark:text-white font-medium text-xs ml-1 px-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800">AI</span>
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-1">
                  Event Planning Copilot
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Event Selector Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-700 transition"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {getEventIcon(activeEvent.details.eventType)}
                <span className="max-w-[150px] sm:max-w-[220px] truncate">
                  {activeEvent.details.title}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fade-in"
                  role="menu"
                >
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Your Celebrations
                  </div>
                  {allEvents.map((evt) => (
                    <button
                      key={evt.details.id}
                      onClick={() => {
                        onSelectEvent(evt.details.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition ${
                        evt.details.id === activeEvent.details.id
                          ? 'bg-brand-50/60 dark:bg-brand-950/30 font-semibold text-brand-600 dark:text-brand-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                      role="menuitem"
                    >
                      {getEventIcon(evt.details.eventType)}
                      <div className="truncate flex-1">
                        <div className="truncate">{evt.details.title}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {evt.details.date} • {evt.details.guestCount} guests
                        </div>
                      </div>
                    </button>
                  ))}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      onOpenCreateWizard();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition"
                    role="menuitem"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create New Event with AI</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1" role="tablist">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Top Right Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                isChatOpen
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100'
              }`}
              title="Toggle AI Event Copilot"
              aria-label="Toggle AI Event Copilot"
            >
              <MessageSquareText className="w-4 h-4" />
              <span className="hidden sm:inline">AI Copilot</span>
            </button>

            <button
              onClick={onOpenExport}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Export & Share Plan"
              aria-label="Export Plan"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Configure Settings & API Key"
              aria-label="Configure Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex justify-around bg-slate-50/70 dark:bg-slate-950/70">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};


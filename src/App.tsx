import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { BudgetPlanner } from './components/BudgetPlanner';
import { TimelineManager } from './components/TimelineManager';
import { VendorChecklist } from './components/VendorChecklist';
import { IdeationStudio } from './components/IdeationStudio';
import { AssistantChat } from './components/AssistantChat';
import { EventSetupWizard } from './components/EventSetupWizard';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { 
  FullEventPlan, 
  UserSettings 
} from './types/event';
import { 
  getStoredEvents, 
  saveStoredEvents, 
  getActiveEventId, 
  setActiveEventId, 
  saveSingleEvent, 
  getStoredSettings, 
  saveStoredSettings 
} from './services/storage';
import { SAMPLE_EVENTS } from './services/mockData';
import { Sparkles, Heart } from 'lucide-react';

export const App: React.FC = () => {
  const [events, setEvents] = useState<FullEventPlan[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'timeline' | 'vendors' | 'ideas'>('dashboard');
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [externalChatPrompt, setExternalChatPrompt] = useState<string>('');

  // Initial load
  useEffect(() => {
    const loadedEvents = getStoredEvents();
    const storedActiveId = getActiveEventId();
    setEvents(loadedEvents);
    setActiveId(storedActiveId || loadedEvents[0]?.details.id || '');

    // Apply dark theme if saved
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const activeEvent = events.find((e) => e.details.id === activeId) || events[0] || SAMPLE_EVENTS[0];

  const handleSelectEvent = (id: string) => {
    setActiveId(id);
    setActiveEventId(id);
  };

  const handleUpdateActivePlan = (updated: FullEventPlan) => {
    saveSingleEvent(updated);
    setEvents((prev) => prev.map((e) => (e.details.id === updated.details.id ? updated : e)));
  };

  const handlePlanCreated = (newPlan: FullEventPlan) => {
    const updatedEvents = [newPlan, ...events];
    setEvents(updatedEvents);
    setActiveId(newPlan.details.id);
    setActiveEventId(newPlan.details.id);
    saveStoredEvents(updatedEvents);
    setActiveTab('dashboard');
  };

  const handleResetSamples = () => {
    localStorage.clear();
    setEvents(SAMPLE_EVENTS);
    setActiveId(SAMPLE_EVENTS[0].details.id);
    setActiveEventId(SAMPLE_EVENTS[0].details.id);
    saveStoredEvents(SAMPLE_EVENTS);
  };

  const handleOpenCopilotWithPrompt = (prompt: string) => {
    setExternalChatPrompt(prompt);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors selection:bg-brand-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        allEvents={events}
        activeEvent={activeEvent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectEvent={handleSelectEvent}
        onOpenCreateWizard={() => setShowCreateWizard(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenExport={() => setShowExport(true)}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            plan={activeEvent}
            onNavigateTab={setActiveTab}
            onOpenCopilot={() => setIsChatOpen(true)}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetPlanner
            plan={activeEvent}
            onUpdatePlan={handleUpdateActivePlan}
            onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineManager
            plan={activeEvent}
            onUpdatePlan={handleUpdateActivePlan}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorChecklist
            plan={activeEvent}
            onUpdatePlan={handleUpdateActivePlan}
          />
        )}

        {activeTab === 'ideas' && (
          <IdeationStudio
            plan={activeEvent}
            onOpenCopilotWithPrompt={handleOpenCopilotWithPrompt}
          />
        )}
      </main>

      {/* AI Assistant Copilot Drawer */}
      <AssistantChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plan={activeEvent}
        onUpdatePlan={handleUpdateActivePlan}
        externalPrompt={externalChatPrompt}
        clearExternalPrompt={() => setExternalChatPrompt('')}
      />

      {/* Modals */}
      <EventSetupWizard
        isOpen={showCreateWizard}
        onClose={() => setShowCreateWizard(false)}
        onPlanCreated={handlePlanCreated}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
        onResetSamples={handleResetSamples}
      />

      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        plan={activeEvent}
        onImportPlan={(imported) => handlePlanCreated(imported)}
      />

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 py-6 text-center text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-extrabold text-brand-600">Gatherly AI</span>
            <span>— GenAI-Powered Celebration & Event Planner</span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/justinmathew2/gatherly-ai-event-planner.git"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
            >
              GitHub Repository
            </a>
            <span>•</span>
            <span className="text-slate-400">Challenge 5 Submission</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

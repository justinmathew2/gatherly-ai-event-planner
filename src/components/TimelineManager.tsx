/**
 * @file TimelineManager.tsx
 * @description Accessible countdown milestone tracker and hour-by-hour day-of
 * run-of-show itinerary with RFC-5545 iCalendar synchronization.
 */

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  FileDown, 
  Printer, 
  Sparkles, 
  MapPin, 
  User 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  FullEventPlan, 
  MilestoneItem, 
  DayOfScheduleItem, 
  MilestonePhase 
} from '../types/event';
import { generateICalendar, downloadFile } from '../services/export';
import { sanitizeText } from '../utils/security';

interface TimelineManagerProps {
  plan: FullEventPlan;
  onUpdatePlan: (updated: FullEventPlan) => void;
}

const PHASE_LABELS: Record<MilestonePhase, string> = {
  '12_months_out': '12+ Months Before',
  '6_months_out': '6 Months Before',
  '3_months_out': '3 Months Before',
  '1_month_out': '1 Month Before',
  '2_weeks_out': '2 Weeks Before',
  '1_week_out': '1 Week Before',
  'day_before': 'Day Before Event',
  'post_event': 'Post-Event Wrap-up',
};

const PHASE_ORDER: MilestonePhase[] = [
  '12_months_out',
  '6_months_out',
  '3_months_out',
  '1_month_out',
  '2_weeks_out',
  '1_week_out',
  'day_before',
  'post_event',
];

export const TimelineManager: React.FC<TimelineManagerProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const { details, milestones, dayOfSchedule } = plan;
  const [activeSubTab, setActiveSubTab] = useState<'milestones' | 'dayOf'>('milestones');

  // Add milestone modal state
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestonePhase, setNewMilestonePhase] = useState<MilestonePhase>('1_month_out');
  const [newMilestonePriority, setNewMilestonePriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newMilestoneAssignee, setNewMilestoneAssignee] = useState('');
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState(details.date);

  // Add schedule item modal state
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newTime, setNewTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('15:00');
  const [newActivity, setNewActivity] = useState('');
  const [newLocation, setNewLocation] = useState(details.location);
  const [newPeople, setNewPeople] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddMilestone) setShowAddMilestone(false);
        if (showAddSchedule) setShowAddSchedule(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddMilestone, showAddSchedule]);

  // Milestone checkoff with confetti celebration
  const toggleMilestone = (id: string) => {
    const target = milestones.find((m) => m.id === id);
    const willComplete = target ? !target.completed : false;

    if (willComplete) {
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#d74e84', '#f59e0b', '#10b981', '#6366f1'],
        });
      } catch {
        // ignore in test
      }
    }

    const updated = milestones.map((m) => {
      if (m.id === id) {
        return { ...m, completed: willComplete };
      }
      return m;
    });

    onUpdatePlan({ ...plan, milestones: updated });
  };

  const deleteMilestone = (id: string) => {
    const updated = milestones.filter((m) => m.id !== id);
    onUpdatePlan({ ...plan, milestones: updated });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newMilestoneTitle, 150);
    if (!cleanTitle) return;

    const newItem: MilestoneItem = {
      id: `milestone-${Date.now()}`,
      title: cleanTitle,
      phase: newMilestonePhase,
      dueDate: newMilestoneDueDate || details.date,
      completed: false,
      priority: newMilestonePriority,
      assignedTo: sanitizeText(newMilestoneAssignee, 80) || undefined,
    };

    onUpdatePlan({ ...plan, milestones: [...milestones, newItem] });
    setNewMilestoneTitle('');
    setShowAddMilestone(false);
  };

  const toggleScheduleComplete = (id: string) => {
    const updated = dayOfSchedule.map((s) => {
      if (s.id === id) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });
    onUpdatePlan({ ...plan, dayOfSchedule: updated });
  };

  const deleteScheduleItem = (id: string) => {
    const updated = dayOfSchedule.filter((s) => s.id !== id);
    onUpdatePlan({ ...plan, dayOfSchedule: updated });
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanActivity = sanitizeText(newActivity, 150);
    if (!cleanActivity) return;

    const newItem: DayOfScheduleItem = {
      id: `sched-${Date.now()}`,
      time: newTime,
      endTime: newEndTime || undefined,
      activity: cleanActivity,
      location: sanitizeText(newLocation, 120) || details.location,
      keyPeople: newPeople ? newPeople.split(',').map((p) => sanitizeText(p, 60)) : [],
      notes: sanitizeText(newNotes, 300) || undefined,
      completed: false,
    };

    const updated = [...dayOfSchedule, newItem].sort((a, b) => a.time.localeCompare(b.time));
    onUpdatePlan({ ...plan, dayOfSchedule: updated });

    setNewActivity('');
    setNewNotes('');
    setShowAddSchedule(false);
  };

  const handleExportCalendar = () => {
    const ics = generateICalendar(plan);
    downloadFile(ics, `${details.title.replace(/\s+/g, '_')}_calendar.ics`, 'text/calendar');
  };

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPct = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Clock className="w-6 h-6 text-brand-600" />
            <span>Timeline & Schedule</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Track phase-by-phase planning countdowns and your exact day-of run of show.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCalendar}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-500"
            title="Download .ics file for Google or Apple Calendar"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Sync to Calendar (.ics)</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          {activeSubTab === 'milestones' ? (
            <button
              type="button"
              onClick={() => setShowAddMilestone(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddSchedule(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add Schedule Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'milestones'}
          onClick={() => setActiveSubTab('milestones')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition focus-visible:ring-2 focus-visible:ring-brand-500 ${
            activeSubTab === 'milestones'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Countdown Milestones ({completedCount}/{milestones.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeSubTab === 'dayOf'}
          onClick={() => setActiveSubTab('dayOf')}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition focus-visible:ring-2 focus-visible:ring-brand-500 ${
            activeSubTab === 'dayOf'
              ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Day-Of Run-of-Show ({dayOfSchedule.length} Events)</span>
        </button>
      </div>

      {/* VIEW 1: Milestones Checklist */}
      {activeSubTab === 'milestones' && (
        <div className="space-y-6" role="tabpanel" aria-label="Countdown Milestones">
          {/* Progress Banner */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Planning Readiness: {progressPct}% Done
              </div>
              <div className="text-[11px] text-slate-500">
                {milestones.length - completedCount} milestones remaining before {details.date}
              </div>
            </div>
            <div className="w-48 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Grouped by Phase */}
          <div className="space-y-6">
            {PHASE_ORDER.map((phase) => {
              const phaseItems = milestones.filter((m) => m.phase === phase);
              if (phaseItems.length === 0) return null;

              return (
                <div key={phase} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{PHASE_LABELS[phase]}</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {phaseItems.filter((i) => i.completed).length} / {phaseItems.length} checked
                    </span>
                  </div>

                  <div className="space-y-2">
                    {phaseItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition ${
                          item.completed
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800/50 opacity-75'
                            : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 hover:border-brand-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                          <button
                            type="button"
                            onClick={() => toggleMilestone(item.id)}
                            aria-label={item.completed ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as completed`}
                            className="flex-shrink-0 text-slate-400 hover:text-emerald-500 transition focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            )}
                          </button>
                          
                          <div className="min-w-0">
                            <span
                              className={`text-xs sm:text-sm font-semibold block truncate ${
                                item.completed
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {item.title}
                            </span>
                            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                              {item.assignedTo && (
                                <span className="flex items-center space-x-1">
                                  <User className="w-3 h-3" />
                                  <span>{item.assignedTo}</span>
                                </span>
                              )}
                              <span>•</span>
                              <span>Due: {item.dueDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.priority === 'high'
                                ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                : item.priority === 'medium'
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {item.priority}
                          </span>

                          <button
                            type="button"
                            onClick={() => deleteMilestone(item.id)}
                            aria-label={`Delete milestone: ${item.title}`}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded transition focus-visible:ring-2 focus-visible:ring-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Day-Of Run of Show (Hourly) */}
      {activeSubTab === 'dayOf' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6" role="tabpanel" aria-label="Day-Of Run-of-Show">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Official Run of Show: {details.date}
              </h2>
              <p className="text-xs text-slate-400">
                Detailed timing cue sheet for coordinators, vendors, and hosts.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportCalendar}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1 focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Day to iCal</span>
            </button>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {dayOfSchedule.map((slot) => (
              <div key={slot.id} className="relative group">
                <button
                  type="button"
                  onClick={() => toggleScheduleComplete(slot.id)}
                  aria-label={slot.completed ? `Mark ${slot.activity} incomplete` : `Mark ${slot.activity} completed`}
                  className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white dark:bg-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
                    slot.completed
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-brand-500 text-brand-500'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${slot.completed ? 'bg-emerald-500' : 'bg-brand-500'}`} />
                </button>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700/60 hover:border-brand-300 dark:hover:border-brand-600 transition space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold text-xs mr-2 border border-brand-200/50 dark:border-brand-800/50">
                        {slot.time} {slot.endTime ? `– ${slot.endTime}` : ''}
                      </span>
                      <h3 className={`inline text-xs sm:text-sm font-bold text-slate-900 dark:text-white ${slot.completed ? 'line-through text-slate-400' : ''}`}>
                        {slot.activity}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteScheduleItem(slot.id)}
                      aria-label={`Delete ${slot.activity}`}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{slot.location}</span>
                    </div>

                    {slot.keyPeople.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>Key people: {slot.keyPeople.join(', ')}</span>
                      </div>
                    )}
                  </div>

                  {slot.notes && (
                    <div className="text-[11px] text-slate-400 italic bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                      Note: {slot.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-milestone-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 id="add-milestone-modal-title" className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <span>Add Planning Milestone</span>
            </h3>

            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label htmlFor="new-milestone-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Task Title *
                </label>
                <input
                  id="new-milestone-title"
                  type="text"
                  required
                  placeholder="e.g. Schedule Cake Tasting & Select Flavors"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-milestone-phase" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Planning Phase
                </label>
                <select
                  id="new-milestone-phase"
                  value={newMilestonePhase}
                  onChange={(e) => setNewMilestonePhase(e.target.value as MilestonePhase)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  {PHASE_ORDER.map((phase) => (
                    <option key={phase} value={phase}>
                      {PHASE_LABELS[phase]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-milestone-priority" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    id="new-milestone-priority"
                    value={newMilestonePriority}
                    onChange={(e) => setNewMilestonePriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="new-milestone-assignee" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Person
                  </label>
                  <input
                    id="new-milestone-assignee"
                    type="text"
                    placeholder="e.g. Lead Planner"
                    value={newMilestoneAssignee}
                    onChange={(e) => setNewMilestoneAssignee(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-milestone-due-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Due Date
                </label>
                <input
                  id="new-milestone-due-date"
                  type="date"
                  value={newMilestoneDueDate}
                  onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Day-of Schedule Modal */}
      {showAddSchedule && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-schedule-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 id="add-schedule-modal-title" className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <span>Add Day-Of Schedule Slot</span>
            </h3>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-slot-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    id="new-slot-time"
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-slot-end-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    id="new-slot-end-time"
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-slot-activity" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Activity Title *
                </label>
                <input
                  id="new-slot-activity"
                  type="text"
                  required
                  placeholder="e.g. Sunset Golden Hour Couple Photos"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-slot-location" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  id="new-slot-location"
                  type="text"
                  placeholder="e.g. West Vineyard Lawn"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-slot-people" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Key People (comma-separated)
                </label>
                <input
                  id="new-slot-people"
                  type="text"
                  placeholder="e.g. Elena, Julian, Lead Photographer"
                  value={newPeople}
                  onChange={(e) => setNewPeople(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-slot-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  id="new-slot-notes"
                  type="text"
                  placeholder="e.g. Golf cart reserved to ferry couple"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchedule(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Save Schedule Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

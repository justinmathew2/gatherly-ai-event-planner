/**
 * @file ExportModal.tsx
 * @description Accessible export modal supporting iCalendar (.ics), Budget CSV,
 * Vendor CSV, JSON backups, and PDF print previews.
 */

import React, { useRef, useEffect } from 'react';
import { 
  Download, 
  FileDown, 
  Printer, 
  FileSpreadsheet, 
  FileCode, 
  Upload, 
  X, 
  Calendar, 
  Users 
} from 'lucide-react';
import { FullEventPlan } from '../types/event';
import { generateICalendar, generateBudgetCsv, generateVendorsCsv, downloadFile } from '../services/export';
import { FullEventPlanSchema } from '../types/schema';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: FullEventPlan;
  onImportPlan: (plan: FullEventPlan) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  plan,
  onImportPlan,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExportIcs = () => {
    const ics = generateICalendar(plan);
    downloadFile(ics, `${plan.details.title.replace(/\s+/g, '_')}_schedule.ics`, 'text/calendar');
  };

  const handleExportBudgetCsv = () => {
    const csv = generateBudgetCsv(plan);
    downloadFile(csv, `${plan.details.title.replace(/\s+/g, '_')}_budget.csv`, 'text/csv');
  };

  const handleExportVendorsCsv = () => {
    const csv = generateVendorsCsv(plan);
    downloadFile(csv, `${plan.details.title.replace(/\s+/g, '_')}_vendors.csv`, 'text/csv');
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(plan, null, 2);
    downloadFile(jsonStr, `${plan.details.title.replace(/\s+/g, '_')}_master_plan.json`, 'application/json');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        const validated = FullEventPlanSchema.safeParse(parsed);
        if (validated.success) {
          onImportPlan(validated.data as FullEventPlan);
          alert('Event Plan imported successfully!');
          onClose();
        } else {
          alert('Invalid plan JSON format. Please upload a valid Gatherly AI backup.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close export dialog"
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 id="export-modal-title" className="text-lg font-black text-slate-900 dark:text-white">
              Export & Share Event Plan
            </h2>
            <p className="text-xs text-slate-500">Download formats or sync to calendars</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Calendar .ics */}
          <button
            onClick={handleExportIcs}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition text-left group focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                  Apple & Google Calendar (.ics)
                </div>
                <div className="text-[11px] text-slate-400">
                  Full day-of run-of-show and milestone countdown deadlines
                </div>
              </div>
            </div>
            <FileDown className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Budget CSV */}
          <button
            onClick={handleExportBudgetCsv}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition text-left group focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                  Budget Spreadsheet (.csv)
                </div>
                <div className="text-[11px] text-slate-400">
                  Detailed category allocations, actual quotes, and paid amounts
                </div>
              </div>
            </div>
            <FileDown className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Vendors CSV */}
          <button
            onClick={handleExportVendorsCsv}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition text-left group focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                  Vendor Directory & Contacts (.csv)
                </div>
                <div className="text-[11px] text-slate-400">
                  Vendor emails, phone numbers, quotes, and contract status
                </div>
              </div>
            </div>
            <FileDown className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Master Plan JSON Backup */}
          <button
            onClick={handleExportJson}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition text-left group focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                  Complete Master Plan (.json)
                </div>
                <div className="text-[11px] text-slate-400">
                  All event data, palettes, menus, and chat history for backup
                </div>
              </div>
            </div>
            <FileDown className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </button>

          {/* Browser Print View */}
          <button
            onClick={() => {
              onClose();
              setTimeout(() => window.print(), 300);
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition text-left group focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                  Print / Save to PDF
                </div>
                <div className="text-[11px] text-slate-400">
                  Formatted summary suitable for physical binder or PDF export
                </div>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
          </button>
        </div>

        {/* Restore from JSON backup */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <input
            id="json-file-input"
            type="file"
            ref={fileInputRef}
            accept=".json"
            aria-label="Upload JSON backup file"
            onChange={handleImportJsonFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-400 text-slate-600 dark:text-slate-300 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Upload className="w-4 h-4" />
            <span>Restore / Import Plan from JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * @file VendorChecklist.tsx
 * @description Accessible vendor management directory with quote tracking,
 * automated AI inquiry email drafts, and interview cheat sheets.
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Mail, 
  Phone, 
  HelpCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Filter,
  Briefcase
} from 'lucide-react';
import { FullEventPlan, Vendor, VendorCategory, VendorStatus, CURRENCY_MAP } from '../types/event';
import { generateVendorInquiryEmail, generateVendorQuestions } from '../services/gemini';
import { generateVendorsCsv, downloadFile } from '../services/export';
import { sanitizeText } from '../utils/security';

interface VendorChecklistProps {
  plan: FullEventPlan;
  onUpdatePlan: (updated: FullEventPlan) => void;
}

const STATUS_LABELS: Record<VendorStatus, { label: string; color: string }> = {
  researching: { label: 'Researching', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  contacted: { label: 'Contacted', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300' },
  quote_received: { label: 'Quote Received', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  contract_signed: { label: 'Contract Signed', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  deposit_paid: { label: 'Deposit Paid', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  fully_paid: { label: 'Fully Paid', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
};

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  plan,
  onUpdatePlan,
}) => {
  const { details, vendors } = plan;
  const currency = CURRENCY_MAP[details.currency] || CURRENCY_MAP.USD;

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Add vendor modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<VendorCategory>('Venue');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEstimate, setNewEstimate] = useState<number>(2000);
  const [newNotes, setNewNotes] = useState('');

  // AI Modal states
  const [emailModalVendor, setEmailModalVendor] = useState<Vendor | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [isEmailLoading, setIsEmailLoading] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const [questionsModalVendor, setQuestionsModalVendor] = useState<Vendor | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState<boolean>(false);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        if (emailModalVendor) setEmailModalVendor(null);
        if (questionsModalVendor) setQuestionsModalVendor(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, emailModalVendor, questionsModalVendor]);

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    const matchesStatus = selectedStatus === 'all' || v.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || v.category === selectedCategory;
    return matchesStatus && matchesCategory;
  });

  const handleUpdateStatus = (vendorId: string, newStatus: VendorStatus) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        return { ...v, status: newStatus };
      }
      return v;
    });
    onUpdatePlan({ ...plan, vendors: updated });
  };

  const handleDeleteVendor = (vendorId: string) => {
    const updated = vendors.filter((v) => v.id !== vendorId);
    onUpdatePlan({ ...plan, vendors: updated });
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeText(newName, 100);
    if (!cleanName) return;

    const newVendor: Vendor = {
      id: `vendor-${Date.now()}`,
      name: cleanName,
      category: newCategory,
      contactPerson: sanitizeText(newContact, 80) || undefined,
      email: sanitizeText(newEmail, 100) || undefined,
      phone: sanitizeText(newPhone, 50) || undefined,
      status: 'researching',
      estimatedCost: Math.max(0, Number(newEstimate) || 0),
      notes: sanitizeText(newNotes, 300) || undefined,
    };

    onUpdatePlan({ ...plan, vendors: [...vendors, newVendor] });

    setNewName('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewEstimate(2000);
    setNewNotes('');
    setShowAddModal(false);
  };

  // AI Actions
  const handleOpenEmailDraft = async (vendor: Vendor) => {
    setEmailModalVendor(vendor);
    setIsEmailLoading(true);
    setCopiedEmail(false);
    try {
      const draft = await generateVendorInquiryEmail(vendor, plan);
      setGeneratedEmail(draft);
    } catch {
      // Handled
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleOpenQuestions = async (vendor: Vendor) => {
    setQuestionsModalVendor(vendor);
    setIsQuestionsLoading(true);
    try {
      const qList = await generateVendorQuestions(vendor, plan);
      setGeneratedQuestions(qList);
    } catch {
      // Handled
    } finally {
      setIsQuestionsLoading(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleExportCsv = () => {
    const csv = generateVendorsCsv(plan);
    downloadFile(csv, `${details.title.replace(/\s+/g, '_')}_vendors.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <Briefcase className="w-6 h-6 text-brand-600" />
            <span>Vendor Hub & Checklist</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage quotes, contract milestones, and generate AI inquiry emails and interview questions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vendor</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <label htmlFor="vendor-status-filter" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Status:
            </label>
            <select
              id="vendor-status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Statuses ({vendors.length})</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label htmlFor="vendor-category-filter" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Category:
            </label>
            <select
              id="vendor-category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Categories</option>
              <option value="Venue">Venue</option>
              <option value="Catering & Bar">Catering & Bar</option>
              <option value="Photography & Video">Photography & Video</option>
              <option value="Music & DJ">Music & DJ</option>
              <option value="Flowers & Decor">Flowers & Decor</option>
              <option value="Attire & Beauty">Attire & Beauty</option>
              <option value="Cake & Dessert">Cake & Dessert</option>
              <option value="Rentals & Audio">Rentals & Audio</option>
              <option value="Permits & Security">Permits & Security</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </div>
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => {
          const statusInfo = STATUS_LABELS[vendor.status] || STATUS_LABELS.researching;

          return (
            <div
              key={vendor.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200/50 dark:border-brand-800/50">
                      {vendor.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {vendor.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteVendor(vendor.id)}
                    aria-label={`Delete vendor ${vendor.name}`}
                    className="p-1 text-slate-300 hover:text-rose-600 rounded transition focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-400">Status:</span>
                  <select
                    aria-label={`Status for ${vendor.name}`}
                    value={vendor.status}
                    onChange={(e) => handleUpdateStatus(vendor.id, e.target.value as VendorStatus)}
                    className={`text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700 ${statusInfo.color} focus:outline-none`}
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1">
                  {vendor.contactPerson && (
                    <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.contactPerson}</span>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{vendor.email}</span>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center space-x-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Estimated</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {currency.symbol}{vendor.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Deposit Paid</span>
                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                      {currency.symbol}{(vendor.depositPaid || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {vendor.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg italic">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleOpenEmailDraft(vendor)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 font-semibold text-xs border border-brand-200 dark:border-brand-800 transition focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Draft Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenQuestions(vendor)}
                  className="flex-1 flex items-center justify-center space-x-1.5 py-1.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Questions</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-vendor-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 id="add-vendor-modal-title" className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <span>Add New Vendor</span>
            </h3>

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label htmlFor="new-vendor-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Vendor / Business Name *
                </label>
                <input
                  id="new-vendor-name"
                  type="text"
                  required
                  placeholder="e.g. Napa Valley Floral Studio"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="new-vendor-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  id="new-vendor-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as VendorCategory)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="Venue">Venue</option>
                  <option value="Catering & Bar">Catering & Bar</option>
                  <option value="Photography & Video">Photography & Video</option>
                  <option value="Music & DJ">Music & DJ</option>
                  <option value="Flowers & Decor">Flowers & Decor</option>
                  <option value="Attire & Beauty">Attire & Beauty</option>
                  <option value="Cake & Dessert">Cake & Dessert</option>
                  <option value="Rentals & Audio">Rentals & Audio</option>
                  <option value="Permits & Security">Permits & Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-vendor-contact" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person
                  </label>
                  <input
                    id="new-vendor-contact"
                    type="text"
                    placeholder="e.g. Samantha Smith"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-vendor-estimate" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Cost ({currency.symbol})
                  </label>
                  <input
                    id="new-vendor-estimate"
                    type="number"
                    min="0"
                    value={newEstimate}
                    onChange={(e) => setNewEstimate(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="new-vendor-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    id="new-vendor-email"
                    type="email"
                    placeholder="info@vendor.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="new-vendor-phone" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="new-vendor-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="new-vendor-notes" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  id="new-vendor-notes"
                  type="text"
                  placeholder="e.g. Recommended by wedding venue manager"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Email Draft Modal */}
      {emailModalVendor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-email-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-brand-600">
                <Sparkles className="w-5 h-5" />
                <h3 id="ai-email-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  AI Inquiry Email Draft: {emailModalVendor.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEmailModalVendor(null)}
                aria-label="Close email draft modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                ✕
              </button>
            </div>

            {isEmailLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-brand-500 animate-spin" />
                <span className="text-xs font-medium">Gatherly AI is composing a tailored email...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  readOnly
                  rows={12}
                  value={generatedEmail}
                  aria-label="Generated inquiry email text"
                  className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none"
                />

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Includes your date, headcount ({details.guestCount}), and budget.
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="flex items-center space-x-1.5 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition shadow-sm focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Interview Questions Modal */}
      {questionsModalVendor && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-questions-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-brand-600">
                <HelpCircle className="w-5 h-5" />
                <h3 id="ai-questions-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Top 5 Questions to Ask: {questionsModalVendor.category}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuestionsModalVendor(null)}
                aria-label="Close questions modal"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Ask these specific questions to avoid hidden charges and contract surprises with <span className="font-semibold text-slate-800 dark:text-slate-200">{questionsModalVendor.name}</span>:
            </p>

            {isQuestionsLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-brand-500 animate-spin" />
                <span className="text-xs font-medium">Formulating targeted vendor questions...</span>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-medium">{q}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setQuestionsModalVendor(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

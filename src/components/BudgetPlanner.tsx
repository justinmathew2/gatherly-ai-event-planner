import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  Filter, 
  Layers,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { FullEventPlan, BudgetItem, BudgetCategoryType, CURRENCY_MAP } from '../types/event';
import { generateBudgetCsv, downloadFile } from '../services/export';

interface BudgetPlannerProps {
  plan: FullEventPlan;
  onUpdatePlan: (updated: FullEventPlan) => void;
  onOpenCopilotWithPrompt: (prompt: string) => void;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({
  plan,
  onUpdatePlan,
  onOpenCopilotWithPrompt,
}) => {
  const { details, budgetItems, ideas } = plan;
  const currency = CURRENCY_MAP[details.currency] || CURRENCY_MAP.USD;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showAiRebalanceModal, setShowAiRebalanceModal] = useState<boolean>(false);

  // New item state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BudgetCategoryType>('other');
  const [newItemAllocated, setNewItemAllocated] = useState<number>(500);
  const [newItemActual, setNewItemActual] = useState<number>(0);
  const [newItemNotes, setNewItemNotes] = useState('');

  // Calculations
  const totalBudget = details.totalBudget;
  const totalAllocated = budgetItems.reduce((acc, item) => acc + item.allocatedAmount, 0);
  const totalActual = budgetItems.reduce((acc, item) => acc + item.actualAmount, 0);
  const totalPaid = budgetItems.reduce((acc, item) => acc + item.paidAmount, 0);
  const remainingBudget = totalBudget - totalActual;
  const contingencyItem = budgetItems.find(i => i.category === 'contingency');
  const contingencyAmount = contingencyItem ? contingencyItem.allocatedAmount : 0;

  // Filtered items
  const filteredItems = selectedCategory === 'all'
    ? budgetItems
    : budgetItems.filter((i) => i.category === selectedCategory);

  // Category totals for visualization
  const categoryStats: Record<string, { allocated: number; actual: number }> = {};
  budgetItems.forEach((item) => {
    if (!categoryStats[item.category]) {
      categoryStats[item.category] = { allocated: 0, actual: 0 };
    }
    categoryStats[item.category].allocated += item.allocatedAmount;
    categoryStats[item.category].actual += item.actualAmount;
  });

  const categoryColorMap: Record<string, string> = {
    venue: 'bg-indigo-500',
    catering: 'bg-emerald-500',
    photography: 'bg-amber-500',
    entertainment: 'bg-rose-500',
    decor: 'bg-purple-500',
    attire: 'bg-pink-500',
    stationery: 'bg-teal-500',
    transport: 'bg-blue-500',
    contingency: 'bg-slate-500',
    other: 'bg-orange-500',
  };

  const handleUpdateItem = (id: string, field: keyof BudgetItem, value: any) => {
    const updatedItems = budgetItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onUpdatePlan({ ...plan, budgetItems: updatedItems });
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = budgetItems.filter((i) => i.id !== id);
    onUpdatePlan({ ...plan, budgetItems: updatedItems });
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: BudgetItem = {
      id: `budget-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      allocatedAmount: Number(newItemAllocated) || 0,
      actualAmount: Number(newItemActual) || 0,
      paidAmount: 0,
      isPaid: false,
      notes: newItemNotes.trim(),
    };

    onUpdatePlan({
      ...plan,
      budgetItems: [...budgetItems, newItem],
    });

    setNewItemName('');
    setNewItemAllocated(500);
    setNewItemActual(0);
    setNewItemNotes('');
    setShowAddModal(false);
  };

  const handleExportCsv = () => {
    const csv = generateBudgetCsv(plan);
    downloadFile(csv, `${details.title.replace(/\s+/g, '_')}_budget.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
            <DollarSign className="w-6 h-6 text-brand-600" />
            <span>Smart Budget Planner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time allocation tracker with AI rebalancing and dynamic expense breakdown.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAiRebalanceModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>AI Rebalance</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Target</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {currency.symbol}{totalBudget.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{details.guestCount} guests</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Allocated</div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {currency.symbol}{totalAllocated.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {Math.round((totalAllocated / totalBudget) * 100)}% of cap
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Actual Spent</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {currency.symbol}{totalActual.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Paid: {currency.symbol}{totalPaid.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Remaining Buffer</div>
          <div className={`text-xl font-bold mt-1 ${remainingBudget < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {currency.symbol}{remainingBudget.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {remainingBudget < 0 ? '⚠️ Exceeding cap' : 'Safe buffer'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Contingency</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {currency.symbol}{contingencyAmount.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Emergency cushion</div>
        </div>
      </div>

      {/* Visual Multi-Segment Category Allocation Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center space-x-1.5">
            <PieChart className="w-4 h-4 text-brand-600" />
            <span>Category Spending Distribution</span>
          </div>
          <span className="text-slate-400 font-normal">Based on allocated amounts</span>
        </div>

        {/* Stacked bar */}
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          {Object.entries(categoryStats).map(([cat, stats]) => {
            const pct = (stats.allocated / totalBudget) * 100;
            if (pct <= 0) return null;
            return (
              <div
                key={cat}
                className={`${categoryColorMap[cat] || 'bg-slate-400'} h-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
                title={`${cat}: ${currency.symbol}${stats.allocated.toLocaleString()} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-slate-500">
          {Object.entries(categoryStats).map(([cat, stats]) => (
            <div key={cat} className="flex items-center space-x-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${categoryColorMap[cat] || 'bg-slate-400'}`} />
              <span className="capitalize">{cat}:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {currency.symbol}{stats.allocated.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Smart Advisor Callout */}
      <div className="p-4 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-brand-700 dark:text-brand-300">AI Cost Recommendation: </span>
            {ideas.costSavingHacks[0] || 'Consider grouping floral orders with ceremony aisle setups to save up to 20% on duplication.'}
          </div>
        </div>
        <button
          onClick={() => onOpenCopilotWithPrompt(`Can you analyze my budget for ${details.title} and give me 3 specific ways to save money?`)}
          className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center space-x-1 flex-shrink-0"
        >
          <span>Ask Copilot for more</span>
          <span>→</span>
        </button>
      </div>

      {/* Filter and Interactive Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Categories ({budgetItems.length})</option>
              <option value="venue">Venue</option>
              <option value="catering">Catering & Bar</option>
              <option value="photography">Photography & Video</option>
              <option value="entertainment">Entertainment & Music</option>
              <option value="decor">Decor & Florals</option>
              <option value="stationery">Stationery & Invites</option>
              <option value="transport">Transportation</option>
              <option value="contingency">Contingency</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Showing {filteredItems.length} items
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Item & Category</th>
                <th className="py-3 px-4">Allocated</th>
                <th className="py-3 px-4">Actual Cost</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {item.category}
                    </span>
                  </td>

                  {/* Allocated input */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        value={item.allocatedAmount}
                        onChange={(e) => handleUpdateItem(item.id, 'allocatedAmount', Number(e.target.value) || 0)}
                        className="w-20 px-1.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </td>

                  {/* Actual input */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        value={item.actualAmount}
                        onChange={(e) => handleUpdateItem(item.id, 'actualAmount', Number(e.target.value) || 0)}
                        className="w-20 px-1.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </td>

                  {/* Paid input */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-slate-400">{currency.symbol}</span>
                      <input
                        type="number"
                        min="0"
                        value={item.paidAmount}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          handleUpdateItem(item.id, 'paidAmount', val);
                          if (val >= item.actualAmount && item.actualAmount > 0) {
                            handleUpdateItem(item.id, 'isPaid', true);
                          }
                        }}
                        className="w-20 px-1.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </td>

                  {/* Paid status toggle */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleUpdateItem(item.id, 'isPaid', !item.isPaid)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition ${
                        item.isPaid
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.isPaid ? 'Fully Paid' : 'Pending'}</span>
                    </button>
                  </td>

                  {/* Notes */}
                  <td className="py-3 px-4 max-w-[180px]">
                    <input
                      type="text"
                      value={item.notes || ''}
                      placeholder="Add note..."
                      onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                      className="w-full text-xs text-slate-600 dark:text-slate-300 bg-transparent hover:border-b border-slate-300 dark:border-slate-600 focus:outline-none"
                    />
                  </td>

                  {/* Delete button */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-brand-600" />
              <span>Add Budget Expense</span>
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Item / Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wedding Cake & Dessert Station"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as BudgetCategoryType)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="venue">Venue</option>
                  <option value="catering">Catering & Bar</option>
                  <option value="photography">Photography & Video</option>
                  <option value="entertainment">Entertainment & Music</option>
                  <option value="decor">Decor & Florals</option>
                  <option value="stationery">Stationery & Invites</option>
                  <option value="transport">Transportation</option>
                  <option value="contingency">Contingency Reserve</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Allocated Target ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItemAllocated}
                    onChange={(e) => setNewItemAllocated(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Actual Quote ({currency.symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItemActual}
                    onChange={(e) => setNewItemActual(Number(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deposit due 60 days before event"
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Rebalance Modal */}
      {showAiRebalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center space-x-2 text-brand-600 mb-3">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Gatherly AI Budget Optimizer
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Based on your guest count of <span className="font-semibold text-slate-800 dark:text-slate-200">{details.guestCount} guests</span> and total target of <span className="font-semibold text-slate-800 dark:text-slate-200">{currency.symbol}{details.totalBudget.toLocaleString()}</span>, here is the industry-benchmarked recommended rebalance:
            </p>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">Venue & Rentals (35%)</span>
                <span>{currency.symbol}{Math.round(totalBudget * 0.35).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">Catering & Beverage (30%)</span>
                <span>{currency.symbol}{Math.round(totalBudget * 0.30).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">Photography & Video (12%)</span>
                <span>{currency.symbol}{Math.round(totalBudget * 0.12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">Entertainment & Music (10%)</span>
                <span>{currency.symbol}{Math.round(totalBudget * 0.10).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">Decor & Flowers (8%)</span>
                <span>{currency.symbol}{Math.round(totalBudget * 0.08).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold">Contingency Cushion (5%)</span>
                <span>{currency.symbol}{Math.round(totalBudget * 0.05).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAiRebalanceModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  // Apply optimized allocated proportions
                  const updated = budgetItems.map((item) => {
                    if (item.category === 'venue') return { ...item, allocatedAmount: Math.round(totalBudget * 0.35) };
                    if (item.category === 'catering') return { ...item, allocatedAmount: Math.round(totalBudget * 0.30) };
                    if (item.category === 'photography') return { ...item, allocatedAmount: Math.round(totalBudget * 0.12) };
                    if (item.category === 'entertainment') return { ...item, allocatedAmount: Math.round(totalBudget * 0.10) };
                    if (item.category === 'decor') return { ...item, allocatedAmount: Math.round(totalBudget * 0.08) };
                    if (item.category === 'contingency') return { ...item, allocatedAmount: Math.round(totalBudget * 0.05) };
                    return item;
                  });
                  onUpdatePlan({ ...plan, budgetItems: updated });
                  setShowAiRebalanceModal(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white transition shadow-sm"
              >
                Apply Proportions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


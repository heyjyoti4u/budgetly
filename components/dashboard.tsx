'use client';

import { useEffect, useState } from 'react';
import { useExpenseStore } from '@/lib/store';
import { Category } from '@/lib/db';
import ExpenseForm from './expense-form';
import CategoryCard from './category-card';
import InstallButton from './install-button';
import AddCategoryModal from './add-category-modal';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const { categories, expenses, budgetCycle, loadCategories, loadExpenses, loadBudgetCycle, removeExpense, setTotalBudget } = useExpenseStore();
  const [showBudgetInput, setShowBudgetInput] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    const init = async () => {
      await loadBudgetCycle();
      await loadCategories();
    };
    init();
  }, []);

  useEffect(() => {
    if (budgetCycle) {
      loadExpenses(budgetCycle.startDate, budgetCycle.endDate);
    }
  }, [budgetCycle]);

  const allocatedBudget = categories.reduce((sum, cat) => sum + cat.allocatedBudget, 0);
  const totalBudget = budgetCycle?.totalBudget || 0;
  const unallocatedBudget = Math.max(0, totalBudget - allocatedBudget);
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  const categoryExpenses: { [key: string]: number } = {};
  expenses.forEach((exp) => {
    categoryExpenses[exp.categoryId] = (categoryExpenses[exp.categoryId] || 0) + exp.amount;
  });

  return (
    <div className="min-h-screen bg-slate-950 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white">Expense Tracker</h1>
            <p className="text-xs text-slate-400">
              {budgetCycle ? new Date(budgetCycle.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Loading'}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <InstallButton />
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              )}
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        {activeTab === 'dashboard' && (
          <>
            {/* Budget Overview Card */}
            <div className="mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-5 text-white shadow-xl space-y-3">
              {/* Total Budget Row */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-80 font-medium">Total Budget</p>
                  <h2 className="text-3xl font-bold">₹{totalBudget.toFixed(0)}</h2>
                </div>
                <button
                  onClick={() => {
                    setShowBudgetInput(true);
                    setBudgetInput(totalBudget.toString());
                  }}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                >
                  Edit
                </button>
              </div>

              {/* Budget Breakdown */}
              <div className="bg-white/10 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="opacity-80">Allocated:</span>
                  <span className="font-semibold">₹{allocatedBudget.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Spent:</span>
                  <span className="font-semibold">₹{totalSpent.toFixed(0)}</span>
                </div>
                <div className="border-t border-white/20 pt-2 flex justify-between">
                  <span className="opacity-80">Unallocated:</span>
                  <span className="font-semibold text-green-300">₹{unallocatedBudget.toFixed(0)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-white/25 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs opacity-75">
                  <span>Spent: ₹{totalSpent.toFixed(0)}</span>
                  <span>Left: ₹{Math.max(0, totalRemaining).toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Categories</h3>
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="text-xs font-medium px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    spent={categoryExpenses[category.id] || 0}
                    onAddExpense={() => {
                      setEditingCategory(category);
                      setIsFormOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Add Expense Button */}
            <button
              onClick={() => {
                setEditingCategory(null);
                setIsFormOpen(true);
              }}
              className="fixed bottom-20 right-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200 z-30 flex items-center justify-center font-bold text-xl"
            >
              +
            </button>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white mb-4">History</h2>
            {expenses.length === 0 ? (
              <p className="text-center text-slate-400 py-8 text-sm">No expenses yet</p>
            ) : (
              <div className="space-y-2">
                {expenses.map((expense) => {
                  const category = categories.find((c) => c.id === expense.categoryId);
                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 group"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: category?.color }}
                      >
                        {category?.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm">{category?.name}</p>
                        <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="font-bold text-white text-sm">₹{expense.amount.toFixed(0)}</p>
                        <button
                          onClick={() => {
                            if (confirm('Delete this expense?')) {
                              removeExpense(expense.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs font-medium"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mb-4">Settings</h2>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <label className="block text-sm font-medium text-white mb-3">
                Salary Date
              </label>
              <input
                type="number"
                min="1"
                max="31"
                defaultValue={budgetCycle?.salaryDate || 15}
                onBlur={(e) => {
                  const { setSalaryDate } = useExpenseStore.getState();
                  const day = parseInt(e.target.value);
                  if (day >= 1 && day <= 31) {
                    setSalaryDate(day);
                  }
                }}
                className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-slate-400 mt-2">
                Budget resets on the {budgetCycle?.salaryDate}th every month
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'flex-1 py-3 text-center transition-colors border-t-2',
              activeTab === 'dashboard'
                ? 'border-blue-600 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            )}
          >
            <span className="text-sm font-medium block">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 py-3 text-center transition-colors border-t-2',
              activeTab === 'history'
                ? 'border-blue-600 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            )}
          >
            <span className="text-sm font-medium block">History</span>
          </button>
        </div>
      </nav>

      {/* Add Category Modal */}
      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onSuccess={() => {
            setShowAddCategory(false);
            loadCategories();
          }}
        />
      )}

      {/* Budget Input Modal */}
      {showBudgetInput && (
        <div className="fixed inset-0 bg-black/70 flex items-end z-50 animate-in slide-in-from-bottom">
          <div className="w-full bg-slate-900 rounded-t-3xl p-5 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Set Total Budget</h2>
              <button
                onClick={() => setShowBudgetInput(false)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="number"
                step="0.01"
                min="0"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="Enter total budget"
                className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
                autoFocus
              />

              <div className="bg-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1">
                <p>This is your total monthly budget. You can allocate it across categories.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowBudgetInput(false)}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors text-white text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const amount = parseFloat(budgetInput);
                    if (!isNaN(amount) && amount >= 0) {
                      setTotalBudget(amount);
                      setShowBudgetInput(false);
                    }
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium transition-colors text-white text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {isFormOpen && (
        <ExpenseForm
          categories={categories}
          selectedCategory={editingCategory}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            setEditingCategory(null);
            if (budgetCycle) {
              loadExpenses(budgetCycle.startDate, budgetCycle.endDate);
            }
          }}
        />
      )}
    </div>
  );
}

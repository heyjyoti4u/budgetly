'use client';

import { useState } from 'react';
import { Category, Expense } from '@/lib/db';
import { useExpenseStore } from '@/lib/store';

interface ExpenseFormProps {
  categories: Category[];
  expenses: Expense[];
  selectedCategory?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ExpenseForm({
  categories,
  expenses,
  selectedCategory,
  onClose,
  onSuccess,
}: ExpenseFormProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(selectedCategory?.id || categories[0]?.id || '');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const { recordExpense } = useExpenseStore();
  const selectedCat = categories.find((c) => c.id === categoryId);
  const spentInSelectedCat = expenses
    .filter((exp) => exp.categoryId === categoryId)
    .reduce((sum, exp) => sum + exp.amount, 0);
  const remainingInSelectedCat = (selectedCat?.allocatedBudget || 0) - spentInSelectedCat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId) {
      alert('Please enter an amount and select a category');
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await recordExpense(categoryId, numAmount, note || undefined);
      onSuccess();
    } catch (error) {
      console.error('Error recording expense:', error);
      alert('Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50 animate-in slide-in-from-bottom">
      <div className="w-full bg-slate-900 rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto border-t border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Add Expense</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className="p-2 rounded-lg border transition-all text-xs font-medium"
                  style={
                    categoryId === cat.id
                      ? {
                          borderColor: cat.color,
                          backgroundColor: cat.color + '20',
                          color: cat.color,
                        }
                      : {
                          borderColor: '#475569',
                          backgroundColor: '#1e293b',
                          color: '#94a3b8',
                        }
                  }
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white mb-1" style={{ backgroundColor: cat.color }}>
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold"
              autoFocus
            />
          </div>

          {/* Budget Info */}
          {selectedCat && selectedCat.allocatedBudget > 0 && (
            <div
              className="p-3 rounded-lg text-xs"
              style={{ backgroundColor: selectedCat.color + '15', borderLeft: `3px solid ${selectedCat.color}` }}
            >
              <p className="text-slate-200">
                Budget: ₹{selectedCat.allocatedBudget.toFixed(0)} | Remaining: ₹
                {remainingInSelectedCat.toFixed(0)} | After: ₹
                {(remainingInSelectedCat - parseFloat(amount || '0')).toFixed(0)}
              </p>
            </div>
          )}

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you spend on?"
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors text-white text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount || !categoryId}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white text-sm"
            >
              {loading ? 'Recording...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
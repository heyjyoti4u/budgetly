'use client';

import { useState } from 'react';
import { Category } from '@/lib/db';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditBudgetModalProps {
  category: Category;
  spent: number;
  onClose: () => void;
  onSave: (amount: number) => Promise<void>;
}

export default function EditBudgetModal({ category, spent, onClose, onSave }: EditBudgetModalProps) {
  // The field directly edits the TOTAL allocated budget for this category.
  // Whatever the user types becomes the new total — no hidden math.
  const [amount, setAmount] = useState(category.allocatedBudget.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      alert('Amount cannot be negative');
      return;
    }

    setLoading(true);
    try {
      await onSave(numAmount);
    } finally {
      setLoading(false);
    }
  };

  const parsedAmount = parseFloat(amount);
  const remainingAfterSave = !isNaN(parsedAmount) ? parsedAmount - spent : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Budget</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Category Info */}
        <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <span className="font-medium text-slate-900 dark:text-white">{category.name}</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
              Allocated Budget (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
              autoFocus
            />
            {spent > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Already spent ₹{spent.toFixed(0)} this cycle.
                {remainingAfterSave !== null && ` Remaining after save: ₹${remainingAfterSave.toFixed(0)}.`}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
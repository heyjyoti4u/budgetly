'use client';

import { useState } from 'react';
import { useExpenseStore } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

interface AddCategoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const COLOR_OPTIONS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#10b981', // green
  '#06b6d4', // cyan
  '#ef4444', // red
  '#6366f1', // indigo
  '#f43f5e', // rose
];

export default function AddCategoryModal({ onClose, onSuccess }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const { addNewCategory, loadCategories } = useExpenseStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (!budget || parseFloat(budget) <= 0) {
      alert('Please enter a valid budget');
      return;
    }

    setLoading(true);
    try {
      await addNewCategory({
        id: uuidv4(),
        name: name.trim(),
        color,
        icon: name.charAt(0).toUpperCase(),
        allocatedBudget: parseFloat(budget),
        isDefault: false,
      });

      await loadCategories();
      onSuccess();
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50 animate-in slide-in-from-bottom">
      <div className="w-full bg-slate-900 rounded-t-3xl p-5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Add Category</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">
              Category Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries, Gym, etc."
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              autoFocus
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">
              Budget (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase">
              Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    color === c ? 'border-white' : 'border-slate-600'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              disabled={loading || !name.trim() || !budget}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors text-white text-sm"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

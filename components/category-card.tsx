'use client';

import { Category } from '@/lib/db';
import { useExpenseStore } from '@/lib/store';
import { useState } from 'react';
import EditBudgetModal from './edit-budget-modal';

interface CategoryCardProps {
  category: Category;
  spent: number;
  onAddExpense?: () => void;
}

export default function CategoryCard({ category, spent, onAddExpense }: CategoryCardProps) {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const { updateCategoryBudget } = useExpenseStore();

  const remaining = category.allocatedBudget - spent;
  const percentageUsed = category.allocatedBudget > 0 ? (spent / category.allocatedBudget) * 100 : 0;
  const isOverBudget = spent > category.allocatedBudget && category.allocatedBudget > 0;

  return (
    <>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 hover:border-slate-600 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={onAddExpense}
            className="flex-1 flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity text-left"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: category.color }}
            >
              {category.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="font-medium text-white text-sm truncate">{category.name}</h3>
          </button>
          <button
            onClick={() => setIsEditingBudget(true)}
            className="text-slate-400 hover:text-slate-200 text-xs font-medium px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded transition-colors flex-shrink-0"
          >
            Edit
          </button>
        </div>

        {/* Budget Info - Compact */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">₹{spent.toFixed(0)} / ₹{category.allocatedBudget.toFixed(0)}</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}>
              {isOverBudget ? `Over ₹${(spent - category.allocatedBudget).toFixed(0)}` : `₹${Math.max(0, remaining).toFixed(0)} left`}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${Math.min(100, percentageUsed)}%`,
                backgroundColor: isOverBudget ? '#f87171' : category.color,
              }}
            />
          </div>

          {/* Percentage */}
          <p className="text-xs text-slate-500">
            {isOverBudget ? 'Over budget' : `${Math.round(percentageUsed)}% used`}
          </p>
        </div>
      </div>

      {isEditingBudget && (
        <EditBudgetModal
          category={category}
          spent={spent}
          onClose={() => setIsEditingBudget(false)}
          onSave={async (newAllocatedBudget) => {
            await updateCategoryBudget(category.id, newAllocatedBudget);
            setIsEditingBudget(false);
          }}
        />
      )}
    </>
  );
}
import { create } from 'zustand';
import { Category, Expense, BudgetCycle, getCategories, addCategory, updateCategory, deleteCategory, addExpense, getExpensesByDateRange, deleteExpense, setBudgetCycle, getBudgetCycle, initDefaultCategories, resetAllBudgets } from './db';

interface ExpenseStore {
  categories: Category[];
  expenses: Expense[];
  budgetCycle: BudgetCycle | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadCategories: () => Promise<void>;
  loadExpenses: (startDate: string, endDate: string) => Promise<void>;
  loadBudgetCycle: () => Promise<void>;
  addNewCategory: (category: Category) => Promise<void>;
  updateCategoryBudget: (categoryId: string, budget: number) => Promise<void>;
  removeCat: (categoryId: string) => Promise<void>;
  recordExpense: (categoryId: string, amount: number, note?: string) => Promise<void>;
  removeExpense: (expenseId: string) => Promise<void>;
  setSalaryDate: (day: number) => Promise<void>;
  setTotalBudget: (amount: number) => Promise<void>;
  resetBudget: () => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  categories: [],
  expenses: [],
  budgetCycle: null,
  loading: false,
  error: null,

  loadCategories: async () => {
    try {
      set({ loading: true, error: null });
      await initDefaultCategories();
      const categories = await getCategories();
      set({ categories });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  loadExpenses: async (startDate: string, endDate: string) => {
    try {
      set({ loading: true, error: null });
      const expenses = await getExpensesByDateRange(startDate, endDate);
      set({ expenses });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  loadBudgetCycle: async () => {
    try {
      const budgetCycle = await getBudgetCycle();
      if (!budgetCycle) {
        // Set default salary date to 15th
        const cycle = await setBudgetCycle({ salaryDate: 15 });
        set({ budgetCycle: cycle });
      } else {
        set({ budgetCycle });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addNewCategory: async (category: Category) => {
    try {
      await addCategory(category);
      const categories = await getCategories();
      set({ categories });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateCategoryBudget: async (categoryId: string, budget: number) => {
    try {
      const categories = get().categories;
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        const updated = { ...category, allocatedBudget: budget };
        await updateCategory(updated);
        set({ categories: categories.map((c) => (c.id === categoryId ? updated : c)) });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeCat: async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      const categories = get().categories.filter((c) => c.id !== categoryId);
      set({ categories });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  recordExpense: async (categoryId: string, amount: number, note?: string) => {
    try {
      const expense: Expense = {
        id: Date.now().toString() + Math.random(),
        categoryId,
        amount,
        date: new Date().toISOString().split('T')[0],
        note,
      };
      await addExpense(expense);
      
      // Reload expenses for current cycle
      const budgetCycle = get().budgetCycle;
      if (budgetCycle) {
        const expenses = await getExpensesByDateRange(budgetCycle.startDate, budgetCycle.endDate);
        set({ expenses });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  removeExpense: async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      
      // Reload expenses for current cycle
      const budgetCycle = get().budgetCycle;
      if (budgetCycle) {
        const expenses = await getExpensesByDateRange(budgetCycle.startDate, budgetCycle.endDate);
        set({ expenses });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setSalaryDate: async (day: number) => {
    try {
      const currentCycle = get().budgetCycle;
      const cycle = await setBudgetCycle({ 
        salaryDate: day,
        totalBudget: currentCycle?.totalBudget || 0
      });
      set({ budgetCycle: cycle });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  setTotalBudget: async (amount: number) => {
    try {
      const currentCycle = get().budgetCycle;
      if (currentCycle) {
        const cycle = await setBudgetCycle({ 
          salaryDate: currentCycle.salaryDate,
          totalBudget: amount
        });
        set({ budgetCycle: cycle });
      }
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  resetBudget: async () => {
    try {
      set({ loading: true, error: null });
      const { categories, budgetCycle } = await resetAllBudgets();
      set({ categories, budgetCycle });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
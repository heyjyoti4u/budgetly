// IndexedDB wrapper for expense tracking
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  allocatedBudget: number;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  categoryId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface BudgetCycle {
  id: string;
  salaryDate: number; // day of month (1-31)
  totalBudget: number; // total monthly budget
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

const DB_NAME = 'ExpenseTrackerDB';
const DB_VERSION = 1;
const STORE_CATEGORIES = 'categories';
const STORE_EXPENSES = 'expenses';
const STORE_BUDGET_CYCLE = 'budgetCycle';

let db: IDBDatabase | null = null;

export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create categories store
      if (!database.objectStoreNames.contains(STORE_CATEGORIES)) {
        database.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      }

      // Create expenses store
      if (!database.objectStoreNames.contains(STORE_EXPENSES)) {
        const expenseStore = database.createObjectStore(STORE_EXPENSES, { keyPath: 'id' });
        expenseStore.createIndex('categoryId', 'categoryId', { unique: false });
        expenseStore.createIndex('date', 'date', { unique: false });
      }

      // Create budget cycle store
      if (!database.objectStoreNames.contains(STORE_BUDGET_CYCLE)) {
        database.createObjectStore(STORE_BUDGET_CYCLE, { keyPath: 'id' });
      }
    };
  });
}

export async function getCategories(): Promise<Category[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_CATEGORIES, 'readonly');
    const store = transaction.objectStore(STORE_CATEGORIES);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Category[]);
  });
}

export async function addCategory(category: Category): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_CATEGORIES, 'readwrite');
    const store = transaction.objectStore(STORE_CATEGORIES);
    const request = store.add(category);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function updateCategory(category: Category): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_CATEGORIES, 'readwrite');
    const store = transaction.objectStore(STORE_CATEGORIES);
    const request = store.put(category);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_CATEGORIES, 'readwrite');
    const store = transaction.objectStore(STORE_CATEGORIES);
    const request = store.delete(categoryId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function addExpense(expense: Expense): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);
    const request = store.add(expense);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_EXPENSES, 'readonly');
    const store = transaction.objectStore(STORE_EXPENSES);
    const index = store.index('date');
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as Expense[]);
  });
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_EXPENSES, 'readwrite');
    const store = transaction.objectStore(STORE_EXPENSES);
    const request = store.delete(expenseId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getBudgetCycle(): Promise<BudgetCycle | null> {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_BUDGET_CYCLE, 'readonly');
    const store = transaction.objectStore(STORE_BUDGET_CYCLE);
    const request = store.get('current');

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const cycle = request.result as BudgetCycle | undefined;
      resolve(cycle || null);
    };
  });
}

export async function setBudgetCycle(cycle: Omit<BudgetCycle, 'startDate' | 'endDate'> & { startDate?: string; endDate?: string }): Promise<BudgetCycle> {
  const database = await initDB();
  
  const now = new Date();
  const salaryDate = cycle.salaryDate;
  
  // Calculate current cycle dates
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  let startDate: Date;
  let endDate: Date;
  
  if (now.getDate() >= salaryDate) {
    // Current cycle has started
    startDate = new Date(currentYear, currentMonth, salaryDate);
    endDate = new Date(currentYear, currentMonth + 1, salaryDate - 1);
  } else {
    // Current cycle starts from previous month
    startDate = new Date(currentYear, currentMonth - 1, salaryDate);
    endDate = new Date(currentYear, currentMonth, salaryDate - 1);
  }

  const budgetCycle: BudgetCycle = {
    id: 'current',
    salaryDate,
    totalBudget: cycle.totalBudget || 0,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_BUDGET_CYCLE, 'readwrite');
    const store = transaction.objectStore(STORE_BUDGET_CYCLE);
    const request = store.put(budgetCycle);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(budgetCycle);
  });
}

export async function resetAllBudgets(): Promise<{ categories: Category[]; budgetCycle: BudgetCycle | null }> {
  const database = await initDB();

  // Reset allocatedBudget to 0 for every category
  const categories = await getCategories();
  const resetCategories: Category[] = categories.map((c) => ({ ...c, allocatedBudget: 0 }));

  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_CATEGORIES, 'readwrite');
    const store = transaction.objectStore(STORE_CATEGORIES);
    resetCategories.forEach((c) => store.put(c));

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => resolve();
  });

  // Reset total budget to 0, keeping the same salary date/cycle
  const currentCycle = await getBudgetCycle();
  let budgetCycle: BudgetCycle | null = null;
  if (currentCycle) {
    budgetCycle = await setBudgetCycle({
      salaryDate: currentCycle.salaryDate,
      totalBudget: 0,
    });
  }

  return { categories: resetCategories, budgetCycle };
}

export async function initDefaultCategories(): Promise<void> {
  const categories = await getCategories();
  if (categories.length > 0) return;

  const defaultCategories: Category[] = [
    { id: '1', name: 'Food', color: '#FF6B6B', icon: '🍔', allocatedBudget: 0, isDefault: true },
    { id: '2', name: 'Travel', color: '#4ECDC4', icon: '🚗', allocatedBudget: 0, isDefault: true },
    { id: '3', name: 'Personal', color: '#FFE66D', icon: '👤', allocatedBudget: 0, isDefault: true },
    { id: '4', name: 'Entertainment', color: '#A8E6CF', icon: '🎬', allocatedBudget: 0, isDefault: true },
    { id: '5', name: 'Recharge', color: '#FFD3B6', icon: '📱', allocatedBudget: 0, isDefault: true },
    { id: '6', name: 'Subscription', color: '#FF8B94', icon: '📦', allocatedBudget: 0, isDefault: true },
    { id: '7', name: 'SIP', color: '#A29BFE', icon: '💰', allocatedBudget: 0, isDefault: true },
    { id: '8', name: 'Other', color: '#74B9FF', icon: '📌', allocatedBudget: 0, isDefault: true },
  ];

  for (const category of defaultCategories) {
    await addCategory(category);
  }
}
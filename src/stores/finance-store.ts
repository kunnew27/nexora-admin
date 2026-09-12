import { create } from "zustand";
import {
	type Account,
	type AccountType,
	type Budget,
	type BudgetPeriod,
	type Category,
	type CategoryType,
	type Currency,
	type Debt,
	type DebtStatus,
	type ExchangeRate,
	type Goal,
	type GoalStatus,
	type Transaction,
	type TransactionStatus,
	convertAmount,
	daysAgoIso,
	monthRange,
	todayIso,
} from "@/lib/finance";
import { useFinancePrefsStore } from "@/stores/finance-prefs-store";

/**
 * Frontend stand-in for the finance collections. Every document is user-owned
 * on the backend (`userId`); this demo store represents a single signed-in
 * user, so `userId` is omitted here. The exchange-rate snapshot is shared
 * reference data (1 USD = 4100 KHR demo snapshot, never hardcoded into
 * transaction amounts — every transaction keeps its original `amount`).
 */
export const DEMO_EXCHANGE_RATE: ExchangeRate = {
	baseCurrency: "USD",
	targetCurrency: "KHR",
	rate: 4100,
	effectiveAt: daysAgoIso(0),
	source: "demo-provider",
};

/** Live USD→KHR snapshot; editable in Settings → Exchange rate. */
export const rateToKhr = () => useFinancePrefsStore.getState().exchangeRate;

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const seedCategories: Category[] = [
	{ id: "cat-salary", userId: null, name: "Salary", type: "income", color: "#16a34a", createdAt: daysAgoIso(90) },
	{ id: "cat-freelance", userId: null, name: "Freelance", type: "income", color: "#0ea5e9", createdAt: daysAgoIso(90) },
	{ id: "cat-food", userId: null, name: "Food & Drink", type: "expense", color: "#f97316", createdAt: daysAgoIso(90) },
	{ id: "cat-transport", userId: null, name: "Transport", type: "expense", color: "#6366f1", createdAt: daysAgoIso(90) },
	{ id: "cat-rent", userId: null, name: "Rent", type: "expense", color: "#ef4444", createdAt: daysAgoIso(90) },
	{ id: "cat-utilities", userId: null, name: "Utilities", type: "expense", color: "#eab308", createdAt: daysAgoIso(90) },
	{ id: "cat-shopping", userId: null, name: "Shopping", type: "expense", color: "#ec4899", createdAt: daysAgoIso(90) },
	{ id: "cat-health", userId: null, name: "Health", type: "expense", color: "#14b8a6", createdAt: daysAgoIso(90) },
	{ id: "cat-fun", userId: null, name: "Entertainment", type: "expense", color: "#a855f7", createdAt: daysAgoIso(90) },
];

function makeAccount(
	id: string,
	name: string,
	type: AccountType,
	openingBalance: number,
	currency: Currency
): Account {
	return {
		id,
		name,
		type,
		openingBalance,
		currentBalance: openingBalance,
		currency,
		isActive: true,
		createdAt: daysAgoIso(90),
	};
}

const seedAccounts: Account[] = [
	makeAccount("acc-cash", "Cash wallet", "cash", 120, "USD"),
	makeAccount("acc-aba", "ABA Bank", "bank", 2350, "USD"),
	makeAccount("acc-wing", "Wing wallet", "wallet", 820_000, "KHR"),
	makeAccount("acc-savings", "Savings", "savings", 5_000, "USD"),
	makeAccount("acc-credit", "Credit card", "credit", -340, "USD"),
];

type SeedTx = [string, string, "income" | "expense", number, Currency, number, string, TransactionStatus];
// [accountId, categoryId, type, amount, currency, daysAgo, description, status]
const seedTx: SeedTx[] = [
	["acc-aba", "cat-salary", "income", 2200, "USD", 28, "Monthly salary", "completed"],
	["acc-aba", "cat-rent", "expense", 450, "USD", 27, "Apartment rent", "completed"],
	["acc-cash", "cat-food", "expense", 18.5, "USD", 26, "Lunch with team", "completed"],
	["acc-wing", "cat-transport", "expense", 32_000, "KHR", 25, "Tuk-tuk rides", "completed"],
	["acc-aba", "cat-utilities", "expense", 64.2, "USD", 24, "Electricity + water", "completed"],
	["acc-aba", "cat-freelance", "income", 600, "USD", 20, "Landing page project", "completed"],
	["acc-cash", "cat-shopping", "expense", 85, "USD", 19, "Running shoes", "completed"],
	["acc-wing", "cat-food", "expense", 68_000, "KHR", 17, "Groceries", "completed"],
	["acc-aba", "cat-health", "expense", 42, "USD", 14, "Dental checkup", "completed"],
	["acc-cash", "cat-fun", "expense", 12, "USD", 12, "Cinema tickets", "completed"],
	["acc-aba", "cat-freelance", "income", 350, "USD", 9, "Logo revision", "completed"],
	["acc-wing", "cat-utilities", "expense", 46_000, "KHR", 8, "Internet bill", "completed"],
	["acc-cash", "cat-food", "expense", 22.75, "USD", 6, "Dinner downtown", "completed"],
	["acc-aba", "cat-transport", "expense", 9.5, "USD", 5, "Ride-hailing", "completed"],
	["acc-aba", "cat-shopping", "expense", 129, "USD", 4, "Desk lamp", "pending"],
	["acc-wing", "cat-food", "expense", 54_000, "KHR", 3, "Market run", "completed"],
	["acc-cash", "cat-fun", "expense", 7.25, "USD", 2, "Coffee beans", "completed"],
	["acc-aba", "cat-utilities", "expense", 38.9, "USD", 1, "Phone plan", "completed"],
	["acc-wing", "cat-transport", "expense", 12_000, "KHR", 0, "Scooter fuel", "completed"],
	["acc-cash", "cat-food", "expense", 15.4, "USD", 0, "Breakfast", "completed"],
];

function makeTransaction(seed: SeedTx, index: number): Transaction {
	const [accountId, categoryId, type, amount, currency, daysBack, description, status] = seed;
	const baseCurrency: Currency = "USD";
	return {
		id: `tx-seed-${index}`,
		accountId,
		categoryId,
		type,
		amount,
		currency,
		baseCurrency,
		exchangeRateToBase: currency === baseCurrency ? 1 : rateToKhr(),
		amountInBaseCurrency: convertAmount(amount, currency, baseCurrency, rateToKhr()),
		description,
		transactionDate: daysAgoIso(daysBack),
		status,
		createdAt: daysAgoIso(daysBack),
	};
}

const seedTransactions: Transaction[] = seedTx.map(makeTransaction);

function seedBudget(
	id: string,
	categoryId: string,
	amount: number,
	currency: Currency,
	period: BudgetPeriod,
	startDate: string,
	endDate: string
): Budget {
	return { id, categoryId, amount, currency, period, startDate, endDate };
}

const month = monthRange();
const seedBudgets: Budget[] = [
	seedBudget("bud-food", "cat-food", 300, "USD", "monthly", month.start, month.end),
	seedBudget("bud-transport", "cat-transport", 150, "USD", "monthly", month.start, month.end),
	seedBudget("bud-fun", "cat-fun", 80, "USD", "monthly", month.start, month.end),
	seedBudget("bud-rent", "cat-rent", 450, "USD", "monthly", month.start, month.end),
];

const seedGoals: Goal[] = [
	{ id: "goal-emergency", name: "Emergency fund", targetAmount: 10_000, currentAmount: 5_000, currency: "USD", deadline: null, status: "active" },
	{ id: "goal-laptop", name: "New laptop", targetAmount: 2_400, currentAmount: 1_650, currency: "USD", deadline: daysAgoIso(-120), status: "active" },
	{ id: "goal-japan", name: "Japan trip", targetAmount: 3_500, currentAmount: 3_500, currency: "USD", deadline: daysAgoIso(-200), status: "completed" },
];

const seedDebts: Debt[] = [
	{ id: "debt-car", name: "Car loan", type: "borrowed", originalAmount: 8_000, remainingAmount: 5_200, currency: "USD", interestRate: 6.5, dueDate: daysAgoIso(-400), status: "active" },
	{ id: "debt-mika", name: "Loan to Mika", type: "lent", originalAmount: 500, remainingAmount: 200, currency: "USD", interestRate: null, dueDate: daysAgoIso(-30), status: "active" },
	{ id: "debt-cousin", name: "Loan to Vuthy", type: "lent", originalAmount: 1_200_000, remainingAmount: 0, currency: "KHR", interestRate: null, dueDate: daysAgoIso(10), status: "paid" },
];

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

type FinanceState = {
	accounts: Account[];
	categories: Category[];
	transactions: Transaction[];
	budgets: Budget[];
	goals: Goal[];
	debts: Debt[];

	addAccount: (account: Omit<Account, "id" | "createdAt">) => void;
	updateAccount: (id: string, updates: Partial<Account>) => void;
	deleteAccount: (id: string) => void;

	addCategory: (category: Omit<Category, "id" | "createdAt">) => void;
	updateCategory: (id: string, updates: Partial<Category>) => void;
	deleteCategory: (id: string) => void;

	addTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
	updateTransaction: (id: string, updates: Partial<Transaction>) => void;
	deleteTransaction: (id: string) => void;

	addBudget: (budget: Omit<Budget, "id">) => void;
	updateBudget: (id: string, updates: Partial<Budget>) => void;
	deleteBudget: (id: string) => void;

	addGoal: (goal: Omit<Goal, "id">) => void;
	updateGoal: (id: string, updates: Partial<Goal>) => void;
	deleteGoal: (id: string) => void;
	depositGoal: (id: string, amount: number) => void;

	addDebt: (debt: Omit<Debt, "id">) => void;
	updateDebt: (id: string, updates: Partial<Debt>) => void;
	deleteDebt: (id: string) => void;
	payDebt: (id: string, amount: number) => void;
};

const uid = () =>
	typeof crypto !== "undefined" && "randomUUID" in crypto
		? crypto.randomUUID()
		: `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useFinanceStore = create<FinanceState>()((set) => ({
	accounts: seedAccounts,
	categories: seedCategories,
	transactions: seedTransactions,
	budgets: seedBudgets,
	goals: seedGoals,
	debts: seedDebts,

	addAccount: (account) =>
		set((state) => ({
			accounts: [{ ...account, id: uid(), createdAt: todayIso() }, ...state.accounts],
		})),
	updateAccount: (id, updates) =>
		set((state) => ({
			accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
		})),
	deleteAccount: (id) =>
		set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

	addCategory: (category) =>
		set((state) => ({
			categories: [...state.categories, { ...category, id: uid(), createdAt: todayIso() }],
		})),
	updateCategory: (id, updates) =>
		set((state) => ({
			categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
		})),
	deleteCategory: (id) =>
		set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),

	addTransaction: (tx) =>
		set((state) => ({
			transactions: [{ ...tx, id: uid(), createdAt: todayIso() }, ...state.transactions],
		})),
	updateTransaction: (id, updates) =>
		set((state) => ({
			transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
		})),
	deleteTransaction: (id) =>
		set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) })),

	addBudget: (budget) => set((state) => ({ budgets: [{ ...budget, id: uid() }, ...state.budgets] })),
	updateBudget: (id, updates) =>
		set((state) => ({ budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)) })),
	deleteBudget: (id) => set((state) => ({ budgets: state.budgets.filter((b) => b.id !== id) })),

	addGoal: (goal) => set((state) => ({ goals: [{ ...goal, id: uid() }, ...state.goals] })),
	updateGoal: (id, updates) =>
		set((state) => ({ goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
	deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
	depositGoal: (id, amount) =>
		set((state) => ({
			goals: state.goals.map((g) => {
				if (g.id !== id) return g;
				const currentAmount = Math.min(g.targetAmount, g.currentAmount + amount);
				return { ...g, currentAmount, status: currentAmount >= g.targetAmount ? ("completed" as GoalStatus) : g.status };
			}),
		})),

	addDebt: (debt) => set((state) => ({ debts: [{ ...debt, id: uid() }, ...state.debts] })),
	updateDebt: (id, updates) =>
		set((state) => ({ debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d)) })),
	deleteDebt: (id) => set((state) => ({ debts: state.debts.filter((d) => d.id !== id) })),
	payDebt: (id, amount) =>
		set((state) => ({
			debts: state.debts.map((d) => {
				if (d.id !== id) return d;
				const remainingAmount = Math.max(0, d.remainingAmount - amount);
				const status: DebtStatus = remainingAmount === 0 ? "paid" : d.status;
				return { ...d, remainingAmount, status };
			}),
		})),
}));

/* ------------------------------------------------------------------ */
/* Derived helpers                                                     */
/* ------------------------------------------------------------------ */

export function categoryById(categories: Category[], id: string | null): Category | undefined {
	return id ? categories.find((c) => c.id === id) : undefined;
}

export function accountById(accounts: Account[], id: string): Account | undefined {
	return accounts.find((a) => a.id === id);
}

export function categoryTypeLabel(type: CategoryType): string {
	return type === "income" ? "Income" : "Expense";
}

import { z } from "zod";

const currencyEnum = z.enum(["USD", "KHR"]);

export const accountFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(40, "Name is too long."),
  type: z.enum(["cash", "bank", "savings", "credit", "wallet"]),
  currency: currencyEnum,
  openingBalance: z.coerce
    .number("Enter a number.")
    .min(0, "Opening balance cannot be negative."),
  isActive: z.boolean(),
});

export const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(30, "Name is too long."),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Pick a color."),
});

export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  accountId: z.string().min(1, "Choose an account."),
  categoryId: z.string().min(1, "Choose a category."),
  amount: z.coerce
    .number("Enter an amount.")
    .positive("Amount must be greater than zero."),
  currency: currencyEnum,
  transactionDate: z.string().min(1, "Pick a date."),
  description: z
    .string()
    .trim()
    .max(120, "Description is too long.")
    .optional(),
  status: z.enum(["pending", "completed", "cancelled"]),
});

export const budgetFormSchema = z
  .object({
    categoryId: z.string().min(1, "Choose an expense category."),
    amount: z.coerce
      .number("Enter an amount.")
      .positive("Amount must be greater than zero."),
    currency: currencyEnum,
    period: z.enum(["weekly", "monthly", "yearly"]),
    startDate: z.string().min(1, "Pick a start date."),
    endDate: z.string().min(1, "Pick an end date."),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: "End date must be after the start date.",
    path: ["endDate"],
  });

export const goalFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(40, "Name is too long."),
  targetAmount: z.coerce
    .number("Enter an amount.")
    .positive("Target must be greater than zero."),
  currentAmount: z.coerce
    .number("Enter an amount.")
    .min(0, "Saved amount cannot be negative."),
  currency: currencyEnum,
  deadline: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]),
});

export const goalDepositSchema = z.object({
  amount: z.coerce
    .number("Enter an amount.")
    .positive("Amount must be greater than zero."),
});

export const debtFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(40, "Name is too long."),
  type: z.enum(["borrowed", "lent"]),
  originalAmount: z.coerce
    .number("Enter an amount.")
    .positive("Amount must be greater than zero."),
  remainingAmount: z.coerce
    .number("Enter an amount.")
    .min(0, "Remaining cannot be negative."),
  currency: currencyEnum,
  interestRate: z.coerce
    .number("Enter a rate.")
    .min(0, "Rate cannot be negative.")
    .max(100, "Rate must be a percentage.")
    .optional(),
  dueDate: z.string().optional(),
  status: z.enum(["active", "paid", "overdue"]),
});

export const debtPaymentSchema = z.object({
  amount: z.coerce
    .number("Enter an amount.")
    .positive("Amount must be greater than zero."),
});

/** Flatten a failed safeParse into `{ field: firstMessage }`. */
export function fieldErrors<T extends string>(
  error: z.ZodError,
): Partial<Record<T, string>> {
  const flattened = error.flatten().fieldErrors as Partial<
    Record<string, string[] | undefined>
  >;
  const result: Partial<Record<T, string>> = {};
  for (const [key, messages] of Object.entries(flattened)) {
    if (messages?.[0]) result[key as T] = messages[0];
  }
  return result;
}

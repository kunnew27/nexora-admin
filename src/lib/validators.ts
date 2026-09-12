import { z } from "zod";

export const userFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(60, "Name is too long."),
  email: z.string().trim().pipe(z.email("Enter a valid email address.")),
  role: z.enum(["Admin", "Member", "Viewer"]),
  status: z.enum(["Invited", "Active", "Suspended"]),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const securityFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((values) => values.newPassword !== values.currentPassword, {
    message: "New password must be different from the current password.",
    path: ["newPassword"],
  });

export type SecurityFormValues = z.infer<typeof securityFormSchema>;

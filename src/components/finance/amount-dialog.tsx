import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const amountSchema = z.object({
  amount: z.coerce
    .number("Enter an amount.")
    .positive("Amount must be greater than zero."),
});

/** Small modal asking for a single positive amount (goal deposits, debt payments). */
export function AmountDialog({
  description,
  onConfirm,
  onOpenChange,
  open,
  submitLabel,
  title,
}: {
  description: string;
  onConfirm: (amount: number) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  submitLabel: string;
  title: string;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = amountSchema.safeParse({ amount });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter an amount.");
      return;
    }
    onConfirm(parsed.data.amount);
    toast.success(submitLabel, {
      description: `${parsed.data.amount.toLocaleString()} recorded.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="amount-dialog-value">Amount</Label>
            <Input
              aria-invalid={Boolean(error)}
              id="amount-dialog-value"
              min="0"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={amount}
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>
          <DialogFooter>
            <Button
              onClick={() => onOpenChange(false)}
              size="sm"
              type="button"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button size="sm" type="submit">
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

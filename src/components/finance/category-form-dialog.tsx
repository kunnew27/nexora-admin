import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoryFormSchema, fieldErrors } from "@/lib/finance-validators";
import type { Category, CategoryType } from "@/lib/finance";
import { useFinanceStore } from "@/stores/finance-store";

type Field = "name" | "type" | "color";

const COLOR_SWATCHES = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#16a34a",
  "#14b8a6",
  "#0ea5e9",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
];

export function CategoryFormDialog({
  category,
  onOpenChange,
  open,
}: {
  category?: Category | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const addCategory = useFinanceStore((state) => state.addCategory);
  const updateCategory = useFinanceStore((state) => state.updateCategory);

  const isEdit = Boolean(category);

  const [name, setName] = useState("");
  const [type, setType] = useState<CategoryType>("expense");
  const [color, setColor] = useState(COLOR_SWATCHES[2]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color);
    } else {
      setName("");
      setType("expense");
      setColor(COLOR_SWATCHES[2]);
    }
  }, [open, category]);

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const parsed = categoryFormSchema.safeParse({ name, type, color });
    if (!parsed.success) {
      const next = fieldErrors<Field>(parsed.error);
      setErrors(next);
      toast.error("Please fix the highlighted fields.", {
        description: Object.values(next)[0],
      });
      return;
    }
    setErrors({});

    if (category) {
      updateCategory(category.id, parsed.data);
      toast.success("Changes saved", {
        description: `${parsed.data.name} was updated.`,
      });
    } else {
      addCategory({ ...parsed.data, userId: null });
      toast.success("Category created", {
        description: `${parsed.data.name} can now classify transactions.`,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Categories classify your income and expenses.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSave}>
          <div className="space-y-2">
            <Label htmlFor="category-form-name">Name</Label>
            <Input
              aria-invalid={Boolean(errors.name)}
              id="category-form-name"
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Groceries"
              value={name}
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category-form-type">Type</Label>
            <Select
              onValueChange={(v) => setType(v as CategoryType)}
              value={type}
            >
              <SelectTrigger className="w-full" id="category-form-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  aria-label={`Color ${swatch}`}
                  className={`size-7 rounded-full border-2 transition-transform ${
                    color === swatch
                      ? "scale-110 border-foreground"
                      : "border-transparent"
                  }`}
                  key={swatch}
                  onClick={() => setColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  type="button"
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-destructive text-xs">{errors.color}</p>
            )}
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
              {isEdit ? "Save changes" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

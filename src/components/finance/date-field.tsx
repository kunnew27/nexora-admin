import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FieldError } from "@/components/finance/finance-sheet";
import { CalendarIcon } from "lucide-react";

function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function toIso(date: Date): string {
  const copy = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return copy.toISOString().slice(0, 10);
}

function label(iso: string): string {
  return parseIso(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Single-date picker: outline trigger + popover calendar. */
export function DatePickerField({
  ariaInvalid,
  error,
  id,
  onChange,
  placeholder,
  value,
}: {
  ariaInvalid?: boolean;
  error?: string;
  id: string;
  onChange: (iso: string) => void;
  placeholder: string;
  value: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    // flex + gap (not space-y): Base UI mounts position:fixed focus guards
    // next to the trigger while the popover is open; margin-based spacing
    // gives them height and pushes the fields below down.
    <div className="flex flex-col gap-2">
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger
          render={
            <Button
              aria-invalid={ariaInvalid}
              className="justify-between font-normal"
              id={id}
              type="button"
              variant="outline"
            />
          }
        >
          <span className={value ? "" : "text-muted-foreground"}>
            {value ? label(value) : placeholder}
          </span>
          <CalendarIcon className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="single"
            onSelect={(day) => {
              onChange(day ? toIso(day) : "");
              setOpen(false);
            }}
            selected={value ? parseIso(value) : undefined}
          />
        </PopoverContent>
      </Popover>
      <FieldError message={error} />
    </div>
  );
}

/** Date-range picker for budget windows; picks start and end in one calendar. */
export function DateRangePickerField({
  endValue,
  id,
  onRangeChange,
  startValue,
}: {
  endValue: string;
  id: string;
  onRangeChange: (start: string, end: string) => void;
  startValue: string;
}) {
  const [open, setOpen] = useState(false);
  const rangeLabel =
    startValue && endValue
      ? `${label(startValue).replace(/, \d{4}/, "")} – ${label(endValue)}`
      : startValue
        ? label(startValue)
        : "Pick a date range";

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className="w-full justify-between font-normal"
            id={id}
            type="button"
            variant="outline"
          />
        }
      >
        <span className={startValue ? "" : "text-muted-foreground"}>
          {rangeLabel}
        </span>
        <CalendarIcon className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          defaultMonth={startValue ? parseIso(startValue) : undefined}
          mode="range"
          numberOfMonths={2}
          onSelect={(range: DateRange | undefined) => {
            if (!range?.from) return;
            onRangeChange(toIso(range.from), range.to ? toIso(range.to) : "");
          }}
          selected={{
            from: startValue ? parseIso(startValue) : undefined,
            to: endValue ? parseIso(endValue) : undefined,
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

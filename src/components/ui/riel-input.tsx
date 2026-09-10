import * as React from "react";

import { NumberInput } from "@/components/ui/number-input";
import {
  RIEL_CASH_UNIT,
  formatRiel,
  isPayableRiel,
  roundRiel,
  type RielRoundMode,
} from "@/lib/khr";

type RielInputProps = {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Snap to this multiple on blur. 100 = smallest note. */
  cashUnit?: number;
  roundMode?: RielRoundMode;
  /** Show "Rounded from 1,250៛" when snapping changed the value. */
  showRoundingHint?: boolean;
  numerals?: "latn" | "khmr";
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function RielInput({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max,
  cashUnit = RIEL_CASH_UNIT,
  roundMode = "nearest",
  showRoundingHint = true,
  numerals = "latn",
  ...props
}: RielInputProps) {
  const [hint, setHint] = React.useState<string | null>(null);
  const beforeRound = React.useRef<number | null>(null);

  return (
    <div className="flex flex-col gap-1.5">
      <NumberInput
        {...props}
        decimalScale={0}
        defaultValue={defaultValue}
        locale={numerals === "khmr" ? "km-KH-u-nu-khmr" : "en-US"}
        max={max}
        min={min}
        normalizeOnBlur={(raw) => {
          const snapped = roundRiel(raw, { unit: cashUnit, mode: roundMode });
          beforeRound.current = snapped !== raw ? raw : null;
          return snapped;
        }}
        onValueChange={(next) => {
          setHint(
            next != null && beforeRound.current != null
              ? `Rounded from ${formatRiel(beforeRound.current)}`
              : null,
          );
          if (next == null || isPayableRiel(next, cashUnit)) {
            beforeRound.current = null;
          }
          onValueChange?.(next);
        }}
        step={cashUnit}
        suffix="៛"
        value={value}
      />
      {showRoundingHint && hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export { RielInput, type RielInputProps };

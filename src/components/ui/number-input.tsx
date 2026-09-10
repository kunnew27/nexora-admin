import * as React from "react"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MinusIcon,
  PlusIcon,
  type LucideIcon,
} from "lucide-react"

import { cn } from "cn"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { toLatinDigits } from "@/lib/khr"

/* -------------------------------------------------------------------------- */
/*                                   types                                    */
/* -------------------------------------------------------------------------- */

type StepperVariant = "stacked" | "split"

type NumberInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  /** Controlled numeric value. `null` means empty. */
  value?: number | null
  defaultValue?: number | null
  /** Fires with the parsed number, or `null` when the field is empty. */
  onValueChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  /** Max digits after the decimal separator. `0` disables decimals. */
  decimalScale?: number
  allowNegative?: boolean
  /** Grouping/decimal characters follow this locale. Defaults to en-US. */
  locale?: string
  prefix?: string
  suffix?: string
  showSteppers?: boolean
  /**
   * `"stacked"` = compact chevron column at the trailing edge (default).
   * `"split"` = `−` and `+` on either side of a centred value (touch friendly).
   */
  stepperVariant?: StepperVariant
  /** Transform the value when the field loses focus (e.g. cash rounding). */
  normalizeOnBlur?: (value: number) => number
}

type Config = {
  group: string
  decimal: string
  locale: string
  allowNegative: boolean
  decimalScale?: number
}

/* -------------------------------------------------------------------------- */
/*                             number formatting                              */
/* -------------------------------------------------------------------------- */

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function getSeparators(locale: string) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6)
  return {
    group: parts.find((part) => part.type === "group")?.value ?? ",",
    decimal: parts.find((part) => part.type === "decimal")?.value ?? ".",
  }
}

function isDecimalDigit(char: string) {
  return (char >= "0" && char <= "9") || (char >= "\u17E0" && char <= "\u17E9")
}

/** Strip formatting down to `-`, digits and at most one decimal separator. */
function sanitize(input: string, config: Config) {
  const { group, decimal, allowNegative, decimalScale } = config
  const normalized = toLatinDigits(input)
  const isNegative = allowNegative && /^\s*-/.test(normalized)

  let body = normalized.split(group).join("").replace(/\s/g, "")
  // Accept "." from the numpad even in comma-decimal locales.
  if (decimal !== ".") body = body.replace(/\./g, decimal)
  body = body.replace(new RegExp(`[^0-9${escapeRegExp(decimal)}]`, "g"), "")

  const firstDecimal = body.indexOf(decimal)
  if (firstDecimal !== -1) {
    body =
      body.slice(0, firstDecimal + 1) +
      body.slice(firstDecimal + 1).split(decimal).join("")
  }

  if (decimalScale === 0) {
    body = body.split(decimal)[0]
  } else if (firstDecimal !== -1 && decimalScale != null) {
    const [integerPart, decimalPart = ""] = body.split(decimal)
    body = `${integerPart}${decimal}${decimalPart.slice(0, decimalScale)}`
  }

  return (isNegative ? "-" : "") + body
}

/** Add grouping separators without disturbing an in-progress decimal. */
function format(sanitized: string, config: Config) {
  const { decimal, locale } = config
  if (sanitized === "" || sanitized === "-") return sanitized

  const isNegative = sanitized.startsWith("-")
  const body = isNegative ? sanitized.slice(1) : sanitized
  const hasDecimal = body.includes(decimal)
  const [integerPart, decimalPart = ""] = body.split(decimal)

  let grouped = ""
  if (integerPart !== "") {
    const digits = integerPart.replace(/^0+(?=\d)/, "") || "0"
    grouped = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(BigInt(digits))
  }

  return `${isNegative ? "-" : ""}${grouped}${
    hasDecimal ? decimal + decimalPart : ""
  }`
}

function toNumber(sanitized: string, decimal: string): number | null {
  if (sanitized === "" || sanitized === "-" || sanitized === decimal) {
    return null
  }
  const parsed = Number(sanitized.split(decimal).join("."))
  return Number.isNaN(parsed) ? null : parsed
}

function fromNumber(value: number | null | undefined, config: Config) {
  if (value == null || Number.isNaN(value)) return ""
  const raw =
    config.decimalScale != null
      ? value.toFixed(config.decimalScale)
      : String(value)
  return format(sanitize(raw.replace(".", config.decimal), config), config)
}

function countDigits(value: string) {
  let count = 0
  for (const char of toLatinDigits(value)) {
    if (char >= "0" && char <= "9") count += 1
  }
  return count
}

/** Place the caret after the same number of digits it preceded before formatting. */
function caretForDigitIndex(formatted: string, digitIndex: number) {
  if (digitIndex <= 0) {
    const firstDigit = formatted.search(/\d/)
    return firstDigit === -1 ? formatted.length : firstDigit
  }
  let seen = 0
  for (let i = 0; i < formatted.length; i += 1) {
    if (isDecimalDigit(formatted[i])) {
      seen += 1
      if (seen === digitIndex) return i + 1
    }
  }
  return formatted.length
}

function clamp(value: number, min?: number, max?: number) {
  let next = value
  if (min != null) next = Math.max(min, next)
  if (max != null) next = Math.min(max, next)
  return next
}

function decimalPlaces(value: number) {
  const text = String(Math.abs(value))
  if (text.includes("e")) return 12
  const dot = text.indexOf(".")
  return dot === -1 ? 0 : text.length - dot - 1
}

/** Kill float noise, e.g. 0.1 + 0.2 -> 0.30000000000000004. */
function snap(value: number, places: number) {
  return Number(value.toFixed(Math.min(Math.max(places, 0), 12)))
}

/* -------------------------------------------------------------------------- */
/*                                  stepper                                   */
/* -------------------------------------------------------------------------- */

type StepperButtonProps = {
  className?: string
  disabled?: boolean
  icon: LucideIcon
  label: string
  onFocusInput: () => void
  onStep: () => void
}

function StepperButton({
  className,
  disabled,
  icon: Icon,
  label,
  onFocusInput,
  onStep,
}: StepperButtonProps) {
  return (
    <InputGroupButton
      aria-label={label}
      className={cn(
        "flex size-auto min-h-0 w-full shrink-0 items-center justify-center rounded-none border-0 p-0 text-muted-foreground shadow-none ring-0 transition-colors hover:bg-accent hover:text-foreground focus-visible:border-0 focus-visible:ring-0 active:translate-y-0 active:bg-accent/70 disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      disabled={disabled}
      onClick={onStep}
      onMouseDown={(event) => {
        // Keep the caret in the field. Blurring here would run
        // normalizeOnBlur on every single click.
        event.preventDefault()
        onFocusInput()
      }}
      size="xs"
      tabIndex={-1}
      type="button"
    >
      <Icon aria-hidden />
    </InputGroupButton>
  )
}

/* -------------------------------------------------------------------------- */
/*                                 component                                  */
/* -------------------------------------------------------------------------- */

function NumberInput({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  decimalScale,
  allowNegative = false,
  locale = "en-US",
  prefix,
  suffix,
  showSteppers = false,
  stepperVariant = "stacked",
  normalizeOnBlur,
  className,
  disabled,
  readOnly,
  onBlur,
  onKeyDown,
  ...props
}: NumberInputProps) {
  const separators = React.useMemo(() => getSeparators(locale), [locale])
  const config = React.useMemo<Config>(
    () => ({ ...separators, locale, allowNegative, decimalScale }),
    [separators, locale, allowNegative, decimalScale]
  )

  const inputRef = React.useRef<HTMLInputElement>(null)
  const caretRef = React.useRef<number | null>(null)

  const isControlled = value !== undefined
  const [display, setDisplay] = React.useState(() =>
    fromNumber(isControlled ? value : defaultValue, config)
  )

  React.useLayoutEffect(() => {
    const element = inputRef.current
    const caret = caretRef.current
    if (!element || caret == null) return
    element.setSelectionRange(caret, caret)
    caretRef.current = null
  })

  // Re-sync from the outside only when the numeric value actually differs, so
  // in-progress input like "1,000." is never clobbered mid-keystroke.
  React.useEffect(() => {
    if (!isControlled) return
    const current = toNumber(sanitize(display, config), config.decimal)
    if (current !== (value ?? null)) {
      setDisplay(fromNumber(value, config))
    }
  }, [value, isControlled, config, display])

  const commit = React.useCallback(
    (nextDisplay: string, caret: number | null) => {
      const element = inputRef.current
      caretRef.current = caret
      if (element) {
        element.value = nextDisplay
        if (caret != null) element.setSelectionRange(caret, caret)
      }
      setDisplay(nextDisplay)
    },
    []
  )

  const focusInput = React.useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const parsed = toNumber(sanitize(display, config), config.decimal)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const selection = event.target.selectionStart ?? raw.length
    const digitsBeforeCaret = countDigits(raw.slice(0, selection))
    const nextDisplay = format(sanitize(raw, config), config)
    commit(nextDisplay, caretForDigitIndex(nextDisplay, digitsBeforeCaret))
    onValueChange?.(toNumber(sanitize(nextDisplay, config), config.decimal))
  }

  const applyNumber = (next: number) => {
    const clamped = clamp(next, min, max)
    const nextDisplay = fromNumber(clamped, config)
    commit(nextDisplay, nextDisplay.length)
    onValueChange?.(clamped)
  }

  const nudge = (direction: 1 | -1) => {
    if (disabled || readOnly) return
    const current = parsed ?? min ?? 0
    const places =
      decimalScale ?? Math.max(decimalPlaces(step), decimalPlaces(current))
    applyNumber(snap(current + direction * step, places))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return

    const element = event.currentTarget
    const caret = element.selectionStart ?? 0
    const hasSelection = caret !== (element.selectionEnd ?? caret)

    if (event.key === "ArrowUp") {
      event.preventDefault()
      nudge(1)
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      nudge(-1)
      return
    }

    // Backspacing a group separator should remove the digit before it,
    // otherwise the key appears to do nothing.
    if (
      event.key === "Backspace" &&
      !hasSelection &&
      caret > 1 &&
      element.value[caret - 1] === config.group
    ) {
      event.preventDefault()
      const stripped =
        element.value.slice(0, caret - 2) + element.value.slice(caret)
      const digitsBeforeCaret = countDigits(stripped.slice(0, caret - 2))
      const nextDisplay = format(sanitize(stripped, config), config)
      commit(nextDisplay, caretForDigitIndex(nextDisplay, digitsBeforeCaret))
      onValueChange?.(toNumber(sanitize(nextDisplay, config), config.decimal))
    }
  }

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (parsed == null) {
      if (display !== "") {
        commit("", null)
        onValueChange?.(null)
      }
    } else {
      const clamped = clamp(
        normalizeOnBlur ? normalizeOnBlur(parsed) : parsed,
        min,
        max
      )
      const nextDisplay = fromNumber(clamped, config)
      if (nextDisplay !== display) commit(nextDisplay, null)
      if (clamped !== parsed) onValueChange?.(clamped)
    }
    onBlur?.(event)
  }

  const inputProps = {
    ...props,
    autoComplete: "off" as const,
    disabled,
    readOnly,
    inputMode: decimalScale === 0 ? ("numeric" as const) : ("decimal" as const),
    onBlur: handleBlur,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    ref: inputRef,
    type: "text" as const,
    value: display,
  }

  if (!prefix && !suffix && !showSteppers) {
    return <Input {...inputProps} className={cn("tabular-nums", className)} />
  }

  const interactive = !disabled && !readOnly
  const canIncrement =
    interactive && !(max != null && parsed != null && parsed >= max)
  const canDecrement =
    interactive && !(min != null && parsed != null && parsed <= min)

  const isSplit = showSteppers && stepperVariant === "split"
  const stepperShared = {
    onFocusInput: focusInput,
  }

  return (
    <InputGroup
      // overflow-hidden lets the group's own radius clip the flush buttons,
      // so no rounded-r-[calc(...)] guessing is needed.
      className={cn(showSteppers && "items-stretch overflow-hidden", className)}
      data-disabled={disabled ? true : undefined}
    >
      {isSplit ? (
        <InputGroupAddon
          align="inline-start"
          className="h-full min-h-0 cursor-default p-0 pl-0 has-[>button]:ml-0"
        >
          <div className="flex h-full w-9 border-r border-input">
            <StepperButton
              {...stepperShared}
              className="h-full [&_svg]:size-4"
              disabled={!canDecrement}
              icon={MinusIcon}
              label="Decrement"
              onStep={() => nudge(-1)}
            />
          </div>
        </InputGroupAddon>
      ) : null}

      {prefix ? (
        <InputGroupAddon
          align="inline-start"
          className={isSplit ? "pr-0 pl-2.5" : undefined}
        >
          <InputGroupText>{prefix}</InputGroupText>
        </InputGroupAddon>
      ) : null}

      <InputGroupInput
        {...inputProps}
        className={cn("tabular-nums", isSplit && "px-2 text-center")}
      />

      {suffix ? (
        <InputGroupAddon
          align="inline-end"
          className={isSplit ? "pr-2.5 pl-0" : "pr-2.5"}
        >
          <InputGroupText>{suffix}</InputGroupText>
        </InputGroupAddon>
      ) : null}

      {showSteppers ? (
        <InputGroupAddon
          align="inline-end"
          className="h-full min-h-0 cursor-default p-0 pr-0 has-[>button]:mr-0"
        >
          {isSplit ? (
            <div className="flex h-full w-9 border-l border-input">
              <StepperButton
                {...stepperShared}
                className="h-full [&_svg]:size-4"
                disabled={!canIncrement}
                icon={PlusIcon}
                label="Increment"
                onStep={() => nudge(1)}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-0 w-8 flex-col divide-y divide-input border-l border-input">
              <StepperButton
                {...stepperShared}
                className="h-1/2 min-h-0 flex-1 basis-0 [&_svg]:size-3"
                disabled={!canIncrement}
                icon={ChevronUpIcon}
                label="Increment"
                onStep={() => nudge(1)}
              />
              <StepperButton
                {...stepperShared}
                className="h-1/2 min-h-0 flex-1 basis-0 [&_svg]:size-3"
                disabled={!canDecrement}
                icon={ChevronDownIcon}
                label="Decrement"
                onStep={() => nudge(-1)}
              />
            </div>
          )}
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  )
}

export { NumberInput, type NumberInputProps }

import * as React from "react"
import { MinusIcon, PlusIcon } from "lucide-react"
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
  /** Transform the value when the field loses focus (e.g. cash rounding). */
  normalizeOnBlur?: (value: number) => number
}

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

type Config = {
  group: string
  decimal: string
  locale: string
  allowNegative: boolean
  decimalScale?: number
}

/** Strip formatting down to `-`, digits and at most one decimal separator. */
function isDecimalDigit(char: string) {
  return (char >= "0" && char <= "9") || (char >= "\u17E0" && char <= "\u17E9")
}

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
    const char = formatted[i]
    if (isDecimalDigit(char)) {
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
  normalizeOnBlur,
  className,
  disabled,
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

  const commit = React.useCallback((nextDisplay: string, caret: number | null) => {
    const element = inputRef.current
    caretRef.current = caret
    if (element) {
      element.value = nextDisplay
      if (caret != null) element.setSelectionRange(caret, caret)
    }
    setDisplay(nextDisplay)
  }, [])

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
    const current =
      toNumber(sanitize(display, config), config.decimal) ?? min ?? 0
    applyNumber(current + direction * step)
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
      caret > 0 &&
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
    const parsed = toNumber(sanitize(display, config), config.decimal)
    if (parsed == null) {
      commit("", null)
      onValueChange?.(null)
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

  const hasAddons = Boolean(prefix || suffix || showSteppers)

  const inputProps = {
    ...props,
    autoComplete: "off" as const,
    disabled,
    inputMode: decimalScale === 0 ? ("numeric" as const) : ("decimal" as const),
    onBlur: handleBlur,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    ref: inputRef,
    type: "text" as const,
    value: display,
  }

  const steppers = showSteppers ? (
    <InputGroupAddon align="inline-end">
      <div className="flex flex-col">
        <InputGroupButton
          aria-label="Increment"
          className="h-3.5 w-6 rounded-b-none"
          disabled={disabled}
          onClick={() => nudge(1)}
          size="icon-xs"
          tabIndex={-1}
        >
          <PlusIcon />
        </InputGroupButton>
        <InputGroupButton
          aria-label="Decrement"
          className="h-3.5 w-6 rounded-t-none"
          disabled={disabled}
          onClick={() => nudge(-1)}
          size="icon-xs"
          tabIndex={-1}
        >
          <MinusIcon />
        </InputGroupButton>
      </div>
    </InputGroupAddon>
  ) : null

  if (!hasAddons) {
    return (
      <Input
        {...inputProps}
        className={cn("tabular-nums", className)}
      />
    )
  }

  return (
    <InputGroup
      className={className}
      data-disabled={disabled ? true : undefined}
    >
      {prefix ? (
        <InputGroupAddon>
          <InputGroupText>{prefix}</InputGroupText>
        </InputGroupAddon>
      ) : null}
      <InputGroupInput {...inputProps} className="tabular-nums" />
      {suffix ? (
        <InputGroupAddon align="inline-end">
          <InputGroupText>{suffix}</InputGroupText>
        </InputGroupAddon>
      ) : null}
      {steppers}
    </InputGroup>
  )
}

export { NumberInput, type NumberInputProps }

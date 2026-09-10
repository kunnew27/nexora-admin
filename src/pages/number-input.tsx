import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { NumberInput } from "@/components/ui/number-input"
import { RielInput } from "@/components/ui/riel-input"
import {
  breakdownRiel,
  formatRiel,
  rielToUsd,
  roundRiel,
  sumRielLines,
} from "@/lib/khr"

const cartLines = [
  { label: "Coffee × 3", price: 4200, qty: 3 },
  { label: "Pastry × 1", price: 1750, qty: 1 },
]

export default function NumberInputPage() {
  const [amount, setAmount] = useState<number | null>(1_000_000)
  const [qty, setQty] = useState<number | null>(1)
  const [deAmount, setDeAmount] = useState<number | null>(1_000_000)
  const [riel, setRiel] = useState<number | null>(1_200)

  const cartRaw = sumRielLines(cartLines)
  const cartPayable = roundRiel(cartRaw)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Number input"
        description="Type 1000000 and it formats to 1,000,000 live, without jumping the caret."
      />

      <div className="flex flex-wrap gap-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Amount</CardTitle>
            <CardDescription>
              Type 1000000 → shows 1,000,000. Clamping runs on blur.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount</Label>
              <NumberInput
                decimalScale={2}
                id="amount"
                min={0}
                onValueChange={setAmount}
                placeholder="0.00"
                prefix="$"
                value={amount}
              />
              <p className="text-muted-foreground text-xs">
                Raw value: {amount ?? "null"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="qty">Quantity</Label>
              <NumberInput
                decimalScale={0}
                id="qty"
                max={99}
                min={1}
                onValueChange={setQty}
                showSteppers
                stepperVariant="split"
                value={qty}
              />
              <p className="text-muted-foreground text-xs">
                Split − / + on both sides. Raw value: {qty ?? "null"}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="riel-steppers">Stacked steppers</Label>
              <NumberInput
                decimalScale={0}
                defaultValue={1200}
                id="riel-steppers"
                min={0}
                showSteppers
                suffix="៛"
              />
              <p className="text-muted-foreground text-xs">
                Compact chevron column. Good in tables and forms.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="percent">Share (uncontrolled)</Label>
              <NumberInput
                decimalScale={1}
                defaultValue={12.5}
                id="percent"
                max={100}
                min={0}
                suffix="%"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="de-amount">German locale</Label>
              <NumberInput
                decimalScale={2}
                id="de-amount"
                locale="de-DE"
                min={0}
                onValueChange={setDeAmount}
                value={deAmount}
              />
              <p className="text-muted-foreground text-xs">
                Groups as 1.000.000,00. Numpad “.” still inserts a decimal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Riel (KHR)</CardTitle>
            <CardDescription>
              Type 1250 or paste ១២៥០ — blur snaps to 1,200៛. Arrows step by
              100.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="riel">Amount (KHR)</Label>
              <RielInput
                id="riel"
                min={0}
                onValueChange={setRiel}
                value={riel}
              />
            </div>

            {riel != null ? (
              <div className="flex flex-col gap-1 text-muted-foreground text-xs tabular-nums">
                <p>Khmer numerals: {formatRiel(riel, { numerals: "khmr" })}</p>
                <p>≈ ${rielToUsd(riel).toFixed(2)} USD</p>
                <p>
                  Notes:{" "}
                  {breakdownRiel(riel)
                    .map(({ note, count }) => `${count}×${formatRiel(note)}`)
                    .join(" + ") || "—"}
                </p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <p className="font-medium text-sm">Cart (round once at pay)</p>
              {cartLines.map((line) => (
                <p
                  className="text-muted-foreground text-xs tabular-nums"
                  key={line.label}
                >
                  {line.label}: {formatRiel(line.price * line.qty)}
                </p>
              ))}
              <p className="text-xs tabular-nums">
                Exact: {formatRiel(cartRaw)}
              </p>
              <p className="text-xs tabular-nums">
                Payable: {formatRiel(cartPayable)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

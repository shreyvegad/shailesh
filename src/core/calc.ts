// Pure TypeScript: no React/Next imports, so it is reusable anywhere.
import type { Rate, RowInput, Settings } from "./types";
const num = (v: string) => { const n = parseFloat(v); return isNaN(n) ? 0 : n };

export function effectivePrice(rate: Rate, input: RowInput): number {
    const p = num(input.price);
    return p > 0 ? p : rate.price; // empty/0 override -> default price (as in HTML)
}
export function sizeLabel(rate: Rate, i: RowInput): string {
    if (rate.type === "itemPrice") return rate.specialType === "insideLaminate" ? `${i.qty} x ${rate.priceOnItem}` : i.qty;
    return `${i.height} x ${i.width} x ${i.qty}`;
}
export function rowTotal(rate: Rate, input: RowInput, s: Settings): number {
    const qty = num(input.qty);
    let base: number;
    if (rate.type === "itemPrice") base = qty;
    else base = (num(input.height) * num(input.width) / s.areaDivisor) * qty; // Running Feet = same as Square Feet
    if (!(base > 0)) return 0;
    return Number((base * effectivePrice(rate, input) * rate.priceOnItem).toFixed(s.decimals));
}
export const grandTotal = (totals: number[], s: Settings) => Number(totals.reduce((a, b) => a + b, 0).toFixed(s.decimals));

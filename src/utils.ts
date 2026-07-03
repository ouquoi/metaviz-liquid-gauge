export function isNumericCol(c: { base_type?: string; effective_type?: string }): boolean {
  const t = c.base_type ?? c.effective_type ?? "";
  return /Integer|Float|Decimal|Number|BigInteger/i.test(t);
}

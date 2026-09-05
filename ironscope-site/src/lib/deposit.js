// Direct port of lib/deposit.js in the Next.js app -- display-only math here
// (the server recomputes and enforces the real deposit amount independently
// on submission; this just drives what the form shows before you hit submit).
export function computeDeposit(estimatedRcv) {
  const rcv = Number(estimatedRcv) || 0

  if (rcv <= 10000) return { amountCents: 17500, label: '$175', isCustom: false }
  if (rcv <= 25000) return { amountCents: 20000, label: '$200', isCustom: false }
  if (rcv <= 100000) return { amountCents: 30000, label: '$300', isCustom: false }
  return { amountCents: null, label: 'Custom', isCustom: true }
}

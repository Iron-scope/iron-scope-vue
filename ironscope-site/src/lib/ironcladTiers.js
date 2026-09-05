// Direct port of lib/ironcladTiers.js in the Next.js app -- display config
// only. The real Stripe Price IDs and checkout session creation stay
// entirely server-side (app/api/stripe/checkout/route.js), unchanged.
export const IRONCLAD_TIERS = [
  { id: 'tier1', name: 'Tier 1', volumeCeiling: 50000, priceDollars: 99, includedJobs: 6 },
  { id: 'tier2', name: 'Tier 2', volumeCeiling: 250000, priceDollars: 449, includedJobs: 15 },
  { id: 'tier3', name: 'Tier 3', volumeCeiling: 500000, priceDollars: 799, includedJobs: 25 },
  { id: 'tier4', name: 'Tier 4', volumeCeiling: 1000000, priceDollars: 1449, includedJobs: 50 },
]

export function getTierById(id) {
  return IRONCLAD_TIERS.find((t) => t.id === id) || null
}

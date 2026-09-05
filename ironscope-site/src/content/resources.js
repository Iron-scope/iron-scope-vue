// Direct port of app/data/resources.js in the Next.js app -- staff-only
// reference content, not customer-facing.
export const TRAINING = [
  {
    title: 'Estimate Writing Standards Checklist',
    description:
      "Every estimate should cite the applicable IICRC standard (S500 water, S520 mold, S540 trauma/biohazard, S700 fire/smoke) alongside manufacturer specs and local code where relevant. Confirm this before marking a request Delivered.",
  },
  {
    title: 'Documentation Review Before Writing',
    description:
      "Cross-check submitted photos, moisture readings, and 3D scans against the loss description before starting the scope. If anything's missing or inconsistent, move the request to Awaiting Info rather than guessing.",
  },
  {
    title: 'Ironclad Rebuttal Approach',
    description:
      "Ironclad-tier requests get a fully built rebuttal package, not just base documentation — but the contractor stays the point of contact with the carrier, not us. Lead the rebuttal with the specific standard being invoked, then the line item, then the dollar impact, in that order, so it's ready for the contractor to present as-is.",
  },
  {
    title: 'Licensing Boundary — Read Before Talking to Any Carrier',
    description:
      "We are not licensed public adjusters. Do not contact, negotiate with, or represent a position to a carrier or adjuster directly, on any tier, regardless of what a contractor asks for. All carrier-facing communication and negotiation is the contractor's responsibility — our role stops at preparing the documentation they use. If a contractor asks us to negotiate directly, escalate to Derek/Tyson rather than agreeing.",
  },
]

export const RIA_REBUTTALS = [
  {
    scenario: 'Adjuster disputes drying equipment count/duration',
    rebuttal:
      'Reference IICRC S500 psychrometric requirements — equipment placement should be justified by moisture readings and affected material type, not a flat per-room assumption. Cite the specific moisture log entries supporting the equipment run time actually used.',
  },
  {
    scenario: "Adjuster claims a line item is 'not typical' for the region",
    rebuttal:
      'RIA guidelines and current Xactimate pricing already reflect regional pricing data — point to the specific price list/region code in use rather than arguing typicality in the abstract.',
  },
  {
    scenario: 'Adjuster disputes mold remediation scope size',
    rebuttal:
      'IICRC S520 ties containment and remediation scope to the assessed contamination level (Condition 1/2/3), not just visible staining. Reference the environmental assessment or visual inspection notes that justify the scope written.',
  },
  {
    scenario: 'Adjuster wants to depreciate or exclude code-required items',
    rebuttal:
      'Code upgrade items should be tied to the specific code section triggering the requirement (cite the local building code reference used), not treated as optional betterment.',
  },
]

export const GENERAL_RESOURCES = [
  { title: 'IICRC — Official Standards', url: 'https://www.iicrc.org' },
  { title: 'Restoration Industry Association (RIA)', url: 'https://restorationindustry.org' },
  { title: 'Xactimate', url: 'https://www.xactware.com' },
]

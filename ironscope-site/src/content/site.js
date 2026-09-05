/**
 * Site-wide content. Keeping copy here (rather than inline in templates) means
 * the marketing text can be edited without touching component logic, and the
 * same list can feed more than one view.
 */

export const company = {
  name: 'Iron Scope',
  legalName: 'Iron Scope LLC',
  tagline: 'Professional. Accurate. Defensible.',
  description:
    'Independent Xactimate estimate writing for restoration and mitigation contractors. Fast turnaround, IICRC certified, backed by 30+ years of industry experience.',
}

export const primaryNav = [
  { label: 'Pricing', to: '/pricing' },
  { label: 'Requirements', to: '/requirements' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
]

export const legalNav = [
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'EULA', to: '/eula' },
  { label: 'Service Agreement', to: '/agreement' },
]

export const hero = {
  eyebrow: 'Independent Xactimate Estimating',
  title: ['Precision scopes.', 'Decades of experience.', 'Carrier-compliant.'],
  body: 'Our leadership team carries decades of industry experience, working with TPAs and IICRC certified across the board. Every scope we write reflects the precision that comes from having done the restoration work firsthand — accurate, well-documented, and carrier-compliant, using current Xactimate pricing and industry standards.',
  stats: [
    { value: '30+', label: 'Years industry experience' },
    { value: '24–48', label: 'Hour standard turnaround' },
    { value: 'IICRC', label: 'Certified across the board' },
  ],
}

export const steps = [
  {
    n: '01',
    title: 'Submit Your Request',
    body: 'Give us the loss details, carrier information, and supporting documentation — photos, moisture readings, and a 3D scan. The more complete the submission, the more precisely we can scope it the first time.',
  },
  {
    n: '02',
    title: 'We Write the Scope',
    body: 'Every line item is written against current Xactimate pricing and the applicable IICRC standard for the loss type, with decades of combined field experience behind each decision — not a generic template applied to your job.',
  },
  {
    n: '03',
    title: 'You Get a Carrier-Compliant Estimate',
    body: 'A completed ESX file, documented and structured to hold up to adjuster scrutiny, delivered on the turnaround you’d expect from people who’ve actually done the restoration work themselves.',
  },
  {
    n: '04',
    title: 'We Stand Behind It',
    body: 'Revisions and supplement preparation are included if a carrier pushes back, so your scope stays defensible without starting over.',
  },
]

export const included = [
  'Complete Xactimate Estimate',
  'Scope Review & Verification',
  'Insurance-Compliant Line Item Documentation',
  'Building Code & Manufacturer Research',
  'Estimate Revisions',
  'Supplement Preparation',
  'Adjuster Question Support',
  'ESX File Delivery',
  'Contractor & Client Consultation',
]

export const includedNote =
  'Free-tier estimates (your first 3, under $10,000) include the estimate itself — revisions and support above aren’t guaranteed on those.'

export const projectTypes = [
  'Water Damage Restoration',
  'Fire & Smoke Damage',
  'Mold Remediation',
  'Sewage Losses',
  'Reconstruction',
  'Roofing',
  'Commercial Losses',
  'Residential Repairs',
  'Insurance Supplements',
]

export const turnaround = [
  { value: '24–48 hrs', label: 'Standard Estimates' },
  { value: '2–5 days', label: 'Large Losses' },
  { value: 'On Request', label: 'Rush Service' },
]

export const credentials = [
  { label: '30+ Years Industry Experience' },
  { label: 'IICRC Certified', href: 'https://www.iicrc.org', external: true },
  { label: 'TPA Relationships' },
]

export const pullQuote =
  'We understand both the restoration industry and the insurance claims process. Every estimate is prepared with attention to accuracy, documentation, and carrier compliance.'

export const additionalServices = [
  {
    title: 'Estimate Audits',
    body: 'A second set of eyes on scope you already have — line items, pricing, and documentation checked against current standards.',
  },
  {
    title: 'Change Order Documentation',
    body: 'Scope changes captured and documented as they happen, so mid-job adjustments are defensible when the carrier reviews them.',
  },
  {
    title: 'Project Consulting',
    body: 'Guidance on complex or high-value losses where the approach to scoping determines whether the job is profitable.',
  },
]

export const pricingSummary = {
  title: 'Pricing',
  body: 'Sign up free — your first 3 small estimates (under $10,000) don’t cost a thing, so you can see how we write before committing to anything. Free estimates are the estimate itself. Pricing beyond the free tier scales with your project’s approved RCV.',
  note: 'Create an account to view current rates and start submitting requests.',
}

/* ---- About ------------------------------------------------------------- */

export const about = {
  eyebrow: 'About Us',
  title: 'Estimators, not scribes.',
  lede: 'Iron Scope was built on the belief that a restoration company should be paid fairly and quickly for the work it performs — and that takes real field experience, not just software fluency.',
  storyEyebrow: 'Our Story',
  story:
    'Decades in restoration, insurance, and Xactimate — brought together under one roof.',
  teamNote: 'Team bios coming soon — check back shortly.',
}

/* ---- Requirements ------------------------------------------------------- */

export const requirements = {
  eyebrow: 'Before You Submit',
  title: 'What We Need From You',
  lede: 'Accurate estimates — delivered on the timelines we commit to — depend on getting complete information up front. Here’s what we ask of every contractor we work with.',
  callout:
    'Our turnaround commitments start once we’ve received everything below. Incomplete submissions may extend delivery time.',
  groups: [
    {
      title: 'Documentation We Need',
      items: [
        'Clear photos of all affected areas, taken before mitigation equipment is removed',
        'Moisture readings and mapping for water losses (with meter type noted)',
        'Video walkthrough for larger or more complex losses',
        'A sketch or floor plan of the affected structure, when available',
        'A 360 scan from Matterport, DocuSketch, or HOVER — required with every submission',
        'Equipment placement log — type, count, and dates in service',
        'Date and cause of loss, and category/class if already determined',
        'Any prior inspection reports or notes from techs on-site',
      ],
    },
    {
      title: 'Account & Credentials',
      items: [
        'Active contractor license in your operating state',
        'General liability insurance in good standing',
        'A completed Iron Scope account with accurate company and contact info',
        'Carrier and claim number, when assigned, submitted with the request',
      ],
    },
    {
      title: 'Communication & Response Times',
      items: [
        'Respond to information requests within 24 hours — our turnaround clock is measured from when we have everything we need',
        'Flag rush requests at submission, not after the standard window has started',
        'Route all revision and supplement requests through your account so they’re tracked',
        'Let us know promptly if a claim number, adjuster, or scope changes mid-job',
      ],
    },
  ],
}

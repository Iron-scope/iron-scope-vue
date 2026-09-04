/**
 * FAQ entries. `home: true` marks the subset surfaced on the landing page —
 * one source of truth, two placements.
 */
export const faqs = [
  {
    q: 'What is Iron Scope?',
    a: 'Iron Scope is an independent Xactimate estimating service for restoration contractors and mitigation companies. Our leadership team has over 30 years of combined industry experience and is IICRC certified — we write the estimate, you focus on the job.',
    home: true,
  },
  {
    q: 'Who is your client — the contractor or the homeowner?',
    a: 'The contractor. We’re engaged by and work for the restoration or mitigation company, not the policyholder. Every estimate we prepare is reviewed, approved, and submitted by the contractor — we don’t represent homeowners in their insurance claims.',
    home: true,
  },
  {
    q: 'How does the process work?',
    a: 'You submit your loss details, photos, and documentation through your account. We review the scope, write a complete Xactimate estimate, and deliver it back to you as a ready-to-submit ESX file — typically within 24-48 hours for standard losses.',
    home: true,
  },
  {
    q: 'How fast will I get my estimate?',
    a: 'Standard estimates are delivered in 24-48 hours. Larger or more complex losses typically take 2-5 business days. Rush service is available on request if you’re up against a deadline.',
    home: true,
  },
  {
    q: 'What’s included with every estimate?',
    a: 'Every estimate includes scope review and verification, insurance-compliant line item documentation, building code and manufacturer research, revisions, supplement preparation, adjuster question support, and the final ESX file. Rebuttal and dispute support is available through our Ironclad tier.',
    home: true,
  },
  {
    q: 'How is pricing calculated?',
    a: 'Our fee scales with the approved project value (RCV) rather than a flat rate per job — that keeps pricing fair on small jobs and proportional on large ones. Full pricing details are available to subscribers on our pricing page.',
    home: true,
  },
  {
    q: 'Do I need a subscription?',
    a: 'No — signing up is free, and you can submit and track requests right away. Your first 3 small estimates (under $10,000 RCV) don’t cost anything, though they’re the estimate itself only — not guaranteed revisions or Ironclad support. A paid Ironclad subscription is available separately if you want rebuttal support and guaranteed SLAs on an ongoing basis, but it’s optional.',
  },
  {
    q: 'What if I need help with a free estimate after I submit it?',
    a: 'You can upgrade that specific request to Ironclad after the fact — no deposit required, since it already went out for free. You’ll owe the standard estimate fee based on the final approved RCV once the carrier settles, not upfront. This is meant as a safety net if a carrier pushes back harder than expected, not a way to get ongoing Ironclad coverage — for that, the monthly subscription is the better fit.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. If you subscribe to Ironclad, there’s no long-term contract — you can manage or cancel it at any time. Your base account itself never requires a subscription.',
  },
  {
    q: 'What types of losses do you handle?',
    a: 'Water damage, fire and smoke, mold remediation, sewage losses, reconstruction, roofing, commercial losses, residential repairs, and insurance supplements.',
  },
  {
    q: 'Will you work directly with adjusters or TPAs?',
    a: 'You stay the point of contact with the carrier or TPA — that’s part of keeping the relationship where it belongs, with you and your client. What we provide is the ammunition: documentation and technical support you can bring to those conversations. Our Ironclad tier goes further, building a full rebuttal package for disputed line items for you to present.',
  },
  {
    q: 'What industry standards back your estimates?',
    a: 'Restoration Industry Association (RIA) guidelines and IICRC S500 (water damage), S520 (mold), S540 (trauma and biohazard), and S700 (fire and smoke) standards, along with manufacturer specifications and local building codes. Ironclad rebuttal packages cite these directly, so disputed line items are backed by named industry sources — not just our word.',
  },
  {
    q: 'Why not just write the estimate myself?',
    a: 'You can — but Xactimate has thousands of line items, and knowing which ones apply to a given loss (and how to document them so a carrier approves them without a fight) takes real field experience. Every hour spent behind a screen writing scope is an hour not spent running jobs or closing new business.',
  },
  {
    q: 'What if the carrier pushes back on the estimate?',
    a: 'Revisions and supplement preparation are included with every estimate, so we’ll help you document and defend a disputed line item. If you want a fully built rebuttal package — standards citations and dollar impact ready to present yourself — that’s included with our Ironclad tier.',
  },
  {
    q: 'What format will I receive?',
    a: 'You’ll receive a complete ESX file, ready to import directly into Xactimate, along with a PDF copy for your records.',
  },
]

export const homeFaqs = faqs.filter((f) => f.home)

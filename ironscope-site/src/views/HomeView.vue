<script setup>
import SealMark from '@/components/SealMark.vue'
import StandardGlyph from '@/components/StandardGlyph.vue'
import TextureArt from '@/components/TextureArt.vue'

/**
 * Every figure here has to be something the contractor gets, not something we
 * are. A years-in-the-field number is a claim about us and buys nothing — it
 * was cut for that reason; don't reintroduce it.
 */
const stats = [
  { v: '24–48', u: 'hr', k: 'Standard turnaround' },
  { v: '$100K', u: '+', k: 'Large loss, handled' },
  { v: '3', u: 'free', k: 'To start, on us' },
]

const boundary = [
  { us: 'Write the scope to the documented conditions', them: 'Negotiate the claim with the carrier' },
  { us: 'Cite the standard that governs the loss type', them: 'Settle or compromise on your behalf' },
  { us: 'Deliver an ESX file and a carrier-ready PDF', them: 'Speak to the adjuster as your agent' },
  { us: 'Build supplements and revisions for you to file', them: 'Hold a public adjuster licence' },
]

const intake = [
  { k: 'Photographs', v: 'Every affected area, before the equipment comes out' },
  { k: 'Moisture record', v: 'Readings and mapping, meter type noted' },
  { k: '3D scan', v: 'Matterport, DocuSketch, or HOVER' },
  { k: 'Equipment log', v: 'Type, count, dates in service' },
  { k: 'Loss detail', v: 'Date, cause, category and class' },
]

const deliverable = [
  { k: 'Format', v: 'ESX file + carrier-ready PDF' },
  { k: 'Price list', v: 'Yours, with your O&P' },
  { k: 'Standard', v: '24–48 hours' },
  { k: 'Large loss', v: '2–5 business days' },
  { k: 'Revisions', v: 'Included' },
]

/**
 * `body` is the issuing organisation, `id` the designation. Both are shown —
 * a bare "S500" means nothing to anyone outside the trade, and the whole point
 * of naming a standard is that the carrier recognises the citation.
 */
const standards = [
  { body: 'IICRC', id: 'S500', desc: 'Water damage restoration' },
  { body: 'IICRC', id: 'S520', desc: 'Mold remediation' },
  { body: 'IICRC', id: 'S540', desc: 'Trauma and biohazard' },
  { body: 'IICRC', id: 'S700', desc: 'Fire and smoke damage' },
]
// RIA is named in the supporting line instead of the badge row: it publishes
// guidance, not a numbered standard, so it breaks the designation shape.
</script>

<template>
  <!-- ═══════════ HERO ═══════════ -->
  <section class="relative overflow-hidden">
    <!-- The seal, oversized and bled off the edge. It is the only graphic
         asset that exists, so it gets used at scale rather than as a trinket. -->
    <div
      class="pointer-events-none absolute -top-24 -right-40 hidden opacity-[0.055] lg:block"
      aria-hidden="true"
    >
      <SealMark :size="760" class="text-ink" />
    </div>

    <div class="shell relative py-20 lg:py-28">
      <p class="label tick text-rust">Independent Xactimate estimating</p>

      <h1 class="display-1 mt-10 max-w-[16ch] text-ink">
        Scopes that <span class="text-rust">hold up</span> when the carrier
        pushes back.
      </h1>

      <p class="lede mt-8 max-w-2xl text-ink-2">
        We write to the conditions your documentation supports, cited to the
        standard that governs the loss. Not padded, not guessed — built to clear
        desk review the first time.
      </p>

      <div class="mt-10 flex flex-wrap items-center gap-4">
        <RouterLink to="/register" class="btn btn-signal">Send a file</RouterLink>
        <a href="#fee" class="btn btn-outline">How it works</a>
      </div>
    </div>

    <!-- Stats band: forest field, big figures. -->
    <div class="bg-forest text-on-dark">
      <div class="shell grid grid-cols-2 gap-x-8 gap-y-10 py-12 sm:grid-cols-3 lg:py-14">
        <div v-for="s in stats" :key="s.k">
          <p class="figure text-[clamp(2.25rem,1.4rem+2.6vw,3.25rem)]">
            {{ s.v }}<span class="ml-1 text-[0.45em] text-signal">{{ s.u }}</span>
          </p>
          <p class="label mt-3 text-on-dark-muted">{{ s.k }}</p>
        </div>
      </div>
    </div>
  </section>

  <!--
    ═══════════ STANDARDS ═══════════
    Composed as a header row over a full-width badge wall. The earlier version
    put a display headline in a 4-of-12 column, which wrapped it to five cramped
    lines and left the right two-thirds of the section empty below the badges.
    Headline and supporting copy now sit side by side across the top, and the
    designations run the full measure underneath as the centrepiece.
  -->
  <section id="standards" class="scroll-mt-24">
    <div class="shell py-20 lg:py-28">
      <p class="label tick text-rust">Authority</p>

      <div class="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-16">
        <h2 class="display-2 text-ink lg:col-span-7">
          Every disputed line traces to a standard.
        </h2>
        <div class="lg:col-span-5">
          <p class="text-[16px] leading-relaxed text-ink-2">
            Adjusters assess whether documented procedure conforms to accepted
            industry standards. Naming the standard is not decoration — it is
            the grammar of the argument, and it is the difference between a line
            item you can defend and one you can only insist on.
          </p>
        </div>
      </div>

      <!--
        Carbon-filled so the designations carry weight on a cream field. Outlined
        boxes read as placeholders here; solid ones read as certification.
      -->
      <ul class="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        <li
          v-for="s in standards"
          :key="s.id"
          class="relative overflow-hidden rounded-card bg-carbon text-on-dark"
        >
          <p class="label border-b border-on-dark-rule px-5 py-2.5 text-[10px] text-signal">
            {{ s.body }}
          </p>

          <!-- Watermark sits FULLY inside the badge. It used to bleed off the
               corner, which cut the S540 cell mid-curve and read as a rendering
               fault rather than a crop — the droplet and flame taper and survive
               that, a round form does not. Colour is set inside the glyph. -->
          <StandardGlyph
            :kind="s.id"
            class="pointer-events-none absolute right-3 bottom-3 h-24 w-24 opacity-[0.22]"
          />

          <div class="relative px-5 pt-5 pb-6">
            <p class="figure text-[clamp(2rem,1.4rem+1.4vw,2.75rem)] leading-none">
              {{ s.id }}
            </p>
            <p class="mt-3 text-[14px] leading-snug text-on-dark-muted">
              {{ s.desc }}
            </p>
          </div>
        </li>
      </ul>

      <p class="mt-8 max-w-2xl text-[14.5px] leading-relaxed text-muted">
        Cited alongside Restoration Industry Association guidance, manufacturer
        specification and local building code — so a disputed line is backed by
        a named source rather than an opinion.
      </p>
    </div>
  </section>

  <!--
    ═══════════ THE FEE ═══════════
    Inset rather than page: with Authority moved up to position two, three cream
    sections were stacking between the hero's forest band and the carbon one.
    The tint separates fee from standards without spending a third dark band.

    Band rhythm down the page:
      hero cream → forest stats → standards cream → fee INSET
      → the line CARBON → intake cream → large loss SIGNAL → submit FOREST
  -->
  <section id="fee" class="relative scroll-mt-24 overflow-hidden bg-inset">
    <!-- The left column runs out well before the band does, so the assembly
         detail has somewhere to sit that is genuinely clear of text. -->
    <TextureArt
      variant="section"
      class="art-fade pointer-events-none absolute -bottom-40 -left-40 hidden h-[64rem] w-[64rem] text-ink opacity-[0.09] xl:block"
      style="--art-x: 22%; --art-y: 80%; --art-r: 105%"
    />

    <div class="relative shell grid gap-12 py-20 lg:grid-cols-12 lg:gap-20 lg:py-28">
      <div class="lg:col-span-5">
        <p class="label tick text-rust">How it works</p>
        <!-- Kept short on purpose: all-caps display runs long, and this ran to
             six lines before it was cut back. -->
        <h2 class="display-2 mt-8 text-ink">Priced on the job. Not your settlement.</h2>
      </div>

      <div class="lg:col-span-7">
        <p class="lede text-ink-2">
          <strong class="font-semibold text-ink">One rate. No tiers.</strong>
          2.25% of the approved RCV, $175 minimum — the same percentage on a
          $12,000 water loss as on a $90,000 rebuild. Nothing to look up, no
          band to land in.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <RouterLink
            to="/pricing"
            class="text-[15.5px] font-semibold text-rust underline underline-offset-4 hover:text-ink"
          >
            See the full rate &amp; work out a job →
          </RouterLink>
        </div>

        <div class="mt-10 grid gap-8 sm:grid-cols-2">
          <div class="border-t-2 border-ink pt-5">
            <p class="label text-ink">What that means</p>
            <p class="mt-3 text-[15.5px] leading-relaxed text-ink-2">
              The scope carries what your documentation supports. Nothing is
              added to lift the RCV — a line the carrier strikes costs you a
              revision cycle and costs us the relationship.
            </p>
          </div>
          <div class="border-t-2 border-rust pt-5">
            <p class="label text-rust">What it does not</p>
            <p class="mt-3 text-[15.5px] leading-relaxed text-ink-2">
              We hold no interest in your settlement, take no contingency, and
              are paid whether or not the carrier pays you. Your claim proceeds
              are yours.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!--
    ═══════════ THE LINE — carbon field ═══════════
    Header row over a full-width table, same correction as Authority: the
    display heading was boxed into 4 of 12 columns, wrapping to four cramped
    lines with half the band empty beneath the list.
  -->
  <section id="boundary" class="relative scroll-mt-24 overflow-hidden bg-carbon text-on-dark">
    <!-- No background artwork in this band on purpose. A header row plus a
         full-width four-row table leaves nowhere for art to sit that is not
         behind type, and drafting rules interfere with body copy at any
         opacity. Texture lives in the bands that have air. -->

    <div class="relative shell py-20 lg:py-28">
      <p class="label tick text-signal">The line</p>

      <div class="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-16">
        <h2 class="display-2 lg:col-span-6">We are not a public adjuster.</h2>
        <p class="text-[16px] leading-relaxed text-on-dark-muted lg:col-span-6">
          You stay the contractor of record and the point of contact with the
          carrier. Every estimate we prepare is reviewed, approved and submitted
          by you. That boundary protects your licence as much as it defines our
          work.
        </p>
      </div>

      <!-- Column heads make the two sides scannable without reading a row -->
      <div class="mt-14 hidden grid-cols-2 gap-8 border-b border-on-dark-rule pb-3 sm:grid">
        <p class="label text-signal">What we do</p>
        <p class="label text-on-dark-muted">What we never do</p>
      </div>

      <ul>
        <li
          v-for="row in boundary"
          :key="row.us"
          class="grid gap-2 border-b border-on-dark-rule py-5 sm:grid-cols-2 sm:gap-8"
        >
          <p class="text-[16px] leading-snug">{{ row.us }}</p>
          <p class="flex gap-3 text-[16px] leading-snug text-on-dark-muted">
            <span class="label mt-1 shrink-0 text-on-dark-rule sm:hidden">Never</span>
            {{ row.them }}
          </p>
        </li>
      </ul>
    </div>
  </section>

  <!-- ═══════════ IN / OUT ═══════════ -->
  <section id="scope" class="scroll-mt-24">
    <div class="shell grid gap-14 py-16 lg:grid-cols-2 lg:gap-24 lg:py-20">
      <div>
        <p class="label tick text-rust">Intake</p>
        <h2 class="display-3 mt-6 text-ink">What you send us</h2>
        <dl class="mt-8">
          <div
            v-for="row in intake"
            :key="row.k"
            class="grid grid-cols-[8.5rem_1fr] gap-5 border-b border-hairline py-4"
          >
            <dt class="label pt-1 text-muted">{{ row.k }}</dt>
            <dd class="text-[15.5px] leading-snug text-ink">{{ row.v }}</dd>
          </div>
        </dl>
        <p class="mt-6 text-[14px] leading-relaxed text-muted">
          The clock starts when the file is complete.
        </p>
      </div>

      <div>
        <p class="label tick text-rust">Deliverable</p>
        <h2 class="display-3 mt-6 text-ink">What comes back</h2>
        <dl class="mt-8">
          <div
            v-for="row in deliverable"
            :key="row.k"
            class="grid grid-cols-[8.5rem_1fr] gap-5 border-b border-hairline py-4"
          >
            <dt class="label pt-1 text-muted">{{ row.k }}</dt>
            <dd class="text-[15.5px] leading-snug text-ink">{{ row.v }}</dd>
          </div>
        </dl>
        <p class="mt-6 text-[14px] leading-relaxed text-muted">
          Carrier pushes back? Revisions and supplements are included.
        </p>
      </div>
    </div>
  </section>

  <!--
    ═══════════ LARGE LOSS — contained, not full-bleed ═══════════
    Every other section is an edge-to-edge stripe, which is what made the page
    read as a stack of bricks. This one is a contained block sitting ON the
    cream, so it registers as a designed object and gives the eye somewhere to
    land between two full-width bands.
  -->
  <section id="large-loss" class="scroll-mt-24 pb-4">
    <div class="shell">
      <div
        class="relative grid items-center gap-12 overflow-hidden rounded-card bg-signal px-8 py-14 text-ink lg:grid-cols-12 lg:gap-16 lg:px-14 lg:py-16"
      >
        <!-- Floor-plan fragment: what a scope is written against -->
        <TextureArt
          variant="plan"
          class="art-fade pointer-events-none absolute top-1/2 right-0 hidden h-[30rem] w-[30rem] -translate-y-1/2 text-ink opacity-[0.18] lg:block"
          style="--art-x: 78%; --art-y: 50%; --art-r: 85%"
        />

        <div class="relative lg:col-span-7">
          <p class="label">Threshold</p>
          <p class="figure mt-4 text-[clamp(3.5rem,2rem+6vw,6rem)]">$100K+</p>
          <h2 class="display-3 mt-5 max-w-lg">
            Past six figures the rate comes down, not up.
          </h2>
        </div>
        <div class="relative lg:col-span-5">
          <p class="text-[16px] leading-relaxed">
            Priced below the standard rate and set with you directly. You get the
            full file: executive summary, daily large-loss reporting, and a
            project management log the desk can follow.
          </p>
          <RouterLink to="/register" class="btn btn-ink mt-8">
            Discuss a large loss
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ SUBMIT — forest field ═══════════ -->
  <section id="submit" class="scroll-mt-24 bg-forest text-on-dark">
    <div class="shell grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-24">
      <div class="hidden lg:col-span-2 lg:block">
        <SealMark :size="132" class="text-on-dark" />
      </div>
      <div class="lg:col-span-6">
        <h2 class="display-2">Send the file. We'll tell you what's missing.</h2>
        <p class="mt-6 max-w-lg text-[16px] leading-relaxed text-on-dark-muted">
          Your first three estimates under $10,000 RCV are free — read our work
          before you commit to anything. No card, no subscription.
        </p>
      </div>
      <div class="flex flex-wrap gap-4 lg:col-span-4 lg:justify-end">
        <RouterLink to="/register" class="btn btn-signal">Create an account</RouterLink>
        <RouterLink to="/login" class="btn btn-outline-light">Log in</RouterLink>
      </div>
    </div>
  </section>
</template>

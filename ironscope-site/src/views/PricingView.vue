<script setup>
import { ref, computed } from 'vue'
import SealMark from '@/components/SealMark.vue'
import TextureArt from '@/components/TextureArt.vue'

/**
 * The published model, in full:
 *
 *   2.25% of approved RCV, $175 minimum, 25% due at submission.
 *   Above $100,000 there is no published rate — those are priced directly.
 *
 * Large losses are priced BELOW 2.25%, but the number comes out of a
 * conversation rather than a formula: at that size the work varies enough that
 * a published figure would either overcharge the simple files or undercharge
 * the hard ones. $100,000 is also the carriers' own large-loss threshold, so
 * the line sits where the work genuinely changes character.
 *
 * Copy anywhere near large loss must make the direction explicit — "priced
 * below the standard rate", never a vague "better rate", which readers hear as
 * better for us.
 */
const RATE = 0.0225
const MINIMUM = 175
const DEPOSIT_SHARE = 0.25
const QUOTE_ABOVE = 100000

function feeFor(r) {
  if (!r || r > QUOTE_ABOVE) return 0
  return Math.max(MINIMUM, r * RATE)
}

/** RCV below which the minimum binds rather than the rate: $7,778. */
const MIN_BINDS_BELOW = MINIMUM / RATE

/*
 * NOTE: Ironclad (the rebuttal-support subscription and its guaranteed SLAs)
 * has been removed from this page deliberately — it is pitched to clients
 * directly rather than sold off a rate card. Nothing about it should reappear
 * here without that decision being revisited.
 */

/* ── Calculator ─────────────────────────────────────────────────────────── */

const rcvInput = ref('45000')

const rcv = computed(() => {
  const n = Number(String(rcvInput.value).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 0
})

const fee = computed(() => feeFor(rcv.value))
const isLargeLoss = computed(() => rcv.value > QUOTE_ABOVE)

// 25% of the fee, never below the minimum, never more than the fee itself.
const deposit = computed(() =>
  rcv.value ? Math.min(fee.value, Math.max(MINIMUM, fee.value * DEPOSIT_SHARE)) : 0,
)

const balance = computed(() => fee.value - deposit.value)
const onMinimum = computed(() => rcv.value > 0 && rcv.value < MIN_BINDS_BELOW)

const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

/* Worked examples, derived from the same function the calculator uses. */
const examples = [5000, 18000, 45000, 75000, 100000].map((r) => {
  const f = feeFor(r)
  const d = Math.min(f, Math.max(MINIMUM, f * DEPOSIT_SHARE))
  return { rcv: r, fee: f, deposit: d, balance: f - d }
})
</script>

<template>
  <!-- ═══════════ HERO ═══════════ -->
  <section class="shell py-20 lg:py-24">
    <p class="label tick text-rust">Pricing</p>
    <h1 class="display-1 mt-10 max-w-[17ch] text-ink">
      One rate. <span class="text-rust">No tiers.</span> No surprises.
    </h1>
    <p class="lede mt-8 max-w-2xl text-ink-2">
      The fee follows the approved value of the job — the RCV the carrier signs
      off on. One percentage, no bands to look up. Past $100,000 we price it
      with you directly — at a lower rate, not a higher one.
    </p>
  </section>

  <!-- ═══════════ THE MODEL — three numbers, full bleed ═══════════ -->
  <section class="bg-carbon text-on-dark">
    <div class="shell grid gap-px bg-on-dark-rule py-0 md:grid-cols-3">
      <div class="bg-carbon px-2 py-14 md:px-8">
        <p class="figure text-[clamp(3rem,2rem+3.4vw,4.5rem)]">
          2.25<span class="text-[0.5em] text-signal">%</span>
        </p>
        <p class="label mt-4 text-on-dark-muted">Of approved RCV</p>
        <p class="mt-3 text-[15px] leading-relaxed text-on-dark-muted">
          The same rate on a $12,000 water loss and a $90,000 rebuild. Larger
          jobs are priced below it.
        </p>
      </div>
      <div class="bg-carbon px-2 py-14 md:px-8">
        <p class="figure text-[clamp(3rem,2rem+3.4vw,4.5rem)]">
          <span class="text-[0.5em] text-signal">$</span>175
        </p>
        <p class="label mt-4 text-on-dark-muted">Minimum fee</p>
        <p class="mt-3 text-[15px] leading-relaxed text-on-dark-muted">
          Applies below about $7,800 of RCV. Above that, the rate takes over.
        </p>
      </div>
      <div class="bg-carbon px-2 py-14 md:px-8">
        <p class="figure text-[clamp(3rem,2rem+3.4vw,4.5rem)]">
          25<span class="text-[0.5em] text-signal">%</span>
        </p>
        <p class="label mt-4 text-on-dark-muted">Due at submission</p>
        <p class="mt-3 text-[15px] leading-relaxed text-on-dark-muted">
          A quarter of the fee up front (minimum $175). The balance settles on
          the approved RCV.
        </p>
      </div>
    </div>
  </section>

  <!-- ═══════════ FREE ESTIMATES ═══════════ -->
  <section class="bg-forest text-on-dark">
    <div class="shell grid items-center gap-10 py-14 lg:grid-cols-12 lg:gap-16">
      <div class="lg:col-span-7">
        <p class="label text-signal">Start here</p>
        <h2 class="display-3 mt-4 max-w-xl">
          Your first three small estimates are free.
        </h2>
      </div>
      <p class="text-[15.5px] leading-relaxed text-on-dark-muted lg:col-span-5">
        Requests under $10,000 RCV cost nothing for your first three. After that
        — or on any estimate over $10,000 — the rate above applies. Free
        estimates cover the estimate itself; guaranteed revisions and dispute
        support aren't included on those.
      </p>
    </div>
  </section>

  <!--
    ═══════════ LARGE LOSS — contained, not full-bleed ═══════════
    Matches the homepage treatment. Three edge-to-edge colour stripes ran
    back-to-back here (carbon, forest, signal) with no cream between them;
    containing this one gives the eye somewhere to rest and stops the page
    reading as a stack.
  -->
  <section id="large-loss" class="scroll-mt-24 py-4">
    <div class="shell">
      <div
        class="relative grid items-center gap-12 overflow-hidden rounded-card bg-signal px-8 py-14 text-ink lg:grid-cols-12 lg:gap-16 lg:px-14 lg:py-16"
      >
        <TextureArt
          variant="plan"
          class="art-fade pointer-events-none absolute top-1/2 right-0 hidden h-[30rem] w-[30rem] -translate-y-1/2 text-ink opacity-[0.18] lg:block"
          style="--art-x: 78%; --art-y: 50%; --art-r: 85%"
        />

        <div class="relative lg:col-span-7">
          <p class="label">Over $100,000</p>
          <h2 class="display-2 mt-5 max-w-2xl">Large loss is a conversation.</h2>
          <p class="mt-6 max-w-xl text-[16px] leading-relaxed">
            Past six figures no single percentage is fair to both sides, so we
            price these below the standard rate and set the number with you. We'd
            rather understand the job and build something that lasts longer than
            one claim.
          </p>
        </div>
        <div class="relative flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
          <RouterLink to="/register" class="btn btn-ink">
            Start the conversation
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══════════ CALCULATOR ═══════════ -->
  <section id="calculator" class="scroll-mt-24 bg-inset">
    <div class="shell grid gap-12 py-20 lg:grid-cols-12 lg:gap-20 lg:py-24">
      <div class="lg:col-span-5">
        <p class="label tick text-rust">Work it out</p>
        <h2 class="display-2 mt-8 text-ink">What a job costs</h2>
        <p class="mt-6 text-[15.5px] leading-relaxed text-ink-2">
          Enter an approved RCV. An estimate, not a quote — the final fee is set
          by the value the carrier actually approves.
        </p>

        <label class="label mt-10 block text-ink" for="rcv">Approved RCV</label>
        <div class="mt-3 flex items-center gap-2 border-b-2 border-ink pb-2">
          <span class="figure text-[2rem] text-muted">$</span>
          <input
            id="rcv"
            v-model="rcvInput"
            type="text"
            inputmode="numeric"
            class="figure w-full bg-transparent text-[2.5rem] text-ink outline-none"
            aria-describedby="rcv-help"
          />
        </div>
        <p id="rcv-help" class="mt-3 text-[14px] text-muted">
          <template v-if="isLargeLoss">
            Over $100,000 — <strong class="text-ink">priced below 2.25%</strong>, set with you directly.
          </template>
          <template v-else-if="onMinimum">
            Below $7,800 the <strong class="text-ink">$175 minimum</strong> applies.
          </template>
          <template v-else-if="rcv">
            Charged at <strong class="text-ink">2.25%</strong> of approved RCV.
          </template>
          <template v-else>Enter a value to see the fee.</template>
        </p>
      </div>

      <div class="lg:col-span-7">
        <!-- Over $100,000 the calculator stops rather than inventing a number.
             Showing a figure we would not honour is worse than showing none. -->
        <div v-if="isLargeLoss" class="bg-carbon p-8 text-on-dark sm:p-10">
          <p class="label text-signal">Large loss</p>
          <p class="display-3 mt-4 max-w-md">
            Above $100,000 the number comes from a conversation, not a formula.
          </p>
          <p class="mt-5 max-w-lg text-[15.5px] leading-relaxed text-on-dark-muted">
            Files this size vary too much for one rate to be fair to both of
            us, and they're priced below 2.25%. Tell us what you have and we'll
            work out the number together.
          </p>
          <div class="mt-8 flex flex-wrap gap-4">
            <RouterLink to="/register" class="btn btn-signal">Talk to us</RouterLink>
          </div>
        </div>

        <div v-else class="grid gap-px bg-rule/40 sm:grid-cols-3">
          <div class="bg-page p-7">
            <p class="label text-muted">Total fee</p>
            <p class="figure mt-4 text-[clamp(2rem,1.4rem+1.8vw,2.75rem)] text-ink">
              {{ rcv ? money(fee) : '—' }}
            </p>
          </div>
          <div class="bg-page p-7">
            <p class="label text-muted">At submission</p>
            <p class="figure mt-4 text-[clamp(2rem,1.4rem+1.8vw,2.75rem)] text-ink">
              {{ rcv ? money(deposit) : '—' }}
            </p>
          </div>
          <div class="bg-page p-7">
            <p class="label text-muted">On approval</p>
            <p class="figure mt-4 text-[clamp(2rem,1.4rem+1.8vw,2.75rem)] text-ink">
              {{ rcv ? money(balance) : '—' }}
            </p>
          </div>
        </div>

        <!-- Worked examples, derived from the same constants as the calculator -->
        <table class="mt-10 w-full border-collapse text-left">
          <caption class="label mb-4 text-left text-muted">
            Worked examples
          </caption>
          <thead>
            <tr class="border-b-2 border-ink">
              <th scope="col" class="label py-3 pr-4 text-ink">Approved RCV</th>
              <th scope="col" class="label py-3 pr-4 text-right text-ink">Fee</th>
              <th scope="col" class="label py-3 pr-4 text-right text-ink">At submission</th>
              <th scope="col" class="label py-3 text-right text-ink">On approval</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in examples" :key="e.rcv" class="border-b border-hairline">
              <td class="py-3.5 pr-4 text-[16px] font-semibold text-ink">{{ money(e.rcv) }}</td>
              <td class="py-3.5 pr-4 text-right text-[16px] text-ink-2">{{ money(e.fee) }}</td>
              <td class="py-3.5 pr-4 text-right text-[16px] text-ink-2">{{ money(e.deposit) }}</td>
              <td class="py-3.5 text-right text-[16px] text-ink-2">{{ money(e.balance) }}</td>
            </tr>
            <tr class="border-b border-hairline">
              <td class="py-3.5 pr-4 text-[16px] font-semibold text-ink">Over $100,000</td>
              <td colspan="3" class="py-3.5 text-right text-[16px] font-semibold text-rust">
                Priced with you directly
              </td>
            </tr>
          </tbody>
        </table>

        <p class="mt-6 border-l-4 border-rust bg-page px-5 py-4 text-[14.5px] leading-relaxed text-ink-2">
          Figures are calculated from the published rate for guidance only.
          Nothing here is a binding quote, and no payment is taken on this page.
        </p>
      </div>
    </div>
  </section>

  <!--
    ═══════════ CLOSING ═══════════
    The page previously ended on the calculator, which leaves someone who has
    just worked out their number with nowhere to go. Mirrors the homepage's
    closing band so the two pages end the same way.
  -->
  <section class="bg-forest text-on-dark">
    <div class="shell grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-24">
      <div class="hidden lg:col-span-2 lg:block">
        <SealMark :size="132" class="text-on-dark" />
      </div>
      <div class="lg:col-span-6">
        <h2 class="display-2">Start with three on us.</h2>
        <p class="mt-6 max-w-lg text-[16px] leading-relaxed text-on-dark-muted">
          Your first three estimates under $10,000 RCV are free. No card, no
          subscription — read our work, then decide.
        </p>
      </div>
      <div class="flex flex-wrap gap-4 lg:col-span-4 lg:justify-end">
        <RouterLink to="/register" class="btn btn-signal">Create an account</RouterLink>
        <RouterLink to="/login" class="btn btn-outline-light">Log in</RouterLink>
      </div>
    </div>
  </section>
</template>

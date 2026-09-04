<script setup>
import SealMark from '@/components/SealMark.vue'

const year = new Date().getFullYear()

const columns = [
  {
    head: 'Service',
    links: [
      { label: 'Scope of Work', href: '/#scope' },
      { label: 'Large Loss — $100K+', href: '/#large-loss' },
      { label: 'Supplements & Revisions', href: '/#scope' },
      { label: 'What We Need From You', href: '/#scope' },
    ],
  },
  {
    head: 'Position',
    links: [
      { label: 'Standards We Cite', href: '/#standards' },
      { label: 'Pricing', href: '/pricing', route: true },
      { label: 'How It Works', href: '/#fee' },
      { label: 'Not a Public Adjuster', href: '/#boundary' },
    ],
  },
  {
    head: 'Record',
    links: [
      { label: 'Terms & Conditions', href: '/terms' },
      { label: 'EULA', href: '/eula' },
      { label: 'Service Agreement', href: '/agreement' },
    ],
  },
  {
    head: 'Company',
    links: [
      { label: 'About', href: '/about', route: true },
      { label: 'Requirements', href: '/requirements', route: true },
      { label: 'FAQ', href: '/faq', route: true },
      { label: 'Contact', href: '/contact', route: true },
    ],
  },
]
</script>

<template>
  <footer class="mt-auto border-t border-hairline bg-carbon text-on-dark">
    <div class="shell py-16">
      <div class="grid gap-12 md:grid-cols-12">
        <div class="md:col-span-12 lg:col-span-4">
          <div class="flex items-start gap-4">
            <SealMark :size="56" class="text-on-dark" />
            <div>
              <p class="text-[19px] leading-tight font-extrabold tracking-[-0.02em] uppercase">Iron Scope LLC</p>
              <p class="label mt-2 text-on-dark-muted">Oregon limited liability company</p>
            </div>
          </div>
          <p class="mt-6 max-w-sm text-[15px] leading-relaxed text-on-dark-muted">
            Independent Xactimate scopes for restoration and mitigation
            contractors. We write the estimate. You stay the contractor of
            record.
          </p>
        </div>

        <nav
          v-for="col in columns"
          :key="col.head"
          class="md:col-span-6 lg:col-span-2"
          :aria-label="col.head"
        >
          <h2 class="label text-on-dark-muted">{{ col.head }}</h2>
          <ul class="mt-4 space-y-2.5">
            <li v-for="l in col.links" :key="l.label">
              <component
                :is="l.route ? 'RouterLink' : 'a'"
                v-bind="l.route ? { to: l.href } : { href: l.href }"
                class="text-[15px] text-on-dark/85 transition-colors duration-150 hover:text-on-dark"
              >
                {{ l.label }}
              </component>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Colophon. Document-register convention; very high authority per byte. -->
      <div
        class="mt-14 flex flex-col gap-4 border-t border-on-dark-rule pt-6 md:flex-row md:items-baseline md:justify-between"
      >
        <p class="label text-[11px] text-on-dark-muted">
          &copy; {{ year }} Iron Scope LLC · All rights reserved
        </p>
        <p class="label text-[11px] text-on-dark-muted">
          Iron Scope is not a licensed public adjuster and does not negotiate,
          settle, or communicate with carriers on a policyholder's behalf.
        </p>
      </div>
    </div>
  </footer>
</template>

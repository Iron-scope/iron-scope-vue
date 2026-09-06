<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSession } from '@/composables/useSession'
import { signOut } from '@/lib/auth'
import { getTierById } from '@/lib/ironcladTiers'

/**
 * Session-aware nav, ported from the real app's components/SiteNav.js --
 * that file's own comment explains why this matters: "pages always showed
 * Log In/Sign Up regardless of actual auth state, and there was no Log Out
 * link anywhere." The anonymous nav below is this app's own (marketing,
 * anchor-based); the signed-in ones mirror SiteNav.js exactly so a staff
 * login sees Queue/Resources/Users, not a customer Dashboard link.
 *
 * `route: true` items are real pages and must render as RouterLink — a plain
 * <a href="/pricing"> would trigger a full document reload. The rest are
 * in-page anchors and stay as <a>.
 */
const anonNav = [
  { label: 'Scope of Work', to: '/#scope' },
  { label: 'Large Loss', to: '/#large-loss' },
  { label: 'Standards', to: '/#standards' },
  { label: 'Pricing', to: '/pricing', route: true },
]
const staffNav = [
  { label: 'Queue', to: '/queue', route: true },
  { label: 'Resources', to: '/admin', route: true },
  { label: 'Users', to: '/admin/users', route: true },
]
// "Subscription" deliberately omitted while Ironclad is paused -- don't
// invite new signups. An existing active subscriber still reaches /upgrade
// via the Ironclad badge's own "Manage plan" link on Dashboard.
const customerNav = [
  { label: 'Dashboard', to: '/dashboard', route: true },
  { label: 'Submit Request', to: '/intake', route: true },
]

const { user, isSignedIn, isStaff, fetchSession } = useSession()
const nav = computed(() => (isStaff.value ? staffNav : isSignedIn.value ? customerNav : anonNav))
const ironcladTier = computed(() =>
  user.value?.subscriptionStatus === 'active' ? getTierById(user.value.ironcladTier) : null
)

const route = useRoute()
const router = useRouter()
const open = ref(false)

async function logOut() {
  await signOut()
  await fetchSession()
  router.push('/')
}

watch(() => route.fullPath, () => (open.value = false))
watch(open, (v) => {
  document.body.style.overflow = v ? 'hidden' : ''
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-hairline bg-page/92 backdrop-blur-[3px]">
    <div class="shell flex h-[76px] items-center justify-between gap-8">
      <!--
        Matches the real site's nav lockup exactly (app/globals.css .brand /
        .brand-logo): the actual raster seal image, not a traced vector, at
        a comparable height, next to uppercase "Iron Scope". Font stays this
        app's own (Archivo) rather than switching to the old site's Sora, so
        the rest of the type system doesn't fork for one label.
      -->
      <RouterLink to="/" class="flex items-center gap-2.5" aria-label="Iron Scope — home">
        <img src="/ironscope-seal-v4.png" alt="" class="h-9 w-auto" />
        <span class="text-[20px] leading-none font-bold uppercase tracking-wide text-ink">Iron Scope</span>
      </RouterLink>

      <nav class="hidden items-center gap-9 lg:flex" aria-label="Primary">
        <span v-if="ironcladTier" class="label rounded-full border border-rule px-3 py-1.5 text-ink-2">
          Ironclad · {{ ironcladTier.name }}
        </span>
        <component
          v-for="item in nav"
          :key="item.to"
          :is="item.route ? 'RouterLink' : 'a'"
          v-bind="item.route ? { to: item.to } : { href: item.to }"
          class="text-[15px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
        >
          {{ item.label }}
        </component>
      </nav>

      <div class="hidden items-center gap-6 md:flex">
        <template v-if="isSignedIn">
          <button type="button" class="text-[15px] font-medium text-ink-2 hover:text-ink" @click="logOut">
            Log out
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="text-[15px] font-medium text-ink-2 hover:text-ink">
            Log in
          </RouterLink>
          <RouterLink to="/register" class="btn btn-signal !py-2.5">Send a file</RouterLink>
        </template>
      </div>

      <button
        type="button"
        class="-mr-1 inline-flex h-10 w-10 items-center justify-center text-ink md:hidden"
        :aria-expanded="open"
        aria-controls="mobile-nav"
        :aria-label="open ? 'Close menu' : 'Open menu'"
        @click="open = !open"
      >
        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path v-if="!open" d="M2 5h16M2 10h16M2 15h16" />
          <path v-else d="M4 4l12 12M16 4L4 16" />
        </svg>
      </button>
    </div>

    <nav
      v-if="open"
      id="mobile-nav"
      class="border-t border-hairline bg-page md:hidden"
      aria-label="Primary"
    >
      <div class="shell flex flex-col py-2">
        <component
          v-for="item in nav"
          :key="item.to"
          :is="item.route ? 'RouterLink' : 'a'"
          v-bind="item.route ? { to: item.to } : { href: item.to }"
          class="border-b border-hairline py-4 text-[17px] font-medium text-ink-2"
          @click="open = false"
        >
          {{ item.label }}
        </component>
        <div class="flex flex-col gap-3 py-5">
          <template v-if="isSignedIn">
            <button type="button" class="btn btn-outline" @click="logOut">Log out</button>
          </template>
          <template v-else>
            <RouterLink to="/register" class="btn btn-signal">Send a file</RouterLink>
            <RouterLink to="/login" class="btn btn-outline">Log in</RouterLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

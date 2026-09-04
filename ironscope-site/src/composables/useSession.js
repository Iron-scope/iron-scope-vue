import { ref, computed } from 'vue'

/**
 * Vue's equivalent of the `session.user.*` fields every current React page
 * gets from NextAuth's getServerSession(). Backed by the same, unchanged
 * /api/auth/session endpoint — just fetched client-side once and cached in
 * module-level (singleton) state so every component sees the same session
 * without re-fetching.
 */
const user = ref(null)
const loading = ref(true)
const loaded = ref(false)

async function fetchSession() {
  loading.value = true
  try {
    const res = await fetch('/api/auth/session', { credentials: 'include' })
    const data = await res.json().catch(() => null)
    user.value = data?.user ?? null
  } catch {
    user.value = null
  } finally {
    loading.value = false
    loaded.value = true
  }
}

export function useSession() {
  return {
    user,
    loading,
    loaded,
    isSignedIn: computed(() => Boolean(user.value)),
    isStaff: computed(() => user.value?.role === 'staff'),
    fetchSession,
  }
}

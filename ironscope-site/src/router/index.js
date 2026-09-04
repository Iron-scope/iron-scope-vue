import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { sessionGuard } from './guards'

/**
 * Home is eager (first paint on nearly every session); everything else is a
 * dynamic import so Rolldown emits it as its own chunk.
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Independent Xactimate Estimating' },
  },
  {
    path: '/pricing',
    name: 'pricing',
    component: () => import('@/views/PricingView.vue'),
    meta: { title: 'Pricing' },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Log in' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Create an account' },
  },
  // The old site used /signup; keep the URL alive rather than 404 it.
  { path: '/signup', redirect: { name: 'register' } },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/ForgotPasswordView.vue'),
    meta: { title: 'Reset your password' },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: { title: 'About' },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FaqView.vue'),
    meta: { title: 'FAQ' },
  },
  {
    path: '/requirements',
    name: 'requirements',
    component: () => import('@/views/RequirementsView.vue'),
    meta: { title: 'Requirements' },
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/ContactView.vue'),
    meta: { title: 'Contact' },
  },
  {
    path: '/terms',
    name: 'terms',
    component: () => import('@/views/LegalView.vue'),
    meta: { title: 'Terms & Conditions', legalSlug: 'terms' },
  },
  {
    path: '/eula',
    name: 'eula',
    component: () => import('@/views/LegalView.vue'),
    meta: { title: 'EULA', legalSlug: 'eula' },
  },
  {
    path: '/agreement',
    name: 'agreement',
    component: () => import('@/views/LegalView.vue'),
    meta: { title: 'Service Agreement', legalSlug: 'agreement' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 96 }
    return { top: 0 }
  },
})

router.beforeEach(sessionGuard)

router.afterEach((to) => {
  const t = to.meta?.title
  document.title = t ? `Iron Scope — ${t}` : 'Iron Scope'
})

export default router

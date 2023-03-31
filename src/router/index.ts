import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../components/Homepage.vue')
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../components/Editor.vue')
    },
    {
      path: '/browse',
      name: 'browser',
      props: {browserName: "Komunitní seznamy"},
      component: () => import('@/components/CommunityLists.vue')
    }
  ]
})

export default router

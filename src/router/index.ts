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
    }
  ]
})

export default router

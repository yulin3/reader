import { createRouter, createWebHistory } from 'vue-router'
import ListView from '@/views/ListView.vue'
import DetailView from '@/views/DetailView.vue'
import ReaderView from '@/views/ReaderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'list',
      component: ListView
    },
    {
      path: '/detail/:id',
      name: 'detail',
      component: DetailView,
      props: true
    },
    {
      path: '/reader/:id/:chapter',
      name: 'reader',
      component: ReaderView,
      props: true
    }
  ]
})

export default router
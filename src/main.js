import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Forum from './views/Forum.vue'
import Search from './views/Search.vue'
import Profile from './views/Profile.vue'
import PostDetail from './views/PostDetail.vue'
import BookDetail from './views/BookDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/forum',
      name: 'forum',
      component: Forum
    },
    {
      path: '/search',
      name: 'search',
      component: Search
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/post/:id',
      name: 'post-detail',
      component: PostDetail
    },
    {
      path: '/book/:id',
      name: 'BookDetail',
      component: BookDetail
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')

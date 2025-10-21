import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Home from './views/Home.vue'
import Forum from './views/Forum.vue'
import Search from './views/Search.vue'

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
    }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')

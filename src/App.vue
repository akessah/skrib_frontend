<template>
  <div id="app">
    <header>
      <nav>
        <div class="nav-brand">
          <router-link to="/">Skrib</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/forum" class="nav-link">Forum</router-link>
          <router-link to="/search" class="nav-link">Search</router-link>
          <router-link v-if="isAuthenticated" to="/profile" class="nav-link">Profile</router-link>
          <div v-if="isAuthenticated" class="notification-bell" @click="toggleNotifications">
            <span class="bell-icon">🔔</span>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </div>
        </div>
        
        <!-- Notification Dropdown -->
        <div v-if="showNotifications && isAuthenticated" class="notification-dropdown">
          <NotificationList 
            :user-id="currentUser"
            @close="showNotifications = false"
          />
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useAuth } from './composables/useAuth.js';
import { useNotifications } from './composables/useNotifications.js';
import NotificationList from './components/NotificationList.vue';

export default {
  name: 'App',
  components: {
    NotificationList
  },
  setup() {
    const { currentUser, isAuthenticated, initializeAuth } = useAuth();
    const { unreadCount, loadUnreadNotifications } = useNotifications();
    const showNotifications = ref(false);
    
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value;
      if (showNotifications.value && currentUser.value) {
        loadUnreadNotifications(currentUser.value);
      }
    };
    
    onMounted(() => {
      initializeAuth();
    });
    
    return {
      currentUser,
      isAuthenticated,
      unreadCount,
      showNotifications,
      toggleNotifications
    };
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-brand a {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-brand a:hover {
  color: #42b983;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #42b983;
}

.nav-link.router-link-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.25rem;
}

.notification-bell {
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.notification-bell:hover {
  background-color: #f8f9fa;
}

.bell-icon {
  font-size: 1.2rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-width: 90vw;
  z-index: 1000;
  margin-top: 0.5rem;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>

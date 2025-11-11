<template>
  <div id="app">
    <header>
      <nav>
        <div class="nav-brand">
          <router-link to="/" class="main-home-link">Skrib</router-link>
        </div>
        <div class="nav-links">
          <!-- <router-link to="/" class="nav-link">Home</router-link> -->
          <router-link to="/forum" class="nav-link">Forum</router-link>
          <router-link to="/search" class="nav-link">Search</router-link>
          <router-link v-if="isAuthenticated" to="/profile" class="nav-link">Profile</router-link>
          <div 
            v-if="isAuthenticated" 
            ref="notificationBell"
            class="notification-bell" 
            @click.stop="toggleNotifications"
          >
            <span class="bell-icon"><img src="../../assets/bell.png" alt="Bell icon" width = "20"></span>
            <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
          </div>
        </div>
        
        <!-- Notification Dropdown -->
        <div 
          v-if="showNotifications && isAuthenticated" 
          ref="notificationDropdown"
          class="notification-dropdown"
          @click.stop
        >
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
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from './composables/useAuth.js';
import { useNotifications } from './composables/useNotifications.js';
import NotificationList from './components/NotificationList.vue';

export default {
  name: 'App',
  components: {
    NotificationList
  },
  setup() {
    const route = useRoute();
    const auth = useAuth();
    const { unreadCount, loadUnreadNotifications } = useNotifications();
    const showNotifications = ref(false);
    const notificationDropdown = ref(null);
    const notificationBell = ref(null);
    
    const toggleNotifications = () => {
      showNotifications.value = !showNotifications.value;
      if (showNotifications.value && auth.currentUser.value) {
        loadUnreadNotifications(auth.currentUser.value);
      }
    };
    
    const closeNotifications = () => {
      showNotifications.value = false;
    };
    
    // Handle clicks outside the notification dropdown
    const handleClickOutside = (event) => {
      if (!showNotifications.value) return;
      
      // Check if click is outside both the dropdown and the bell
      if (
        notificationDropdown.value &&
        !notificationDropdown.value.contains(event.target) &&
        notificationBell.value &&
        !notificationBell.value.contains(event.target)
      ) {
        closeNotifications();
      }
    };
    
    // Watch for route changes to close notifications
    watch(() => route.path, () => {
      closeNotifications();
    });
    
    onMounted(() => {
      auth.initializeAuth();
      // Add click listener to document
      document.addEventListener('click', handleClickOutside);
    });
    
    onUnmounted(() => {
      // Remove click listener when component is unmounted
      document.removeEventListener('click', handleClickOutside);
    });
    
    return {
      currentUser: auth.currentUser,
      isAuthenticated: auth.isAuthenticated,
      unreadCount,
      showNotifications,
      toggleNotifications,
      notificationDropdown,
      notificationBell
    };
  }
}
</script>

<style>
@font-face {
    font-family: rouge-vintage;
    src: url('../assets/RougeVintage.ttf');
}

@font-face {
    font-family: spbutch-lite;
    src: url('../assets/LinLibertine_R.ttf');
}

:root {
  --color-primary: #889841;
  --color-accent: #efbe37;
  --color-warn: #e86830;
  --color-danger: #b52b39;
  --color-purple: #6c4b73;
  --color-text: #2c3e50;
  --color-bg: #fff9ef;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  /* font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; */
  font-family: spbutch-lite, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: var(--color-bg);
}

button {
  font-family: spbutch-lite, Courier New, Courier, monospace;
}

.main-home-link, h1 {
  font-family: rouge-vintage, Courier New, Courier, monospace;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: var(--color-accent);
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
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-brand a:hover {
  color: var(--color-purple);
}

.nav-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  font-size: 2.5rem;
}

.nav-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--color-purple);
}

.nav-link.router-link-active {
  color: var(--color-purple);
  border-bottom: 2px solid var(--color-purple);
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
  background: var(--color-danger);
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

<template>
  <div class="home">
    <h1>Welcome to Skrib</h1>
    <p>Your community for book recommendations and discussions</p>
    
    <div class="home-content">
      <!-- Authentication Section -->
      <div v-if="!isAuthenticated" class="auth-section">
        <h2>Join the Community</h2>
        <p>Please login or register to access all features</p>
        <AuthForm @auth-success="handleAuthSuccess" />
      </div>
      
      <!-- Authenticated User Section -->
      <div v-else class="authenticated-section">
        <div class="user-welcome">
          <h2>Welcome back, {{ currentUsername }}!</h2>
        </div>
        
        <div class="feature-cards">
          <div class="feature-card">
            <h3>📝 Create Posts</h3>
            <p>Share your thoughts and ask for book recommendations</p>
          </div>
          <div class="feature-card">
            <h3>💬 Join Discussions</h3>
            <p>Engage with the community and share your insights</p>
          </div>
          <div class="feature-card">
            <h3>🔍 Discover Books</h3>
            <p>Find your next favorite read through community recommendations</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import AuthForm from '../components/AuthForm.vue';

export default {
  name: 'Home',
  components: {
    AuthForm
  },
  setup() {
    const { currentUsername, isAuthenticated, initializeAuth } = useAuth();

    const handleAuthSuccess = () => {
      // Auth success is handled by the composable
      console.log('Authentication successful');
    };


    onMounted(() => {
      initializeAuth();
    });

    return {
      currentUsername,
      isAuthenticated,
      handleAuthSuccess
    };
  }
}
</script>

<style scoped>
.home {
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.home-content {
  margin-top: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.auth-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.authenticated-section {
  text-align: left;
}

.user-welcome {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.user-welcome h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}


.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.2s;
}

.feature-card:hover {
  transform: translateY(-2px);
}

.feature-card h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.feature-card p {
  color: #666;
  font-size: 1rem;
  margin: 0;
}
</style>

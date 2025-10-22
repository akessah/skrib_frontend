<template>
  <div class="auth-form">
    <div class="auth-tabs">
      <button 
        @click="activeTab = 'login'"
        :class="{ active: activeTab === 'login' }"
        class="tab-btn"
      >
        Login
      </button>
      <button 
        @click="activeTab = 'register'"
        :class="{ active: activeTab === 'register' }"
        class="tab-btn"
      >
        Register
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          required
          :disabled="isSubmitting"
          placeholder="Enter your username"
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          :disabled="isSubmitting"
          placeholder="Enter your password"
        />
      </div>

      <button 
        type="submit" 
        :disabled="isSubmitting || !username.trim() || !password.trim()"
        class="submit-btn"
      >
        {{ isSubmitting ? 'Please wait...' : (activeTab === 'login' ? 'Login' : 'Register') }}
      </button>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth.js';

export default {
  name: 'AuthForm',
  emits: ['auth-success'],
  setup(props, { emit }) {
    const { authenticate, register } = useAuth();
    
    const activeTab = ref('login');
    const username = ref('');
    const password = ref('');
    const isSubmitting = ref(false);
    const error = ref(null);
    const success = ref(null);

    const handleSubmit = async () => {
      if (!username.value.trim() || !password.value.trim()) {
        error.value = 'Please fill in all fields.';
        return;
      }

      isSubmitting.value = true;
      error.value = null;
      success.value = null;

      try {
        const result = activeTab.value === 'login' 
          ? await authenticate(username.value.trim(), password.value.trim())
          : await register(username.value.trim(), password.value.trim());

        if (result.success) {
          success.value = activeTab.value === 'login' 
            ? 'Login successful!' 
            : 'Registration successful!';
          emit('auth-success');
          
          // Clear form
          username.value = '';
          password.value = '';
          
          // Clear success message after 2 seconds
          setTimeout(() => {
            success.value = null;
          }, 2000);
        } else {
          error.value = result.error || 'Authentication failed. Please try again.';
        }
      } catch (err) {
        error.value = 'An unexpected error occurred. Please try again.';
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      activeTab,
      username,
      password,
      isSubmitting,
      error,
      success,
      handleSubmit
    };
  }
};
</script>

<style scoped>
.auth-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: 0 auto;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e1e5e9;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: #2c3e50;
}

.tab-btn.active {
  color: #42b983;
  border-bottom-color: #42b983;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.submit-btn {
  width: 100%;
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #369870;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #fcc;
}

.success-message {
  background-color: #efe;
  color: #363;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #cfc;
}
</style>

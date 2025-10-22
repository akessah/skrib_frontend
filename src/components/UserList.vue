<template>
  <div class="user-list">
    <div class="user-list-header">
      <h3>All Users</h3>
      <button 
        @click="loadUsers" 
        :disabled="isLoading"
        class="refresh-btn"
      >
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>
    
    <div v-if="isLoading && users.length === 0" class="loading">
      <p>Loading users...</p>
    </div>
    
    <div v-else-if="users.length === 0" class="no-users">
      <p>No users found.</p>
    </div>
    
    <div v-else class="users-container">
      <div v-for="user in users" :key="user._id" class="user-item">
        <div class="user-info">
          <strong>{{ user.username }}</strong>
          <span class="user-id">ID: {{ user._id }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth.js';

export default {
  name: 'UserList',
  setup() {
    const { getAllUsers } = useAuth();
    
    const users = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    const loadUsers = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        const result = await getAllUsers();
        if (result.success) {
          users.value = result.users || [];
        } else {
          error.value = result.error || 'Failed to load users.';
        }
      } catch (err) {
        error.value = 'An unexpected error occurred while loading users.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      loadUsers();
    });

    return {
      users,
      isLoading,
      error,
      loadUsers
    };
  }
};
</script>

<style scoped>
.user-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  margin-bottom: 1rem;
}

.user-list-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.refresh-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #369870;
}

.refresh-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading, .no-users {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.users-container {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.user-item {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  border-left: 4px solid #42b983;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info strong {
  color: #2c3e50;
  font-size: 1.1rem;
}

.user-id {
  color: #666;
  font-size: 0.9rem;
  font-family: monospace;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem 1.5rem;
  border-top: 1px solid #fcc;
  font-size: 0.9rem;
}
</style>

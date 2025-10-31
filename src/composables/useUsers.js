import { ref } from 'vue';
import apiService from '../services/api.js';

// Global state for user data
const users = ref({});
const isLoading = ref(false);

export function useUsers() {
  const fetchAllUsers = async () => {
    if (isLoading.value) return;
    
    isLoading.value = true;
    try {
      const response = await apiService.getAllUsers();
      const userMap = {};
      
      // Build a map of user ID to username
      if (response && Array.isArray(response)) {
        response.forEach(user => {
          userMap[user._id] = user.username;
        });
      }
      
      users.value = userMap;
      return userMap;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return {};
    } finally {
      isLoading.value = false;
    }
  };

  const getUserById = (userId) => {
    return users.value[userId] || `User ${userId.slice(0, 8)}`;
  };

  const buildAuthorMap = (items) => {
    const map = {};
    items.forEach(item => {
      if (item.author && !map[item.author]) {
        map[item.author] = getUserById(item.author);
      }
    });
    return map;
  };

  const addUser = (userId, username) => {
    users.value[userId] = username;
  };

  const ensureUserInMap = (userId, username) => {
    if (!users.value[userId] && username) {
      users.value[userId] = username;
    }
  };

  // Add a direct lookup by userId using authentication API
  const fetchUsernameById = async (userId) => {
    if (users.value[userId]) return users.value[userId];
    try {
      const result = await apiService.makeRequest('/api/Authentication/_getUserById', 'POST', { user: userId });
      const username = result?.username || `User ${userId.slice(0,8)}`;
      users.value[userId] = username;
      return username;
    } catch (e) {
      users.value[userId] = `User ${userId.slice(0,8)}`;
      return `User ${userId.slice(0,8)}`;
    }
  };

  return {
    users,
    isLoading,
    fetchAllUsers,
    getUserById,
    buildAuthorMap,
    addUser,
    ensureUserInMap,
    fetchUsernameById,
  };
}

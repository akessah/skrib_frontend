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

  return {
    users: users.value,
    isLoading,
    fetchAllUsers,
    getUserById,
    buildAuthorMap,
    addUser,
    ensureUserInMap
  };
}

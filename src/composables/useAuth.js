import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '../services/api.js';

// Global state
const currentUser = ref(null);
const currentUsername = ref(null);
const isAuthenticated = ref(false);

export function useAuth() {
  const router = useRouter();
  
  const authenticate = async (username, password) => {
    try {
      const response = await apiService.authenticate(username, password);
      currentUser.value = response.user;
      currentUsername.value = username;
      isAuthenticated.value = true;
      
      // Store in localStorage for persistence
      localStorage.setItem('currentUser', response.user);
      localStorage.setItem('currentUsername', username);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to profile page after successful login
      router.push('/profile');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await apiService.register(username, password);
      currentUser.value = response.user;
      currentUsername.value = username;
      isAuthenticated.value = true;
      
      // Store in localStorage for persistence
      localStorage.setItem('currentUser', response.user);
      localStorage.setItem('currentUsername', username);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to profile page after successful registration
      router.push('/profile');
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    // Clear state (no logout endpoint in the API spec)
    currentUser.value = null;
    currentUsername.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentUsername');
    localStorage.removeItem('isAuthenticated');
  };

  const deleteUser = async (user) => {
    try {
      await apiService.deleteUser(user);
      // If deleting current user, log them out
      if (currentUser.value === user) {
        currentUser.value = null;
        currentUsername.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentUsername');
        localStorage.removeItem('isAuthenticated');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (user, newPassword) => {
    try {
      await apiService.changePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getAllUsers = async () => {
    try {
      const response = await apiService.getAllUsers();
      return { success: true, users: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const initializeAuth = () => {
    const storedUser = localStorage.getItem('currentUser');
    const storedUsername = localStorage.getItem('currentUsername');
    const storedAuth = localStorage.getItem('isAuthenticated');
    
    if (storedUser && storedAuth === 'true') {
      currentUser.value = storedUser;
      currentUsername.value = storedUsername;
      isAuthenticated.value = true;
    }
  };

  return {
    // State
    currentUser: computed(() => currentUser.value),
    currentUsername: computed(() => currentUsername.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    
    // Actions
    authenticate,
    register,
    logout,
    deleteUser,
    changePassword,
    getAllUsers,
    initializeAuth
  };
}

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiService from '../services/api.js';

// Global state
const currentSession = ref(null);
const currentUser = ref(null);
const currentUsername = ref(null);

export function useAuth() {
  const router = useRouter();
  
  const authenticate = async (username, password) => {
    try {
      const response = await apiService.authenticate(username, password);
      console.log('Authenticate response:', response);
      
      // The backend should return { session: "<session_token>" }
      // If it returns { user: "<user_id>" }, we need to handle that
      const sessionToken = response.session || response.user;
      console.log('Session token from response:', sessionToken);
      
      if (!sessionToken) {
        throw new Error('No session token received from server');
      }
      
      sessionToken;
      currentUsername.value = username;
      
      // Store in localStorage for persistence
      localStorage.setItem('currentSession', sessionToken);
      
      // Fetch user from session
      try {
        console.log('fetching user from session');
        const userResponse = (await apiService.getUser(sessionToken))[0];
        if (userResponse && userResponse.user) {
          console.log('successfuly fetched user from session');
          currentUser.value = userResponse.user;
        }
      } catch (error) {
        console.error('Failed to fetch user from session:', error);
      }
      
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
      // currentUser.value = response.user;
      // currentUsername.value = username;
      // isAuthenticated.value = true;
      
      // Store in localStorage for persistence
      // localStorage.setItem('currentUser', response.user);
      // localStorage.setItem('currentUsername', username);
      // localStorage.setItem('isAuthenticated', 'true');
      
      // Redirect to profile page after successful registration
      // router.push('/profile');
      return await authenticate(username, password);
      
      // return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async (session) => {
    try {
      // Call logout endpoint to invalidate session on backend
      await apiService.logout(session);
    } catch (error) {
      // Even if logout endpoint fails, clear local state
      console.error('Logout endpoint error:', error);
    } finally {
      // Clear session and state
      currentSession.value = null;
      currentUser.value = null;
      currentUsername.value = null;
      localStorage.removeItem('currentSession');
    }
  };

  const deleteUser = async (user) => {
    try {
      await apiService.deleteUser(currentSession.value);
      // If deleting current user, log them out
      if (currentUser.value === user) {
        currentSession.value = null;
        currentUser.value = null;
        currentUsername.value = null;
        localStorage.removeItem('currentSession');
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (user, newPassword) => {
    try {
      await apiService.changePassword(currentSession.value, newPassword);
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

  const initializeAuth = async () => {
    const storedSession = localStorage.getItem('currentSession');
    
    if (storedSession) {
      currentSession.value = storedSession;
      
      // Fetch user from session to populate currentUser and currentUsername
      try {
        console.log('Initializing auth with session:', storedSession);
        const userResponse = (await apiService.getUser(storedSession))[0];
        console.log('getUser response:', userResponse);
        
        // Handle different possible response formats
        const userId = userResponse?.user || userResponse?.userId || userResponse?._id || userResponse;
        
        if (userId) {
          currentUser.value = userId;
          console.log('Set currentUser to:', userId);
          
          // Fetch username for the user
          try {
            const usernameResponse = (await apiService.getUsername(userId))[0];
            console.log('getUsername response:', usernameResponse);
            
            // Handle different possible response formats
            let username = null;
            if (Array.isArray(usernameResponse) && usernameResponse.length > 0) {
              // If response is an array, get the first element
              username = usernameResponse[0]?.username || usernameResponse[0];
            } else if (usernameResponse && typeof usernameResponse === 'object') {
              // If response is an object
              username = usernameResponse.username || usernameResponse;
            } else if (typeof usernameResponse === 'string') {
              // If response is a string directly
              username = usernameResponse;
            }
            
            if (username) {
              currentUsername.value = username;
              console.log('Set currentUsername to:', username);
            } else {
              console.warn('getUsername did not return a valid username. Response:', usernameResponse);
            }
          } catch (error) {
            console.error('Failed to fetch username:', error);
          }
        } else {
          console.warn('getUser did not return a valid user ID. Response:', userResponse);
        }
      } catch (error) {
        // If session is invalid, clear it
        console.error('Failed to fetch user from session:', error);
        currentSession.value = null;
        localStorage.removeItem('currentSession');
      }
    } else {
      console.log('No stored session found');
    }
  };

  return {
    // State
    currentSession: computed(() => currentSession.value),
    currentUser: computed(() => currentUser.value),
    currentUsername: computed(() => currentUsername.value),
    isAuthenticated: computed(() => currentSession.value !== null),
    
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

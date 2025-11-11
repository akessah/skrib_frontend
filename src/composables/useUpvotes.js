import { ref } from 'vue';
import apiService from '../services/api.js';
import { useAuth } from './useAuth.js';

// Global state for upvotes
const upvotes = ref({}); // itemId -> { count: number, userVoted: boolean }
const isLoading = ref(false);

export function useUpvotes() {
  const { currentSession } = useAuth();
  // Track loading state per item to allow parallel loading
  const loadingItems = ref(new Set());
  
  const loadUpvotesForItem = async (itemId, currentUser) => {
    // Skip if already loading this specific item
    if (loadingItems.value.has(itemId)) {
      // Wait for the existing load to complete
      while (loadingItems.value.has(itemId)) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return upvotes.value[itemId] || { count: 0, userVoted: false };
    }
    
    loadingItems.value.add(itemId);
    try {
      const response = await apiService.getUpvotesByItem(itemId);
      const upvoteList = response || [];
      
      // Check if current user has voted
      const userVoted = currentUser ? upvoteList.some(vote => vote.user === currentUser) : false;
      
      upvotes.value[itemId] = {
        count: upvoteList.length,
        userVoted: userVoted
      };
      
      return upvotes.value[itemId];
    } catch (error) {
      console.error('Failed to load upvotes for item:', itemId, error);
      // Set default values on error
      upvotes.value[itemId] = {
        count: 0,
        userVoted: false
      };
      return upvotes.value[itemId];
    } finally {
      loadingItems.value.delete(itemId);
    }
  };

  const loadUpvotesForItems = async (itemIds, currentUser) => {
    const promises = itemIds.map(itemId => loadUpvotesForItem(itemId, currentUser));
    await Promise.all(promises);
  };

  const toggleUpvote = async (itemId, currentUser) => {
    if (!currentUser) {
      throw new Error('You must be logged in to vote');
    }

    const currentUpvotes = upvotes.value[itemId] || { count: 0, userVoted: false };
    
    try {
      if (currentUpvotes.userVoted) {
        // User has voted, so unvote
        await apiService.unvote(currentSession.value, itemId);
      } else {
        // User hasn't voted, so upvote
        await apiService.upvote(currentSession.value, itemId);
      }
      
      // Reload from server to ensure accuracy
      return await loadUpvotesForItem(itemId, currentUser);
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
      throw error;
    }
  };

  const getUpvotesForItem = (itemId) => {
    return upvotes.value[itemId] || { count: 0, userVoted: false };
  };

  const clearUpvotes = () => {
    upvotes.value = {};
  };

  return {
    upvotes: upvotes.value,
    isLoading,
    loadUpvotesForItem,
    loadUpvotesForItems,
    toggleUpvote,
    getUpvotesForItem,
    clearUpvotes
  };
}

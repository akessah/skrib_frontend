import { ref } from 'vue';
import apiService from '../services/api.js';

// Global state for upvotes
const upvotes = ref({}); // itemId -> { count: number, userVoted: boolean }
const isLoading = ref(false);

export function useUpvotes() {
  const loadUpvotesForItem = async (itemId, currentUser) => {
    if (isLoading.value) return;
    
    isLoading.value = true;
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
      isLoading.value = false;
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
        await apiService.unvote(currentUser, itemId);
        upvotes.value[itemId] = {
          count: Math.max(0, currentUpvotes.count - 1),
          userVoted: false
        };
      } else {
        // User hasn't voted, so upvote
        await apiService.upvote(currentUser, itemId);
        upvotes.value[itemId] = {
          count: currentUpvotes.count + 1,
          userVoted: true
        };
      }
      
      return upvotes.value[itemId];
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

import { ref, computed } from 'vue';
import apiService from '../services/api.js';

// Global state for tags
const userTags = ref([]);
const bookTags = ref({}); // bookId -> tags array
const isLoading = ref(false);

export function useTags() {
  const loadUserTags = async (userId) => {
    if (!userId || isLoading.value) return;
    
    isLoading.value = true;
    try {
      const response = await apiService.getTagsByUser(userId);
      userTags.value = response || [];
    } catch (error) {
      console.error('Failed to load user tags:', error);
      userTags.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadBookTags = async (userId, bookId) => {
    if (!userId || !bookId) return;
    
    try {
      const response = await apiService.getTagsByBook(userId, bookId);
      bookTags.value[bookId] = response || [];
      return response || [];
    } catch (error) {
      console.error('Failed to load book tags:', error);
      bookTags.value[bookId] = [];
      return [];
    }
  };

  const addTag = async (userId, label, bookId) => {
    try {
      const response = await apiService.addTag(userId, label, bookId);
      
      // Update local state
      const newTag = {
        _id: response.tag,
        user: userId,
        label: label,
        book: bookId,
        private: false
      };
      
      userTags.value.push(newTag);
      
      if (!bookTags.value[bookId]) {
        bookTags.value[bookId] = [];
      }
      bookTags.value[bookId].push(newTag);
      
      return { success: true, tag: newTag };
    } catch (error) {
      console.error('Failed to add tag:', error);
      return { success: false, error: error.message };
    }
  };

  const removeTag = async (tagId) => {
    try {
      await apiService.removeTag(tagId);
      
      // Update local state
      const tagIndex = userTags.value.findIndex(tag => tag._id === tagId);
      if (tagIndex !== -1) {
        const removedTag = userTags.value[tagIndex];
        userTags.value.splice(tagIndex, 1);
        
        // Remove from book tags
        if (bookTags.value[removedTag.book]) {
          const bookTagIndex = bookTags.value[removedTag.book].findIndex(tag => tag._id === tagId);
          if (bookTagIndex !== -1) {
            bookTags.value[removedTag.book].splice(bookTagIndex, 1);
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to remove tag:', error);
      return { success: false, error: error.message };
    }
  };

  const toggleTagPrivacy = async (tagId, isPrivate) => {
    try {
      if (isPrivate) {
        await apiService.markTagPrivate(tagId);
      } else {
        await apiService.markTagPublic(tagId);
      }
      
      // Update local state
      const tag = userTags.value.find(tag => tag._id === tagId);
      if (tag) {
        tag.private = isPrivate;
      }
      
      // Update in book tags
      Object.keys(bookTags.value).forEach(bookId => {
        const bookTag = bookTags.value[bookId].find(tag => tag._id === tagId);
        if (bookTag) {
          bookTag.private = isPrivate;
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Failed to toggle tag privacy:', error);
      return { success: false, error: error.message };
    }
  };

  const getBookTags = (bookId) => {
    return bookTags.value[bookId] || [];
  };

  const getTaggedBooks = computed(() => {
    const bookMap = {};
    userTags.value.forEach(tag => {
      if (!bookMap[tag.book]) {
        bookMap[tag.book] = {
          bookId: tag.book,
          tags: []
        };
      }
      bookMap[tag.book].tags.push(tag);
    });
    return Object.values(bookMap);
  });

  const getUserLabels = computed(() => {
    const labelMap = {};
    userTags.value.forEach(tag => {
      if (!labelMap[tag.label]) {
        labelMap[tag.label] = {
          label: tag.label,
          count: 0
        };
      }
      labelMap[tag.label].count++;
    });
    return Object.values(labelMap).sort((a, b) => b.count - a.count);
  });

  const getAllPublicTags = async () => {
    try {
      const response = await apiService.getAllPublicTags();
      return response || [];
    } catch (error) {
      console.error('Failed to load public tags:', error);
      return [];
    }
  };

  const clearTags = () => {
    userTags.value = [];
    bookTags.value = {};
  };

  return {
    userTags: computed(() => userTags.value),
    bookTags: computed(() => bookTags.value),
    isLoading,
    getTaggedBooks,
    getUserLabels,
    loadUserTags,
    loadBookTags,
    addTag,
    removeTag,
    toggleTagPrivacy,
    getBookTags,
    getAllPublicTags,
    clearTags
  };
}

import { ref, computed } from 'vue';
import apiService from '../services/api.js';
import { useAuth } from './useAuth.js';

// Global state for shelves
const userShelves = ref([]);
const bookShelves = ref({}); // bookId -> shelf info
const isLoading = ref(false);

// Shelf status constants
export const SHELF_STATUS = {
  WANT_TO_READ: 0,
  CURRENTLY_READING: 1,
  READ: 2,
  DID_NOT_FINISH: 3
};

export const SHELF_LABELS = {
  [SHELF_STATUS.WANT_TO_READ]: 'Want to Read',
  [SHELF_STATUS.CURRENTLY_READING]: 'Currently Reading',
  [SHELF_STATUS.READ]: 'Read',
  [SHELF_STATUS.DID_NOT_FINISH]: 'Did Not Finish'
};

export const SHELF_ICONS = {
  [SHELF_STATUS.WANT_TO_READ]: '<img src="../../assets/book-stack.png" alt="Books icon" width="20">',
  [SHELF_STATUS.CURRENTLY_READING]: '<img src="../../assets/open-book.png" alt="Open book icon" width="20">',
  [SHELF_STATUS.READ]: '<img src="../../assets/book.png" alt="Checkmark icon" width="20">',
  [SHELF_STATUS.DID_NOT_FINISH]: '<img src="../../assets/x-mark.png" alt="X mark icon" width="20">'
};

export function useShelving() {
  const { currentSession } = useAuth();
  const loadUserShelves = async (userId) => {
    if (!userId || isLoading.value) return;
    
    isLoading.value = true;
    try {
      const response = await apiService.getBooksByUser(currentSession.value);
      userShelves.value = response.shelf || [];
    } catch (error) {
      console.error('Failed to load user shelves:', error);
      userShelves.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadBookShelves = async (bookId) => {
    if (!bookId) return;
    
    try {
      const response = await apiService.getShelvesByBook(bookId);
      bookShelves.value[bookId] = response || [];
      return response || [];
    } catch (error) {
      console.error('Failed to load book shelves:', error);
      bookShelves.value[bookId] = [];
      return [];
    }
  };

  const getUserShelfForBook = async (userId, bookId) => {
    try {
      const response = await apiService.getUserShelfByBook(currentSession.value, bookId);
      console.log('getUserShelfForBook response:', response);
      
      // According to API spec, response is an array: [{ status: number }]
      if (Array.isArray(response) && response.length > 0) {
        const status = response[0].status;
        // Convert to number if it's a string, and ensure it's a valid status (0-3)
        const statusNum = typeof status === 'string' ? parseInt(status, 10) : status;
        if (statusNum !== undefined && statusNum !== null && !isNaN(statusNum) && statusNum >= 0 && statusNum <= 3) {
          console.log('getUserShelfForBook returning status:', statusNum);
          return statusNum;
        }
      } 
      // Fallback: handle if response is a direct object
      else if (response && typeof response === 'object') {
        if (response.status !== undefined) {
          const statusNum = typeof response.status === 'string' ? parseInt(response.status, 10) : response.status;
          if (!isNaN(statusNum) && statusNum >= 0 && statusNum <= 3) {
            return statusNum;
          }
        }
        if (response.shelfNumber !== undefined) {
          const statusNum = typeof response.shelfNumber === 'string' ? parseInt(response.shelfNumber, 10) : response.shelfNumber;
          if (!isNaN(statusNum) && statusNum >= 0 && statusNum <= 3) {
            return statusNum;
          }
        }
      }
      
      console.log('getUserShelfForBook: No valid status found, returning null');
      return null;
    } catch (error) {
      console.error('Failed to get user shelf for book:', error);
      return null;
    }
  };

  const getShelfIdByBookAndUser = async (bookId) => {
    try {
      console.log('getShelfIdByBookAndUser: Calling API with session:', currentSession.value, 'and book:', bookId);
      const response = await apiService.getShelfByBookAndUser(currentSession.value, bookId);
      console.log('getShelfIdByBookAndUser: API response', response);
      // Response should be an array with shelf object(s), or a single shelf object
      if (Array.isArray(response) && response.length > 0) {
        return response[0]._id || response[0];
      } else if (response && response._id) {
        return response._id;
      } else if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error('Failed to get shelf ID by book and user:', error);
      return null;
    }
  };

  const addBookToShelf = async (userId, status, bookId) => {
    try {
      console.log('useShelving: Adding book to shelf', { userId, status, bookId });
      const response = await apiService.addBookToShelf(currentSession.value, status, bookId);
      console.log('useShelving: API response', response);
      
      // Validate response
      if (!response || !response.shelf) {
        throw new Error('Invalid response from server: missing shelf ID');
      }
      
      // Update local state
      const shelfInfo = {
        _id: response.shelf,
        user: userId,
        status: status,
        book: bookId
      };
      
      // Add to user shelves
      const statusGroup = userShelves.value.find(group => group.status === status);
      if (statusGroup) {
        statusGroup.shelves.push(bookId);
      } else {
        userShelves.value.push({
          status: status,
          shelves: [bookId]
        });
      }
      
      // Add to book shelves
      if (!bookShelves.value[bookId]) {
        bookShelves.value[bookId] = [];
      }
      bookShelves.value[bookId].push(shelfInfo);
      
      return { success: true, shelf: response.shelf };
    } catch (error) {
      console.error('useShelving: Failed to add book to shelf:', error);
      return { success: false, error: error.message };
    }
  };

  const removeBookFromShelf = async (shelfId) => {
    try {
      console.log('useShelving: Removing book from shelf', { shelfId });
      await apiService.removeBookFromShelf(currentSession.value, shelfId);
      
      // Update local state
      // Find and remove from user shelves
      for (const statusGroup of userShelves.value) {
        const index = statusGroup.shelves.findIndex(shelf => shelf === shelfId);
        if (index !== -1) {
          statusGroup.shelves.splice(index, 1);
          break;
        }
      }
      
      // Find and remove from book shelves
      for (const bookId in bookShelves.value) {
        const index = bookShelves.value[bookId].findIndex(shelf => shelf._id === shelfId);
        if (index !== -1) {
          bookShelves.value[bookId].splice(index, 1);
          break;
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to remove book from shelf:', error);
      return { success: false, error: error.message };
    }
  };

  const changeBookStatus = async (shelfId, newStatus) => {
    try {

      await apiService.changeBookStatus(currentSession.value, shelfId, newStatus);
      
      // Update local state
      // Find the shelf and update its status
      for (const statusGroup of userShelves.value) {
        const shelfIndex = statusGroup.shelves.findIndex(shelf => shelf === shelfId);
        if (shelfIndex !== -1) {
          // Remove from current status group
          const shelf = statusGroup.shelves.splice(shelfIndex, 1)[0];
          
          // Add to new status group
          let newStatusGroup = userShelves.value.find(group => group.status === newStatus);
          if (!newStatusGroup) {
            newStatusGroup = { status: newStatus, shelves: [] };
            userShelves.value.push(newStatusGroup);
          }
          newStatusGroup.shelves.push(shelf);
          break;
        }
      }
      
      // Update in book shelves
      for (const bookId in bookShelves.value) {
        const shelf = bookShelves.value[bookId].find(shelf => shelf._id === shelfId);
        if (shelf) {
          shelf.status = newStatus;
          break;
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to change book status:', error);
      return { success: false, error: error.message };
    }
  };

  const getBooksByStatus = computed(() => {
    const booksByStatus = {};
    userShelves.value.forEach(statusGroup => {
      booksByStatus[statusGroup.status] = statusGroup.shelves;
    });
    return booksByStatus;
  });

  const getShelfCounts = computed(() => {
    const counts = {};
    userShelves.value.forEach(statusGroup => {
      counts[statusGroup.status] = statusGroup.shelves.length;
    });
    return counts;
  });

  const getTotalShelvedBooks = computed(() => {
    return userShelves.value.reduce((total, statusGroup) => {
      return total + statusGroup.shelves.length;
    }, 0);
  });

  const getBookShelves = (bookId) => {
    return bookShelves.value[bookId] || [];
  };

  const clearShelves = () => {
    userShelves.value = [];
    bookShelves.value = {};
  };

  return {
    userShelves: computed(() => userShelves.value),
    bookShelves: computed(() => bookShelves.value),
    isLoading,
    getBooksByStatus,
    getShelfCounts,
    getTotalShelvedBooks,
    loadUserShelves,
    loadBookShelves,
    getUserShelfForBook,
    getShelfIdByBookAndUser,
    addBookToShelf,
    removeBookFromShelf,
    changeBookStatus,
    getBookShelves,
    clearShelves
  };
}

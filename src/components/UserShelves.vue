<template>
  <div class="user-shelves">
    <div class="shelves-header">
      <h2> Your Reading Shelves</h2>
      <p v-if="totalShelvedBooks > 0">
        You have {{ totalShelvedBooks }} book{{ totalShelvedBooks !== 1 ? 's' : '' }} on your shelves
      </p>
      <p v-else>
        No books on your shelves yet. Start reading and organizing your books!
      </p>
    </div>
    
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading your shelves...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadShelves" class="retry-btn">Try Again</button>
    </div>
    
    <div v-else-if="totalShelvedBooks === 0" class="empty-state">
      <div class="empty-icon">📚</div>
      <h3>No Books on Your Shelves</h3>
      <p>Start exploring books and add them to your reading shelves!</p>
      <router-link to="/search" class="search-link">
        <img src="../../assets/search-icon.png" alt="Search icon" width = "15"> Search for Books
      </router-link>
    </div>
    
    <div v-else class="shelves-container">
      <div 
        v-for="(shelves, status) in booksByStatus" 
        :key="status"
        class="shelf-section"
        v-show="shelves.length > 0"
      >
        <div class="shelf-header">
          <h3 class="shelf-title">
            <span class="shelf-icon" v-html="SHELF_ICONS[status]"></span>
            {{ SHELF_LABELS[status] }}
            <span class="book-count">({{ shelves.length }})</span>
          </h3>
        </div>
        
        <div class="books-grid">
          <div 
            v-for="bookId in shelves" 
            :key="bookId"
            class="book-card"
          >
            <div class="book-cover-area">
              <img 
                v-if="bookDetails[bookId]?.volumeInfo?.imageLinks?.thumbnail" 
                :src="bookDetails[bookId].volumeInfo.imageLinks.thumbnail" 
                :alt="getBookTitle(bookId)" 
                class="book-thumbnail" 
              />
              <div v-else class="no-cover">No Cover</div>
            </div>
            <div class="book-details-column">
              <div class="book-info">
                <h4 class="book-title">{{ getBookTitle(bookId) }}</h4>
                <p class="book-author">{{ getBookAuthor(bookId) }}</p>
              </div>
              <div class="book-actions-row">
                <button 
                  @click="viewBookDetails(bookId)"
                  class="view-btn"
                >
                 Details
                </button>
                <button 
                  @click="removeFromShelf(bookId, status)"
                  class="remove-btn"
                  title="Remove from shelf"
                >
                  <img src="../../assets/bin.png" alt="Trash icon" width="15"></img>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { useShelving, SHELF_LABELS, SHELF_ICONS } from '../composables/useShelving.js';
import apiService from '../services/api.js';

export default {
  name: 'UserShelves',
  setup() {
    const router = useRouter();
    const { currentUser, isAuthenticated } = useAuth();
    const { 
      getBooksByStatus, 
      getTotalShelvedBooks, 
      loadUserShelves, 
      removeBookFromShelf 
    } = useShelving();
    
    const isLoading = ref(false);
    const error = ref(null);
    const bookDetails = ref({}); // Cache for book details
    
    const booksByStatus = computed(() => getBooksByStatus.value);
    const totalShelvedBooks = computed(() => getTotalShelvedBooks.value);
    
    const loadShelves = async () => {
      if (!currentUser.value) return;
      
      isLoading.value = true;
      error.value = null;
      
      try {
        await loadUserShelves(currentUser.value);
        
        // Load book details for all shelved books
        const allBookIds = Object.values(booksByStatus.value).flat();
        for (const bookId of allBookIds) {
          if (!bookDetails.value[bookId]) {
            try {
              const bookDetail = await apiService.getBookDetails(bookId);
              bookDetails.value[bookId] = bookDetail;
            } catch (err) {
              console.warn(`Failed to load details for book ${bookId}:`, err);
              bookDetails.value[bookId] = null;
            }
          }
        }
      } catch (err) {
        error.value = 'Failed to load your shelves. Please try again.';
        console.error('Error loading shelves:', err);
      } finally {
        isLoading.value = false;
      }
    };
    
    const getBookTitle = (bookId) => {
      const bookDetail = bookDetails.value[bookId];
      if (bookDetail && bookDetail.volumeInfo) {
        return bookDetail.volumeInfo.title || 'Unknown Title';
      }
      return 'Loading...';
    };
    
    const getBookAuthor = (bookId) => {
      const bookDetail = bookDetails.value[bookId];
      if (bookDetail && bookDetail.volumeInfo && bookDetail.volumeInfo.authors) {
        return bookDetail.volumeInfo.authors.join(', ');
      }
      return 'Unknown Author';
    };
    
    const viewBookDetails = (bookId) => {
      router.push({
        name: 'BookDetail',
        params: { id: bookId }
      });
    };
    
    const removeFromShelf = async (bookId, status) => {
      if (!confirm(`Are you sure you want to remove this book from your ${SHELF_LABELS[status]} shelf?`)) {
        return;
      }
      
      try {
        // Find the shelf ID for this book
        const bookShelves = await apiService.getShelvesByBook(bookId);
        const userShelf = bookShelves.find(shelf => shelf.user === currentUser.value);
        
        if (!userShelf) {
          error.value = 'Shelf not found';
          return;
        }
        
        const result = await removeBookFromShelf(userShelf._id);
        if (!result.success) {
          error.value = result.error || 'Failed to remove book from shelf';
        }
        
        // Remove from book details cache
        delete bookDetails.value[bookId];
      } catch (err) {
        error.value = 'Failed to remove book from shelf. Please try again.';
        console.error('Error removing book from shelf:', err);
      }
    };
    
    // Watch for authentication changes
    watch(isAuthenticated, (newValue) => {
      if (newValue && currentUser.value) {
        loadShelves();
      }
    });
    
    onMounted(() => {
      if (isAuthenticated.value && currentUser.value) {
        loadShelves();
      }
    });
    
    return {
      booksByStatus,
      totalShelvedBooks,
      isLoading,
      error,
      bookDetails,
      SHELF_LABELS,
      SHELF_ICONS,
      loadShelves,
      getBookTitle,
      getBookAuthor,
      viewBookDetails,
      removeFromShelf
    };
  }
};
</script>

<style scoped>
.user-shelves {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.shelves-header {
  text-align: center;
  margin-bottom: 2rem;
}

.shelves-header h2 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.shelves-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #889841;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  color: #b52b39;
}

.retry-btn {
  background: #b52b39;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.search-link {
  display: inline-block;
  background: #889841;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.search-link:hover {
  background: #5b662a;
}

.shelves-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.shelf-section {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.shelf-header {
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.shelf-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.shelf-icon {
  font-size: 1.5rem;
}

.book-count {
  color: #666;
  font-weight: normal;
  font-size: 1rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
}

.book-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: flex-start;
  flex-direction: row;
  gap: 1rem;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-cover-area {
  min-width: 60px;
  margin-right: 1rem;
}

.book-thumbnail {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.14);
  margin-bottom: 8px;
  background: #fff;
}

.no-cover {
  width: 60px;
  height: 90px;
  background: #eee;
  color: #999;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.book-details-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.book-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.book-actions-row {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.book-author {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.view-btn {
  background: #889841;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-btn:hover {
  background: #5b662a;
}

.remove-btn {
  background: #b52b39;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 40px;
}

.remove-btn:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .user-shelves {
    padding: 1rem;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .book-card {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  .book-cover-area {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  .book-details-column {
    align-items: center;
    text-align: center;
  }
  .book-info {
    align-items: center;
  }
  .book-actions-row {
    justify-content: center;
  }
  
  .view-btn,
  .remove-btn {
    flex: none;
  }
}
</style>

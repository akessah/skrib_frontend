<template>
  <div class="tagged-books">
    <div class="section-header">
      <h2>📚 Your Tagged Books</h2>
      <p v-if="taggedBooks.length > 0">
        You have {{ taggedBooks.length }} tagged book{{ taggedBooks.length !== 1 ? 's' : '' }}
      </p>
      <p v-else>
        No tagged books yet. Search for books and add tags to see them here!
      </p>
    </div>
    
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading your tagged books...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadTaggedBooks" class="retry-btn">Try Again</button>
    </div>
    
    <div v-else-if="taggedBooks.length === 0" class="empty-state">
      <div class="empty-icon">📖</div>
      <h3>No Tagged Books Yet</h3>
      <p>Start exploring books and add tags to organize your reading list!</p>
      <router-link to="/search" class="search-link">
        🔍 Search for Books
      </router-link>
    </div>
    
    <div v-else class="books-container">
      <div class="books-grid">
        <div 
          v-for="bookGroup in taggedBooks" 
          :key="bookGroup.bookId"
          class="book-card"
        >
          <div class="book-info">
            <h3 class="book-title">{{ getBookTitle(bookGroup.bookId) }}</h3>
            <div class="book-tags">
              <span 
                v-for="tag in bookGroup.tags" 
                :key="tag._id"
                class="tag-badge"
                :class="{ 'private-tag': tag.private }"
              >
                {{ tag.label }}
              </span>
            </div>
          </div>
          <div class="book-actions">
            <button 
              @click="viewBookDetails(bookGroup.bookId)"
              class="view-btn"
            >
              View Details
            </button>
            <button 
              @click="removeAllTags(bookGroup.bookId)"
              class="remove-all-btn"
            >
              Remove All Tags
            </button>
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
import { useTags } from '../composables/useTags.js';
import apiService from '../services/api.js';

export default {
  name: 'TaggedBooks',
  setup() {
    const router = useRouter();
    const { currentUser, isAuthenticated } = useAuth();
    const { getTaggedBooks, loadUserTags, removeTag } = useTags();
    
    const isLoading = ref(false);
    const error = ref(null);
    const bookDetails = ref({}); // Cache for book details
    
    const taggedBooks = computed(() => getTaggedBooks.value);
    
    const loadTaggedBooks = async () => {
      if (!currentUser.value) return;
      
      isLoading.value = true;
      error.value = null;
      
      try {
        await loadUserTags(currentUser.value);
        
        // Load book details for each tagged book
        for (const bookGroup of taggedBooks.value) {
          if (!bookDetails.value[bookGroup.bookId]) {
            try {
              const bookDetail = await apiService.getBookDetails(bookGroup.bookId);
              bookDetails.value[bookGroup.bookId] = bookDetail;
            } catch (err) {
              console.warn(`Failed to load details for book ${bookGroup.bookId}:`, err);
              bookDetails.value[bookGroup.bookId] = null;
            }
          }
        }
      } catch (err) {
        error.value = 'Failed to load tagged books. Please try again.';
        console.error('Error loading tagged books:', err);
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
    
    const viewBookDetails = (bookId) => {
      // Navigate to book detail page
      router.push({
        name: 'BookDetail',
        params: { id: bookId }
      });
    };
    
    const removeAllTags = async (bookId) => {
      if (!confirm('Are you sure you want to remove all tags from this book?')) {
        return;
      }
      
      const bookGroup = taggedBooks.value.find(bg => bg.bookId === bookId);
      if (!bookGroup) return;
      
      try {
        for (const tag of bookGroup.tags) {
          await removeTag(tag._id);
        }
        // Remove from book details cache
        delete bookDetails.value[bookId];
      } catch (err) {
        error.value = 'Failed to remove some tags. Please try again.';
        console.error('Error removing tags:', err);
      }
    };
    
    // Watch for authentication changes
    watch(isAuthenticated, (newValue) => {
      if (newValue && currentUser.value) {
        loadTaggedBooks();
      }
    });
    
    onMounted(() => {
      if (isAuthenticated.value && currentUser.value) {
        loadTaggedBooks();
      }
    });
    
    return {
      taggedBooks,
      isLoading,
      error,
      bookDetails,
      loadTaggedBooks,
      getBookTitle,
      viewBookDetails,
      removeAllTags
    };
  }
};
</script>

<style scoped>
.tagged-books {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
}

.section-header p {
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
  border-top: 4px solid #42b983;
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
  color: #dc3545;
}

.retry-btn {
  background: #dc3545;
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
  background: #42b983;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.search-link:hover {
  background: #369870;
}

.books-container {
  margin-top: 1rem;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-info {
  margin-bottom: 1rem;
}

.book-title {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
}

.book-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.private-tag {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.view-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
}

.view-btn:hover {
  background: #369870;
}

.remove-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
}

.remove-all-btn:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .tagged-books {
    padding: 1rem;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
  }
  
  .book-actions {
    flex-direction: column;
  }
  
  .view-btn,
  .remove-all-btn {
    flex: none;
  }
}
</style>

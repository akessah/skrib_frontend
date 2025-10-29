<template>
  <div class="book-detail-page">
    <div v-if="isLoading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading book details...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h2>Book Not Found</h2>
      <p>{{ error }}</p>
      <router-link to="/search" class="back-to-search">
        ← Back to Search
      </router-link>
    </div>
    
    <div v-else-if="book" class="book-detail-container">
      <!-- Book Header -->
      <div class="book-header">
        <div class="book-cover-large">
          <img 
            v-if="book.volumeInfo.imageLinks?.large || book.volumeInfo.imageLinks?.thumbnail" 
            :src="book.volumeInfo.imageLinks.large || book.volumeInfo.imageLinks.thumbnail" 
            :alt="book.volumeInfo.title"
            class="book-image"
          />
          <div v-else class="no-cover-large">
            <span class="no-cover-text">No Cover Available</span>
          </div>
        </div>
        
        <div class="book-main-info">
          <h1 class="book-title">{{ book.volumeInfo.title }}</h1>
          
          <div v-if="book.volumeInfo.authors" class="book-authors">
            <span class="label">Authors:</span>
            <span class="authors">{{ book.volumeInfo.authors.join(', ') }}</span>
          </div>
          
          <div v-if="book.volumeInfo.publishedDate" class="book-published">
            <span class="label">Published:</span>
            <span class="published-date">{{ formatDate(book.volumeInfo.publishedDate) }}</span>
          </div>
          
          <div v-if="book.volumeInfo.publisher" class="book-publisher">
            <span class="label">Publisher:</span>
            <span class="publisher">{{ book.volumeInfo.publisher }}</span>
          </div>
          
          <div v-if="book.volumeInfo.pageCount" class="book-pages">
            <span class="label">Pages:</span>
            <span class="pages">{{ book.volumeInfo.pageCount }}</span>
          </div>
          
          <div v-if="book.volumeInfo.averageRating" class="book-rating">
            <span class="label">Rating:</span>
            <div class="rating">
              <span class="stars">{{ getStars(book.volumeInfo.averageRating) }}</span>
              <span class="rating-value">{{ book.volumeInfo.averageRating }}/5</span>
              <span v-if="book.volumeInfo.ratingsCount" class="rating-count">
                ({{ book.volumeInfo.ratingsCount }} reviews)
              </span>
            </div>
          </div>
          
          <div class="book-actions">
            <a 
              v-if="book.volumeInfo.previewLink" 
              :href="book.volumeInfo.previewLink" 
              target="_blank" 
              class="preview-btn"
            >
              📖 Preview
            </a>
            <a 
              v-if="book.volumeInfo.infoLink" 
              :href="book.volumeInfo.infoLink" 
              target="_blank" 
              class="info-btn"
            >
              ℹ️ More Info
            </a>
            <button 
              v-if="isAuthenticated"
              @click="toggleTagForm"
              class="tag-btn"
            >
              🏷️ {{ hasTags ? 'Manage Tags' : 'Add Tag' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Book Description -->
      <div v-if="book.volumeInfo.description" class="book-description">
        <h3>Description</h3>
        <div class="description-content" v-html="book.volumeInfo.description"></div>
      </div>
      
      <!-- Shelving Section -->
      <div v-if="isAuthenticated" class="shelving-section">
        <h3>📚 Add to Your Shelf</h3>
        <ShelfButton :book-id="book.id" />
      </div>
      
      <!-- Tags Section -->
      <div v-if="bookTags.length > 0 || isAuthenticated" class="tags-section">
        <h3>Tags</h3>
        
        <div v-if="bookTags.length > 0" class="existing-tags">
          <div class="tags-list">
            <span 
              v-for="tag in bookTags" 
              :key="tag._id"
              class="tag-item"
              :class="{ 'private-tag': tag.private }"
            >
              {{ tag.label }}
              <button 
                v-if="tag.user === currentUser"
                @click="removeTag(tag._id)"
                class="remove-tag-btn"
                title="Remove tag"
              >
                ×
              </button>
            </span>
          </div>
        </div>
        
        <!-- Tag Form -->
        <div v-if="showTagForm && isAuthenticated" class="tag-form">
          <div class="tag-form-header">
            <h4>Add a Tag</h4>
            <button @click="showTagForm = false" class="close-btn">×</button>
          </div>
          <form @submit.prevent="handleAddTag">
            <div class="form-group">
              <input
                v-model="newTagLabel"
                type="text"
                placeholder="Enter tag label (e.g., 'favorite', 'to-read', 'sci-fi')"
                class="tag-input"
                required
                :disabled="isAddingTag"
              />
            </div>
            <div class="form-actions">
              <button 
                type="submit" 
                class="add-tag-btn"
                :disabled="isAddingTag || !newTagLabel.trim()"
              >
                {{ isAddingTag ? 'Adding...' : 'Add Tag' }}
              </button>
              <button 
                type="button" 
                @click="showTagForm = false"
                class="cancel-btn"
                :disabled="isAddingTag"
              >
                Cancel
              </button>
            </div>
          </form>
          <div v-if="tagError" class="error-message">
            {{ tagError }}
          </div>
          <div v-if="tagSuccess" class="success-message">
            {{ tagSuccess }}
          </div>
        </div>
        
        <div v-else-if="isAuthenticated && bookTags.length === 0" class="no-tags">
          <p>No tags yet. Be the first to tag this book!</p>
          <button @click="toggleTagForm" class="add-first-tag-btn">
            🏷️ Add First Tag
          </button>
        </div>
      </div>
      
      <!-- Navigation -->
      <div class="navigation">
        <router-link to="/search" class="back-btn">
          ← Back to Search
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { useTags } from '../composables/useTags.js';
import ShelfButton from '../components/ShelfButton.vue';
import apiService from '../services/api.js';

export default {
  name: 'BookDetail',
  components: {
    ShelfButton
  },
  setup() {
    const route = useRoute();
    const { currentUser, isAuthenticated } = useAuth();
    const { loadBookTags, addTag, removeTag, getBookTags } = useTags();
    
    const book = ref(null);
    const isLoading = ref(true);
    const error = ref(null);
    const showTagForm = ref(false);
    const newTagLabel = ref('');
    const isAddingTag = ref(false);
    const tagError = ref(null);
    const tagSuccess = ref(null);
    const bookTags = ref([]);
    
    const hasTags = computed(() => bookTags.value.length > 0);
    
    const loadBookDetails = async () => {
      const bookId = route.params.id;
      if (!bookId) {
        error.value = 'No book ID provided';
        isLoading.value = false;
        return;
      }
      
      try {
        const bookData = await apiService.getBookDetails(bookId);
        book.value = bookData;
        
        // Load tags if user is authenticated
        if (isAuthenticated.value && currentUser.value) {
          const tags = await loadBookTags(currentUser.value, bookId);
          bookTags.value = tags;
        }
      } catch (err) {
        error.value = 'Failed to load book details. Please try again.';
        console.error('Error loading book details:', err);
      } finally {
        isLoading.value = false;
      }
    };
    
    const toggleTagForm = () => {
      showTagForm.value = !showTagForm.value;
      if (showTagForm.value) {
        newTagLabel.value = '';
        tagError.value = null;
        tagSuccess.value = null;
      }
    };
    
    const handleAddTag = async () => {
      if (!newTagLabel.value.trim() || !currentUser.value || !book.value) return;
      
      isAddingTag.value = true;
      tagError.value = null;
      tagSuccess.value = null;
      
      try {
        const result = await addTag(currentUser.value, newTagLabel.value.trim(), book.value.id);
        if (result.success) {
          tagSuccess.value = 'Tag added successfully!';
          newTagLabel.value = '';
          await loadBookTags(currentUser.value, book.value.id);
          bookTags.value = await loadBookTags(currentUser.value, book.value.id);
          setTimeout(() => {
            tagSuccess.value = null;
            showTagForm.value = false;
          }, 2000);
        } else {
          tagError.value = result.error || 'Failed to add tag';
        }
      } catch (error) {
        tagError.value = 'Failed to add tag. Please try again.';
      } finally {
        isAddingTag.value = false;
      }
    };
    
    const handleRemoveTag = async (tagId) => {
      try {
        const result = await removeTag(tagId);
        if (result.success) {
          await loadBookTags(currentUser.value, book.value.id);
          bookTags.value = await loadBookTags(currentUser.value, book.value.id);
        } else {
          tagError.value = result.error || 'Failed to remove tag';
        }
      } catch (error) {
        tagError.value = 'Failed to remove tag. Please try again.';
      }
    };
    
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } catch (error) {
        return dateString;
      }
    };
    
    const getStars = (rating) => {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      let stars = '★'.repeat(fullStars);
      if (hasHalfStar) {
        stars += '☆';
      }
      return stars;
    };
    
    onMounted(async () => {
      await loadBookDetails();
      // Auto-add category tags from Google Books categories
      await addAutoCategoryTags();
    });
    
    const addAutoCategoryTags = async () => {
      try {
        if (!isAuthenticated.value || !currentUser.value || !book.value) return;
        
        const categories = book.value?.volumeInfo?.categories || [];
        if (!Array.isArray(categories) || categories.length === 0) {
          console.log('No categories found for auto-tagging');
          return;
        }

        console.log('Auto-adding category tags from Google Books categories:', categories);

        // Build a quick lookup of existing labels (case-insensitive)
        const existingLabels = new Set(
          (bookTags.value || []).map(t => (t.label || '').toLowerCase())
        );

        let addedAny = false;
        for (const rawCategory of categories) {
          const trimmed = (rawCategory || '').trim();
          if (!trimmed) continue;
          const label = `category:${trimmed}`;
          if (existingLabels.has(label.toLowerCase())) {
            console.log(`Category tag already exists: ${label}`);
            continue;
          }
          
          try {
            console.log(`Adding category tag: ${label}`);
            const result = await addTag(currentUser.value, label, book.value.id);
            if (result && result.success) {
              addedAny = true;
              console.log(`Successfully added category tag: ${label}`);
            } else {
              console.warn(`Failed to add category tag: ${label}`, result);
            }
          } catch (e) {
            console.warn(`Error adding category tag ${label}:`, e);
          }
        }

        if (addedAny) {
          console.log('Auto-tagging completed, reloading tags');
          await loadBookTags(currentUser.value, book.value.id);
          bookTags.value = await getBookTags(book.value.id);
        } else {
          console.log('No new category tags added');
        }
      } catch (error) {
        console.error('Error in auto-tagging:', error);
      }
    };
    
    return {
      book,
      isLoading,
      error,
      showTagForm,
      newTagLabel,
      isAddingTag,
      tagError,
      tagSuccess,
      bookTags,
      hasTags,
      currentUser,
      isAuthenticated,
      toggleTagForm,
      handleAddTag,
      removeTag: handleRemoveTag,
      formatDate,
      getStars
    };
  }
};
</script>

<style scoped>
.book-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  color: white;
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.error h2 {
  margin-bottom: 1rem;
}

.back-to-search {
  display: inline-block;
  background: white;
  color: #2c3e50;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  transition: transform 0.2s;
}

.back-to-search:hover {
  transform: translateY(-2px);
}

.book-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.book-header {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.book-cover-large {
  flex-shrink: 0;
  width: 200px;
  height: 300px;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.no-cover-large {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-cover-text {
  color: #999;
  font-size: 1rem;
  text-align: center;
}

.book-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.book-title {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
}

.book-authors,
.book-published,
.book-publisher,
.book-pages,
.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
}

.authors,
.published-date,
.publisher,
.pages {
  color: #666;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  color: #ffc107;
  font-size: 1.2rem;
}

.rating-value {
  color: #666;
  font-weight: 600;
}

.rating-count {
  color: #999;
  font-size: 0.9rem;
}

.book-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.preview-btn,
.info-btn,
.tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.preview-btn {
  background: #42b983;
  color: white;
}

.preview-btn:hover {
  background: #369870;
  transform: translateY(-2px);
}

.info-btn {
  background: #6c757d;
  color: white;
}

.info-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.tag-btn {
  background: #17a2b8;
  color: white;
}

.tag-btn:hover {
  background: #138496;
  transform: translateY(-2px);
}

.book-description {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.book-description h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.description-content {
  color: #666;
  line-height: 1.6;
  font-size: 1rem;
}

.shelving-section {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.shelving-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.tags-section {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.tags-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.existing-tags {
  margin-bottom: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #e9ecef;
  color: #495057;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.private-tag {
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0;
  margin-left: 0.25rem;
  line-height: 1;
}

.remove-tag-btn:hover {
  color: #c82333;
}

.tag-form {
  margin-top: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.tag-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tag-form-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #dc3545;
}

.form-group {
  margin-bottom: 1rem;
}

.tag-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.tag-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.tag-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.add-tag-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-tag-btn:hover:not(:disabled) {
  background: #369870;
}

.add-tag-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  background: #5a6268;
}

.cancel-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.no-tags {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.add-first-tag-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.add-first-tag-btn:hover {
  background: #138496;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #c3e6cb;
}

.navigation {
  padding: 2rem;
  text-align: center;
}

.back-btn {
  display: inline-block;
  background: #6c757d;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .book-detail-page {
    padding: 1rem 0.5rem;
  }
  
  .book-header {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  
  .book-cover-large {
    width: 150px;
    height: 225px;
    margin: 0 auto;
  }
  
  .book-title {
    font-size: 1.5rem;
  }
  
  .book-authors,
  .book-published,
  .book-publisher,
  .book-pages,
  .book-rating {
    justify-content: center;
  }
  
  .label {
    min-width: auto;
  }
  
  .book-actions {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>

<template>
  <div class="book-item">
    <div class="book-cover">
      <img 
        v-if="book.volumeInfo.imageLinks?.thumbnail" 
        :src="book.volumeInfo.imageLinks.thumbnail" 
        :alt="book.volumeInfo.title"
        class="book-thumbnail"
      />
      <div v-else class="no-cover">
        <span class="no-cover-text">No Cover</span>
      </div>
    </div>
    
    <div class="book-details">
      <h3 class="book-title">{{ book.volumeInfo.title }}</h3>
      
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
      
      <div v-if="book.volumeInfo.description" class="book-description">
        <p>{{ truncateDescription(book.volumeInfo.description) }}</p>
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
      
      <!-- Tags Display -->
      <div v-if="bookTags.length > 0" class="book-tags">
        <div class="tags-label">Tags:</div>
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
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import { useTags } from '../composables/useTags.js';

export default {
  name: 'BookItem',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const { currentUser, isAuthenticated } = useAuth();
    const { loadBookTags, addTag, removeTag, getBookTags } = useTags();
    
    const showTagForm = ref(false);
    const newTagLabel = ref('');
    const isAddingTag = ref(false);
    const tagError = ref(null);
    const tagSuccess = ref(null);
    const bookTags = ref([]);
    
    const hasTags = computed(() => bookTags.value.length > 0);
    
    const loadTags = async () => {
      if (currentUser.value && props.book.id) {
        const tags = await loadBookTags(currentUser.value, props.book.id);
        bookTags.value = tags;
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
      if (!newTagLabel.value.trim() || !currentUser.value) return;
      
      isAddingTag.value = true;
      tagError.value = null;
      tagSuccess.value = null;
      
      try {
        const result = await addTag(currentUser.value, newTagLabel.value.trim(), props.book.id);
        if (result.success) {
          tagSuccess.value = 'Tag added successfully!';
          newTagLabel.value = '';
          await loadTags(); // Refresh tags
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
          await loadTags(); // Refresh tags
        } else {
          tagError.value = result.error || 'Failed to remove tag';
        }
      } catch (error) {
        tagError.value = 'Failed to remove tag. Please try again.';
      }
    };
    
    onMounted(() => {
      loadTags();
    });
    
    return {
      currentUser,
      isAuthenticated,
      showTagForm,
      newTagLabel,
      isAddingTag,
      tagError,
      tagSuccess,
      bookTags,
      hasTags,
      toggleTagForm,
      handleAddTag,
      removeTag: handleRemoveTag
    };
  },
  methods: {
    formatDate(dateString) {
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
    },
    
    getStars(rating) {
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;
      let stars = '★'.repeat(fullStars);
      if (hasHalfStar) {
        stars += '☆';
      }
      return stars;
    },
    
    truncateDescription(description) {
      if (!description) return '';
      const maxLength = 200;
      if (description.length <= maxLength) return description;
      return description.substring(0, maxLength) + '...';
    }
  }
};
</script>

<style scoped>
.book-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.book-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.book-cover {
  flex-shrink: 0;
  width: 120px;
  height: 180px;
}

.book-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.no-cover {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border: 2px dashed #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-cover-text {
  color: #999;
  font-size: 0.8rem;
  text-align: center;
}

.book-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.book-title {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.3;
}

.book-authors,
.book-published,
.book-publisher,
.book-pages,
.book-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.label {
  font-weight: 600;
  color: #555;
  min-width: 80px;
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
  font-size: 1rem;
}

.rating-value {
  color: #666;
  font-weight: 600;
}

.rating-count {
  color: #999;
  font-size: 0.8rem;
}

.book-description {
  margin-top: 0.5rem;
}

.book-description p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.preview-btn,
.info-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
}

.preview-btn {
  background: #42b983;
  color: white;
}

.preview-btn:hover {
  background: #369870;
  transform: translateY(-1px);
}

.info-btn {
  background: #6c757d;
  color: white;
}

.info-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.tag-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  background: #138496;
  transform: translateY(-1px);
}

.book-tags {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.tags-label {
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  font-size: 1rem;
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
  padding: 1rem;
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
  font-size: 1rem;
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
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.tag-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.tag-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.add-tag-btn {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
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
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
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

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  border: 1px solid #c3e6cb;
}

@media (max-width: 768px) {
  .book-item {
    flex-direction: column;
    text-align: center;
  }
  
  .book-cover {
    width: 100px;
    height: 150px;
    margin: 0 auto;
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
}
</style>

<template>
  <div class="advanced-search-form">
    <div class="search-header">
      <h3><img src="../../assets/search-icon.png" alt="Search icon" width = "15"> Advanced Search</h3>
      <p>Search for books using multiple criteria</p>
    </div>
    
    <form @submit.prevent="handleSearch" class="search-form">
      <!-- Title Search -->
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="searchForm.title"
          type="text"
          placeholder="Enter book title..."
          class="form-input"
        />
      </div>
      
      <!-- Author Search -->
      <div class="form-group">
        <label for="author">Author</label>
        <input
          id="author"
          v-model="searchForm.author"
          type="text"
          placeholder="Enter author name..."
          class="form-input"
        />
      </div>
      
      <!-- Tag Search -->
      <div class="form-group">
        <label for="tags">Tags</label>
        <div class="tag-input-container">
          <input
            id="tags"
            v-model="tagInput"
            type="text"
            placeholder="Enter tags (press Enter to add)..."
            class="form-input"
            @keydown.enter.prevent="addTag"
            @input="handleTagInput"
          />
          <div v-if="tagSuggestions.length > 0" class="tag-suggestions">
            <div
              v-for="suggestion in tagSuggestions"
              :key="suggestion"
              @click="selectTagSuggestion(suggestion)"
              class="tag-suggestion"
            >
              {{ suggestion }}
            </div>
          </div>
        </div>
        
        <!-- Selected Tags -->
        <div v-if="searchForm.tags.length > 0" class="selected-tags">
          <div
            v-for="(tag, index) in searchForm.tags"
            :key="index"
            class="selected-tag"
          >
            {{ tag }}
            <button
              type="button"
              @click="removeTag(index)"
              class="remove-tag-btn"
            >
              ×
            </button>
          </div>
        </div>
        
      </div>
      
      <!-- Search Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="search-btn"
          :disabled="isSearching || !hasSearchCriteria"
        >
          {{ isSearching ? 'Searching...' : 'Search Books' }}
        </button>
        <button
          type="button"
          @click="clearForm"
          class="clear-btn"
          :disabled="isSearching"
        >
          Clear All
        </button>
      </div>
    </form>
    
    <!-- Search Results Summary -->
    <div v-if="hasSearched && !isSearching" class="search-summary">
      <h4>Search Results</h4>
      <p v-if="searchResults.length > 0">
        Found {{ searchResults.length }} book{{ searchResults.length !== 1 ? 's' : '' }} 
        {{ getSearchSummary() }}
      </p>
      <p v-else class="no-results">
        No books found matching your criteria. Try adjusting your search terms.
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useTags } from '../composables/useTags.js';
import apiService from '../services/api.js';

export default {
  name: 'AdvancedSearchForm',
  emits: ['search-results', 'search-started'],
  setup(props, { emit }) {
    const { getAllPublicTags } = useTags();
    
    const searchForm = ref({
      title: '',
      author: '',
      tags: [],
      tagIntersection: false
    });
    
    const tagInput = ref('');
    const tagSuggestions = ref([]);
    const isSearching = ref(false);
    const hasSearched = ref(false);
    const searchResults = ref([]);
    const allPublicTags = ref([]);
    
    const hasSearchCriteria = computed(() => {
      return searchForm.value.title.trim() || 
             searchForm.value.author.trim() || 
             searchForm.value.tags.length > 0;
    });
    
    const loadPublicTags = async () => {
      try {
        const tags = await getAllPublicTags();
        allPublicTags.value = tags.map(tag => tag.label);
      } catch (error) {
        console.error('Failed to load public tags:', error);
      }
    };
    
    const handleTagInput = () => {
      const input = tagInput.value.toLowerCase().trim();
      if (input.length > 0) {
        tagSuggestions.value = allPublicTags.value
          .filter(tag => tag.toLowerCase().includes(input))
          .slice(0, 5);
      } else {
        tagSuggestions.value = [];
      }
    };
    
    const addTag = () => {
      const tag = tagInput.value.trim();
      if (tag && !searchForm.value.tags.includes(tag)) {
        searchForm.value.tags.push(tag);
        tagInput.value = '';
        tagSuggestions.value = [];
      }
    };
    
    const selectTagSuggestion = (suggestion) => {
      if (!searchForm.value.tags.includes(suggestion)) {
        searchForm.value.tags.push(suggestion);
        tagInput.value = '';
        tagSuggestions.value = [];
      }
    };
    
    const removeTag = (index) => {
      searchForm.value.tags.splice(index, 1);
    };
    
    const clearForm = () => {
      searchForm.value = {
        title: '',
        author: '',
        tags: [],
        tagIntersection: false
      };
      tagInput.value = '';
      tagSuggestions.value = [];
      searchResults.value = [];
      hasSearched.value = false;
    };
    
    const handleSearch = async () => {
      if (!hasSearchCriteria.value) return;
      
      isSearching.value = true;
      hasSearched.value = true;
      emit('search-started');
      
      try {
        let results = [];

        // Split tags into category-based and normal user tags
        const categoryTags = searchForm.value.tags
          .filter(t => t.toLowerCase().startsWith('category:'))
          .map(t => t.slice('category:'.length).trim())
          .filter(Boolean)
          .flatMap(cat => cat.split('/').map(part => part.trim()).filter(part => part.length > 0));
        const normalTags = searchForm.value.tags
          .filter(t => !t.toLowerCase().startsWith('category:'));

        
        // Search by normal tags via backend
        if (normalTags.length > 0) {
          const tagResults = await searchByTags(normalTags);
          results = tagResults;

          if (categoryTags.length > 0 || searchForm.value.title.trim() || searchForm.value.author.trim()) {
            const tempResults = [];
            for (const book of results) {
              const bookTitle = (await searchSpecificBook(book.id)).volumeInfo.title;
              if(searchForm.value.title.trim() && searchForm.value.title.trim() !== bookTitle.trim()) {
                continue;
              }
              if ((await searchByGoogleBooks(categoryTags, bookTitle, searchForm.value.author.trim())).length > 0) {
                tempResults.push(book);
              }
            }
            results = tempResults;
          }
        }

        
        // Search Google Books by title/author and category subjects
        else if (searchForm.value.title.trim() || searchForm.value.author.trim() || categoryTags.length > 0) {
          const googleResults = await searchByGoogleBooks(categoryTags);
          
          if (results.length > 0) {
            results = intersectResults(results, googleResults);
          } else {
            results = googleResults;
          }
        }
        
        searchResults.value = results;
        emit('search-results', results);
      } catch (error) {
        console.error('Search error:', error);
        searchResults.value = [];
        emit('search-results', []);
      } finally {
        isSearching.value = false;
      }
    };
    
    const searchByTags = async (labels) => {
      try {
        const response = await apiService.getBooksByLabel(
          '', // No specific user for public tags
          labels,
          'union'
          // searchForm.value.tagIntersection ? 'intersect' : 'union'
        );
        
        // Get book details for each book ID
        const bookDetails = [];
        for (const bookRef of response) {
          try {
            const bookDetail = await apiService.getBookDetails(bookRef.book);
            bookDetails.push(bookDetail);
          } catch (error) {
            console.warn(`Failed to load details for book ${bookRef.book}:`, error);
          }
        }
        
        return bookDetails;
      } catch (error) {
        console.error('Tag search error:', error);
        return [];
      }
    };
    
    const searchByGoogleBooks = async (categorySubjects = [], title = searchForm.value.title.trim(), author = searchForm.value.author.trim()) => {
      try {
        // Build base query (title/author only)
        const parts = [];
        if (title) {
          parts.push(`intitle:${title}`);
        }
        if (author) {
          parts.push(`inauthor:${author}`);
        }
        for(const subject of categorySubjects) {
          parts.push(`subject:${subject}`);
        }

        // OR mode by default for categories: run one request per subject and union results
        // if (categorySubjects.length > 0) {
        //   const seen = new Set();
        //   const merged = [];
        //   for (const subject of categorySubjects) {
        //     const term = subject.replace(/\s+/g, '+');
        //     const query = [...parts, `subject:${term}`].join('+');
        //     console.log('Google Books query:', query);
        //     try {
        //       const response = await apiService.searchBooks(query, 40);
        //       const items = response.items || [];
        //       for (const item of items) {
        //         if (item?.id && !seen.has(item.id)) {
        //           seen.add(item.id);
        //           merged.push(item);
        //         }
        //       }
        //     } catch (err) {
        //       console.warn('Google Books subquery failed for subject:', subject, err);
        //     }
        //   }
        //   return merged;
        // }

        // No categories: single request with base parts
        const baseQuery = parts.join('+');
        console.log('Google Books query:', baseQuery);
        const response = await apiService.searchBooks(baseQuery, 40);
        return response.items || [];
      } catch (error) {
        console.error('Google Books search error:', error);
        return [];
      }
    };

    const searchSpecificBook = async (bookId) => {
      try {
        const response = await apiService.getBookDetails(bookId);
        return response;
      } catch (error) {
        console.error('Specific book search error:', error);
        return null;
      }
    };
    
    const intersectResults = (tagResults, googleResults) => {
      const tagBookIds = new Set(tagResults.map(book => book.id));
      return googleResults.filter(book => tagBookIds.has(book.id));
    };
    
    const getSearchSummary = () => {
      const criteria = [];
      if (searchForm.value.title.trim()) {
        criteria.push(`title: "${searchForm.value.title.trim()}"`);
      }
      if (searchForm.value.author.trim()) {
        criteria.push(`author: "${searchForm.value.author.trim()}"`);
      }
      if (searchForm.value.tags.length > 0) {
        const tagText = searchForm.value.tags.join(', ');
        const type = searchForm.value.tagIntersection ? 'all tags' : 'any tags';
        criteria.push(`${type}: ${tagText}`);
      }
      return `for ${criteria.join(', ')}`;
    };
    
    // Load public tags on mount
    loadPublicTags();
    
    return {
      searchForm,
      tagInput,
      tagSuggestions,
      isSearching,
      hasSearched,
      searchResults,
      hasSearchCriteria,
      handleTagInput,
      addTag,
      selectTagSuggestion,
      removeTag,
      clearForm,
      handleSearch,
      getSearchSummary
    };
  }
};
</script>

<style scoped>
.advanced-search-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.search-header {
  text-align: center;
  margin-bottom: 2rem;
}

.search-header h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.search-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 1rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #889841;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.1);
}

.tag-input-container {
  position: relative;
}

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.tag-suggestion {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.tag-suggestion:hover {
  background: #f8f9fa;
}

.tag-suggestion:last-child {
  border-bottom: none;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.selected-tag {
  background: #889841;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0;
  line-height: 1;
}

.remove-tag-btn:hover {
  color: #ffeb3b;
}

.tag-search-type {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #2c3e50;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.95rem;
}

.help-text {
  margin: 0.5rem 0 0 0;
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.inline-hint {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #6c4b73;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.search-btn {
  background: #889841;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #5b662a;
  transform: translateY(-2px);
}

.search-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  background: #5a6268;
  transform: translateY(-2px);
}

.clear-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.search-summary {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.search-summary h4 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.search-summary p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

.no-results {
  color: #b52b39 !important;
  font-weight: 500;
}

@media (max-width: 768px) {
  .advanced-search-form {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .search-btn,
  .clear-btn {
    width: 100%;
  }
  
  .selected-tags {
    justify-content: center;
  }
}
</style>

<template>
  <div class="search">
    <h1>📚 Advanced Book Search</h1>
    <p>Discover your next favorite read with powerful search filters</p>
    
    <div class="search-content">
      <!-- Advanced Search Form -->
      <AdvancedSearchForm
        @search-results="handleSearchResults"
        @search-started="handleSearchStarted"
      />
      
      <!-- Search Results -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="searchResults.length > 0" class="search-results">
        <div class="results-header">
          <h3>Search Results ({{ searchResults.length }} books found)</h3>
        </div>
        
        <div class="books-grid">
          <BookSearchItem
            v-for="book in searchResults"
            :key="book.id"
            :book="book"
          />
        </div>
      </div>
      
      <div v-else-if="hasSearched && !isLoading" class="no-results">
        <h3>No books found</h3>
        <p>Try adjusting your search criteria or using different keywords.</p>
      </div>
      
      <div v-else-if="!hasSearched" class="search-prompt">
        <div class="search-icon">🔍</div>
        <h3>Start Your Advanced Search</h3>
        <p>Use the form above to search by title, author, or tags!</p>
        <div class="search-tips">
          <h4>Search Tips:</h4>
          <ul>
            <li><strong>Title Search:</strong> Enter part or all of a book title</li>
            <li><strong>Author Search:</strong> Enter the author's name</li>
            <li><strong>Tag Search:</strong> Add tags to find books with specific labels</li>
            <li><strong>Combined Search:</strong> Use multiple criteria for precise results</li>
            <li><strong>Tag Options:</strong> Choose "all tags" for books that must have every tag</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import BookSearchItem from '../components/BookSearchItem.vue';
import AdvancedSearchForm from '../components/AdvancedSearchForm.vue';

export default {
  name: 'Search',
  components: {
    BookSearchItem,
    AdvancedSearchForm
  },
  setup() {
    const searchResults = ref([]);
    const isLoading = ref(false);
    const hasSearched = ref(false);
    const error = ref(null);
    
    const handleSearchResults = (results) => {
      searchResults.value = results;
      hasSearched.value = true;
      error.value = null;
    };
    
    const handleSearchStarted = () => {
      isLoading.value = true;
      error.value = null;
    };
    
    return {
      searchResults,
      isLoading,
      hasSearched,
      error,
      handleSearchResults,
      handleSearchStarted
    };
  }
};
</script>

<style scoped>
.search {
  text-align: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

h1 {
  color: white;
  margin-bottom: 1rem;
  font-size: 2.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.search-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.search-tips {
  text-align: left;
  max-width: 600px;
  margin: 2rem auto 0;
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-tips h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.search-tips ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.search-tips li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.search-tips strong {
  color: #2c3e50;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
}

.results-header {
  text-align: left;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eee;
}

.results-header h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.results-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.books-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}


.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-results h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.search-prompt {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.search-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.search-prompt h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}


@media (max-width: 768px) {
  .search {
    padding: 1rem 0.5rem;
  }
  
  .search-content {
    padding: 1rem;
  }
  
  .search-tips {
    margin: 1rem auto 0;
    padding: 1rem;
  }
}
</style>

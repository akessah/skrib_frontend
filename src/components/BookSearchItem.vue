<template>
  <div class="book-search-item" @click="navigateToBook">
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
    
    <div class="book-info">
      <h3 class="book-title">{{ book.volumeInfo.title }}</h3>
      
      <div v-if="book.volumeInfo.authors" class="book-authors">
        <span class="authors">{{ book.volumeInfo.authors.join(', ') }}</span>
      </div>
    </div>
    
    <div class="click-indicator">
      <span class="click-text">Click for details</span>
      <span class="arrow">→</span>
    </div>
  </div>
</template>

<script>
import { useRouter } from 'vue-router';

export default {
  name: 'BookSearchItem',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    
    const navigateToBook = () => {
      router.push({
        name: 'BookDetail',
        params: { id: props.book.id }
      });
    };
    
    return {
      navigateToBook
    };
  }
};
</script>

<style scoped>
.book-search-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.book-search-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border-color: #889841;
}

.book-cover {
  flex-shrink: 0;
  width: 80px;
  height: 120px;
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
  font-size: 0.7rem;
  text-align: center;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.book-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-authors {
  color: #666;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.click-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #889841;
  font-size: 0.8rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.book-search-item:hover .click-indicator {
  opacity: 1;
}

.click-text {
  font-weight: 500;
}

.arrow {
  font-size: 1.2rem;
  font-weight: bold;
}

@media (max-width: 768px) {
  .book-search-item {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .book-cover {
    width: 100px;
    height: 150px;
  }
  
  .click-indicator {
    opacity: 1;
  }
  
  .book-title {
    -webkit-line-clamp: 3;
  }
}
</style>

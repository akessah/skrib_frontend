<template>
  <div class="post-list">
    <div class="post-list-header">
      <h3>Community Posts</h3>
      <div class="header-actions">
        <div class="sort-dropdown">
          <label for="sort-select">Sort by:</label>
          <select 
            id="sort-select"
            v-model="sortBy" 
            @change="handleSortChange"
            class="sort-select"
            :disabled="isLoading"
          >
            <option value="date">Date (Newest First)</option>
            <option value="upvotes">Upvotes (Most First)</option>
          </select>
        </div>
        <button 
          @click="refreshPosts" 
          :disabled="isLoading"
          class="refresh-btn"
        >
          {{ isLoading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>
    
    <div v-if="isLoading && posts.length === 0" class="loading">
      <p>Loading posts...</p>
    </div>
    
    <div v-else-if="posts.length === 0" class="no-posts">
      <p>No posts yet. Be the first to start a discussion!</p>
    </div>
    
    <div v-else class="posts-container">
        <PostItem
          v-for="post in posts"
          :key="post._id"
          :post="post"
          :current-user="currentUser"
          :author-map="authorMap"
          @post-updated="handlePostUpdated"
          @post-deleted="handlePostDeleted"
          @post-upvoted="handlePostUpvoted"
        />
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import PostItem from './PostItem.vue';
import apiService from '../services/api.js';
import { useUsers } from '../composables/useUsers.js';
import { useUpvotes } from '../composables/useUpvotes.js';

export default {
  name: 'PostList',
  components: { PostItem },
  props: {
    currentUser: {
      type: String,
      required: true
    }
  },
  emits: ['posts-loaded', 'post-upvoted'],
  setup(props, { emit }) {
    const posts = ref([]);
    const allPosts = ref([]); // Store unsorted posts
    const isLoading = ref(false);
    const error = ref(null);
    const authorMap = ref({});
    const sortBy = ref('date'); // 'date' or 'upvotes'
    const { fetchAllUsers, users, fetchUsernameById } = useUsers();
    const { loadUpvotesForItems, getUpvotesForItem } = useUpvotes();

    const sortPosts = async (postsToSort, sortMethod) => {
      if (sortMethod === 'date') {
        // Sort by date field (newest first), fallback to _id if date is not available
        return [...postsToSort].sort((a, b) => {
          if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
          } else if (a.date) {
            return -1; // a has date, b doesn't - a comes first
          } else if (b.date) {
            return 1; // b has date, a doesn't - b comes first
          } else {
            // Fallback to _id comparison
            return b._id.localeCompare(a._id);
          }
        });
      } else if (sortMethod === 'upvotes') {
        // Sort by upvote count (most first)
        // First, ensure upvotes are loaded for all posts
        const postIds = postsToSort.map(p => p._id);
        await loadUpvotesForItems(postIds, props.currentUser);
        
        return [...postsToSort].sort((a, b) => {
          const upvotesA = getUpvotesForItem(a._id).count || 0;
          const upvotesB = getUpvotesForItem(b._id).count || 0;
          return upvotesB - upvotesA; // Descending order (most upvotes first)
        });
      }
      return postsToSort;
    };

    const loadPosts = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const response = await apiService.getAllPosts();
        const fetchedPosts = response || [];
        allPosts.value = fetchedPosts;
        
        // Sort posts based on current sort method
        posts.value = await sortPosts(fetchedPosts, sortBy.value);
        
        // build authorMap using live API resolution
        const userIds = Array.from(new Set(posts.value.map(p => p.author)));
        const usernameMap = {};
        for (const uid of userIds) {
          usernameMap[uid] = await fetchUsernameById(uid);
        }
        console.log(`usernameMap: ${usernameMap}`);
        // always use usernameMap for user lookups
        const map = {};
        posts.value.forEach(post => {
          if (post.author && usernameMap[post.author]) {
            map[post.author] = usernameMap[post.author];
          } else if (post.author) {
            map[post.author] = `User ${post.author.slice(0, 8)}`;
          }
        });
        authorMap.value = map;
        emit('posts-loaded', posts.value);
      } catch (err) {
        error.value = err.message || 'Failed to load posts. Please try again.';
        posts.value = [];
        allPosts.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const handleSortChange = async () => {
      if (allPosts.value.length === 0) return;
      isLoading.value = true;
      try {
        posts.value = await sortPosts(allPosts.value, sortBy.value);
        emit('posts-loaded', posts.value);
      } catch (err) {
        error.value = err.message || 'Failed to sort posts. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(async () => {
      await fetchAllUsers();
      await loadPosts();
    });

    const refreshPosts = loadPosts;
    const handlePostUpdated = (updatedPost) => {
      const index = posts.value.findIndex(post => post._id === updatedPost._id);
      if (index !== -1) posts.value.splice(index, 1, updatedPost);
      // Also update allPosts
      const allIndex = allPosts.value.findIndex(post => post._id === updatedPost._id);
      if (allIndex !== -1) allPosts.value.splice(allIndex, 1, updatedPost);
    };
    const handlePostDeleted = (postId) => {
      posts.value = posts.value.filter(post => post._id !== postId);
      allPosts.value = allPosts.value.filter(post => post._id !== postId);
    };
    const handlePostUpvoted = async (upvoteData) => {
      emit('post-upvoted', upvoteData);
      // If sorting by upvotes, re-sort after upvote change
      if (sortBy.value === 'upvotes' && allPosts.value.length > 0) {
        posts.value = await sortPosts(allPosts.value, sortBy.value);
      }
    };
    const addNewPost = (post) => {
      allPosts.value.unshift(post);
      posts.value.unshift(post);
    };

    return { 
      posts, 
      isLoading, 
      error, 
      authorMap, 
      sortBy,
      refreshPosts, 
      handlePostUpdated, 
      handlePostDeleted, 
      handlePostUpvoted, 
      addNewPost, 
      handleSortChange,
      currentUser: props.currentUser 
    };
  }
};
</script>

<style scoped>
.post-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e1e5e9;
  margin-bottom: 1rem;
}

.post-list-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-dropdown label {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 500;
}

.sort-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.sort-select:hover:not(:disabled) {
  border-color: #889841;
}

.sort-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.refresh-btn {
  background-color: #889841;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #5b662a;
}

.refresh-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.loading, .no-posts {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.posts-container {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 1rem 1.5rem;
  border-top: 1px solid #fcc;
  font-size: 0.9rem;
}
</style>

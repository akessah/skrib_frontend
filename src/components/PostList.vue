<template>
  <div class="post-list">
    <div class="post-list-header">
      <h3>Community Posts</h3>
      <button 
        @click="refreshPosts" 
        :disabled="isLoading"
        class="refresh-btn"
      >
        {{ isLoading ? 'Loading...' : 'Refresh' }}
      </button>
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
import PostItem from './PostItem.vue';
import apiService from '../services/api.js';

export default {
  name: 'PostList',
  components: {
    PostItem
  },
  props: {
    currentUser: {
      type: String,
      required: true
    }
  },
  emits: ['posts-loaded', 'post-upvoted'],
  data() {
    return {
      posts: [],
      isLoading: false,
      error: null
    };
  },
  async mounted() {
    await this.loadPosts();
  },
  methods: {
    async loadPosts() {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await apiService.getAllPosts();
        this.posts = response || [];
        this.$emit('posts-loaded', this.posts);
      } catch (error) {
        this.error = error.message || 'Failed to load posts. Please try again.';
        this.posts = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    async refreshPosts() {
      await this.loadPosts();
      // Emit posts-loaded to trigger author map building
      this.$emit('posts-loaded', this.posts);
    },
    
    handlePostUpdated(updatedPost) {
      const index = this.posts.findIndex(post => post._id === updatedPost._id);
      if (index !== -1) {
        this.posts.splice(index, 1, updatedPost);
      }
    },
    
    handlePostDeleted(postId) {
      this.posts = this.posts.filter(post => post._id !== postId);
    },
    
    handlePostUpvoted(upvoteData) {
      // Emit upvote event to parent component
      this.$emit('post-upvoted', upvoteData);
    },
    
    addNewPost(post) {
      // Add new post to the beginning of the list
      this.posts.unshift(post);
    }
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

.refresh-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #369870;
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

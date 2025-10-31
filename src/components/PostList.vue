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
    const isLoading = ref(false);
    const error = ref(null);
    const authorMap = ref({});
    const { fetchAllUsers, users, fetchUsernameById } = useUsers();

    const loadPosts = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const response = await apiService.getAllPosts();
        const allPosts = response || [];
        // Sort posts by _id descending (newest first) - MongoDB ObjectIds encode creation time
        posts.value = allPosts.sort((a, b) => {
          // Compare ObjectIds as strings - newer IDs are lexicographically larger
          return b._id.localeCompare(a._id);
        });
        // build authorMap using live API resolution
        const userIds = Array.from(new Set(posts.value.map(p => p.author)));
        const usernameMap = {};
        for (const uid of userIds) {
          usernameMap[uid] = await fetchUsernameById(uid);
        }
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
    };
    const handlePostDeleted = (postId) => {
      posts.value = posts.value.filter(post => post._id !== postId);
    };
    const handlePostUpvoted = (upvoteData) => emit('post-upvoted', upvoteData);
    const addNewPost = (post) => posts.value.unshift(post);

    return { posts, isLoading, error, authorMap, refreshPosts, handlePostUpdated, handlePostDeleted, handlePostUpvoted, addNewPost, currentUser: props.currentUser };
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

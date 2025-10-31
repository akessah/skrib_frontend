<template>
  <div class="post-detail-page">
    <div v-if="!isAuthenticated" class="auth-required">
      <h2><img src="../../assets/lock.png" alt="Lock icon" width = "15"></img> Login Required</h2>
      <p>You need to be logged in to view posts and participate in discussions.</p>
      <p>Please login or register to continue:</p>
      <AuthForm @auth-success="handleAuthSuccess" />
    </div>
    
    <div v-else class="post-detail-content">
      <!-- Navigation -->
      <div class="navigation">
        <router-link to="/forum" class="back-btn">
          ← Back to Forum
        </router-link>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="loading">
        <p>Loading post...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error">
        <h2>Error</h2>
        <p>{{ error }}</p>
        <router-link to="/forum" class="back-btn">
          ← Back to Forum
        </router-link>
      </div>
      
      <!-- Post Content -->
      <div v-else-if="post" class="post-container">
        <!-- Post Header -->
        <div class="post-header">
          <div class="post-author">
            <strong>{{ postAuthor }}</strong>
          </div>
          <div class="post-actions">
            <UpvoteButton 
              :item-id="post._id"
              :current-user="currentUser"
              @upvote-toggled="handleUpvoteToggled"
            />
            <div v-if="isAuthor" class="author-actions">
              <button 
                @click="toggleEdit" 
                class="action-btn edit-btn"
                :disabled="isEditing"
              >
                {{ isEditing ? 'Cancel' : 'Edit' }}
              </button>
              <button 
                @click="handleDelete" 
                class="action-btn delete-btn"
                :disabled="isDeleting"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Post Content -->
        <div v-if="!isEditing" class="post-content">
          <p>{{ post.body }}</p>
        </div>
        
        <!-- Edit Form -->
        <div v-else class="edit-form">
          <textarea
            v-model="editBody"
            placeholder="Edit your post..."
            rows="4"
            class="edit-textarea"
          ></textarea>
          <div class="edit-actions">
            <button 
              @click="handleUpdate" 
              :disabled="isUpdating || !editBody.trim()"
              class="action-btn save-btn"
            >
              {{ isUpdating ? 'Saving...' : 'Save' }}
            </button>
            <button 
              @click="toggleEdit" 
              :disabled="isUpdating"
              class="action-btn cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
        
        <!-- Comments Section -->
        <div class="comments-section">
          <h3>Comments</h3>
          
          <!-- Comment Form -->
          <CommentForm 
            :current-user="currentUser"
            :post-id="post._id"
            :parent-author="post.author"
            @comment-created="handleCommentCreated"
          />
          
          <!-- Comments List -->
          <CommentList 
            ref="commentList"
            :post-id="post._id"
            :current-user="currentUser"
            :author-map="authorMap"
            :auto-show="true"
            :auto-load-replies="true"
            @comment-upvoted="handleCommentUpvoted"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { useUsers } from '../composables/useUsers.js';
import apiService from '../services/api.js';
import AuthForm from '../components/AuthForm.vue';
import CommentForm from '../components/CommentForm.vue';
import CommentList from '../components/CommentList.vue';
import UpvoteButton from '../components/UpvoteButton.vue';

export default {
  name: 'PostDetail',
  components: {
    AuthForm,
    CommentForm,
    CommentList,
    UpvoteButton
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { currentUser, currentUsername, isAuthenticated, initializeAuth } = useAuth();
    const { fetchAllUsers, buildAuthorMap: buildUserMap, fetchUsernameById } = useUsers();
    
    const post = ref(null);
    const isLoading = ref(false);
    const error = ref(null);
    const authorMap = ref({});
    const commentList = ref(null);
    
    // Edit state
    const isEditing = ref(false);
    const editBody = ref('');
    const isUpdating = ref(false);
    const isDeleting = ref(false);
    
    const postAuthor = computed(() => {
      if (!post.value || !post.value.author) return '';
      return authorMap.value[post.value.author] || `User ${post.value.author.slice(0, 8)}`;
    });
    
    const isAuthor = computed(() => {
      return post.value && post.value.author === currentUser.value;
    });
    
    const loadPost = async () => {
      const postId = route.params.id;
      if (!postId) {
        error.value = 'No post ID provided';
        return;
      }
      
      isLoading.value = true;
      error.value = null;
      
      try {
        // Load all posts and find the specific one
        const response = await apiService.getAllPosts();
        const posts = response || [];
        const foundPost = posts.find(p => p._id === postId);
        
        if (!foundPost) {
          error.value = 'Post not found';
          return;
        }
        
        post.value = foundPost;
        editBody.value = foundPost.body;
        
        // Load users and build author map
        await fetchAllUsers();
        authorMap.value = buildUserMap(posts);
      } catch (err) {
        error.value = err.message || 'Failed to load post';
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleAuthSuccess = () => {
      // User is now authenticated, load the post
      loadPost();
    };
    
    const toggleEdit = () => {
      isEditing.value = !isEditing.value;
      if (isEditing.value) {
        editBody.value = post.value.body;
      }
    };
    
    const handleUpdate = async () => {
      if (!editBody.value.trim()) return;
      
      isUpdating.value = true;
      try {
        const updatedPost = await apiService.editPost(post.value, editBody.value.trim());
        post.value = updatedPost;
        isEditing.value = false;
      } catch (err) {
        error.value = err.message || 'Failed to update post';
      } finally {
        isUpdating.value = false;
      }
    };
    
    const handleDelete = async () => {
      if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
      }
      
      isDeleting.value = true;
      try {
        await apiService.deletePost(post.value);
        router.push('/forum');
      } catch (err) {
        error.value = err.message || 'Failed to delete post';
      } finally {
        isDeleting.value = false;
      }
    };
    
    const handleCommentCreated = async (commentId) => {
      // Refresh comments to show the new one
      console.log('Comment created:', commentId);
      if (commentList.value) {
        await commentList.value.loadComments();
      }
    };
    
    const handleCommentUpvoted = (upvoteData) => {
      // Handle comment upvote events if needed
      console.log('Comment upvoted:', upvoteData);
    };
    
    const handleUpvoteToggled = (upvoteData) => {
      // Handle post upvote events if needed
      console.log('Post upvoted:', upvoteData);
    };
    
    const loadAuthorUsernames = async (authors) => {
      const map = {};
      for (const uid of authors) {
        map[uid] = await fetchUsernameById(uid);
      }
      authorMap.value = map;
    };

    const loadPostAndAuthors = async () => {
      await loadPost(); // assume this loads post.value
      // after loading post, get all unique authorIds for post and its comments
      const commentAuthors = post.value?.comments?.map(c => c.author) || [];
      const allAuthors = Array.from(new Set([post.value?.author, ...commentAuthors].filter(Boolean)));
      await loadAuthorUsernames(allAuthors);
    };
    
    onMounted(() => {
      initializeAuth();
      if (isAuthenticated.value) {
        loadPostAndAuthors();
      }
    });
    
    return {
      currentUser,
      currentUsername,
      isAuthenticated,
      post,
      isLoading,
      error,
      authorMap,
      commentList,
      isEditing,
      editBody,
      isUpdating,
      isDeleting,
      postAuthor,
      isAuthor,
      handleAuthSuccess,
      toggleEdit,
      handleUpdate,
      handleDelete,
      handleCommentCreated,
      handleCommentUpvoted,
      handleUpvoteToggled
    };
  }
};
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #b52b39 0%, #6c4b73 100%); */
  padding: 2rem 1rem;
}

.post-detail-content {
  max-width: 800px;
  margin: 0 auto;
}

.auth-required {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-required h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.auth-required p {
  color: #666;
  margin-bottom: 1rem;
}

.navigation {
  margin-bottom: 2rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  background: #889841;
  color: white;
  text-decoration: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #5b662a;
}

.loading, .error {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error h2 {
  color: #b52b39;
  margin-bottom: 1rem;
}

.post-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.post-author {
  color: #2c3e50;
  font-size: 1.1rem;
}

.post-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.author-actions {
  display: flex;
  gap: 0.5rem;
}

.post-content {
  padding: 1.5rem;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #333;
}

.edit-form {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.edit-textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.edit-textarea:focus {
  outline: none;
  border-color: #889841;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.comments-section {
  padding: 1.5rem;
}

.comments-section h3 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #6c757d;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.delete-btn {
  background-color: #b52b39;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.save-btn {
  background-color: #889841;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background-color: #5b662a;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
}

.cancel-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .post-detail-page {
    padding: 1rem 0.5rem;
  }
  
  .post-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .post-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .edit-actions {
    flex-direction: column;
  }
}
</style>

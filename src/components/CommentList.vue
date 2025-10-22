<template>
  <div class="comment-list">
    <div class="comment-list-header">
      <h4>Comments ({{ comments.length }})</h4>
      <button 
        @click="toggleComments" 
        class="toggle-btn"
      >
        {{ showComments ? 'Hide' : 'Show' }} Comments
      </button>
    </div>
    
    <div v-if="showComments" class="comments-container">
      <div v-if="isLoading" class="loading">
        <p>Loading comments...</p>
      </div>
      
      <div v-else-if="comments.length === 0" class="no-comments">
        <p>No comments yet. Be the first to comment!</p>
      </div>
      
      <div v-else class="comments">
        <CommentItem
          v-for="comment in comments"
          :key="comment._id"
          :comment="comment"
          :current-user="currentUser"
          :author-map="authorMap"
          :auto-load-replies="autoLoadReplies"
          @comment-updated="handleCommentUpdated"
          @comment-deleted="handleCommentDeleted"
          @comment-upvoted="handleCommentUpvoted"
        />
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import CommentItem from './CommentItem.vue';
import apiService from '../services/api.js';

export default {
  name: 'CommentList',
  components: {
    CommentItem
  },
  props: {
    postId: {
      type: String,
      required: true
    },
    currentUser: {
      type: String,
      required: true
    },
    authorMap: {
      type: Object,
      default: () => ({})
    },
    autoShow: {
      type: Boolean,
      default: false
    },
    autoLoadReplies: {
      type: Boolean,
      default: false
    }
  },
  emits: ['comments-loaded', 'comment-upvoted'],
  data() {
    return {
      comments: [],
      isLoading: false,
      error: null,
      showComments: this.autoShow
    };
  },
  async mounted() {
    // If autoShow is true, load comments automatically
    if (this.autoShow) {
      await this.loadComments();
    }
  },
  methods: {
    async loadComments() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Loading comments for post:', this.postId);
        const response = await apiService.getCommentsByParent(this.postId);
        console.log('Comments response:', response);
        this.comments = response || [];
        console.log('Comments loaded:', this.comments.length);
        this.$emit('comments-loaded', this.comments);
      } catch (error) {
        console.error('Error loading comments:', error);
        this.error = error.message || 'Failed to load comments. Please try again.';
        this.comments = [];
      } finally {
        this.isLoading = false;
      }
    },
    
    async toggleComments() {
      if (!this.showComments && this.comments.length === 0) {
        await this.loadComments();
      }
      this.showComments = !this.showComments;
    },
    
    handleCommentUpdated(updatedComment) {
      const index = this.comments.findIndex(comment => comment._id === updatedComment._id);
      if (index !== -1) {
        this.comments.splice(index, 1, updatedComment);
      }
    },
    
    handleCommentDeleted(commentId) {
      this.comments = this.comments.filter(comment => comment._id !== commentId);
    },
    
    handleCommentUpvoted(upvoteData) {
      // Emit upvote event to parent component
      this.$emit('comment-upvoted', upvoteData);
    },
    
    addNewComment(commentId) {
      // Refresh comments to show the new one
      this.loadComments();
    }
  }
};
</script>

<style scoped>
.comment-list {
  margin-top: 1rem;
  border-top: 1px solid #e1e5e9;
  padding-top: 1rem;
}

.comment-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.comment-list-header h4 {
  color: #2c3e50;
  margin: 0;
  font-size: 1rem;
}

.toggle-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background-color: #5a6268;
}

.comments-container {
  margin-top: 1rem;
}

.loading, .no-comments {
  text-align: center;
  color: #666;
  padding: 1rem;
  font-size: 0.9rem;
}

.comments {
  max-height: 400px;
  overflow-y: auto;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}
</style>

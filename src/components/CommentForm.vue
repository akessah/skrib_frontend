<template>
  <div class="comment-form">
    <h4>{{ isReply ? 'Reply to Comment' : 'Add a Comment' }}</h4>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <textarea
          v-model="commentBody"
          :placeholder="isReply ? 'Write your reply...' : 'Write your comment...'"
          rows="3"
          required
          :disabled="isSubmitting"
        ></textarea>
      </div>
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="isSubmitting || !commentBody.trim()"
          class="submit-btn"
        >
          {{ isSubmitting ? 'Posting...' : (isReply ? 'Post Reply' : 'Post Comment') }}
        </button>
        <button 
          type="button" 
          @click="clearForm"
          :disabled="isSubmitting"
          class="clear-btn"
        >
          Clear
        </button>
      </div>
    </form>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      {{ success }}
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js';
import { useNotifications } from '../composables/useNotifications.js';

export default {
  name: 'CommentForm',
  props: {
    currentUser: {
      type: String,
      required: true
    },
    postId: {
      type: String,
      required: false
    },
    parentId: {
      type: String,
      required: false
    },
    parentAuthor: {
      type: String,
      required: false
    }
  },
  emits: ['comment-created'],
  setup() {
    const { sendNotification } = useNotifications();
    
    return {
      sendNotification
    };
  },
  computed: {
    isReply() {
      return !!this.parentId;
    }
  },
  data() {
    return {
      commentBody: '',
      isSubmitting: false,
      error: null,
      success: null
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.commentBody.trim()) {
        this.error = 'Please enter a comment.';
        return;
      }

      this.isSubmitting = true;
      this.error = null;
      this.success = null;

      try {
        // Use parentId for replies, postId for top-level comments
        const targetId = this.parentId || this.postId;
        const response = await apiService.createComment(
          this.currentUser, 
          this.commentBody.trim(), 
          targetId
        );
        this.success = 'Comment posted successfully!';
        this.clearForm();
        this.$emit('comment-created', response.comment);
        
        // Send notification to the parent author if it's not the current user
        if (this.parentAuthor && this.parentAuthor !== this.currentUser) {
          const message = this.isReply 
            ? 'Someone replied to your comment!'
            : 'Someone commented on your post!';
          try {
            await this.sendNotification(this.parentAuthor, message);
          } catch (error) {
            console.error('Failed to send notification:', error);
            // Don't show error to user as comment was still created successfully
          }
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success = null;
        }, 3000);
      } catch (error) {
        this.error = error.message || 'Failed to post comment. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    clearForm() {
      this.commentBody = '';
      this.error = null;
      this.success = null;
    }
  }
};
</script>

<style scoped>
.comment-form {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #e1e5e9;
}

.comment-form h4 {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.form-group {
  margin-bottom: 0.75rem;
}

.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-group textarea:focus {
  outline: none;
  border-color: #42b983;
}

.form-group textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #369870;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.clear-btn {
  background-color: transparent;
  color: #666;
  border: 1px solid #e1e5e9;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover:not(:disabled) {
  border-color: #ccc;
  color: #333;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  border: 1px solid #fcc;
  font-size: 0.85rem;
}

.success-message {
  background-color: #efe;
  color: #363;
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  border: 1px solid #cfc;
  font-size: 0.85rem;
}
</style>

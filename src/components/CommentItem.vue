<template>
  <div class="comment-item">
    <div class="comment-header">
      <div class="comment-author">
        <strong>{{ commentAuthor }}</strong>
      </div>
      <div class="comment-actions">
        <UpvoteButton 
          :item-id="comment._id"
          :current-user="currentUser"
          @upvote-toggled="handleUpvoteToggled"
        />
        <div class="comment-actions-right">
          <button 
            @click="toggleReply" 
            class="action-btn reply-btn"
            :disabled="isReplying"
          >
            {{ isReplying ? 'Cancel' : 'Reply' }}
          </button>
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
    </div>
    
    <div v-if="!isEditing" class="comment-content">
      <p>{{ comment.body }}</p>
    </div>
    
    <div v-else class="comment-edit">
      <textarea
        v-model="editBody"
        rows="2"
        class="edit-textarea"
        :disabled="isUpdating"
      ></textarea>
      <div class="edit-actions">
        <button 
          @click="handleUpdate" 
          class="save-btn"
          :disabled="isUpdating || !editBody.trim()"
        >
          {{ isUpdating ? 'Saving...' : 'Save' }}
        </button>
        <button 
          @click="cancelEdit" 
          class="cancel-btn"
          :disabled="isUpdating"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <!-- Reply Form -->
    <div v-if="isReplying" class="reply-form">
      <CommentForm 
        :current-user="currentUser"
        :parent-id="comment._id"
        :parent-author="comment.author"
        @comment-created="handleReplyCreated"
      />
    </div>
    
    <!-- Replies Toggle and Nested Comments -->
    <div v-if="replies.length > 0" class="replies-section">
      <div class="replies-toggle">
        <button 
          @click="toggleReplies" 
          class="toggle-replies-btn"
        >
          {{ showReplies ? '▼' : '▶' }} {{ replies.length }} {{ replies.length === 1 ? 'reply' : 'replies' }}
        </button>
      </div>
      
      <div v-if="showReplies" class="nested-comments">
        <CommentItem
          v-for="reply in replies"
          :key="reply._id"
          :comment="reply"
          :current-user="currentUser"
          :author-map="authorMap"
          :auto-load-replies="autoLoadReplies"
          @comment-updated="handleReplyUpdated"
          @comment-deleted="handleReplyDeleted"
          @comment-upvoted="handleReplyUpvoted"
        />
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js';
import UpvoteButton from './UpvoteButton.vue';
import CommentForm from './CommentForm.vue';

export default {
  name: 'CommentItem',
  components: {
    UpvoteButton,
    CommentForm
  },
  props: {
    comment: {
      type: Object,
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
    autoLoadReplies: {
      type: Boolean,
      default: false
    }
  },
  emits: ['comment-updated', 'comment-deleted', 'comment-upvoted'],
  async mounted() {
    // If autoLoadReplies is true, load replies automatically
    if (this.autoLoadReplies) {
      await this.loadReplies();
    }
  },
  data() {
    return {
      isEditing: false,
      editBody: '',
      isUpdating: false,
      isDeleting: false,
      isReplying: false,
      replies: [],
      showReplies: false,
      error: null
    };
  },
  computed: {
    isAuthor() {
      return this.comment.author === this.currentUser;
    },
    commentAuthor() {
      // Try to get username from authorMap, fallback to author ID
      return this.authorMap[this.comment.author] || `User ${this.comment.author.slice(0, 8)}`;
    }
  },
  methods: {
    toggleEdit() {
      if (this.isEditing) {
        this.cancelEdit();
      } else {
        this.isEditing = true;
        this.editBody = this.comment.body;
        this.error = null;
      }
    },
    
    cancelEdit() {
      this.isEditing = false;
      this.editBody = '';
      this.error = null;
    },
    
    async handleUpdate() {
      if (!this.editBody.trim()) {
        this.error = 'Comment cannot be empty.';
        return;
      }

      this.isUpdating = true;
      this.error = null;

      try {
        await apiService.editComment(this.comment._id, this.editBody.trim());
        this.isEditing = false;
        this.$emit('comment-updated', {
          ...this.comment,
          body: this.editBody.trim()
        });
      } catch (error) {
        this.error = error.message || 'Failed to update comment. Please try again.';
      } finally {
        this.isUpdating = false;
      }
    },
    
    async handleDelete() {
      if (!confirm('Are you sure you want to delete this comment?')) {
        return;
      }

      this.isDeleting = true;
      this.error = null;

      try {
        await apiService.deleteComment(this.comment._id);
        this.$emit('comment-deleted', this.comment._id);
      } catch (error) {
        this.error = error.message || 'Failed to delete comment. Please try again.';
      } finally {
        this.isDeleting = false;
      }
    },
    
    handleUpvoteToggled(upvoteData) {
      // Emit upvote change to parent component
      this.$emit('comment-upvoted', {
        commentId: this.comment._id,
        upvoteData: upvoteData
      });
    },
    
    toggleReply() {
      this.isReplying = !this.isReplying;
      if (this.isReplying && this.replies.length === 0) {
        this.loadReplies();
      }
    },
    
    toggleReplies() {
      this.showReplies = !this.showReplies;
    },
    
    async loadReplies() {
      try {
        console.log('Loading replies for comment:', this.comment._id);
        const response = await apiService.getCommentsByParent(this.comment._id);
        console.log('Replies response:', response);
        this.replies = response || [];
        console.log('Replies loaded:', this.replies.length);
      } catch (error) {
        console.error('Failed to load replies:', error);
        this.replies = [];
      }
    },
    
    handleReplyCreated(replyId) {
      this.isReplying = false;
      this.showReplies = true; // Show replies when a new one is created
      this.loadReplies(); // Refresh replies to show the new one
    },
    
    handleReplyUpdated(updatedReply) {
      // Update the reply in the replies array
      const index = this.replies.findIndex(reply => reply._id === updatedReply._id);
      if (index !== -1) {
        this.replies.splice(index, 1, updatedReply);
      }
    },
    
    handleReplyDeleted(replyId) {
      // Remove the deleted reply from the replies array
      this.replies = this.replies.filter(reply => reply._id !== replyId);
    },
    
    handleReplyUpvoted(upvoteData) {
      // Emit upvote event to parent component
      this.$emit('comment-upvoted', upvoteData);
    }
  }
};
</script>

<style scoped>
.comment-item {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #42b983;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-author {
  color: #2c3e50;
  font-size: 0.9rem;
}

.comment-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.comment-actions-right {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.author-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 3px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn {
  background-color: #f8f9fa;
  color: #495057;
  border: 1px solid #dee2e6;
}

.edit-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.reply-btn {
  background-color: #17a2b8;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reply-btn:hover:not(:disabled) {
  background-color: #138496;
}

.reply-form {
  margin-top: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e1e5e9;
}

.replies-section {
  margin-top: 1rem;
}

.replies-toggle {
  margin-bottom: 0.5rem;
}

.toggle-replies-btn {
  background: none;
  border: none;
  color: #6c757d;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s;
}

.toggle-replies-btn:hover {
  color: #42b983;
}

.nested-comments {
  margin-top: 0.5rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid #e1e5e9;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-content {
  color: #333;
  line-height: 1.5;
}

.comment-content p {
  margin: 0;
  white-space: pre-wrap;
}

.comment-edit {
  margin-top: 0.5rem;
}

.edit-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.edit-textarea:focus {
  outline: none;
  border-color: #42b983;
}

.edit-textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: flex-end;
}

.save-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 3px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #369870;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: transparent;
  color: #666;
  border: 1px solid #dee2e6;
  padding: 0.25rem 0.75rem;
  border-radius: 3px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover:not(:disabled) {
  border-color: #ccc;
  color: #333;
}

.cancel-btn:disabled {
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
  font-size: 0.8rem;
}
</style>

<template>
  <div class="post-item">
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
            @click.stop="toggleEdit" 
            class="action-btn edit-btn"
            :disabled="isEditing"
          >
            {{ isEditing ? 'Cancel' : 'Edit' }}
          </button>
          <button 
            @click.stop="handleDelete" 
            class="action-btn delete-btn"
            :disabled="isDeleting"
          >
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!isEditing" class="post-content" @click="goToPost">
      <p>{{ post.body }}</p>
      <div class="post-preview-footer">
        <span class="click-hint">Click to view full post and comments</span>
      </div>
    </div>
    
    <div v-else class="post-edit">
      <textarea
        v-model="editBody"
        rows="3"
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
  </div>
</template>

<script>
import { useRouter } from 'vue-router';
import apiService from '../services/api.js';
import UpvoteButton from './UpvoteButton.vue';

export default {
  name: 'PostItem',
  components: {
    UpvoteButton
  },
  setup() {
    const router = useRouter();
    
    const navigateToPost = (postId) => {
      router.push(`/post/${postId}`);
    };
    
    return {
      navigateToPost
    };
  },
  props: {
    post: {
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
    }
  },
  emits: ['post-updated', 'post-deleted', 'post-upvoted'],
  data() {
    return {
      isEditing: false,
      editBody: '',
      isUpdating: false,
      isDeleting: false,
      error: null
    };
  },
  computed: {
    isAuthor() {
      return this.post.author === this.currentUser;
    },
    postAuthor() {
      return this.authorMap[this.post.author] || `User ${this.post.author.slice(0, 8)}`;
    }
  },
  methods: {
    toggleEdit() {
      if (this.isEditing) {
        this.cancelEdit();
      } else {
        this.isEditing = true;
        this.editBody = this.post.body;
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
        this.error = 'Post content cannot be empty.';
        return;
      }

      this.isUpdating = true;
      this.error = null;

      try {
        await apiService.editPost(this.post._id, this.editBody.trim());
        this.isEditing = false;
        this.$emit('post-updated', {
          ...this.post,
          body: this.editBody.trim()
        });
      } catch (error) {
        this.error = error.message || 'Failed to update post. Please try again.';
      } finally {
        this.isUpdating = false;
      }
    },
    
    async handleDelete() {
      if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
      }

      this.isDeleting = true;
      this.error = null;

      try {
        await apiService.deletePost(this.post._id);
        this.$emit('post-deleted', this.post._id);
      } catch (error) {
        this.error = error.message || 'Failed to delete post. Please try again.';
      } finally {
        this.isDeleting = false;
      }
    },
    
    
    handleUpvoteToggled(upvoteData) {
      // Emit upvote change to parent component
      this.$emit('post-upvoted', {
        postId: this.post._id,
        upvoteData: upvoteData
      });
    },
    
    goToPost() {
      this.navigateToPost(this.post._id);
    }
  }
};
</script>

<style scoped>
.post-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  border-left: 4px solid #889841;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
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

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
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
  background-color: #b52b39;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-content {
  color: #333;
  line-height: 1.6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.post-content:hover {
  background-color: #f8f9fa;
}

.post-content p {
  margin: 0;
  white-space: pre-wrap;
}

.post-preview-footer {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #eee;
}

.click-hint {
  font-size: 0.85rem;
  color: #666;
  font-style: italic;
}

.post-edit {
  margin-top: 1rem;
}

.edit-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.edit-textarea:focus {
  outline: none;
  border-color: #889841;
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
  background-color: #889841;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-btn:hover:not(:disabled) {
  background-color: #5b662a;
}

.save-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: transparent;
  color: #666;
  border: 1px solid #dee2e6;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
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
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}
</style>

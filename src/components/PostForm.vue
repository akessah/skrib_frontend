<template>
  <div class="post-form">
    <h3>Create New Post</h3>
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="post-body">What would you like to ask or share?</label>
        <textarea
          id="post-body"
          v-model="postBody"
          placeholder="Ask for book recommendations, share your thoughts, or start a discussion..."
          rows="4"
          required
          :disabled="isSubmitting"
        ></textarea>
      </div>
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="isSubmitting || !postBody.trim()"
          class="submit-btn"
        >
          {{ isSubmitting ? 'Posting...' : 'Post' }}
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

export default {
  name: 'PostForm',
  props: {
    currentUser: {
      type: String,
      required: true
    }
  },
  emits: ['post-created'],
  data() {
    return {
      postBody: '',
      isSubmitting: false,
      error: null,
      success: null
    };
  },
  methods: {
    async handleSubmit() {
      if (!this.postBody.trim()) {
        this.error = 'Please enter some content for your post.';
        return;
      }

      this.isSubmitting = true;
      this.error = null;
      this.success = null;

      try {
        const response = await apiService.createPost(this.currentUser, this.postBody.trim());
        this.success = 'Post created successfully!';
        this.clearForm();
        this.$emit('post-created', response.post);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.success = null;
        }, 3000);
      } catch (error) {
        this.error = error.message || 'Failed to create post. Please try again.';
      } finally {
        this.isSubmitting = false;
      }
    },
    
    clearForm() {
      this.postBody = '';
      this.error = null;
      this.success = null;
    }
  }
};
</script>

<style scoped>
.post-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.post-form h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
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
  gap: 1rem;
  justify-content: flex-end;
}

.submit-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
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
  border: 2px solid #e1e5e9;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
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
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #fcc;
}

.success-message {
  background-color: #efe;
  color: #363;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #cfc;
}
</style>

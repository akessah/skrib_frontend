<template>
  <div class="comment-list">
    <div class="comment-list-header">
      <h4>Comments ({{ comments.length }})</h4>
      <div class="header-actions">
        <div v-if="showComments && comments.length > 0" class="sort-dropdown">
          <label for="comment-sort-select">Sort by:</label>
          <select 
            id="comment-sort-select"
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
          @click="toggleComments" 
          class="toggle-btn"
        >
          {{ showComments ? 'Hide' : 'Show' }} Comments
        </button>
      </div>
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
          :author-map="mergedAuthorMap"
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
import { useUsers } from '../composables/useUsers.js';
import { useUpvotes } from '../composables/useUpvotes.js';

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
  setup() {
    const { fetchUsernameById } = useUsers();
    const { loadUpvotesForItems, getUpvotesForItem } = useUpvotes();
    return { fetchUsernameById, loadUpvotesForItems, getUpvotesForItem };
  },
  data() {
    return {
      comments: [],
      allComments: [], // Store unsorted comments
      isLoading: false,
      error: null,
      showComments: this.autoShow,
      commentAuthorMap: {},
      sortBy: 'date' // 'date' or 'upvotes'
    };
  },
  computed: {
    mergedAuthorMap() {
      // Merge prop authorMap with commentAuthorMap (commentAuthorMap takes precedence)
      return { ...this.authorMap, ...this.commentAuthorMap };
    }
  },
  async mounted() {
    // If autoShow is true, load comments automatically
    if (this.autoShow) {
      await this.loadComments();
    }
  },
  methods: {
    // Recursively collect all author IDs from comments and their replies
    collectAllAuthors(comments) {
      const authors = new Set();
      const collectAuthors = (items) => {
        items.forEach(item => {
          if (item.author) {
            authors.add(item.author);
          }
        });
      };
      collectAuthors(comments);
      return Array.from(authors);
    },
    
    async sortComments(commentsToSort, sortMethod) {
      if (sortMethod === 'date') {
        // Sort by date field (newest first), fallback to _id if date is not available
        return [...commentsToSort].sort((a, b) => {
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
        // First, ensure upvotes are loaded for all comments
        const commentIds = commentsToSort.map(c => c._id);
        await this.loadUpvotesForItems(commentIds, this.currentUser);
        
        return [...commentsToSort].sort((a, b) => {
          const upvotesA = this.getUpvotesForItem(a._id).count || 0;
          const upvotesB = this.getUpvotesForItem(b._id).count || 0;
          return upvotesB - upvotesA; // Descending order (most upvotes first)
        });
      }
      return commentsToSort;
    },

    async loadComments() {
      this.isLoading = true;
      this.error = null;

      try {
        console.log('Loading comments for post:', this.postId);
        const response = await apiService.getCommentsByParent(this.postId);
        console.log('Comments response:', response);
        const fetchedComments = response || [];
        this.allComments = fetchedComments;
        
        // Sort comments based on current sort method
        this.comments = await this.sortComments(fetchedComments, this.sortBy);
        console.log('Comments loaded:', this.comments.length);
        
        // Build authorMap for all comment authors
        const allAuthors = this.collectAllAuthors(this.comments);
        const usernameMap = {};
        for (const uid of allAuthors) {
          if (uid && !this.commentAuthorMap[uid]) {
            try {
              usernameMap[uid] = await this.fetchUsernameById(uid);
            } catch (error) {
              console.error(`Failed to fetch username for ${uid}:`, error);
              usernameMap[uid] = `User ${uid.slice(0, 8)}`;
            }
          }
        }
        
        // Update commentAuthorMap with fetched usernames
        this.commentAuthorMap = { ...this.commentAuthorMap, ...usernameMap };
        
        this.$emit('comments-loaded', this.comments);
      } catch (error) {
        console.error('Error loading comments:', error);
        this.error = error.message || 'Failed to load comments. Please try again.';
        this.comments = [];
        this.allComments = [];
      } finally {
        this.isLoading = false;
      }
    },

    async handleSortChange() {
      if (this.allComments.length === 0) return;
      this.isLoading = true;
      try {
        this.comments = await this.sortComments(this.allComments, this.sortBy);
        this.$emit('comments-loaded', this.comments);
      } catch (err) {
        this.error = err.message || 'Failed to sort comments. Please try again.';
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
      // Also update allComments
      const allIndex = this.allComments.findIndex(comment => comment._id === updatedComment._id);
      if (allIndex !== -1) {
        this.allComments.splice(allIndex, 1, updatedComment);
      }
    },
    
    handleCommentDeleted(commentId) {
      this.comments = this.comments.filter(comment => comment._id !== commentId);
      this.allComments = this.allComments.filter(comment => comment._id !== commentId);
    },
    
    async handleCommentUpvoted(upvoteData) {
      // Emit upvote event to parent component
      this.$emit('comment-upvoted', upvoteData);
      // If sorting by upvotes, re-sort after upvote change
      if (this.sortBy === 'upvotes' && this.allComments.length > 0) {
        this.comments = await this.sortComments(this.allComments, this.sortBy);
      }
    },
    
    async addNewComment(commentId) {
      // Refresh comments to show the new one
      await this.loadComments();
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-dropdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-dropdown label {
  color: #2c3e50;
  font-size: 0.85rem;
  font-weight: 500;
}

.sort-select {
  padding: 0.4rem 0.75rem;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 0.85rem;
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

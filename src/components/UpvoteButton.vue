<template>
  <div class="upvote-button">
    <button 
      @click="handleUpvote"
      :disabled="isLoading || !currentUser"
      :class="{ 
        'upvoted': upvoteData.userVoted, 
        'disabled': !currentUser 
      }"
      class="upvote-btn"
      :title="currentUser ? (upvoteData.userVoted ? 'Remove upvote' : 'Upvote') : 'Login to vote'"
    >
      <span class="upvote-icon">👍</span>
      <span class="upvote-count">{{ upvoteData.count }}</span>
    </button>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useUpvotes } from '../composables/useUpvotes.js';

export default {
  name: 'UpvoteButton',
  props: {
    itemId: {
      type: String,
      required: true
    },
    currentUser: {
      type: String,
      required: true
    }
  },
  emits: ['upvote-toggled'],
  setup(props, { emit }) {
    const { loadUpvotesForItem, toggleUpvote, getUpvotesForItem } = useUpvotes();
    
    const upvoteData = ref({ count: 0, userVoted: false });
    const isLoading = ref(false);
    const error = ref(null);

    const loadUpvotes = async () => {
      try {
        const data = await loadUpvotesForItem(props.itemId, props.currentUser);
        upvoteData.value = data;
      } catch (err) {
        console.error('Failed to load upvotes:', err);
        error.value = 'Failed to load upvotes';
      }
    };

    const handleUpvote = async () => {
      if (!props.currentUser) {
        error.value = 'You must be logged in to vote';
        return;
      }

      isLoading.value = true;
      error.value = null;

      try {
        const newData = await toggleUpvote(props.itemId, props.currentUser);
        upvoteData.value = newData;
        emit('upvote-toggled', newData);
      } catch (err) {
        error.value = err.message || 'Failed to vote. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };

    // Load upvotes when component mounts or itemId changes
    onMounted(() => {
      loadUpvotes();
    });

    watch(() => props.itemId, () => {
      loadUpvotes();
    });

    watch(() => props.currentUser, () => {
      loadUpvotes();
    });

    return {
      upvoteData,
      isLoading,
      error,
      handleUpvote
    };
  }
};
</script>

<style scoped>
.upvote-button {
  display: inline-flex;
  align-items: center;
}

.upvote-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 60px;
  justify-content: center;
}

.upvote-btn:hover:not(:disabled) {
  border-color: #42b983;
  color: #42b983;
}

.upvote-btn.upvoted {
  background-color: #42b983;
  border-color: #42b983;
  color: white;
}

.upvote-btn.upvoted:hover:not(:disabled) {
  background-color: #369870;
  border-color: #369870;
}

.upvote-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upvote-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upvote-icon {
  font-size: 0.9rem;
}

.upvote-count {
  font-weight: 500;
  min-width: 1rem;
  text-align: center;
}

.error-message {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fee;
  color: #c33;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  margin-top: 0.25rem;
  border: 1px solid #fcc;
}
</style>

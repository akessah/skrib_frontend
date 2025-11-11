<template>
  <div class="shelf-button-container">
    <div v-if="!isAuthenticated" class="login-prompt">
      <p>Please log in to shelve books</p>
    </div>
    
    <div v-else class="shelf-controls">
      <div v-if="currentStatus === null" class="add-to-shelf">
        <label class="shelf-label">Add to Shelf:</label>
        <select 
          v-model="selectedStatus" 
          @change="handleAddToShelf"
          class="shelf-select"
          :disabled="isLoading"
        >
          <option value="" disabled>Choose a shelf...</option>
          <option 
            v-for="(label, status) in SHELF_LABELS" 
            :key="status" 
            :value="status"
          >
            <span v-html="SHELF_ICONS[status]"></span> {{ label }}
          </option>
        </select>
      </div>
      
      <div v-else class="current-shelf">
        <div class="shelf-info">
          <span class="shelf-icon" v-html="SHELF_ICONS[currentStatus]"></span>
          <span class="shelf-text">{{ SHELF_LABELS[currentStatus] }}</span>
        </div>
        
        <div class="shelf-actions">
          <!-- Debug: currentStatus={{ currentStatus }}, isLoading={{ isLoading }} -->
          <select 
            v-model="newStatus" 
            @change="handleChangeStatus"
            class="shelf-select"
            :disabled="isLoading"
          >
            <option value="" disabled>Move to...</option>
            <option 
              v-for="(label, status) in SHELF_LABELS" 
              :key="status" 
              :value="status"
              :disabled="status === currentStatus"
            >
              <span v-html="SHELF_ICONS[status]"></span> {{ label }}
            </option>
          </select>
          
          <button 
            @click="() => { console.log('Button clicked directly'); handleRemoveFromShelf(); }"
            class="remove-btn"
            :disabled="isLoading"
            title="Remove from shelf"
          >
            <img 
              src="../../assets/bin.png" 
              alt="Trash icon" 
              width="15"
              style="pointer-events: none;"
            />
          </button>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div v-if="success" class="success-message">
        {{ success }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import { useShelving, SHELF_STATUS, SHELF_LABELS, SHELF_ICONS } from '../composables/useShelving.js';

export default {
  name: 'ShelfButton',
  props: {
    bookId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    // Inject refresh function if available (provided by UserShelves component)
    const refreshShelves = inject('refreshShelves', null);
    const { currentUser, isAuthenticated } = useAuth();
    const { 
      getUserShelfForBook, 
      getShelfIdByBookAndUser,
      addBookToShelf, 
      removeBookFromShelf, 
      changeBookStatus,
      loadBookShelves 
    } = useShelving();
    
    const currentStatus = ref(null);
    const selectedStatus = ref('');
    const newStatus = ref('');
    const isLoading = ref(false);
    const error = ref(null);
    const success = ref(null);
    
    const loadCurrentStatus = async () => {
      if (!isAuthenticated.value || !currentUser.value) return;
      
      try {
        const status = await getUserShelfForBook(currentUser.value, props.bookId);
        currentStatus.value = status;
      } catch (err) {
        console.error('Failed to load current shelf status:', err);
      }
    };
    
    const handleAddToShelf = async () => {
      if (!selectedStatus.value || !currentUser.value) return;
      
      isLoading.value = true;
      error.value = null;
      success.value = null;
      
      try {
        console.log('Adding book to shelf:', {
          user: currentUser.value,
          status: selectedStatus.value,
          bookId: props.bookId
        });
        
        const result = await addBookToShelf(currentUser.value, selectedStatus.value, props.bookId);
        console.log('Add to shelf result:', result);
        
        if (result.success) {
          currentStatus.value = selectedStatus.value;
          const statusLabel = SHELF_LABELS[selectedStatus.value];
          selectedStatus.value = '';
          success.value = `Added to ${statusLabel} shelf!`;
          // Refresh shelves on home page if available
          if (refreshShelves) {
            refreshShelves();
          }
          setTimeout(() => {
            success.value = null;
          }, 3000);
        } else {
          error.value = result.error || 'Failed to add book to shelf';
        }
      } catch (err) {
        console.error('Error adding book to shelf:', err);
        error.value = `Failed to add book to shelf: ${err.message}`;
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleChangeStatus = async () => {
      if (!newStatus.value || !currentUser.value) return;
      
      isLoading.value = true;
      error.value = null;
      success.value = null;
      
      try {
        // Fetch shelf ID
        const shelfIdResponse = await getShelfIdByBookAndUser(props.bookId, currentUser.value);
        const currentShelfId = shelfIdResponse?.shelf || shelfIdResponse;
        
        if (!currentShelfId) {
          error.value = 'Shelf not found';
          return;
        }
        
        const result = await changeBookStatus(currentShelfId, newStatus.value);
        if (result.success) {
          currentStatus.value = newStatus.value;
          const statusLabel = SHELF_LABELS[newStatus.value];
          newStatus.value = '';
          success.value = `Moved to ${statusLabel} shelf!`;
          // Refresh shelves on home page if available
          if (refreshShelves) {
            refreshShelves();
          }
          setTimeout(() => {
            success.value = null;
          }, 3000);
        } else {
          error.value = result.error || 'Failed to change book status';
        }
      } catch (err) {
        error.value = 'Failed to change book status. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };
    
    const handleRemoveFromShelf = async () => {
      console.log('ShelfButton: handleRemoveFromShelf called');
      if (!currentUser.value) {
        console.log('ShelfButton: No current user, returning early');
        return;
      }
      
      if (!confirm('Are you sure you want to remove this book from your shelf?')) {
        console.log('ShelfButton: User cancelled confirmation');
        return;
      }
      
      isLoading.value = true;
      error.value = null;
      success.value = null;
      
      try {
        // Fetch shelf ID
        const shelfIdResponse = await getShelfIdByBookAndUser(props.bookId, currentUser.value);
        const currentShelfId = shelfIdResponse?.shelf || shelfIdResponse;
        
        if (!currentShelfId) {
          console.log('ShelfButton: Shelf not found for user');
          error.value = 'Shelf not found';
          return;
        }
        
        console.log('ShelfButton: Calling removeBookFromShelf with shelfId:', currentShelfId);
        const result = await removeBookFromShelf(currentShelfId);
        console.log('ShelfButton: removeBookFromShelf result:', result);
        if (result.success) {
          currentStatus.value = null;
          success.value = 'Removed from shelf!';
          // Refresh shelves on home page if available
          if (refreshShelves) {
            refreshShelves();
          }
          setTimeout(() => {
            success.value = null;
          }, 3000);
        } else {
          error.value = result.error || 'Failed to remove book from shelf';
        }
      } catch (err) {
        error.value = 'Failed to remove book from shelf. Please try again.';
      } finally {
        isLoading.value = false;
      }
    };
    
    // Watch for authentication changes
    watch(isAuthenticated, (newValue) => {
      if (newValue && currentUser.value) {
        loadCurrentStatus();
      } else {
        currentStatus.value = null;
      }
    });
    
    onMounted(() => {
      if (isAuthenticated.value && currentUser.value) {
        loadCurrentStatus();
      }
    });
    
    return {
      currentUser,
      isAuthenticated,
      currentStatus,
      selectedStatus,
      newStatus,
      isLoading,
      error,
      success,
      SHELF_STATUS,
      SHELF_LABELS,
      SHELF_ICONS,
      handleAddToShelf,
      handleChangeStatus,
      handleRemoveFromShelf
    };
  }
};
</script>

<style scoped>
.shelf-button-container {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.login-prompt {
  text-align: center;
  color: #666;
  font-style: italic;
}

.shelf-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.add-to-shelf {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.shelf-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.shelf-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
}

.shelf-select:focus {
  outline: none;
  border-color: #889841;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.1);
}

.shelf-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.current-shelf {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.shelf-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #e8f5e8;
  border-radius: 6px;
  border: 1px solid #c3e6c3;
}

.shelf-icon {
  font-size: 1.2rem;
}

.shelf-text {
  font-weight: 600;
  color: #2c3e50;
}

.shelf-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.shelf-actions .shelf-select {
  flex: 1;
}

.remove-btn {
  background: #b52b39;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
  min-width: 40px;
}

.remove-btn:hover:not(:disabled) {
  background: #c82333;
}

.remove-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  border: 1px solid #c3e6cb;
}

@media (max-width: 768px) {
  .shelf-actions {
    flex-direction: column;
  }
  
  .shelf-actions .shelf-select {
    width: 100%;
  }
}
</style>

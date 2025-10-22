<template>
  <div class="user-management">
    <h3>Account Management</h3>
    
    <div class="user-info">
      <p><strong>Username:</strong> {{ currentUser }}</p>
    </div>

    <div class="management-actions">
      <!-- Change Password Section -->
      <div class="action-section">
        <h4>Change Password</h4>
        <form @submit.prevent="handleChangePassword" class="password-form">
          <div class="form-group">
            <label for="new-password">New Password</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              required
              :disabled="isChangingPassword"
              placeholder="Enter new password"
            />
          </div>
          <button 
            type="submit" 
            :disabled="isChangingPassword || !newPassword.trim()"
            class="change-password-btn"
          >
            {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
          </button>
        </form>
        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>
        <div v-if="passwordSuccess" class="success-message">
          {{ passwordSuccess }}
        </div>
      </div>

      <!-- Delete Account Section -->
      <div class="action-section">
        <h4>Delete Account</h4>
        <p class="warning-text">
          <strong>Warning:</strong> This action cannot be undone. All your posts and data will be permanently deleted.
        </p>
        <button 
          @click="handleDeleteAccount" 
          :disabled="isDeletingAccount"
          class="delete-account-btn"
        >
          {{ isDeletingAccount ? 'Deleting...' : 'Delete Account' }}
        </button>
        <div v-if="deleteError" class="error-message">
          {{ deleteError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuth } from '../composables/useAuth.js';

export default {
  name: 'UserManagement',
  props: {
    currentUser: {
      type: String,
      required: true
    }
  },
  emits: ['account-deleted'],
  setup(props, { emit }) {
    const { changePassword, deleteUser } = useAuth();
    
    // Change password state
    const newPassword = ref('');
    const isChangingPassword = ref(false);
    const passwordError = ref(null);
    const passwordSuccess = ref(null);
    
    // Delete account state
    const isDeletingAccount = ref(false);
    const deleteError = ref(null);

    const handleChangePassword = async () => {
      if (!newPassword.value.trim()) {
        passwordError.value = 'Please enter a new password.';
        return;
      }

      isChangingPassword.value = true;
      passwordError.value = null;
      passwordSuccess.value = null;

      try {
        const result = await changePassword(props.currentUser, newPassword.value.trim());
        
        if (result.success) {
          passwordSuccess.value = 'Password changed successfully!';
          newPassword.value = '';
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            passwordSuccess.value = null;
          }, 3000);
        } else {
          passwordError.value = result.error || 'Failed to change password. Please try again.';
        }
      } catch (error) {
        passwordError.value = 'An unexpected error occurred. Please try again.';
      } finally {
        isChangingPassword.value = false;
      }
    };

    const handleDeleteAccount = async () => {
      if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your posts and data.')) {
        return;
      }

      // Double confirmation
      if (!confirm('This is your final warning. Click OK to permanently delete your account.')) {
        return;
      }

      isDeletingAccount.value = true;
      deleteError.value = null;

      try {
        const result = await deleteUser(props.currentUser);
        
        if (result.success) {
          emit('account-deleted');
        } else {
          deleteError.value = result.error || 'Failed to delete account. Please try again.';
        }
      } catch (error) {
        deleteError.value = 'An unexpected error occurred. Please try again.';
      } finally {
        isDeletingAccount.value = false;
      }
    };

    return {
      newPassword,
      isChangingPassword,
      passwordError,
      passwordSuccess,
      isDeletingAccount,
      deleteError,
      handleChangePassword,
      handleDeleteAccount
    };
  }
};
</script>

<style scoped>
.user-management {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.user-management h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.user-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
}

.user-info p {
  margin: 0;
  color: #2c3e50;
}

.management-actions {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.action-section {
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  padding: 1.5rem;
}

.action-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #42b983;
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.change-password-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  align-self: flex-start;
}

.change-password-btn:hover:not(:disabled) {
  background-color: #369870;
}

.change-password-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.warning-text {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.delete-account-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-account-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.delete-account-btn:disabled {
  background-color: #ccc;
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

.success-message {
  background-color: #efe;
  color: #363;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #cfc;
  font-size: 0.9rem;
}
</style>

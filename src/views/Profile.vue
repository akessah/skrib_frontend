<template>
  <div class="profile-page">
    <div class="profile-container">
      <div v-if="!isAuthenticated" class="auth-required">
        <h2> Login Required</h2>
        <p>You need to be logged in to view your profile.</p>
        <p>Please login or register to continue:</p>
        <AuthForm @auth-success="handleAuthSuccess" />
      </div>
      
      <div v-else class="profile-content">
        <div class="profile-header">
          <h2> Your Profile</h2>
          <p class="welcome-message">Welcome back, {{ currentUsername }}!</p>
        </div>
        
        <div class="profile-sections">
          <!-- User Information Section -->
          <div class="profile-section">
            <h3> Account Information</h3>
            <div class="info-item">
              <label>Username:</label>
              <span class="username-display">{{ currentUsername }}</span>
            </div>
            <div class="info-item">
              <label>User ID:</label>
              <span class="user-id-display">{{ currentUser }}</span>
            </div>
          </div>
          
          <!-- Password Management Section -->
          <div class="profile-section">
            <h3> Password Management</h3>
            <div class="password-form">
              <div class="form-group">
                <label for="currentPassword">Current Password:</label>
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  :disabled="isChangingPassword"
                />
              </div>
              <div class="form-group">
                <label for="newPassword">New Password:</label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="Enter new password"
                  :disabled="isChangingPassword"
                />
              </div>
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password:</label>
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  :disabled="isChangingPassword"
                />
              </div>
              <button
                @click="handleChangePassword"
                :disabled="isChangingPassword || !isPasswordFormValid"
                class="change-password-btn"
              >
                {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
            
            <div v-if="passwordError" class="error-message">
              {{ passwordError }}
            </div>
            <div v-if="passwordSuccess" class="success-message">
              {{ passwordSuccess }}
            </div>
          </div>
          
          <!-- Account Actions Section -->
          <div class="profile-section">
            <h3> Account Actions</h3>
            <div class="action-buttons">
              <button @click="handleLogout" class="logout-btn">
                Logout
              </button>
              <button @click="showDeleteConfirm = true" class="delete-account-btn">
                Delete Account
              </button>
            </div>
          </div>
          
          <!-- Notifications Section -->
          <div class="profile-section">
            <div class="notifications-header">
              <h3> Notifications</h3>
              <div class="notification-actions">
                <button 
                  @click="markAllAsRead" 
                  class="mark-all-read-btn"
                  :disabled="unreadCount === 0 || isMarkingAll"
                >
                  {{ isMarkingAll ? 'Marking...' : 'Mark All as Read' }}
                </button>
                <button @click="refreshNotifications" class="refresh-btn">
                  Refresh
                </button>
              </div>
            </div>
            
            <div class="notification-stats">
              <div class="stat-item">
                <span class="stat-number">{{ unreadCount }}</span>
                <span class="stat-label">Unread</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ totalCount }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
            
            <div v-if="isLoadingNotifications" class="loading">
              <p>Loading notifications...</p>
            </div>
            
            <div v-else-if="notifications.length === 0" class="no-notifications">
              <div class="empty-state">
                <h4>No notifications yet</h4>
                <p>You'll receive notifications when someone comments on your posts or replies to your comments.</p>
              </div>
            </div>
            
            <div v-else class="notifications-list">
              <NotificationItem
                v-for="notification in sortedNotifications"
                :key="notification._id"
                :notification="notification"
                @notification-read="handleNotificationRead"
              />
            </div>
            
            <div v-if="notificationError" class="error-message">
              {{ notificationError }}
            </div>
          </div>
          
          <!-- Tag Management Section -->
          <div class="profile-section">
            <div class="tags-header">
              <h3> Tag Management</h3>
              <div class="tag-actions">
                <button @click="refreshTags" class="refresh-btn">
                   Refresh Tags
                </button>
              </div>
            </div>
            
            <div class="tag-stats">
              <div class="stat-item">
                <span class="stat-number">{{ userLabels.length }}</span>
                <span class="stat-label">Unique Labels</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ userTags.length }}</span>
                <span class="stat-label">Total Tags</span>
              </div>
            </div>
            
            <div v-if="isLoadingTags" class="loading">
              <p>Loading your tags...</p>
            </div>
            
            <div v-else-if="userLabels.length === 0" class="no-tags">
              <div class="empty-state">
                <h4>No tags yet</h4>
                <p>Start tagging books in the search page to organize your reading list!</p>
                <router-link to="/search" class="search-link">
                  <img src="../../assets/search-icon.png" alt="Search icon" width = "15"> Search for Books
                </router-link>
              </div>
            </div>
            
            <div v-else class="tags-content">
              <div class="labels-section">
                <h4>Your Tag Labels</h4>
                <div class="labels-grid">
                  <div 
                    v-for="label in userLabels" 
                    :key="label.label"
                    class="label-card"
                  >
                    <div class="label-info">
                      <span class="label-name">{{ label.label }}</span>
                      <span class="label-count">{{ label.count }} book{{ label.count !== 1 ? 's' : '' }}</span>
                    </div>
                    <button 
                      @click="viewBooksByLabel(label.label)"
                      class="view-books-btn"
                    >
                      View Books
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="recent-tags-section">
                <h4>Recent Tags</h4>
                <div class="recent-tags-list">
                  <div 
                    v-for="tag in recentTags" 
                    :key="tag._id"
                    class="recent-tag-item"
                  >
                    <div class="tag-info">
                      <span class="tag-label">{{ tag.label }}</span>
                      <span class="tag-book">{{ getBookTitle(tag.book) }}</span>
                      <span class="tag-privacy" :class="{ 'private': tag.private }">
                        <template v-if="tag.private">
                          <img src="../../assets/lock.png" alt="Lock icon" width = "15"> Private
                        </template>
                        <template v-else>
                          <img src="../../assets/internet.png" alt="Public icon" width = "15"> Public
                        </template>
                      </span>
                    </div>
                    <div class="tag-actions">
                      <button 
                        @click="toggleTagPrivacy(tag)"
                        class="privacy-btn"
                        :title="tag.private ? 'Make Public' : 'Make Private'"
                      >
                        <template v-if="tag.private"><img src="../../assets/internet.png" alt="Public icon" width = "15"></template>
                        <template v-else><img src="../../assets/lock.png" alt="Lock icon" width = "15"></template>
                      </button>
                      <button 
                        @click="removeTag(tag._id)"
                        class="remove-btn"
                        title="Remove Tag"
                      >
                        <img src="../../assets/bin.png" alt="Trash icon" width = "15"></img>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="tagError" class="error-message">
              {{ tagError }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Delete Account Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="showDeleteConfirm = false">
      <div class="modal-content" @click.stop>
        <h3>⚠️ Delete Account</h3>
        <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        <p><strong>This will permanently delete:</strong></p>
        <ul>
          <li>Your account and profile</li>
          <li>All your posts</li>
          <li>All your comments</li>
          <li>All your upvotes</li>
        </ul>
        <div class="modal-actions">
          <button @click="showDeleteConfirm = false" class="cancel-btn">
            Cancel
          </button>
          <button @click="handleDeleteAccount" class="confirm-delete-btn">
            Yes, Delete My Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth.js';
import { useNotifications } from '../composables/useNotifications.js';
import { useTags } from '../composables/useTags.js';
import AuthForm from '../components/AuthForm.vue';
import NotificationItem from '../components/NotificationItem.vue';
import apiService from '../services/api.js';

export default {
  name: 'Profile',
  components: {
    AuthForm,
    NotificationItem
  },
  setup() {
    const router = useRouter();
    const { 
      currentUser, 
      currentUsername, 
      isAuthenticated, 
      logout, 
      changePassword, 
      deleteUser,
      initializeAuth 
    } = useAuth();
    
    const { 
      notifications, 
      isLoading: isLoadingNotifications, 
      unreadCount, 
      sortedNotifications,
      loadNotifications, 
      markAsRead 
    } = useNotifications();
    
    const passwordForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    const isChangingPassword = ref(false);
    const passwordError = ref(null);
    const passwordSuccess = ref(null);
    const showDeleteConfirm = ref(false);
    
    // Notification state
    const isMarkingAll = ref(false);
    const notificationError = ref(null);
    
    // Tag management
    const { 
      userTags, 
      getUserLabels, 
      loadUserTags, 
      removeTag, 
      toggleTagPrivacy 
    } = useTags();
    
    const isLoadingTags = ref(false);
    const tagError = ref(null);
    const bookDetails = ref({}); // Cache for book details
    
    const userLabels = computed(() => (getUserLabels.value || []).filter(l => !(l.label || '').toLowerCase().startsWith('category:')));
    const recentTags = computed(() => (userTags.value || []).filter(t => !(t.label || '').toLowerCase().startsWith('category:')).slice(0, 10)); // Show last 10 tags
    
    const isPasswordFormValid = computed(() => {
      return passwordForm.value.currentPassword &&
             passwordForm.value.newPassword &&
             passwordForm.value.confirmPassword &&
             passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
             passwordForm.value.newPassword.length >= 6;
    });
    
    const totalCount = computed(() => notifications.value.length);
    
    const handleAuthSuccess = () => {
      // User is now authenticated, the component will re-render
      // No need to redirect since we're already on the profile page
    };
    
    const handleChangePassword = async () => {
      if (!isPasswordFormValid.value) return;
      
      isChangingPassword.value = true;
      passwordError.value = null;
      passwordSuccess.value = null;
      
      try {
        await changePassword(currentUser.value, passwordForm.value.newPassword);
        passwordSuccess.value = 'Password changed successfully!';
        passwordForm.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      } catch (error) {
        passwordError.value = error.message || 'Failed to change password. Please try again.';
      } finally {
        isChangingPassword.value = false;
      }
    };
    
    const handleLogout = async () => {
      try {
        await logout();
        // Redirect to home page after logout
        router.push('/');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    
    const handleDeleteAccount = async () => {
      try {
        await deleteUser(currentUser.value);
        showDeleteConfirm.value = false;
        // Redirect to home page after account deletion
        router.push('/home');
      } catch (error) {
        console.error('Account deletion failed:', error);
        passwordError.value = error.message || 'Failed to delete account. Please try again.';
      }
    };
    
    // Notification methods
    const loadUserNotifications = async () => {
      if (!currentUser.value) return;
      
      try {
        await loadNotifications(currentUser.value);
      } catch (err) {
        notificationError.value = 'Failed to load notifications';
      }
    };
    
    const markAllAsRead = async () => {
      if (unreadCount.value === 0 || isMarkingAll.value) return;
      
      isMarkingAll.value = true;
      try {
        const unreadNotifications = notifications.value.filter(n => !n.read);
        const promises = unreadNotifications.map(notification => 
          markAsRead(notification._id)
        );
        await Promise.all(promises);
      } catch (err) {
        notificationError.value = 'Failed to mark all notifications as read';
      } finally {
        isMarkingAll.value = false;
      }
    };
    
    const refreshNotifications = async () => {
      await loadUserNotifications();
    };
    
    const handleNotificationRead = (notificationId) => {
      // Notification is already marked as read in the composable
      console.log('Notification marked as read:', notificationId);
    };
    
    // Tag management methods
    const refreshTags = async () => {
      if (!currentUser.value) return;
      
      isLoadingTags.value = true;
      tagError.value = null;
      
      try {
        await loadUserTags(currentUser.value);
        
        // Load book details for recent tags
        for (const tag of recentTags.value) {
          if (!bookDetails.value[tag.book]) {
            try {
              const bookDetail = await apiService.getBookDetails(tag.book);
              bookDetails.value[tag.book] = bookDetail;
            } catch (err) {
              console.warn(`Failed to load details for book ${tag.book}:`, err);
              bookDetails.value[tag.book] = null;
            }
          }
        }
      } catch (err) {
        tagError.value = 'Failed to load tags. Please try again.';
        console.error('Error loading tags:', err);
      } finally {
        isLoadingTags.value = false;
      }
    };
    
    const getBookTitle = (bookId) => {
      const bookDetail = bookDetails.value[bookId];
      if (bookDetail && bookDetail.volumeInfo) {
        return bookDetail.volumeInfo.title || 'Unknown Title';
      }
      return 'Loading...';
    };
    
    const viewBooksByLabel = (label) => {
      // Navigate to search page with the label as a search query
      router.push({
        path: '/search',
        query: { tag: label }
      });
    };
    
    const handleRemoveTag = async (tagId) => {
      try {
        const result = await removeTag(tagId);
        if (!result.success) {
          tagError.value = result.error || 'Failed to remove tag';
        }
      } catch (error) {
        tagError.value = 'Failed to remove tag. Please try again.';
        console.error('Error removing tag:', error);
      }
    };
    
    const handleToggleTagPrivacy = async (tag) => {
      try {
        const result = await toggleTagPrivacy(tag._id, !tag.private);
        if (!result.success) {
          tagError.value = result.error || 'Failed to change tag privacy';
        }
      } catch (error) {
        tagError.value = 'Failed to change tag privacy. Please try again.';
        console.error('Error toggling tag privacy:', error);
      }
    };
    
    onMounted(() => {
      initializeAuth();
      if (isAuthenticated.value) {
        loadUserNotifications();
        refreshTags();
      }
    });
    
    return {
      currentUser,
      currentUsername,
      isAuthenticated,
      passwordForm,
      isChangingPassword,
      passwordError,
      passwordSuccess,
      showDeleteConfirm,
      isPasswordFormValid,
      // Notification-related
      notifications,
      isLoadingNotifications,
      unreadCount,
      totalCount,
      sortedNotifications,
      isMarkingAll,
      notificationError,
      // Tag-related
      userTags,
      userLabels,
      recentTags,
      isLoadingTags,
      tagError,
      handleAuthSuccess,
      handleChangePassword,
      handleLogout,
      handleDeleteAccount,
      markAllAsRead,
      refreshNotifications,
      handleNotificationRead,
      refreshTags,
      getBookTitle,
      viewBooksByLabel,
      removeTag: handleRemoveTag,
      toggleTagPrivacy: handleToggleTagPrivacy
    };
  }
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 2rem 1rem;
}

.profile-container {
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

.profile-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #b52b39 0%, #6c4b73 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.profile-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.welcome-message {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.profile-sections {
  padding: 2rem;
}

.profile-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.profile-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.profile-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.info-item label {
  font-weight: 600;
  color: #555;
  min-width: 100px;
  margin-right: 1rem;
}

.username-display {
  font-weight: 600;
  color: #889841;
  font-size: 1.1rem;
}

.user-id-display {
  font-family: monospace;
  color: #666;
  font-size: 0.9rem;
}

.password-form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #889841;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.change-password-btn {
  background: #889841;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.change-password-btn:hover:not(:disabled) {
  background: #5b662a;
}

.change-password-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.logout-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background: #5a6268;
}

.delete-account-btn {
  background: #b52b39;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-account-btn:hover {
  background: #c82333;
}


.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  padding: 0.75rem;
  border-radius: 6px;
  margin-top: 1rem;
  border: 1px solid #c3e6cb;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  color: #b52b39;
  margin-bottom: 1rem;
}

.modal-content p {
  margin-bottom: 1rem;
  color: #555;
}

.modal-content ul {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.modal-content li {
  margin-bottom: 0.5rem;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn:hover {
  background: #5a6268;
}

.confirm-delete-btn {
  background: #b52b39;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-delete-btn:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem 0.5rem;
  }
  
  .profile-sections {
    padding: 1rem;
  }
  
  .action-buttons,
  .nav-buttons {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

/* Notification Styles */
.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
}

.mark-all-read-btn, .refresh-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover:not(:disabled), .refresh-btn:hover {
  background: #5a6268;
}

.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #889841;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading, .no-notifications {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.empty-state h4 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #666;
  line-height: 1.6;
  font-size: 0.9rem;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .notifications-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .notification-actions {
    justify-content: center;
  }
  
  .notification-stats {
    justify-content: center;
  }
}

/* Tag Management Styles */
.tags-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tag-actions {
  display: flex;
  gap: 0.5rem;
}

.tag-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.no-tags {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.search-link {
  display: inline-block;
  background: #889841;
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.search-link:hover {
  background: #5b662a;
}

.tags-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.labels-section h4,
.recent-tags-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.labels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.label-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.label-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.label-info {
  margin-bottom: 0.5rem;
}

.label-name {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.label-count {
  font-size: 0.8rem;
  color: #666;
}

.view-books-btn {
  background: #889841;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.view-books-btn:hover {
  background: #5b662a;
}

.recent-tags-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 6px;
}

.recent-tag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.recent-tag-item:hover {
  background: #f8f9fa;
}

.recent-tag-item:last-child {
  border-bottom: none;
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.tag-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.tag-book {
  font-size: 0.8rem;
  color: #666;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-privacy {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border-radius: 10px;
  background: #e9ecef;
  color: #495057;
  width: fit-content;
}

.tag-privacy.private {
  background: #fff3cd;
  color: #856404;
}

.tag-actions {
  display: flex;
  gap: 0.25rem;
}

.privacy-btn,
.remove-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
  font-size: 0.9rem;
}

.privacy-btn:hover {
  background: #e9ecef;
}

.remove-btn:hover {
  background: #f8d7da;
}

@media (max-width: 768px) {
  .tags-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .tag-actions {
    justify-content: center;
  }
  
  .tag-stats {
    justify-content: center;
  }
  
  .labels-grid {
    grid-template-columns: 1fr;
  }
  
  .recent-tag-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .tag-actions {
    justify-content: center;
  }
}
</style>

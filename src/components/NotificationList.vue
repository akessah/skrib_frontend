<template>
  <div class="notification-list">
    <div class="notification-header">
      <h3>Notifications</h3>
      <div class="notification-stats">
        <span class="unread-count" v-if="unreadCount > 0">
          {{ unreadCount }} unread
        </span>
        <button 
          @click="markAllAsRead" 
          class="mark-all-read-btn"
          :disabled="unreadCount === 0 || isMarkingAll"
        >
          {{ isMarkingAll ? 'Marking...' : 'Mark All as Read' }}
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading">
      <p>Loading notifications...</p>
    </div>
    
    <div v-else-if="notifications.length === 0" class="no-notifications">
      <p>No notifications yet.</p>
    </div>
    
    <div v-else class="notifications-container">
      <NotificationItem
        v-for="notification in sortedNotifications"
        :key="notification._id"
        :notification="notification"
        @notification-read="handleNotificationRead"
      />
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useNotifications } from '../composables/useNotifications.js';
import NotificationItem from './NotificationItem.vue';

export default {
  name: 'NotificationList',
  components: {
    NotificationItem
  },
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const { 
      notifications, 
      isLoading, 
      unreadCount, 
      sortedNotifications,
      loadNotifications, 
      markAsRead 
    } = useNotifications();
    
    const error = ref(null);
    const isMarkingAll = ref(false);

    const loadUserNotifications = async () => {
      try {
        await loadNotifications(props.userId);
      } catch (err) {
        error.value = 'Failed to load notifications';
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
        error.value = 'Failed to mark all notifications as read';
      } finally {
        isMarkingAll.value = false;
      }
    };

    const handleNotificationRead = (notificationId) => {
      // Notification is already marked as read in the composable
      console.log('Notification marked as read:', notificationId);
    };

    // Load notifications when component mounts or userId changes
    onMounted(() => {
      if (props.userId) {
        loadUserNotifications();
      }
    });

    watch(() => props.userId, (newUserId) => {
      if (newUserId) {
        loadUserNotifications();
      }
    });

    return {
      notifications,
      isLoading,
      unreadCount,
      sortedNotifications,
      error,
      isMarkingAll,
      markAllAsRead,
      handleNotificationRead
    };
  }
};
</script>

<style scoped>
.notification-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.notification-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.unread-count {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.mark-all-read-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover:not(:disabled) {
  background: #5a6268;
}

.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading, .no-notifications {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.notifications-container {
  max-height: 400px;
  overflow-y: auto;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-top: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .notification-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .notification-stats {
    justify-content: space-between;
  }
}
</style>

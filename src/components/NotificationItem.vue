<template>
  <div 
    class="notification-item"
    :class="{ 'unread': !notification.read }"
    @click="handleClick"
  >
    <div class="notification-content">
      <div class="notification-message">
        {{ notification.message }}
      </div>
      <div class="notification-meta">
        <span class="notification-status">
          {{ notification.read ? 'Read' : 'Unread' }}
        </span>
        <span v-if="!notification.read" class="unread-indicator">●</span>
      </div>
    </div>
    
    <div class="notification-actions">
      <button 
        v-if="!notification.read"
        @click.stop="markAsRead"
        class="mark-read-btn"
        :disabled="isMarkingRead"
      >
        {{ isMarkingRead ? 'Marking...' : 'Mark as Read' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useNotifications } from '../composables/useNotifications.js';

export default {
  name: 'NotificationItem',
  props: {
    notification: {
      type: Object,
      required: true
    }
  },
  emits: ['notification-read'],
  setup(props, { emit }) {
    const { markAsRead: markNotificationAsRead } = useNotifications();
    const isMarkingRead = ref(false);

    const handleClick = () => {
      if (!props.notification.read) {
        markAsRead();
      }
    };

    const markAsRead = async () => {
      if (props.notification.read || isMarkingRead.value) return;
      
      isMarkingRead.value = true;
      try {
        await markNotificationAsRead(props.notification._id);
        emit('notification-read', props.notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      } finally {
        isMarkingRead.value = false;
      }
    };

    return {
      isMarkingRead,
      handleClick,
      markAsRead
    };
  }
};
</script>

<style scoped>
.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f8ff;
  border-left: 4px solid #007bff;
}

.notification-content {
  flex: 1;
  margin-right: 1rem;
}

.notification-message {
  font-size: 0.95rem;
  line-height: 1.4;
  color: #333;
  margin-bottom: 0.5rem;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.notification-status {
  font-weight: 500;
}

.unread-indicator {
  color: #007bff;
  font-size: 1rem;
  font-weight: bold;
}

.notification-actions {
  display: flex;
  align-items: center;
}

.mark-read-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mark-read-btn:hover:not(:disabled) {
  background-color: #5a6268;
}

.mark-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .notification-item {
    flex-direction: column;
    align-items: stretch;
  }
  
  .notification-content {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
  
  .notification-actions {
    justify-content: flex-end;
  }
}
</style>

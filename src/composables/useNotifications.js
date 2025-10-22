import { ref, computed } from 'vue';
import apiService from '../services/api.js';

// Global state for notifications
const notifications = ref([]);
const isLoading = ref(false);
const lastChecked = ref(null);

export function useNotifications() {
  const loadNotifications = async (userId) => {
    if (!userId || isLoading.value) return;
    
    isLoading.value = true;
    try {
      const response = await apiService.getNotificationsByUser(userId);
      notifications.value = response || [];
      lastChecked.value = new Date();
    } catch (error) {
      console.error('Failed to load notifications:', error);
      notifications.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const loadUnreadNotifications = async (userId) => {
    if (!userId || isLoading.value) return;
    
    isLoading.value = true;
    try {
      const response = await apiService.getUnreadNotificationsByUser(userId);
      // Merge with existing notifications, updating unread status
      const unreadIds = new Set(response.map(n => n._id));
      notifications.value = notifications.value.map(notification => ({
        ...notification,
        read: !unreadIds.has(notification._id)
      }));
      
      // Add any new unread notifications
      response.forEach(unreadNotification => {
        const exists = notifications.value.find(n => n._id === unreadNotification._id);
        if (!exists) {
          notifications.value.push(unreadNotification);
        }
      });
      
      lastChecked.value = new Date();
    } catch (error) {
      console.error('Failed to load unread notifications:', error);
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.readNotification(notificationId);
      // Update local state
      const notification = notifications.value.find(n => n._id === notificationId);
      if (notification) {
        notification.read = true;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  };

  const sendNotification = async (userId, message) => {
    try {
      const response = await apiService.notify(userId, message);
      return response;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  };

  const clearNotifications = () => {
    notifications.value = [];
    lastChecked.value = null;
  };

  // Computed properties
  const unreadNotifications = computed(() => {
    return notifications.value.filter(notification => !notification.read);
  });

  const unreadCount = computed(() => {
    return unreadNotifications.value.length;
  });

  const hasUnread = computed(() => {
    return unreadCount.value > 0;
  });

  const sortedNotifications = computed(() => {
    return [...notifications.value].sort((a, b) => {
      // Sort by read status (unread first), then by creation time (newest first)
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }
      // Assuming notifications have a timestamp or we can use _id for ordering
      return b._id.localeCompare(a._id);
    });
  });

  return {
    notifications: computed(() => notifications.value),
    isLoading,
    lastChecked,
    unreadNotifications,
    unreadCount,
    hasUnread,
    sortedNotifications,
    loadNotifications,
    loadUnreadNotifications,
    markAsRead,
    sendNotification,
    clearNotifications
  };
}

// API service for handling backend communication
const API_BASE_URL = 'http://localhost:8000'; // Backend URL on port 8000

class ApiService {
  async makeRequest(endpoint, method = 'POST', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    console.log('Making API request to:', url);
    console.log('Request options:', options);

    try {
      const response = await fetch(url, options);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Authentication endpoints
  async register(username, password) {
    return this.makeRequest('/api/Authentication/register', 'POST', {
      username,
      password
    });
  }

  async authenticate(username, password) {
    return this.makeRequest('/api/Authentication/authenticate', 'POST', {
      username,
      password
    });
  }

  async deleteUser(user) {
    return this.makeRequest('/api/Authentication/deleteUser', 'POST', {
      user
    });
  }

  async changePassword(user, newPassword) {
    return this.makeRequest('/api/Authentication/changePassword', 'POST', {
      user,
      newPassword
    });
  }

  async getAllUsers() {
    return this.makeRequest('/api/Authentication/_getAllUsers', 'POST', {});
  }

  // Posting endpoints
  async createPost(user, body) {
    return this.makeRequest('/api/Posting/createPost', 'POST', {
      user,
      body
    });
  }

  async deletePost(post) {
    return this.makeRequest('/api/Posting/deletePost', 'POST', {
      post
    });
  }

  async editPost(post, newBody) {
    return this.makeRequest('/api/Posting/editPost', 'POST', {
      post,
      newBody
    });
  }

  async getPostsByAuthor(author) {
    return this.makeRequest('/api/Posting/_getPostsByAuthor', 'POST', {
      author
    });
  }

  async getAllPosts() {
    return this.makeRequest('/api/Posting/_getAllPosts', 'POST', {});
  }

  // Commenting endpoints
  async createComment(user, body, item) {
    return this.makeRequest('/api/Commenting/createComment', 'POST', {
      user,
      body,
      item
    });
  }

  async deleteComment(comment) {
    return this.makeRequest('/api/Commenting/deleteComment', 'POST', {
      comment
    });
  }

  async editComment(comment, newBody) {
    return this.makeRequest('/api/Commenting/editComment', 'POST', {
      comment,
      newBody
    });
  }

  async getCommentsByAuthor(author) {
    return this.makeRequest('/api/Commenting/_getCommentsByAuthor', 'POST', {
      author
    });
  }

  async getCommentsByParent(parent) {
    return this.makeRequest('/api/Commenting/_getCommentsByParent', 'POST', {
      parent
    });
  }

  async getAllComments() {
    return this.makeRequest('/api/Commenting/_getAllComments', 'POST', {});
  }

  // Upvoting endpoints
  async upvote(user, item) {
    return this.makeRequest('/api/Upvoting/upvote', 'POST', {
      user,
      item
    });
  }

  async unvote(user, item) {
    return this.makeRequest('/api/Upvoting/unvote', 'POST', {
      user,
      item
    });
  }

  async getUpvotesByUser(user) {
    return this.makeRequest('/api/Upvoting/_getUpvotessByUser', 'POST', {
      user
    });
  }

  async getUpvotesByItem(item) {
    return this.makeRequest('/api/Upvoting/_getUpvotesByItem', 'POST', {
      item
    });
  }

  async getAllUpvotes() {
    return this.makeRequest('/api/Upvoting/_getAllUpvotes', 'POST', {});
  }

  // Notifying endpoints
  async notify(user, message) {
    return this.makeRequest('/api/Notifying/notify', 'POST', {
      user,
      message
    });
  }

  async readNotification(notification) {
    return this.makeRequest('/api/Notifying/read', 'POST', {
      notification
    });
  }

  async getNotificationsByUser(recipient) {
    return this.makeRequest('/api/Notifying/_getNotificationsByUser', 'POST', {
      recipient
    });
  }

  async getReadNotificationsByUser(recipient) {
    return this.makeRequest('/api/Notifying/_getReadNotificationsByUser', 'POST', {
      recipient
    });
  }

  async getUnreadNotificationsByUser(recipient) {
    return this.makeRequest('/api/Notifying/_getUnreadNotificationsByUser', 'POST', {
      recipient
    });
  }

  async getAllNotifications() {
    return this.makeRequest('/api/Notifying/_getAllNotifications', 'POST', {});
  }
}

export default new ApiService();

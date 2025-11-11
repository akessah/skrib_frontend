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
      
      // Get response text first to handle non-JSON responses
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        throw new Error(`Invalid JSON response from server: ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status}): ${responseText}`);
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

  async logout(session){
    return this.makeRequest('/api/Authentication/logout', 'POST', {session});
  }

  async deleteUser(session) {
    return this.makeRequest('/api/Authentication/deleteUser', 'POST', {
      session
    });
  }

  async changePassword(session, currentPassword, newPassword) {
    return this.makeRequest('/api/Authentication/changePassword', 'POST', {
      session,
      currentPassword,
      newPassword
    });
  }

  async getAllUsers() {
    return this.makeRequest('/api/Authentication/_getAllUsers', 'POST', {});
  }

  async getUsername(user){
    return this.makeRequest('/api/Authentication/_getUsername', 'POST', {user});
  }

  // Posting endpoints
  async createPost(session, body) {
    return this.makeRequest('/api/Posting/createPost', 'POST', {
      session,
      body
    });
  }

  async deletePost(session, post) {
    return this.makeRequest('/api/Posting/deletePost', 'POST', {
      session,
      post
    });
  }

  async editPost(session, post, newBody) {
    return this.makeRequest('/api/Posting/editPost', 'POST', {
      session,
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
  async createComment(session, body, item) {
    return this.makeRequest('/api/Commenting/createComment', 'POST', {
      // user,
      session,
      body,
      item
    });
  }

  async deleteComment(session, comment) {
    return this.makeRequest('/api/Commenting/deleteComment', 'POST', {
      session,
      comment
    });
  }

  async editComment(session, comment, newBody) {
    return this.makeRequest('/api/Commenting/editComment', 'POST', {
      session,
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
  async upvote(session, item) {
    return this.makeRequest('/api/Upvoting/upvote', 'POST', {
      session,
      item
    });
  }

  async unvote(session, item) {
    return this.makeRequest('/api/Upvoting/unvote', 'POST', {
      session,
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

  async readNotification(session, notification) {
    return this.makeRequest('/api/Notifying/read', 'POST', {
      session, 
      notification
    });
  }

  async getNotificationsByUser(session) {
    return this.makeRequest('/api/Notifying/_getNotificationsByUser', 'POST', {
      session
    });
  }

  async getReadNotificationsByUser(session) {
    return this.makeRequest('/api/Notifying/_getReadNotificationsByUser', 'POST', {
      session
    });
  }

  async getUnreadNotificationsByUser(session) {
    return this.makeRequest('/api/Notifying/_getUnreadNotificationsByUser', 'POST', {
      session
    });
  }

  async getAllNotifications() {
    return this.makeRequest('/api/Notifying/_getAllNotifications', 'POST', {});
  }

  // Google Books API
  async searchBooks(query, maxResults = 20, startIndex = 0) {
    try {

      console.log(`Searching books with query: https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}&startIndex=${startIndex}&printType=books`);
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=${maxResults}&startIndex=${startIndex}&printType=books`
      );
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching books:', error);
      throw error;
    }
  }

  async getBookDetails(bookId) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`
      );
      
      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching book details:', error);
      throw error;
    }
  }

  // Tagging endpoints
  async addTag(session, label, book) {
    return this.makeRequest('/api/Tagging/addTag', 'POST', {
      session,
      label,
      book
    });
  }

  async removeTag(session, tag) {
    return this.makeRequest('/api/Tagging/removeTag', 'POST', {
      session,
      tag
    });
  }

  async markTagPrivate(session, tag) {
    return this.makeRequest('/api/Tagging/markPrivate', 'POST', {
      session,
      tag
    });
  }

  async markTagPublic(session,tag) {
    return this.makeRequest('/api/Tagging/markPublic', 'POST', {
      session,
      tag
    });
  }

  async getTagsByBook(session, book) {
    return this.makeRequest('/api/Tagging/_getTagsByBook', 'POST', {
      session,
      book
    });
  }

  async getLabelsByBook(session, book) {
    return this.makeRequest('/api/Tagging/_getLabelsByBook', 'POST', {
      session,
      book
    });
  }

  async getBooksByLabel(user, labels, type) {
    return this.makeRequest('/api/Tagging/_getBooksByLabel', 'POST', {
      user,
      labels,
      type
    });
  }

  async getTagsByUser(session) {
    return this.makeRequest('/api/Tagging/_getTagsByUser', 'POST', {
      session
    });
  }

  async getLabelsByUser(user) {
    return this.makeRequest('/api/Tagging/_getLabelsByUser', 'POST', {
      user
    });
  }

  async getAllPublicTags() {
    return this.makeRequest('/api/Tagging/_getAllPublicTags', 'POST', {});
  }

  async getAllTags() {
    return this.makeRequest('/api/Tagging/_getAllTags', 'POST', {});
  }

  // Shelving endpoints
  async addBookToShelf(session, status, book) {
    return this.makeRequest('/api/Shelving/addBook', 'POST', {
      session,
      status,
      book
    });
  }

  async removeBookFromShelf(session, shelf) {
    return this.makeRequest('/api/Shelving/removeBook', 'POST', {
      session, 
      shelf
    });
  }

  async changeBookStatus(session, shelf, newStatus) {
    return this.makeRequest('/api/Shelving/changeStatus', 'POST', {
      session,
      shelf,
      newStatus
    });
  }

  async getUserShelfByBook(session, book) {
    return this.makeRequest('/api/Shelving/_getUserShelfByBook', 'POST', {
      session,
      book
    });
  }

  async getShelvesByBook(book) {
    return this.makeRequest('/api/Shelving/_getShelvesByBook', 'POST', {
      book
    });
  }

  async getBooksByUser(session) {
    return this.makeRequest('/api/Shelving/_getBooksByUser', 'POST', {
      session
    });
  }

  async getAllShelves() {
    return this.makeRequest('/api/Shelving/_getAllShelves', 'POST', {});
  }

  async getShelfByBookAndUser(session, book) {
    return this.makeRequest('/api/Shelving/_getShelfByBookAndOwner', 'POST', {
      session,
      book
    });
  }

  //Session endpoints
  async getUser(session){
    return this.makeRequest('/api/Sessioning/_getUser', 'POST', {
      session
    });
  }

}

export default new ApiService();

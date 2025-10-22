# Components

This directory contains reusable Vue components for the Skrib application.

## Posting Feature Components

### AuthForm.vue
Handles user authentication (login/register) with tabbed interface.
- **Props**: None
- **Emits**: `auth-success` - Fired when authentication is successful
- **Features**: Form validation, error handling, loading states, tabbed interface

### UserManagement.vue
Provides account management features for authenticated users.
- **Props**: 
  - `currentUser` (String, required) - The authenticated user's username
- **Emits**: `account-deleted` - Fired when user account is successfully deleted
- **Features**: Change password, delete account with confirmation, error handling

### UserList.vue
Displays all registered users (admin/demo component).
- **Props**: None
- **Emits**: None
- **Features**: Load all users, refresh functionality, error handling

### PostForm.vue
Form component for creating new posts.
- **Props**: 
  - `currentUser` (String, required) - The authenticated user's username
- **Emits**: `post-created` - Fired when a new post is successfully created
- **Features**: Text area for post content, form validation, success/error feedback

### PostItem.vue
Individual post display component with edit/delete functionality and navigation.
- **Props**:
  - `post` (Object, required) - Post object with _id, author, and body
  - `currentUser` (String, required) - The authenticated user's username
- **Emits**: 
  - `post-updated` - Fired when a post is successfully updated
  - `post-deleted` - Fired when a post is successfully deleted
  - `post-upvoted` - Fired when a post is upvoted/unvoted
- **Features**: 
  - Inline editing, delete confirmation, author-only actions
  - Upvoting support
  - Clickable post content that navigates to post detail page
  - Visual feedback for clickable content with hover effects
  - Post preview with "Click to view full post and comments" hint

### PostList.vue
Container component that displays all posts and handles post management.
- **Props**:
  - `currentUser` (String, required) - The authenticated user's username
  - `authorMap` (Object, optional) - Map of user IDs to usernames for display
- **Emits**: `posts-loaded` - Fired when posts are loaded from the API
- **Features**: Post loading, refresh functionality, error handling

### CommentForm.vue
Form component for creating new comments on posts or replies to comments.
- **Props**:
  - `currentUser` (String, required) - The authenticated user's username
  - `postId` (String, optional) - The ID of the post to comment on (for top-level comments)
  - `parentId` (String, optional) - The ID of the comment to reply to (for nested comments)
- **Emits**: `comment-created` - Fired when a new comment is successfully created
- **Features**: 
  - Text area for comment content, form validation, success/error feedback
  - Supports both top-level comments and nested replies
  - Dynamic labels and placeholders based on context

### CommentItem.vue
Individual comment display component with edit/delete functionality and nested replies.
- **Props**:
  - `comment` (Object, required) - Comment object with _id, author, and body
  - `currentUser` (String, required) - The authenticated user's username
  - `authorMap` (Object, optional) - Map of user IDs to usernames for display
  - `autoLoadReplies` (Boolean, default: false) - Whether to automatically load replies on mount
- **Emits**: 
  - `comment-updated` - Fired when a comment is successfully updated
  - `comment-deleted` - Fired when a comment is successfully deleted
  - `comment-upvoted` - Fired when a comment is upvoted/unvoted
- **Features**: 
  - Inline editing, delete confirmation, author-only actions
  - Reply functionality for nested comments
  - Upvoting support
  - Visual indentation for nested comment threads
  - Automatic reply loading when `autoLoadReplies` is true
  - Lazy loading of replies (only loads when user clicks "Reply" if `autoLoadReplies` is false)
  - Show/hide toggle for replies (default: hidden)
  - Reply count display in toggle button

### CommentList.vue
Container component that displays all comments for a specific post.
- **Props**:
  - `postId` (String, required) - The ID of the post to load comments for
  - `currentUser` (String, required) - The authenticated user's username
  - `authorMap` (Object, optional) - Map of user IDs to usernames for display
  - `autoShow` (Boolean, default: false) - Whether to show comments automatically on mount
  - `autoLoadReplies` (Boolean, default: false) - Whether to automatically load replies for all comments
- **Emits**: 
  - `comments-loaded` - Fired when comments are loaded from the API
  - `comment-upvoted` - Fired when a comment is upvoted/unvoted
- **Features**: Comment loading, show/hide toggle, error handling, upvoting support, automatic reply loading

### UpvoteButton.vue
Reusable component for upvoting posts and comments.
- **Props**:
  - `itemId` (String, required) - The ID of the item to upvote (post or comment)
  - `currentUser` (String, required) - The current user's ID
- **Emits**: `upvote-toggled` - Fired when upvote state changes
- **Features**: Upvote count display, vote state management, loading states, error handling

## Notification Components

### NotificationItem.vue
Individual notification display component.
- **Props**:
  - `notification` (Object, required) - Notification object with _id, message, and read status
- **Emits**: `notification-read` - Fired when notification is marked as read
- **Features**: 
  - Visual distinction between read and unread notifications
  - Click to mark as read functionality
  - Unread indicator dot

### NotificationList.vue
Container component for displaying a list of notifications.
- **Props**:
  - `userId` (String, required) - The user ID to load notifications for
- **Features**:
  - Loads and displays user notifications
  - Mark all as read functionality
  - Unread count display
  - Loading and error states
  - Sorted display (unread first, then by date)

### useUpvotes.js
Composable for managing upvote state and operations.
- **Features**: Global upvote state, load upvotes for items, toggle upvote state, clear state
- **Methods**: `loadUpvotesForItem`, `loadUpvotesForItems`, `toggleUpvote`, `getUpvotesForItem`, `clearUpvotes`

### useNotifications.js
Composable for managing notification state and operations.
- **Features**: Global notification state, load notifications, mark as read, send notifications
- **Methods**: 
  - `loadNotifications(userId)` - Load all notifications for a user
  - `loadUnreadNotifications(userId)` - Load only unread notifications
  - `markAsRead(notificationId)` - Mark a notification as read
  - `sendNotification(userId, message)` - Send a notification to a user
  - `clearNotifications()` - Clear all notifications from state
- **Computed**: `unreadNotifications`, `unreadCount`, `hasUnread`, `sortedNotifications`

## Profile Components


### PostDetail.vue
Individual post page component for viewing full post content and comments.
- **Features**:
  - Full post display with author information
  - Post editing and deletion (author-only)
  - Upvoting functionality
  - Complete comments section with nested replies
  - Navigation back to forum
  - Authentication protection
- **Route**: `/post/:id` - Dynamic route based on post ID
- **Authentication**: Requires user to be logged in
- **API Endpoints Used**:
  - `POST /api/Posting/_getAllPosts` - Load all posts to find specific post
  - `POST /api/Posting/editPost` - Edit post content
  - `POST /api/Posting/deletePost` - Delete post
  - All commenting and upvoting endpoints

### Profile.vue (Updated with Notifications)
Main profile page component for authenticated users, now including notification management.
- **Features**: 
  - User information display (username, user ID)
  - Password change functionality
  - Account deletion with confirmation
  - Logout functionality
  - **Notification management section**:
    - View all notifications
    - Mark individual or all notifications as read
    - Notification statistics (unread/total count)
    - Refresh notifications
  - Navigation to other pages
  - Authentication protection (redirects to login if not authenticated)
- **Authentication**: Requires user to be logged in
- **API Endpoints Used**:
  - `POST /api/Authentication/changePassword` - Change user password
  - `POST /api/Authentication/deleteUser` - Delete user account
  - `POST /api/Notifying/_getNotificationsByUser` - Load user notifications
  - `POST /api/Notifying/read` - Mark notifications as read

## API Integration

All components use the `apiService` from `../services/api.js` to communicate with the backend API endpoints defined in `api_specs/posting.md` and `api_specs/authentication.md`.

## Authentication

The posting feature requires user authentication. Users must login or register before they can create, edit, or delete posts. Authentication state is managed through the `useAuth` composable.

## User Management

The application uses a `useUsers` composable to manage user data and display usernames instead of user IDs throughout the interface. This composable:
- Fetches all users from the backend
- Creates a mapping of user IDs to usernames
- Provides utilities to display proper usernames in posts and comments

### Authentication Endpoints Used:
- `POST /api/Authentication/register` - User registration
- `POST /api/Authentication/authenticate` - User login
- `POST /api/Authentication/deleteUser` - Delete user account
- `POST /api/Authentication/changePassword` - Change user password
- `POST /api/Authentication/_getAllUsers` - Get all users (admin feature)

### Posting Endpoints Used:
- `POST /api/Posting/createPost` - Create new posts
- `POST /api/Posting/editPost` - Edit existing posts
- `POST /api/Posting/deletePost` - Delete posts
- `POST /api/Posting/_getAllPosts` - Fetch all posts

### Commenting Endpoints Used:
- `POST /api/Commenting/createComment` - Create new comments
- `POST /api/Commenting/editComment` - Edit existing comments
- `POST /api/Commenting/deleteComment` - Delete comments
- `POST /api/Commenting/_getCommentsByParent` - Fetch comments for a specific post

### Upvoting Endpoints Used:
- `POST /api/Upvoting/upvote` - Add an upvote to an item
- `POST /api/Upvoting/unvote` - Remove an upvote from an item
- `POST /api/Upvoting/_getUpvotesByItem` - Get upvotes for a specific item
- `POST /api/Upvoting/_getUpvotessByUser` - Get upvotes by a specific user
- `POST /api/Upvoting/_getAllUpvotes` - Get all upvotes in the system

### Notifying Endpoints Used:
- `POST /api/Notifying/notify` - Send a notification to a user
- `POST /api/Notifying/read` - Mark a notification as read
- `POST /api/Notifying/_getNotificationsByUser` - Get all notifications for a user
- `POST /api/Notifying/_getUnreadNotificationsByUser` - Get unread notifications for a user
- `POST /api/Notifying/_getAllNotifications` - Get all notifications in the system

Components will be organized by feature:
- Authentication components ✅
- Post components ✅
- Comment components ✅
- Upvote components ✅
- Profile components ✅
- Notification components ✅
- Tag components

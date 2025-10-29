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

### Profile.vue (Updated with Notifications and Tag Management)
Main profile page component for authenticated users, now including notification and tag management.
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
  - **Tag management section**:
    - View all user tags and labels
    - Tag statistics (unique labels/total tags)
    - Recent tags with book titles
    - Toggle tag privacy (public/private)
    - Remove individual tags
    - View books by label
    - Refresh tags
  - Navigation to other pages
  - Authentication protection (redirects to login if not authenticated)
- **Authentication**: Requires user to be logged in
- **API Endpoints Used**:
  - `POST /api/Authentication/changePassword` - Change user password
  - `POST /api/Authentication/deleteUser` - Delete user account
  - `POST /api/Notifying/_getNotificationsByUser` - Load user notifications
  - `POST /api/Notifying/read` - Mark notifications as read
  - `POST /api/Tagging/_getTagsByUser` - Load user tags
  - `POST /api/Tagging/_getLabelsByUser` - Load user labels
  - `POST /api/Tagging/removeTag` - Remove a tag
  - `POST /api/Tagging/markPrivate` - Mark tag as private
  - `POST /api/Tagging/markPublic` - Mark tag as public
  - `GET https://www.googleapis.com/books/v1/volumes/{id}` - Get book details

### Search.vue (Updated with Advanced Search)
Advanced book search page with multiple search criteria and tag-based filtering.
- **Features**:
  - **Advanced Search Form**: Search by title, author, and tags
  - **Tag Search Options**: Choose between "any tags" (union) or "all tags" (intersection)
  - **Tag Autocomplete**: Suggestions based on existing public tags
  - **Combined Search**: Use multiple criteria for precise results
  - **Simplified Results**: Clean display showing title, author, and cover
  - **Click Navigation**: Click any result to view detailed book page
  - **Search Tips**: Helpful guidance for using advanced search features
  - **Responsive Design**: Works perfectly on all screen sizes
- **Route**: `/search` - Advanced book search page
- **Authentication**: No authentication required for search, tagging requires login
- **API Integration**: Google Books API and tagging API
- **External APIs Used**:
  - `GET https://www.googleapis.com/books/v1/volumes` - Search books
  - `GET https://www.googleapis.com/books/v1/volumes/{id}` - Get book details
  - `POST /api/Tagging/_getBooksByLabel` - Search books by tags
  - `POST /api/Tagging/_getAllPublicTags` - Get available tags for suggestions

### BookDetail.vue
Detailed book information page with full book details and tagging functionality.
- **Features**:
  - Complete book information (title, authors, description, rating, publication details)
  - Large book cover display
  - Preview and info links to Google Books
  - Tagging functionality for authenticated users
  - View and manage existing tags
  - Add new tags with validation
  - Remove own tags
  - Navigation back to search
- **Route**: `/book/:id` - Individual book detail page
- **Authentication**: Tagging requires user to be logged in
- **API Integration**: Google Books API and tagging API
- **External APIs Used**:
  - `GET https://www.googleapis.com/books/v1/volumes/{id}` - Get book details
  - All tagging endpoints for tag management

## Book Search Components

### AdvancedSearchForm.vue
Advanced search form component with multiple search criteria and tag-based filtering.
- **Features**:
  - **Title Search**: Search by book title with partial matching
  - **Author Search**: Search by author name
  - **Tag Search**: Add multiple tags with autocomplete suggestions
  - **Tag Options**: Checkbox to choose between "any tags" (union) or "all tags" (intersection)
  - **Tag Autocomplete**: Real-time suggestions based on existing public tags
  - **Combined Search**: Use multiple criteria simultaneously for precise results
  - **Search Summary**: Shows search criteria and result count
  - **Form Validation**: Ensures at least one search criterion is provided
  - **Clear Function**: Reset all search criteria
- **Events**:
  - `@search-results` - Emitted with search results array
  - `@search-started` - Emitted when search begins
- **API Integration**: Uses Google Books API and tagging API for comprehensive search

### BookSearchItem.vue
Simplified book display component for search results with navigation to detail page.
- **Props**:
  - `book` (Object, required) - Book object from Google Books API
- **Features**:
  - Compact display showing only title, author, and cover
  - Click to navigate to detailed book page
  - Book cover with fallback for missing covers
  - Hover effects with click indicator
  - Responsive design optimized for search results
  - Clean, minimal interface for quick browsing

### BookItem.vue
Individual book display component for search results with tagging functionality.
- **Props**:
  - `book` (Object, required) - Book object from Google Books API
- **Features**:
  - Book cover display with fallback for missing covers
  - Book details (title, authors, publication date, publisher, pages)
  - Star rating display
  - Truncated description
  - Preview and info links
  - **Tagging functionality**:
    - Add tags to books (authenticated users only)
    - View existing tags on books
    - Remove tags (own tags only)
    - Tag form with validation
    - Success/error feedback
  - Responsive design
  - Hover effects and animations

### TaggedBooks.vue
Component for displaying user's tagged books on the homepage.
- **Features**:
  - Display all books tagged by the current user
  - Show book titles and associated tags
  - Navigate to detailed book page by clicking "View Details"
  - Remove all tags from a book
  - Loading states and error handling
  - Empty state with link to search page
  - Responsive grid layout
- **Authentication**: Requires user to be logged in
- **API Integration**: Uses Google Books API for book details and tagging API for tag management
- **Navigation**: "View Details" button navigates to `/book/:id` route

## Tag Management Components

### useTags.js (Composable)
Composable for managing tag state and operations.
- **Features**:
  - Global tag state management
  - Load user tags and book-specific tags
  - Add, remove, and toggle tag privacy
  - Load public tags for search suggestions
  - Computed properties for tagged books and user labels
  - Error handling and loading states
- **Methods**:
  - `loadUserTags(userId)` - Load all tags for a user
  - `loadBookTags(userId, bookId)` - Load tags for a specific book
  - `addTag(userId, label, bookId)` - Add a new tag
  - `removeTag(tagId)` - Remove a tag
  - `toggleTagPrivacy(tagId, isPrivate)` - Change tag privacy
  - `getAllPublicTags()` - Load all public tags for search suggestions
- **Computed Properties**:
  - `getTaggedBooks` - Books grouped by book ID with their tags
  - `getUserLabels` - Unique labels with usage counts

## Shelving Components

### useShelving.js (Composable)
Composable for managing book shelving state and operations.
- **Features**:
  - Global shelf state management
  - Load user shelves and book-specific shelf information
  - Add, remove, and change book shelf status
  - Computed properties for shelf organization
  - Error handling and loading states
- **Shelf Status Constants**:
  - `WANT_TO_READ` (0) - Books user wants to read
  - `CURRENTLY_READING` (1) - Books user is currently reading
  - `READ` (2) - Books user has finished reading
  - `DID_NOT_FINISH` (3) - Books user did not finish
- **Methods**:
  - `loadUserShelves(userId)` - Load all shelves for a user
  - `loadBookShelves(bookId)` - Load shelf information for a specific book
  - `getUserShelfForBook(userId, bookId)` - Get user's shelf status for a book
  - `addBookToShelf(userId, status, bookId)` - Add book to a shelf
  - `removeBookFromShelf(shelfId)` - Remove book from shelf
  - `changeBookStatus(shelfId, newStatus)` - Move book to different shelf
- **Computed Properties**:
  - `getBooksByStatus` - Books organized by shelf status
  - `getShelfCounts` - Count of books in each shelf
  - `getTotalShelvedBooks` - Total number of shelved books

### ShelfButton.vue
Interactive component for managing book shelf status.
- **Props**:
  - `bookId` (String, required) - ID of the book to shelf
- **Features**:
  - Add book to any shelf (Want to Read, Currently Reading, Read, Did Not Finish)
  - Change book's shelf status
  - Remove book from shelf
  - Real-time status updates
  - Authentication-aware (shows login prompt if not authenticated)
  - Success/error feedback
- **Shelf Options**:
  - 📚 Want to Read
  - 📖 Currently Reading
  - ✅ Read
  - ❌ Did Not Finish

### UserShelves.vue
Component for displaying user's organized book shelves on homepage.
- **Features**:
  - Display all user's shelves organized by status
  - Show book titles, authors, and shelf counts
  - Quick actions to view book details or remove from shelf
  - Empty state with search link when no books shelved
  - Loading and error states
  - Responsive grid layout
- **Shelf Sections**:
  - Each shelf shows books with title, author, and action buttons
  - "View Details" button navigates to book detail page
  - Remove button with confirmation dialog
  - Book count display for each shelf

## Page Components

### Home.vue
Homepage with user welcome message, book shelves, and tagged books display.
- **Features**:
  - Welcome message with username
  - **User Shelves**: Display of user's organized book shelves (Want to Read, Currently Reading, Read, Did Not Finish)
  - **Tagged Books**: Display of user's tagged books
  - Authentication prompt for non-logged-in users
  - Feature cards highlighting app capabilities
- **Route**: `/` - Homepage
- **Authentication**: Shows different content based on authentication status
- **Components Used**: `AuthForm`, `UserShelves`, `TaggedBooks`

## API Integration

All components use the `apiService` from `../services/api.js` to communicate with the backend API endpoints defined in:
- `api_specs/posting.md` - Post management
- `api_specs/authentication.md` - User authentication
- `api_specs/commenting.md` - Comment system
- `api_specs/upvoting.md` - Upvoting system
- `api_specs/notifying.md` - Notification system
- `api_specs/tagging.md` - Book tagging
- `api_specs/shelving.md` - Book shelving
- Google Books API - External book data

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

### Google Books API Endpoints Used:
- `GET https://www.googleapis.com/books/v1/volumes` - Search for books by query
- `GET https://www.googleapis.com/books/v1/volumes/{id}` - Get detailed information about a specific book

### Tagging Endpoints Used:
- `POST /api/Tagging/addTag` - Add a tag to a book
- `POST /api/Tagging/removeTag` - Remove a tag from a book
- `POST /api/Tagging/markPrivate` - Mark a tag as private
- `POST /api/Tagging/markPublic` - Mark a tag as public
- `POST /api/Tagging/_getTagsByBook` - Get all tags for a specific book
- `POST /api/Tagging/_getTagsByUser` - Get all tags created by a user
- `POST /api/Tagging/_getLabelsByUser` - Get all labels created by a user
- `POST /api/Tagging/_getBooksByLabel` - Get books with specific labels
- `POST /api/Tagging/_getAllPublicTags` - Get all public tags
- `POST /api/Tagging/_getAllTags` - Get all tags in the system

Components will be organized by feature:
- Authentication components ✅
- Post components ✅
- Comment components ✅
- Upvote components ✅
- Profile components ✅
- Notification components ✅
- Book search components ✅
- Tag components

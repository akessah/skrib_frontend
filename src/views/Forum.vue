<template>
  <div class="forum">
    <h1>Forum</h1>
    <p>Join the discussion and connect with others</p>
    
    <div class="forum-content">
      <!-- Authentication Section -->
      <div v-if="!isAuthenticated" class="auth-section">
        <h2><img src="../../assets/lock.png" alt="Lock icon" width = "15"> Login Required</h2>
        <p>You need to be logged in to access the forum and participate in discussions.</p>
        <p>Please login or register to continue:</p>
        <AuthForm @auth-success="handleAuthSuccess" />
      </div>
      
      <!-- Authenticated User Section -->
      <div v-else class="authenticated-section">
        
        <!-- Post Creation Form -->
        <PostForm 
          :current-user="currentUser" 
          @post-created="handlePostCreated" 
        />
        
        <!-- Posts List -->
          <PostList 
            :current-user="currentUser"
            ref="postList"
            @posts-loaded="handlePostsLoaded"
            @post-upvoted="handlePostUpvoted"
          />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useAuth } from '../composables/useAuth.js';
import AuthForm from '../components/AuthForm.vue';
import PostForm from '../components/PostForm.vue';
import PostList from '../components/PostList.vue';

export default {
  name: 'Forum',
  components: {
    AuthForm,
    PostForm,
    PostList
  },
  setup() {
    const { currentUser, currentUsername, isAuthenticated, initializeAuth } = useAuth();
    const postList = ref(null);

    const handleAuthSuccess = () => {
      // Auth success is handled by the composable
      console.log('Authentication successful');
    };


    const handlePostCreated = async (postId) => {
      // Refresh the post list to show the new post
      if (postList.value) {
        await postList.value.refreshPosts();
      }
    };

    const handlePostsLoaded = (posts) => {
      // Handle posts loaded event if needed
      console.log('Posts loaded:', posts.length);
    };

    
    const handlePostUpvoted = (upvoteData) => {
      // Handle post upvote events if needed
      console.log('Post upvoted:', upvoteData);
    };

    onMounted(() => {
      initializeAuth();
    });

    return {
      currentUser,
      currentUsername,
      isAuthenticated,
      postList,
      handleAuthSuccess,
      handlePostCreated,
      handlePostsLoaded,
      handlePostUpvoted
    };
  }
}
</script>

<style scoped>
.forum {
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2.5rem;
}

p {
  color: #666;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.forum-content {
  margin-top: 2rem;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.auth-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.auth-section h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.authenticated-section {
  text-align: left;
}

.user-welcome {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-welcome h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

</style>

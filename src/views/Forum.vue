<template>
  <div class="forum">
    <h1>Forum</h1>
    <p>Join the discussion and connect with others</p>
    
    <div class="forum-content">
      <p>Forum content coming soon...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Forum'
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
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

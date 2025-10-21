<template>
  <div class="home">
    <h1>Welcome to Skrib</h1>
    <p>A Vue.js frontend application</p>
    
    <div class="features">
      <h2>Features</h2>
      <ul>
        <li>Authentication</li>
        <li>Posting</li>
        <li>Commenting</li>
        <li>Upvoting</li>
        <li>Tagging</li>
        <li>Notifications</li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
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

.features {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.features h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.features ul {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  text-align: left;
}

.features li {
  padding: 0.5rem;
  background: #f8f8f8;
  border-radius: 4px;
}
</style>

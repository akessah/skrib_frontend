<template>
  <div class="search">
    <h1>Search</h1>
    <p>Find what you're looking for</p>
    
    <div class="search-content">
      <div class="search-box">
        <input 
          type="text" 
          placeholder="Search..." 
          class="search-input"
        />
        <button class="search-button">Search</button>
      </div>
      <div class="search-results">
        <p>Enter a search term to get started</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search'
}
</script>

<style scoped>
.search {
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

.search-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.search-box {
  display: flex;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #42b983;
}

.search-button {
  padding: 0.75rem 2rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #359268;
}

.search-results {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}
</style>

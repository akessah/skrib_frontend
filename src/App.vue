<template>
  <div id="app">
    <header>
      <nav>
        <div class="nav-brand">
          <router-link to="/">Skrib</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/forum" class="nav-link">Forum</router-link>
          <router-link to="/search" class="nav-link">Search</router-link>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand a {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-brand a:hover {
  color: #42b983;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #2c3e50;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #42b983;
}

.nav-link.router-link-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.25rem;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
</style>

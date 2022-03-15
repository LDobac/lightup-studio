<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <header>
    <div class="wrapper">
      <p class="logo">LightUp Studio</p>
      <nav>
        <RouterLink to="/">Editor</RouterLink>
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style lang="scss">
header {
  line-height: 1.5;
  max-height: 100vh;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

.wrapper {
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;

  nav {
    margin: auto;
    font-size: 12px;
    text-align: center;
  }

  nav a.router-link-exact-active {
    color: var(--color-text);
  }

  nav a.router-link-exact-active:hover {
    background-color: transparent;
  }

  nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
  }

  nav a:first-of-type {
    border: 0;
  }
}
</style>

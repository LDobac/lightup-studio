<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
</script>

<template>
  <div class="container">
    <div class="header">
      <Header />
    </div>
    <div class="content">
      <RouterView />
    </div>
    <div class="footer">
      <footer>Made by yikolden.</footer>
    </div>
  </div>
</template>

<style>
@import "@/assets/styles/reset.css";
@import "@/assets/styles/base.css";
</style>

<style lang="scss" scoped>
.container {
  width: 100vw;
  height: 100vh;

  max-width: 100%;
  max-height: 100%;

  display: flex;
  flex-direction: column;
}

.header {
  background-color: #fff4e3;
  padding: 1rem;
  flex-grow: 0;
  flex-shrink: 0;
}

.content {
  flex-grow: 1;
  flex-shrink: 1;
}

.footer {
  background-color: #fff4e3;
  padding: 1rem;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>

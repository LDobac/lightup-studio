<script setup lang="ts">
import { RouterView } from "vue-router";
import Header from "./components/Header.vue";
</script>

<template>
  <Header />

  <RouterView />
</template>

<style>
@import "@/assets/styles/reset.css";
@import "@/assets/styles/base.css";

#app {
  display: grid;
  grid-template-rows: 40px 1fr;
  row-gap: 2rem;

  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem;

  font-weight: normal;
}
</style>

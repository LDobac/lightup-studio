<script setup lang="ts">
import { NLayout } from "naive-ui";
import ModuleCanvas from "./ModuleCanvas.vue";
import ModuleList from "./ModuleList.vue";
</script>

<template>
  <div class="visual-module-editor editor">
    <ModuleList />
    <n-layout style="height: 100%; flex-grow: 1; flex-shrink: 1">
      <ModuleCanvas class="board" />
    </n-layout>
  </div>
</template>

<style lang="scss" scoped>
.visual-module-editor {
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.board {
  width: 100%;
  height: 100%;
}
</style>

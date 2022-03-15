<script setup lang="ts">
import { ref } from "vue";
import VisualModuleEditor from "./VisualModuleEditor.vue";
import CodeModuleEditor from "./CodeModuleEditor.vue";
import { NButton, NButtonGroup } from "naive-ui"

const isVisualMode = ref(true);
</script>

<template>
  <div class="module-editor">
    <div class="switch">
      <NButtonGroup>
        <NButton ghost @click="isVisualMode = true">Visual</NButton>
        <NButton ghost @click="isVisualMode = false">Code</NButton>
      </NButtonGroup>
    </div>
    <VisualModuleEditor v-if="isVisualMode" />
    <CodeModuleEditor v-if="!isVisualMode" />
  </div>
</template>

<style lang="scss" scoped>
.editor {
  background-color: #fafafa;
  width: 100%;
  height: 100%;
}
</style>

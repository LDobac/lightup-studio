<script setup lang="ts">
import { NTabs, NTabPane } from "naive-ui";
import VisualModuleEditor from "./VisualEditor/VisualModuleEditor.vue";
import CodeModuleEditor from "./CodeEditor/CodeModuleEditor.vue";
</script>

<template>
  <div class="module-editor">
    <n-tabs type="segment" :bar-width="28" style="padding: 0px; height: 100%;">
      <n-tab-pane name="Visual" tab="Visual" style="padding: 0px; height: calc(100% - 40px)">
        <VisualModuleEditor />
      </n-tab-pane>
      <n-tab-pane name="Code" tab="Code" style="padding: 0px; height: calc(100% - 40px)">
        <CodeModuleEditor />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style lang="scss" scoped>
.module-editor {
  height: 100%;
}
</style>

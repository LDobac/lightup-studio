<script setup lang="ts">
import { NTabs, NTabPane } from "naive-ui";
import VisualModuleEditor from "./VisualEditor/VisualModuleEditor.vue";
import CodeModuleEditor from "./CodeEditor/CodeModuleEditor.vue";
</script>

<template>
  <div class="module-editor">
    <n-tabs
      class="tabs"
      type="segment"
      :bar-width="28"
      style="padding: 0px; height: 100%"
    >
      <n-tab-pane
        class="tab-pane"
        name="Visual"
        tab="Visual"
        display-directive="show"
      >
        <VisualModuleEditor />
      </n-tab-pane>
      <n-tab-pane
        class="tab-pane"
        name="Code"
        tab="Code"
        display-directive="show"
      >
        <CodeModuleEditor />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style lang="scss" scoped>
.module-editor {
  height: 100%;
}

.tabs {
  display: flex;
  flex-direction: column;

  .tab-pane {
    padding: 0px;
    height: 100%;
  }
}
</style>

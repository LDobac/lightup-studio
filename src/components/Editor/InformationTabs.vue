<template>
  <div class="information-tabs">
    <n-tabs default-value="hierarchy" class="tabs">
      <n-tab-pane
        class="tab-pane"
        name="inspect"
        tab="Inspect"
        display-directive="show"
        >Inspect</n-tab-pane
      >
      <n-tab-pane
        class="tab-pane"
        name="presets"
        tab="Presets"
        display-directive="show"
        >Presets</n-tab-pane
      >
      <n-tab-pane
        class="tab-pane"
        name="assets"
        tab="Assets"
        display-directive="show"
        >Assets</n-tab-pane
      >
      <n-tab-pane
        class="tab-pane"
        name="gamesettings"
        tab="Gamesettings"
        display-directive="show"
        >Game Settings</n-tab-pane
      >
      <n-tab-pane
        class="tab-pane"
        name="hierarchy"
        tab="Hierarchy"
        display-directive="show"
        ><Hierarchy
      /></n-tab-pane>
    </n-tabs>
  </div>
</template>

<script lang="ts" setup>
import { NTabs, NTabPane } from "naive-ui";
import Hierarchy from "@/components/Editor/ModuleEditor/VisualEditor/Hierarchy.vue";
</script>

<style lang="scss">
.information-tabs {
  flex-grow: 1;
}

.tabs {
  height: 100%;

  display: flex;
  flex-direction: column;

  .tab-pane {
    height: 100%;
  }
}
</style>

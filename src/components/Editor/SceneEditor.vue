<script setup lang="ts">
import { NButton } from "naive-ui";

import Canvas from "@/components/Canvas.vue";
import { ref, watch } from "vue";
import { usePrototypeStore } from "@/stores/PrototypeStore";

const store = usePrototypeStore();

const HandleToggleEdit = () => {
  if (store.prototype && store.prototype.gameEngine) {
    store.prototype.gameEngine.SetEditMode(!isEditing.value);

    isEditing.value = store.prototype.gameEngine.isEditing;
  }
};

const isEditing = ref(false);

watch(
  () => store.prototype,
  (prototype) => {
    if (prototype && prototype.gameEngine) {
      isEditing.value = prototype.gameEngine.isEditing;
    } else {
      isEditing.value = false;
    }
  }
);
</script>

<template>
  <div class="scene-editor editor">
    <Canvas class="scene-canvas" />

    <n-button
      :type="isEditing ? 'success' : 'error'"
      @click="HandleToggleEdit"
      >{{ isEditing ? "Start Game" : "Finish Game" }}</n-button
    >
  </div>
</template>

<style lang="scss" scoped></style>

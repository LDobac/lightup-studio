<script setup lang="ts">
import { ref, watch } from "vue";
import { NButton } from "naive-ui";
import Canvas from "@/components/Canvas.vue";
import { usePrototypeStore } from "@/stores/PrototypeStore";

const store = usePrototypeStore();
const isEditing = ref(false);

const HandleToggleEdit = () => {
  if (store.isPrototypeOpen && store.isLoaded) {
    if (store.prototype.gameEngine) {
      store.prototype.gameEngine.SetEditMode(!isEditing.value);

      isEditing.value = store.prototype.gameEngine.isEditing;
    }
  }
};

watch(
  () => store.isPrototypeOpen,
  (isOpen) => {
    const gameEngine = store.prototype.gameEngine;
    if (isOpen && gameEngine) {
      isEditing.value = gameEngine.isEditing;
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
      class="btn-start"
      :type="isEditing ? 'success' : 'error'"
      @click="HandleToggleEdit"
      >{{ isEditing ? "Start Game" : "Finish Game" }}</n-button
    >
  </div>
</template>

<style lang="scss" scoped>
.scene-editor {
  position: relative;
}

.btn-start {
  position: absolute;
  display: inline-block;

  top: 10px;
  left: 50%;
  transform: translateX(-50%);
}
</style>

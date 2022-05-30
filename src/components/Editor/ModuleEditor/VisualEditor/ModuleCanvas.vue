<template>
  <div
    class="module-canvas"
    :class="isEnable ? '' : 'disable'"
    :style="`background-position: ${curPosition.x}px ${
      curPosition.y
    }px; cursor: ${hold ? 'move' : 'default'}`"
    @dragover="DragOver"
    v-on:drop="Drop($event, HandleGameModuleDrop)"
    @mousedown.stop="HandleMouseDown"
    @touchstart.stop="HandleTouchStart"
    @mousemove.stop="HandleMouseMove"
    @touchmove.stop="HandleTouchMove"
    @mouseup.stop="HandleMouseUp"
    @touchend.stop="HandleTouchEnd"
  >
    <div
      v-if="isEnable"
      class="module-list"
      :style="`transform: translate(${curPosition.x}px, ${curPosition.y}px);`"
    >
      <div class="visual-only-gameobject" v-if="editorStore.selectedGameObject">
        <ModuleBlock
          v-for="gameModuleId in visualOnlyGameObjects[
            editorStore.selectedGameObject.id
          ]"
          :key="gameModuleId"
          class="item"
          :x="0"
          :y="0"
          :module-id="gameModuleId"
          @delete="HandleVisualModuleDelete"
        />
      </div>

      <ModuleBlock
        v-for="gameModule in editorStore.selectedGameObject
          ?.prototypeGameModule"
        :key="gameModule.uid"
        class="item"
        :x="0"
        :y="0"
        :module-id="gameModule.module.id"
        @delete="() => HandleModuleDelete(gameModule.uid)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import ModuleBlock from "./ModuleBlock.vue";
import { useMovable } from "@/composables/Moveable";
import { useGameModuleDrag } from "@/composables/GameModuleDrag";
import { useEditorStore } from "@/stores/EditorStore";

const editorStore = useEditorStore();

const isEnable = computed(() => {
  return editorStore.selectedGameObject ? true : false;
});

const {
  hold,
  curPosition,
  HandleMouseDown,
  HandleTouchStart,
  HandleMouseMove,
  HandleTouchMove,
  HandleTouchEnd,
  HandleMouseUp,
} = useMovable();

const { Drop, DragOver } = useGameModuleDrag();

const visualOnlyGameObjects = ref<Record<string, Array<string>>>({});

const HandleGameModuleDrop = (prototypeGameModuleId: string) => {
  if (isEnable.value && editorStore.selectedGameObject) {
    const gameObjectId = editorStore.selectedGameObject.id;

    if (!visualOnlyGameObjects.value[gameObjectId]) {
      visualOnlyGameObjects.value[gameObjectId] = [];
    }

    visualOnlyGameObjects.value[gameObjectId].push(prototypeGameModuleId);
  }
};

watch(isEnable, (newValue: boolean) => {
  if (!newValue) {
    curPosition.value = { x: 0, y: 0 };
  }
});

const HandleVisualModuleDelete = (moduleId: string) => {
  if (isEnable.value && editorStore.selectedGameObject) {
    const gameObjectId = editorStore.selectedGameObject.id;

    const index = visualOnlyGameObjects.value[gameObjectId].findIndex(
      (v) => v === moduleId
    );
    if (index > -1) {
      visualOnlyGameObjects.value[gameObjectId].splice(index, 1);
    }
  }
};

const HandleModuleDelete = (uid: string) => {
  if (editorStore.selectedGameObject) {
    editorStore.selectedGameObject.RemoveProtoGMByUid(uid);
  }
};
</script>

<style lang="scss" scoped>
.module-canvas {
  position: relative;
  background-color: #d6e9f4;
  overflow: hidden;
  cursor: move;

  background-repeat: repeat;
  // background-image: url("https://cookieshq.co.uk/images/2016/06/28/background-image.jpg");

  z-index: 1;

  &.disable {
    background-color: #444444;
  }
}

.module-list {
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  z-index: 10;
  position: relative;
}
</style>

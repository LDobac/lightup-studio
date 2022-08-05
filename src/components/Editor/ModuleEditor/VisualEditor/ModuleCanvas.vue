<template>
  <div
    class="module-canvas"
    :class="editorStore.selectedGameObject ? '' : 'disable'"
    :style="`background-position: ${curPosition.x}px ${
      curPosition.y
    }px; cursor: ${hold ? 'move' : 'default'}`"
    @dragover.stop.prevent="DragOver"
    v-on:drop.stop.prevent="Drop($event, HandleGameModuleDrop)"
    @mousedown.stop.prevent="HandleMouseDown"
    @touchstart.stop.prevent="HandleTouchStart"
    @mousemove.stop.prevent="HandleMouseMove"
    @touchmove.stop.prevent="HandleTouchMove"
    @mouseup.stop.prevent="HandleMouseUp"
    @touchend.stop.prevent="HandleTouchEnd"
  >
    <div
      v-if="editorStore.selectedGameObject"
      class="module-list"
      :style="`transform: translate(${curPosition.x}px, ${curPosition.y}px);`"
    >
      <GameObjectBlock :game-object="editorStore.selectedGameObject" />

      <ModuleBlock
        v-for="voGameObject in visualOnlyGameObjects[
          editorStore.selectedGameObject.id
        ]"
        :key="voGameObject.protoGameModuleId"
        class="item"
        :x="voGameObject.x"
        :y="voGameObject.y"
        :module-id="voGameObject.protoGameModuleId"
        @delete="HandleVisualModuleDelete"
      />

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
import { ref, watch } from "vue";
import ModuleBlock from "./ModuleBlock.vue";
import { useMovable } from "@/composables/Moveable";
import { useGameModuleDrag } from "@/composables/GameModuleDrag";
import { useEditorStore } from "@/stores/EditorStore";
import GameObjectBlock from "./GameObjectBlock.vue";

const editorStore = useEditorStore();

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

const visualOnlyGameObjects = ref<
  Record<string, Array<{ protoGameModuleId: string; x: number; y: number }>>
>({});

const HandleGameModuleDrop = (
  event: DragEvent,
  prototypeGameModuleId: string
) => {
  if (editorStore.selectedGameObject) {
    const gameObjectId = editorStore.selectedGameObject.id;

    if (!visualOnlyGameObjects.value[gameObjectId]) {
      visualOnlyGameObjects.value[gameObjectId] = [];
    }

    // console.log("Global : ", event.screenX, ", ", event.screenY);
    // console.log("Page   : ", event.pageX, ", ", event.pageY);
    // console.log("Client : ", event.clientX, ", ", event.clientY);
    // console.log("Canvas : ", curPosition.value.x, ", ", curPosition.value.y);
    // console.log("Diff   : ", event.screenX - curPosition.value.x, event.screenY - curPosition.value.y);

    const initX = event.screenX / 2 - curPosition.value.x / 2;
    const initY = event.screenY / 2 - curPosition.value.y / 2;

    visualOnlyGameObjects.value[gameObjectId].push({
      protoGameModuleId: prototypeGameModuleId,
      x: initX,
      y: initY,
    });
  }
};

watch(
  () => editorStore.selectedGameObject,
  (gameObject) => {
    if (gameObject) {
      curPosition.value = { x: 0, y: 0 };
    }
  }
);

const HandleVisualModuleDelete = (moduleId: string) => {
  if (editorStore.selectedGameObject) {
    const gameObjectId = editorStore.selectedGameObject.id;

    const index = visualOnlyGameObjects.value[gameObjectId].findIndex(
      (v) => v.protoGameModuleId === moduleId
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

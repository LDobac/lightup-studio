<script setup lang="ts">
import { ref } from "vue";
import ModuleBlock from "./ModuleBlock.vue";
import { useMovable } from "@/composables/Moveable";
import { useGameModuleDrag } from "@/composables/GameModuleDrag";

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

const gameModules = ref<Array<string>>([]);

const HandleGameModuleDrop = (prototypeGameModuleId: string) => {
  gameModules.value.push(prototypeGameModuleId);
};
</script>

<template>
  <div
    class="module-canvas"
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
      class="module-list"
      :style="`transform: translate(${curPosition.x}px, ${curPosition.y}px);`"
    >
      <div class="item" v-for="gameModule in gameModules" :key="gameModule">
        <ModuleBlock :x="0" :y="0" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.module-canvas {
  position: relative;
  background-color: #d6e9f4;
  overflow: hidden;
  cursor: move;

  background-repeat: repeat;
  background-image: url("https://cookieshq.co.uk/images/2016/06/28/background-image.jpg");

  z-index: 1;
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

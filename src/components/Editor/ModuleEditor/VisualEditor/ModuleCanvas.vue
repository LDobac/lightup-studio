<script setup lang="ts">
import ModuleBlock from "./ModuleBlock.vue";
import { useMovable } from "@/composables/Moveable";

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
</script>

<template>
  <div
    class="module-canvas"
    :style="`background-position: ${curPosition.x}px ${
      curPosition.y
    }px; cursor: ${hold ? 'move' : 'default'}`"
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
      <ModuleBlock />
      <ModuleBlock />
      <ModuleBlock />
      <ModuleBlock />
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

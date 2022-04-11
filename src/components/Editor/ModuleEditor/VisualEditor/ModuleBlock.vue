<script setup lang="ts">
import { NCard } from "naive-ui";
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
    class="module-block"
    :style="`top: ${curPosition.y}px; left: ${curPosition.x}px; cursor: ${
      hold ? 'move' : 'default'
    }`"
    @mousedown.stop="HandleMouseDown"
    @touchstart.stop="HandleTouchStart"
    @mousemove.stop="HandleMouseMove"
    @touchmove.stop="HandleTouchMove"
    @mouseup.stop="HandleMouseUp"
    @touchend.stop="HandleTouchEnd"
  >
    <n-card bordered style="width: 100%; height: 100%; text-align: center">
      <span>This is module</span>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.module-block {
  width: 200px;
  height: 100px;

  overflow: hidden;

  z-index: 10;
}
</style>

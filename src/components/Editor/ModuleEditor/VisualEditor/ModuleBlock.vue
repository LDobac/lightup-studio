<script setup lang="ts">
import { NCard } from "naive-ui";
import { useMovable } from "@/composables/Moveable";
import { onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
  }>(),
  {
    x: 0,
    y: 0,
  }
);

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

onMounted(() => {
  curPosition.value.x = props.x;
  curPosition.value.y = props.y;
});
</script>

<template>
  <div
    class="module-block"
    :style="`transform: translate(${curPosition.x}px, ${
      curPosition.y
    }px);cursor: ${hold ? 'move' : 'default'}`"
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

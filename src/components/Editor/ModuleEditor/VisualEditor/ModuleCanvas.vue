<script setup lang="ts">
import { ref } from "vue";
import ModuleBlock from "./ModuleBlock.vue";

let hold = false;

const lastPosition = ref({ x: 0, y: 0 });
const canvasPosition = ref({ x: 0, y: 0 });

// TODO : MovableCanvas로 별도 컴포넌트 구현
const HandleMouseDown = (e: MouseEvent) => {
  e.preventDefault();

  if (e.button === 0) {
    HandleClick(e.x, e.y);
  }
};

const HandleMouseMove = (e: MouseEvent) => {
  e.preventDefault();

  HandleMove(e.x, e.y);
};

const HandleMouseUp = (e: MouseEvent) => {
  e.preventDefault();

  HandleRelease();
};

const HandleTouchStart = (e: TouchEvent) => {
  e.preventDefault();

  HandleClick(e.touches[0].clientX, e.touches[0].clientY);
};

const HandleTouchMove = (e: TouchEvent) => {
  e.preventDefault();

  HandleClick(e.touches[0].clientX, e.touches[0].clientY);
};

const HandleTouchEnd = (e: TouchEvent) => {
  e.preventDefault();

  HandleRelease();
};

const HandleClick = (x: number, y: number) => {
  hold = true;

  lastPosition.value = { x, y };
};

const HandleMove = (x: number, y: number) => {
  if (hold) {
    const deltaX = x - lastPosition.value.x;
    const deltaY = y - lastPosition.value.y;

    canvasPosition.value.x += deltaX;
    canvasPosition.value.y += deltaY;

    lastPosition.value = { x, y };
  }
};

const HandleRelease = () => {
  hold = false;

  lastPosition.value = { x: 0, y: 0 };
};
</script>

<template>
  <div
    class="module-canvas"
    :style="`background-position: ${canvasPosition.x}px ${canvasPosition.y}px;`"
    @mousedown="HandleMouseDown"
    @touchstart="HandleTouchStart"
    @mousemove="HandleMouseMove"
    @touchmove="HandleTouchMove"
    @mouseup="HandleMouseUp"
    @touchend="HandleTouchEnd"
  >
    <div
      class="module-list"
      :style="`transform: translate(${canvasPosition.x}px, ${canvasPosition.y}px);`"
    >
      <ModuleBlock style="top: 15px; left: 150px" />
      <ModuleBlock style="top: 450px; left: 32px" />
      <ModuleBlock style="top: 900px; left: 150px" />
      <ModuleBlock style="top: 1550px; left: 1550px" />
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
}

.module-list {
}
</style>

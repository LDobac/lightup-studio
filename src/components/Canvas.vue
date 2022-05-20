<script setup lang="ts">
import { onMounted, ref } from "vue";

import { usePrototypeStore } from "@/stores/PrototypeStore";

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (!canvas.value) {
    throw "Cannot find canvas element!";
  }

  const prototype = usePrototypeStore();
  prototype.SetCanvasElement(canvas.value);
});
</script>

<template>
  <div class="wrapper">
    <canvas id="babylon-canvas" ref="canvas"></canvas>
  </div>
</template>

<style lang="scss">
#babylon-canvas {
  width: 480px;
  height: 300px;
}
</style>

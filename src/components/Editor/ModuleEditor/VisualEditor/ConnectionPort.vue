<template>
  <div
    ref="port"
    class="connection-port"
    :style="styleObject"
    @mousedown.stop.prevent="HandleDown"
  ></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import type { Nullable } from "babylonjs";

export type PortDirection = "top" | "left" | "right" | "bottom";

const props = defineProps<{
  direction: PortDirection;
}>();

const port = ref<Nullable<HTMLDivElement>>(null);

const styleObject = ref({
  top: "0px",
  left: "0px",
});

onMounted(() => {
  if (port.value) {
    const width = port.value.clientWidth / 2;
    const height = port.value.clientHeight / 2;

    switch (props.direction) {
      case "bottom":
        styleObject.value = {
          top: `calc(100% - ${height}px)`,
          left: `calc(50% - ${width}px)`,
        };
        break;
      case "left":
        styleObject.value = {
          top: `calc(50% - ${height}px)`,
          left: `calc(0% - ${width}px)`,
        };
        break;
      case "right":
        styleObject.value = {
          top: `calc(50% - ${height}px)`,
          left: `calc(100% - ${width}px)`,
        };
        break;
      case "top":
        styleObject.value = {
          top: `calc(0% - ${height}px)`,
          left: `calc(50% - ${width}px)`,
        };
        break;
      default:
        console.warn("Wrong port direction");
        break;
    }
  }
});

const HandleDown = () => {
  console.log("Handle Down");
};

const HandleMove = () => {
  console.log("Handle Move");
};
</script>

<style lang="scss" scoped>
.connection-port {
  width: 16px;
  height: 16px;

  display: block;
  position: absolute;

  background-color: red;
  border-radius: 100%;

  cursor: move;

  &:hover {
    background-color: blueviolet;
  }
}
</style>

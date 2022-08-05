<template>
  <n-card class="gameobject-block" bordered>
    <span>{{ props.gameObject.name }}</span>

    <ConnectionPort :direction="'bottom'" />
  </n-card>
</template>

<script lang="ts" setup>
import { NCard } from "naive-ui";
import type GameObject from "@/studio/core/runtime/GameObject";
import ConnectionPort from "./ConnectionPort.vue";

const props = defineProps<{
  gameObject: GameObject;
}>();
</script>

<style lang="scss" scoped>
.gameobject-block {
  width: 200px;
  height: 100px;

  overflow: visible;

  z-index: 10;
  text-align: center;
  background-color: orange;
  color: white;
  border-radius: 50%;
}
</style>

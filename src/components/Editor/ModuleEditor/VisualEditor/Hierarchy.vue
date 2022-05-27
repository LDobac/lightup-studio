<template>
  <div class="hierarchy">
    <div
      class="container"
      v-if="prototypeStore.currentGameObjectManager?.gameObjects"
    >
      <div
        class="item"
        v-for="gameObject in prototypeStore.currentGameObjectManager
          .gameObjects"
        :key="gameObject.id"
      >
        <n-image
          object-fit="cover"
          :width="16"
          :height="16"
          :src="iconGameObject"
          :preview-disabled="true"
        />
        <p>
          {{ gameObject.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { NImage } from "naive-ui";

import iconGameObject from "@/assets/images/icon/icon_gameobject.png";

const prototypeStore = usePrototypeStore();
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: row;
}
</style>

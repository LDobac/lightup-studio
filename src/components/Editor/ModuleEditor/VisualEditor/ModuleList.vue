<script setup lang="ts">
import { ref } from "vue";
import { NLayout, NLayoutSider, NScrollbar } from "naive-ui";
import { BookmarkOutline } from "@vicons/ionicons5";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { useGameModuleDrag } from "@/composables/GameModuleDrag";
import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";

const collapsed = ref(true);

const prototypeStore = usePrototypeStore();
const { DragStart } = useGameModuleDrag();
</script>

<template>
  <n-layout has-sider style="height: 100%; flex-grow: 0; flex-shrink: 0">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-scrollbar style="max-height: 100%">
        <div class="container" v-if="prototypeStore.prototype">
          <div
            v-for="prototypeGameModule in prototypeStore.prototype
              .gameModuleRegistry.prototypeGameModules"
            :key="prototypeGameModule.id"
            class="item"
            @dragstart="DragStart($event, prototypeGameModule as PrototypeGameModule)"
            draggable="true"
          >
            <BookmarkOutline />
            <p>{{ prototypeGameModule.name }}</p>
          </div>
        </div>
      </n-scrollbar>
    </n-layout-sider>
  </n-layout>
</template>

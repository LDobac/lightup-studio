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
      <n-scrollbar
        id="game-module-scroll"
        style="max-height: 100%; height: 100%"
      >
        <div class="container">
          <div class="game-module-list" v-if="prototypeStore.prototype">
            <div
              v-for="prototypeGameModule in prototypeStore.prototype
                .gameModuleRegistry.prototypeGameModules"
              :key="prototypeGameModule.id"
              class="item"
              @dblclick="HandleDoubleClick(prototypeGameModule as PrototypeGameModule)"
              @dragstart="DragStart($event, prototypeGameModule as PrototypeGameModule)"
              draggable="true"
            >
              <BookmarkOutline />
              <p>{{ prototypeGameModule.name }}</p>
            </div>
          </div>
          <n-button @click="HandleOpenModal">New GameModule</n-button>
        </div>
      </n-scrollbar>
    </n-layout-sider>
  </n-layout>
  <n-modal v-model:show="showCreateModal">
    <n-card
      style="width: 600px"
      title="새로운 게임 모듈 생성"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <n-form inline>
        <n-form-item label="게임 모듈 이름">
          <n-input placeholder="Input Name" v-model:value="newGameModuleName" />
        </n-form-item>
        <n-form-item>
          <n-button @click="HandleCreateGameModule"> 생성 </n-button>
        </n-form-item>
        <n-form-item>
          <n-button @click="HandleCancel"> 취소 </n-button>
        </n-form-item>
      </n-form>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  NLayout,
  NLayoutSider,
  NScrollbar,
  NButton,
  NModal,
  NCard,
  NForm,
  NFormItem,
  NInput,
} from "naive-ui";
import { BookmarkOutline } from "@vicons/ionicons5";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { useGameModuleDrag } from "@/composables/GameModuleDrag";
import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";
import { useEditorStore } from "@/stores/EditorStore";

const collapsed = ref(true);

const prototypeStore = usePrototypeStore();
const { DragStart } = useGameModuleDrag();

const editorStore = useEditorStore();

const HandleDoubleClick = (gameModule: PrototypeGameModule) => {
  editorStore.GoCodeEditor(gameModule);
};

const showCreateModal = ref(false);

const HandleOpenModal = () => {
  showCreateModal.value = true;
};

const HandleCancel = () => {
  showCreateModal.value = false;
};

const newGameModuleName = ref("");

const HandleCreateGameModule = async () => {
  if (prototypeStore.prototype && prototypeStore.compiler) {
    const registry = prototypeStore.prototype.gameModuleRegistry;

    await registry.RegisterNewModule(
      newGameModuleName.value,
      prototypeStore.compiler
    );

    showCreateModal.value = false;
    newGameModuleName.value = "";
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
</style>

<style lang="scss">
#game-module-scroll {
  .n-scrollbar-content {
    height: 100%;
  }
}
</style>

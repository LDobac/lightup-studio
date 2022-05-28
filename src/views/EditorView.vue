<script setup lang="ts">
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { watch } from "vue";
import ModuleEditor from "../components/Editor/ModuleEditor/ModuleEditor.vue";
import SceneEditor from "../components/Editor/SceneEditor.vue";
import InformationTabs from "../components/Editor/InformationTabs.vue";

const store = usePrototypeStore();

watch(
  () => store.isLoaded,
  async (isLoaded) => {
    if (isLoaded) {
      if (store.prototype && store.compiler) {
        await store.prototype.GenerateTestScene(store.compiler);

        store.prototype.gameEngine.SetEditMode(true);
        store.prototype.gameEngine.Start();

        console.log("Init success");
      }
    }
  }
);

/* 

const editorView: Ref<HTMLElement | null> = ref(null);
const resizeBar: Ref<HTMLElement | null> = ref(null);

const leftWindowSize = ref(0);
const rightWindowSize = ref(0);

onMounted(() => {
  if (!editorView.value || !resizeBar.value)
    throw "Can't find resize bar and view!";
  const editorSize = editorView.value.clientWidth;
  leftWindowSize.value =
    ((editorSize / 2 - resizeBar.value.clientWidth / 2) / editorSize) * 100;
  rightWindowSize.value = leftWindowSize.value;
});

const GetWidthCSS = (width: number) => {
  return `width: ${width}%;`;
};

*/
</script>

<template>
  <main ref="editorView" class="editor-view">
    <div class="module-editor-wrapper">
      <ModuleEditor class="resizeable module-editor" />
    </div>
    <div ref="resizeBar" class="resize-bar"></div>
    <div class="right resizeable">
      <SceneEditor />
      <InformationTabs />
    </div>
  </main>
</template>

<style lang="scss" scoped>
.editor-view {
  position: absolute;
  width: 100%;
  height: calc(100vh - 56px - 56px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  flex-wrap: nowrap;
  align-items: flex-start;
}

.resize-bar {
  width: 5px;
  height: 100%;
  background-color: black;
  color: white;
  flex-shrink: 0;
  word-break: break-all;
}

.module-editor-wrapper {
  height: 100%;

  flex-shrink: 1;
  flex-grow: 1;

  .module-editor {
    overflow: hidden;
    flex-shrink: 1;
    flex-grow: 1;
  }
}

.right {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

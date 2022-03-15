<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue";
import ModuleEditor from "../components/Editor/ModuleEditor.vue";
import SceneEditor from "../components/Editor/SceneEditor.vue";

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
</script>

<template>
  <main ref="editorView" class="editor-view">
    <ModuleEditor class="resizeable" :style="GetWidthCSS(leftWindowSize)" />
    <div ref="resizeBar" class="horizontal-split">Horizontal Spliter</div>
    <SceneEditor class="resizeable" :style="GetWidthCSS(rightWindowSize)" />
  </main>
</template>

<style lang="scss" scoped>
.editor-view {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
  flex-wrap: nowrap;
  align-items: flex-start;
}

.horizontal-split {
  width: 20px;
  height: 100%;
  overflow: hidden;
  word-break: break-all;
  background-color: black;
  color: white;
}

.resizeable {
  height: 100%;

  overflow: hidden;
  flex-shrink: 1;
  flex-grow: 1;
}
</style>

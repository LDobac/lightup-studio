<script setup lang="ts">
import { onMounted, ref } from "vue";

import MonacoEditorManager from "@/studio/editor/MonacoEditorManager";

const monacoEditorWrapper = ref<HTMLElement | null>(null);
let monacoEditorManager: MonacoEditorManager | null = null;

onMounted(() => {
  if (!monacoEditorWrapper.value) throw "Can't find monaco editor container";

  monacoEditorManager = new MonacoEditorManager(monacoEditorWrapper.value);
});

const HandleClick = async () => {
  if (monacoEditorManager) {
    const code = await monacoEditorManager.GetCompiledCode();

    console.log(code);
  }
};

const HandleClick2 = () => {
  if (!monacoEditorManager) return;

  // extra libraries
  const libSource = [
    "declare class Facts {",
    "    /**",
    "     * Returns the next fact",
    "     */",
    "    static next():string",
    "}",
  ].join("\n");
  const libUri = "ts:filename/facts.d.ts";
  monacoEditorManager.AddLibrary(libSource, libUri);
}
</script>

<template>
  <div ref="monacoEditorWrapper" class="monaco-editor-wrapper"></div>
  <button @click="HandleClick">Get Code</button>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/mixins.scss";

.monaco-editor-wrapper {
  height: 50%;
}
</style>

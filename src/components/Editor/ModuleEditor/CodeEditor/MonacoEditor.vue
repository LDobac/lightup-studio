<script setup lang="ts">
import { onMounted, ref } from "vue";

import { usePrototypeStore } from "@/stores/PrototypeStore";

import MonacoEditorManager from "@/studio/editor/MonacoEditorManager";

const monacoEditorWrapper = ref<HTMLElement | null>(null);

onMounted(() => {
  const prototype = usePrototypeStore();
  const CreateEditor = () => {
    if (!monacoEditorWrapper.value) throw "Can't find monaco editor container";

    const monacoEditorManager = new MonacoEditorManager(
      monacoEditorWrapper.value,
      ""
    );

    monacoEditorManager.GetMonacoEditor().layout();

    // Waiting for register typescript compiler
    setTimeout(() => {
      let oldSource = prototype.compiler?.GetCode();

      prototype.SetCompiler(monacoEditorManager);

      if (oldSource && prototype.compiler) {
        const monacoEditor = prototype.compiler as MonacoEditorManager;
        monacoEditor.GetMonacoEditor().dispose();

        prototype.compiler.SetCode(oldSource);
      }
    }, 1000);
  };

  CreateEditor();
});

// const HandleClick = async () => {
//   const prototype = usePrototypeStore();

//   if (prototype.compiler) {
//     const code = await prototype.compiler.GetCompiledCode();

//     console.log(code);
//   }
// };

// const HandleClick2 = () => {
//   if (!monacoEditorManager) return;

//   // extra libraries
//   const libSource = [
//     "declare class Facts {",
//     "    /**",
//     "     * Returns the next fact",
//     "     */",
//     "    static next():string",
//     "}",
//   ].join("\n");
//   const libUri = "ts:filename/facts.d.ts";
//   monacoEditorManager.AddLibrary(libSource, libUri);
// };
</script>

<template>
  <div ref="monacoEditorWrapper" class="monaco-editor-wrapper"></div>
  <!-- <button @click="HandleClick">Get Code</button>
  <button @click="HandleStartGame">Start Game</button> -->
</template>

<style lang="scss" scoped>
.monaco-editor-wrapper {
  position: sticky;
  display: block;
  height: 100%;
}
</style>

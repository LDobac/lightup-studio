<script setup lang="ts">
import { onMounted, ref } from "vue";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

const monacoEditorWrapper = ref<HTMLElement | null>(null);

onMounted(() => {
  if (!monacoEditorWrapper.value) throw "Can't find monaco editor container";

  // eslint-disable-next-line
  // @ts-ignore
  self.MonacoEnvironment = {
    // eslint-disable-next-line
    // @ts-ignore
    getWorker(_, label) {
      if (label === "json") {
        return new jsonWorker();
      }
      if (label === "css" || label === "scss" || label === "less") {
        return new cssWorker();
      }
      if (label === "html" || label === "handlebars" || label === "razor") {
        return new htmlWorker();
      }
      if (label === "typescript" || label === "javascript") {
        return new tsWorker();
      }
      return new editorWorker();
    },
  };

  const editor = monaco.editor.create(monacoEditorWrapper.value, {
    value: ["function x() {", '\tconsole.log("Hello world!");', "}"].join("\n"),
    language: "typescript",
  });
  editor.layout();
});
</script>

<template>
  <div ref="monacoEditorWrapper" class="monaco-editor-wrapper"></div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/mixins.scss";

.monaco-editor-wrapper {
  height: 100%;
}
</style>

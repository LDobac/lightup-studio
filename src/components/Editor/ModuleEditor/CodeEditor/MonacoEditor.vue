<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useMessage } from "naive-ui";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import MonacoEditorManager from "@/studio/editor/MonacoEditorManager";
import { useEditorStore } from "@/stores/EditorStore";

const monacoEditorWrapper = ref<HTMLElement | null>(null);

const prototype = usePrototypeStore();

onMounted(() => {
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

const editorStore = useEditorStore();

watch(
  () => editorStore.selectedGameModule,
  (gameModule) => {
    if (prototype.compiler && gameModule) {
      prototype.compiler.SetCode(gameModule.originSource);
    }
  }
);

const message = useMessage();

const HandleCtrlDown = async (event: KeyboardEvent) => {
  if (event.ctrlKey && event.key === "s") {
    if (prototype.compiler && editorStore.selectedGameModule) {
      const selectedModule = editorStore.selectedGameModule;
      const compiler = prototype.compiler;

      const code = await compiler.GetCompiledCode();

      if (!code.js || !code.declaration) {
        message.error("Failed to compile!");
        console.error(code.diagnostic);
      } else if (code.diagnostic.length > 0) {
        message.warning("Success to compile but some warnings.");
        console.warn(code.diagnostic);
      } else {
        selectedModule.originSource = compiler.GetCode();
        selectedModule.SetCompiledSource(code.js, code.declaration);

        message.success("Success to compile!");
      }
    }
  }
};
</script>

<template>
  <div
    @keydown.ctrl.prevent="HandleCtrlDown"
    ref="monacoEditorWrapper"
    class="monaco-editor-wrapper"
  ></div>
</template>

<style lang="scss" scoped>
.monaco-editor-wrapper {
  position: sticky;
  display: block;
  height: 100%;
}
</style>

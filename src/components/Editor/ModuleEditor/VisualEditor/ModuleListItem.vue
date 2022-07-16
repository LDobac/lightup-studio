<template>
  <div
    class="item"
    @contextmenu.stop.prevent="HandleContextMenu($event)"
    @dblclick="HandleDoubleClick(prototypeGameModule)"
    @dragstart="DragStart($event, prototypeGameModule)"
    draggable="true"
  >
    <BookmarkOutline />
    <div class="field-name">
      <n-input
        v-if="isEdit"
        v-model:value="newName"
        @keyup.enter.prevent="HandleChangeName"
      ></n-input>
      <p v-else>{{ prototypeGameModule.name }}</p>
    </div>
  </div>

  <VueSimpleContextMenu
    ref="contextMenu"
    :element-id="prototypeGameModule.id + '-context-menu'"
    @option-clicked="HandleOptionClicked"
    :options="options"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { NInput } from "naive-ui";
import { BookmarkOutline } from "@vicons/ionicons5";
import VueSimpleContextMenu, {
  type OptionEvent,
  type IOption,
} from "vue-simple-context-menu";
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";

import type PrototypeGameModule from "@/studio/core/PrototypeGameModule";
import { useGameModuleDrag } from "@/composables/GameModuleDrag";
import { useEditorStore } from "@/stores/EditorStore";
import { usePrototypeStore } from "@/stores/PrototypeStore";

const props = defineProps<{
  prototypeGameModule: PrototypeGameModule;
}>();

const { DragStart } = useGameModuleDrag();

const editorStore = useEditorStore();

const HandleDoubleClick = (gameModule: PrototypeGameModule) => {
  editorStore.GoCodeEditor(gameModule);
};

const contextMenu = ref<typeof VueSimpleContextMenu | null>(null);

const options = ref<Array<IOption>>([
  {
    name: "이름 변경",
    slug: "modify_name",
  },
  {
    name: "삭제",
    slug: "delete",
  },
]);

const HandleContextMenu = (event: MouseEvent) => {
  if (contextMenu.value) {
    contextMenu.value.showMenu(event);
  }
};

const prototypeStore = usePrototypeStore();

const prototypeGameModule = ref(props.prototypeGameModule);
const isEdit = ref(false);
const newName = ref("");

const HandleOptionClicked = (event: OptionEvent<PrototypeGameModule>) => {
  if (event.option.slug === "delete") {
    if (prototypeStore.isPrototypeOpen && prototypeStore.compiler) {
      prototypeStore.prototype.gameModuleRegistry.RemoveGameModuleById(
        prototypeGameModule.value.id,
        prototypeStore.compiler
      );
    }
  } else if (event.option.slug === "modify_name") {
    newName.value = prototypeGameModule.value.name;
    isEdit.value = true;
  }
};

const HandleChangeName = () => {
  prototypeGameModule.value.name = newName.value;
  isEdit.value = false;
};
</script>

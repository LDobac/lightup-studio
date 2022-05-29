<template>
  <li
    class="item"
    :class="selected ? 'selected' : ''"
    @contextmenu.stop.prevent="HandleContextMenu($event)"
    @dblclick.stop.prevent="HandleDoubleClick"
  >
    <n-image
      object-fit="cover"
      :width="16"
      :height="16"
      :src="iconGameObject"
      :preview-disabled="true"
    />
    <p>
      {{ props.gameObject.name }}
    </p>
  </li>

  <VueSimpleContextMenu
    ref="contextMenu"
    element-id="hierarchy-item-context-menu"
    @option-clicked="HandleOptionClicked"
    :options="options"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { NImage } from "naive-ui";
import iconGameObject from "@/assets/images/icon/icon_gameobject.png";
import type GameObject from "@/studio/core/runtime/GameObject";

import VueSimpleContextMenu, {
  type OptionEvent,
  type IOption,
} from "vue-simple-context-menu";
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { useEditorStore } from "@/stores/EditorStore";

const props = defineProps<{
  gameObject: GameObject;
}>();

const prototypeStore = usePrototypeStore();
const contextMenu = ref<typeof VueSimpleContextMenu | null>(null);

const options = ref<Array<IOption>>([
  {
    name: "Delete",
    slug: "delete_gameobject",
  },
]);

const HandleContextMenu = (event: MouseEvent) => {
  if (contextMenu.value) {
    contextMenu.value.showMenu(event);
  }
};

const HandleOptionClicked = (event: OptionEvent<GameObject>) => {
  if (event.option.slug === "delete_gameobject") {
    if (prototypeStore.currentGameObjectManager) {
      prototypeStore.currentGameObjectManager.RemoveGameObject(
        props.gameObject
      );
    }
  }
};

const selected = ref(false);

const editorStore = useEditorStore();

watch<GameObject | null>(
  () => editorStore.selectedGameObject as GameObject | null,
  (gameObject: GameObject | null) => {
    if (gameObject && props.gameObject.id === gameObject.id) {
      selected.value = true;
    } else {
      selected.value = false;
    }
  }
);

const HandleDoubleClick = () => {
  editorStore.GoVisualEditor(props.gameObject);
};
</script>

<style lang="scss" scoped>
.item {
  display: flex;
  flex-direction: row;
  user-select: none;

  &.selected {
    background-color: aqua;
  }
}
</style>

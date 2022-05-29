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
    <div class="field-name">
      <n-input
        v-if="isEditName"
        v-model:value="newName"
        @keyup.enter.prevent="HandleChangeName"
      ></n-input>
      <p v-else>
        {{ gameObject.name }}
      </p>
    </div>
  </li>

  <VueSimpleContextMenu
    ref="contextMenu"
    :element-id="gameObject.id + '-context-menu'"
    @option-clicked="HandleOptionClicked"
    :options="options"
  />
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import { NImage, NInput } from "naive-ui";
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

const gameObject = ref(props.gameObject);

const prototypeStore = usePrototypeStore();
const contextMenu = ref<typeof VueSimpleContextMenu | null>(null);

const options = ref<Array<IOption>>([
  {
    name: "이름 변경",
    slug: "modify_name",
  },
  {
    name: "삭제",
    slug: "delete_gameobject",
  },
]);

const HandleContextMenu = (event: MouseEvent) => {
  if (contextMenu.value) {
    contextMenu.value.showMenu(event);
  }
};

const isEditName = ref(false);
const newName = ref("");

const HandleOptionClicked = (event: OptionEvent<GameObject>) => {
  if (event.option.slug === "delete_gameobject") {
    if (prototypeStore.currentGameObjectManager) {
      prototypeStore.currentGameObjectManager.RemoveGameObject(
        gameObject.value as GameObject
      );
    }
  } else if (event.option.slug === "modify_name") {
    isEditName.value = true;
    newName.value = gameObject.value.name;
  }
};

const HandleChangeName = () => {
  gameObject.value.name = newName.value;
  isEditName.value = false;
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
  padding: 8px 0 8px 8px;

  &.selected {
    background-color: aqua;
  }
}
</style>

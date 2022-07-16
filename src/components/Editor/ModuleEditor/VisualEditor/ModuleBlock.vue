<template>
  <div>
    <div
      class="module-block"
      :style="`transform: translate(${curPosition.x}px, ${
        curPosition.y
      }px);cursor: ${hold ? 'move' : 'default'}`"
      @contextmenu.stop.prevent="HandleContextMenu($event)"
      @dblclick.prevent="HandleDBClick"
      @mousedown.stop="HandleMouseDown"
      @touchstart.stop="HandleTouchStart"
      @mousemove.stop="HandleMouseMove"
      @touchmove.stop="HandleTouchMove"
      @mouseup.stop="HandleMouseUp"
      @touchend.stop="HandleTouchEnd"
    >
      <n-card bordered style="width: 100%; height: 100%; text-align: center">
        <span>{{ prototypeGameModule.name }}</span>
      </n-card>
    </div>

    <VueSimpleContextMenu
      ref="contextMenu"
      :element-id="
        prototypeGameModule.id + 'module-block-context-menu' + uuid()
      "
      @option-clicked="HandleOptionClicked"
      :options="options"
    />
  </div>
</template>

<script setup lang="ts">
import { v4 as uuid } from "uuid";
import { computed, onMounted, ref } from "vue";
import { NCard } from "naive-ui";
import VueSimpleContextMenu, {
  type OptionEvent,
  type IOption,
} from "vue-simple-context-menu";
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";
import { useMovable } from "@/composables/Moveable";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { useEditorStore } from "@/stores/EditorStore";

const emit = defineEmits<{
  (e: "delete", moduleId: string): void;
}>();

const props = withDefaults(
  defineProps<{
    x?: number;
    y?: number;
    moduleId: string;
  }>(),
  {
    x: 0,
    y: 0,
  }
);

const {
  hold,
  curPosition,
  HandleMouseDown,
  HandleTouchStart,
  HandleMouseMove,
  HandleTouchMove,
  HandleTouchEnd,
  HandleMouseUp,
} = useMovable();

onMounted(() => {
  curPosition.value.x = props.x;
  curPosition.value.y = props.y;
});

const prototypeStore = usePrototypeStore();

const prototypeGameModule = computed(() => {
  if (prototypeStore.isPrototypeOpen) {
    const registry = prototypeStore.prototype.gameModuleRegistry;

    return registry.GetPrototypeGameModuleById(props.moduleId);
  }

  throw "Game not initailized!";
});

const editorStore = useEditorStore();

const HandleDBClick = () => {
  editorStore.GoCodeEditor(prototypeGameModule.value);
};

const contextMenu = ref<typeof VueSimpleContextMenu | null>(null);

const options = ref<Array<IOption>>([
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

const HandleOptionClicked = (event: OptionEvent<null>) => {
  if (event.option.slug === "delete") {
    emit("delete", props.moduleId);
  }
};
</script>

<style lang="scss" scoped>
.module-block {
  width: 200px;
  height: 100px;

  overflow: hidden;

  z-index: 10;
}
</style>

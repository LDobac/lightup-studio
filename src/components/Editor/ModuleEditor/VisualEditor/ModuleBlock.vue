<template>
  <div
    class="module-block"
    :style="`transform: translate(${curPosition.x}px, ${
      curPosition.y
    }px);cursor: ${hold ? 'move' : 'default'}`"
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
</template>

<script setup lang="ts">
import { NCard } from "naive-ui";
import { useMovable } from "@/composables/Moveable";
import { computed, onMounted } from "vue";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import { useEditorStore } from "@/stores/EditorStore";

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
  if (prototypeStore.prototype) {
    const registry = prototypeStore.prototype.gameModuleRegistry;

    return registry.GetPrototypeGameModuleById(props.moduleId);
  }

  throw "Game not initailized!";
});

const editorStore = useEditorStore();

const HandleDBClick = () => {
  editorStore.GoCodeEditor(prototypeGameModule.value);
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

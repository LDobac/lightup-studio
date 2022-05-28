<template>
  <div class="hierarchy" @contextmenu.stop.prevent="HandleContextMenu($event)">
    <ul
      class="container"
      v-if="prototypeStore.currentGameObjectManager?.gameObjects"
    >
      <hierarchy-item
        v-for="gameObject in prototypeStore.currentGameObjectManager
          .gameObjects"
        :key="gameObject.id"
        :game-object="gameObject"
      />
    </ul>
  </div>

  <VueSimpleContextMenu
    ref="contextMenu"
    element-id="hierarchy-context-menu"
    @option-clicked="HandleOptionClicked"
    :options="options"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import VueSimpleContextMenu, {
  type OptionEvent,
  type IOption,
} from "vue-simple-context-menu";
import "vue-simple-context-menu/dist/vue-simple-context-menu.css";
import { usePrototypeStore } from "@/stores/PrototypeStore";
import HierarchyItem from "./HierarchyItem.vue";

const prototypeStore = usePrototypeStore();

const contextMenu = ref<typeof VueSimpleContextMenu | null>(null);

const options = ref<Array<IOption>>([
  {
    name: "Add GameObject",
    slug: "add_gameobject",
  },
]);

const HandleContextMenu = (event: MouseEvent) => {
  if (contextMenu.value) {
    contextMenu.value.showMenu(event);
  }
};

const HandleOptionClicked = (event: OptionEvent<unknown>) => {
  if (event.option.slug === "add_gameobject") {
    if (prototypeStore.currentGameObjectManager) {
      // TODO : GameObject Add/Delete 시 재 렌더링 수행
      prototypeStore.currentGameObjectManager.CreateGameObject(
        "New GameObject"
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.hierarchy {
  height: 100%;

  .container {
    height: 100%;
  }
}
</style>

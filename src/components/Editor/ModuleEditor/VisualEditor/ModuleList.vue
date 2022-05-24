<script setup lang="ts">
import { h, ref } from "vue";
import { NIcon, NLayout, NLayoutSider, NMenu, NScrollbar } from "naive-ui";
import type { MenuOption } from "naive-ui";
import { BookmarkOutline, CaretDownOutline } from "@vicons/ionicons5";

const menuOptions: MenuOption[] = [
  {
    label: "Hear the Wind Sing6",
    key: "hear-the-wind-sing6",
  },
  {
    label: "Pinball 1973",
    key: "pinball-1973",
    disabled: true,
    children: [
      {
        label: "Rat",
        key: "rat",
      },
    ],
  },
  {
    label: "A Wild Sheep Chase",
    key: "a-wild-sheep-chase",
    disabled: true,
  },
  {
    label: "Dance Dance Dance",
    key: "Dance Dance Dance",
    children: [
      {
        type: "group",
        label: "People",
        key: "people",
        children: [
          {
            label: "Narrator",
            key: "narrator",
          },
          {
            label: "Sheep Man",
            key: "sheep-man",
          },
        ],
      },
      {
        label: "Beverage",
        key: "beverage",
        children: [
          {
            label: "Whisky",
            key: "whisky",
            href: "https://en.wikipedia.org/wiki/Whisky",
          },
        ],
      },
      {
        label: "Food",
        key: "food",
        children: [
          {
            label: "Sandwich",
            key: "sandwich",
          },
        ],
      },
      {
        label: "The past increases. The future recedes.",
        key: "the-past-increases-the-future-recedes",
      },
    ],
  },
];

const collapsed = ref(true);

const renderMenuLabel = (option: MenuOption) => {
  if ("href" in option) {
    return h("a", { href: option.href, target: "_blank" }, [
      option.label as string,
    ]);
  }
  return option.label as string;
};

const renderMenuIcon = (option: MenuOption) => {
  // return render placeholder for indent
  if (option.key === "sheep-man") return true;
  // return falsy, don't render icon placeholder
  if (option.key === "food") return null;
  return h(NIcon, null, { default: () => h(BookmarkOutline) });
};

const expandIcon = () => {
  return h(NIcon, null, { default: () => h(CaretDownOutline) });
};
</script>

<template>
  <n-layout has-sider style="height: 100%; flex-grow: 0; flex-shrink: 0">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <n-scrollbar style="max-height: 100%">
        <n-menu
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          :render-label="renderMenuLabel"
          :render-icon="renderMenuIcon"
          :expand-icon="expandIcon"
        />
      </n-scrollbar>
    </n-layout-sider>
  </n-layout>
</template>

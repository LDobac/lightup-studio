<script setup lang="ts">
import { NCard } from "naive-ui";
</script>

<template>
    <div class="module-block">
        <n-card bordered style="width: 100%; height: 100%; text-align: center;">
            <span>This is module</span>
        </n-card>
    </div>
</template>

<style lang="scss" scoped>
.module-block {
    width: 200px;
    height: 100px;

    overflow: hidden;
    position: absolute;
}
</style>
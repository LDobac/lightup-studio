<script setup lang="ts">
import ModuleBlock from './ModuleBlock.vue';
</script>

<template>
    <div class="module-constructor">
        <ModuleBlock style="top: 15px; left: 150px;" />
        <ModuleBlock style="top: 450px; left: 32px;" />
        <ModuleBlock style="top: 900px; left: 150px;" />
        <ModuleBlock style="top: 1550px; left: 1550px;" />
    </div>
</template>

<style lang="scss" scoped>
.module-constructor {
    background-color: #d6e9f4;
    overflow: scroll;
}

.t {
    position: absolute;
}
</style>
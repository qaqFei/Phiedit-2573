<template>
    <div class="calculator-panel right-inner">
        <Teleport :to="props.titleTeleport">
            计算器
        </Teleport>
        <MyCalculator />
    </div>
</template>
<script setup lang="ts">
import MyCalculator from "@/myElements/MyCalculator.vue";
const props = defineProps<{
    titleTeleport: string
}>();
</script>
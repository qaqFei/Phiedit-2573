<template>
    <div class="my-slider">
        <p class="my-slider-label">
            <slot />
        </p>
        <ElSlider
            v-model="inputData"
            v-bind="$attrs"
            :min="props.min"
            :max="props.max"
            :step="props.step"
            :format-tooltip="props.formatTooltip"
            @input="inputHandler as any"
            @change="changeHandler as any"
        />
    </div>
</template>
<script setup lang="ts">
import { ElSlider } from 'element-plus';
import { ref, watch } from 'vue';
const props = withDefaults(defineProps<{
    min?: number;
    max?: number;
    step?: number;
    formatTooltip?: (value: number) => string;
}>(), {
    min: 0,
    max: 100,
    step: 1,
    formatTooltip: (value: number) => value.toString()
});
const model = defineModel<number>({
    required: true
});
const emit = defineEmits(["input", "change"]);
const inputData = ref(0);
watch(model, () => {
    inputData.value = model.value;
}, {
    immediate: true
});
function inputHandler(value: number) {
    model.value = value;
    emit("input", value);
}
function changeHandler(value: number) {
    emit("change", value);
}
</script>
<style scoped>
.my-slider {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding-right: 15px;
    gap: 5px
}
.my-slider-label {
    white-space: nowrap;
}
</style>
<!-- 此组件可支持非响应式属性，但必须绑定字符串 -->
<template>
    <ElInput
        v-model="inputData"
        v-bind="$attrs"
        @input="inputHandler"
        @change="emit('change', model)"
        @blur="blurHandler"
        @keydown.stop
    >
        <template
            v-if="slots.prepend"
            #prepend
        >
            <slot name="prepend" />
        </template>
        <template
            v-if="slots.append"
            #append
        >
            <slot name="append" />
        </template>
        <template
            v-if="slots.prefix"
            #prefix
        >
            <slot name="prefix" />
        </template>
        <template
            v-if="slots.suffix"
            #suffix
        >
            <slot name="suffix" />
        </template>
    </ElInput>
</template>

<script setup lang="ts">
import { ElInput } from "element-plus";
import { ref, useSlots, watch } from "vue";
const inputData = ref('');
const emit = defineEmits<{
    input: [string],
    change: [string]
}>();
const slots: ReturnType<typeof useSlots> = useSlots();
// const props = withDefaults(defineProps<{
//     autoUpdate?: boolean;
// }>(),{
//     autoUpdate: true
// })
const model = defineModel<string>({
    required: true,
});
// const modelWhen = defineModel<unknown>("when", {
//     required: false
// });
let isInternalUpdate = false;

// if (isEmpty(modelWhen.value)) {
//     watch(model, () => {
//         if (!isInternalUpdate) updateShowedValue();
//     }, { immediate: true });
// }
// else {
//     watch(modelWhen, () => {
//         if (!isInternalUpdate) updateShowedValue();
//     }, { immediate: true });
// }
watch(model, () => {
    // 只有外部修改而不是内部修改时才更新
    if (!isInternalUpdate)
        updateShowedValue();
});
updateShowedValue();
function updateShowedValue() {
    inputData.value = model.value;
    // 把内部修改的标记取消
    isInternalUpdate = false;
}
function inputHandler() {
    model.value = inputData.value;
    // 标记为内部修改
    isInternalUpdate = true;
    emit("input", model.value);
}
function setValueWithoutUpdate(value: string) {
    model.value = value;
    isInternalUpdate = true;
}
function blurHandler() {
    updateShowedValue();
}
defineExpose({
    updateShowedValue,
    setValueWithoutUpdate
});
</script>
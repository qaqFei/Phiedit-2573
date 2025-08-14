<template>
    <div class="number-event-panel">
        <Teleport :to="props.titleTeleport">
            {{ model.type }}事件编辑
        </Teleport>
        事件ID： {{ model.id }}
        <MyInput
            ref="inputStartEndTime"
            v-model="inputEvent.startEndTime"
            @change="createHistory()"
            @input="updateModel('startTime', 'endTime')"
        >
            <template #prepend>
                时间
            </template>
        </MyInput>
        <!-- <MyInput
            ref="inputStartEnd"
            v-model="inputEvent.startEnd"
            @change="createHistory()"
            @input="updateModel('start', 'end')"
        >
            <template #prepend>
                颜色
            </template>
        </MyInput> -->
        <MyInput
            ref="inputStart"
            v-model="inputEvent.start"
            @change="createHistory()"
            @input="updateModel('start')"
        >
            <template #prepend>
                起始文字
            </template>
        </MyInput>
        <MyInput
            ref="inputEnd"
            v-model="inputEvent.end"
            @change="createHistory()"
            @input="updateModel('end')"
        >
            <template #prepend>
                结束文字
            </template>
        </MyInput>
        <MySwitch
            ref="switchBezier"
            v-model="inputEvent.bezier"
            :active-value="1"
            :inactive-value="0"
            @change="updateModel('bezier'), createHistory()"
        >
            Bezier曲线（暂不支持）
        </MySwitch>
        <span v-if="model.bezier">
            暂不支持Bezier曲线
            <!-- <MyBezier
                v-model="inputEvent.bezierPoints"
                @change="createHistory()"
                @input="updateModel('bezierPoints')"
            /> -->
        </span>
        <MySelectEasing
            v-else
            ref="selectEasing"
            v-model="inputEvent.easingType"
            @change="updateModel('easingType'), createHistory()"
        />
        <MySwitch
            ref="switchDisabled"
            v-model="inputEvent.isDisabled"
            @change="updateModel('isDisabled'), createHistory()"
        >
            禁用
        </MySwitch>
        <MyButton @click="swap">
            交换起始和结束值（Alt + S）
        </MyButton>
        <h3>缓动曲线截取</h3>
        <ElSlider
            v-model="inputEvent.easingLeftRight"
            range
            :min="0"
            :max="1"
            :step="0.01"
            @change="createHistory()"
            @input="updateModel('easingLeft', 'easingRight')"
        />
    </div>
</template>
<script setup lang="ts">
import MyButton from '@/myElements/MyButton.vue';
import { IEvent, TextEvent } from "../models/event";
import MyInput from "../myElements/MyInput.vue";
import MySwitch from "../myElements/MySwitch.vue";
import MySelectEasing from "@/myElements/MySelectEasing.vue";
import { addBeats, formatBeats, isEqualBeats, parseBeats, validateBeats } from "@/models/beats";
import { onBeforeUnmount, onMounted, reactive, useTemplateRef } from "vue";
import { Ref, watch } from "vue";
import globalEventEmitter from "@/eventEmitter";
import store from "@/store";
const model = defineModel<TextEvent>({
    required: true,
}) as Ref<TextEvent>;
const props = defineProps<{
    titleTeleport: string;
}>();
const inputStartEndTime = useTemplateRef("inputStartEndTime");
const inputStart = useTemplateRef("inputStart");
const inputEnd = useTemplateRef("inputEnd");
const switchBezier = useTemplateRef("switchBezier");
const selectEasing = useTemplateRef("selectEasing");
const switchDisabled = useTemplateRef("switchDisabled");
interface EventExtends {
    startEndTime: string;
    easingLeftRight: number[];
}
const seperator = " ";
const attributes = [
    "startTime",
    "endTime",
    "start",
    "end",
    "bezier",
    "bezierPoints",
    "easingType",
    "easingLeft",
    "easingRight"
] as const;
const historyManager = store.useManager("historyManager");
// const mouseManager = store.useManager("mouseManager");
watch(model, () => {
    for (const attr of attributes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (inputEvent[attr] as any) = model.value[attr];
    }
    inputStartEndTime.value?.updateShowedValue();
    inputStart.value?.updateShowedValue();
    inputEnd.value?.updateShowedValue();
    switchBezier.value?.updateShowedValue();
    selectEasing.value?.updateShowedValue();
    switchDisabled.value?.updateShowedValue();
}, {
    deep: false
});
const inputEvent: IEvent<string> & EventExtends = reactive({
    startTime: model.value.startTime,
    endTime: model.value.endTime,
    start: model.value.start,
    end: model.value.end,
    bezier: model.value.bezier,
    bezierPoints: model.value.bezierPoints,
    easingType: model.value.easingType,
    easingLeft: model.value.easingLeft,
    easingRight: model.value.easingRight,
    linkgroup: 0,
    isDisabled: model.value.isDisabled,
    get startEndTime() {
        // 如果开始时间和结束时间相同，返回这个相同的时间
        if (this.startTime === this.endTime) {
            return formatBeats(this.startTime);
        }
        // 否则返回开始时间和结束时间的组合
        return formatBeats(this.startTime) + seperator + formatBeats(this.endTime);
    },
    set startEndTime(value: string) {
        const [start, end] = value.split(seperator);
        if (!start) return;
        this.startTime = validateBeats(parseBeats(start));
        // 如果只输入了一个时间，则将结束时间设置为开始时间加1拍
        if (!end) {
            this.endTime = addBeats(this.startTime, [1, 0, 1]);
            return;
        }
        this.endTime = validateBeats(parseBeats(end));
    },
    get easingLeftRight() {
        return [this.easingLeft, this.easingRight];
    },
    set easingLeftRight(value: number[]) {
        this.easingLeft = value[0];
        this.easingRight = value[1];
    }
});
const oldValues = {
    startTime: model.value.startTime,
    endTime: model.value.endTime,
    start: model.value.start,
    end: model.value.end,
    bezier: model.value.bezier,
    bezierPoints: model.value.bezierPoints,
    easingType: model.value.easingType,
    easingLeft: model.value.easingLeft,
    easingRight: model.value.easingRight
};
/** 检查属性是否被修改过，并记录到历史记录中 */
function createHistory() {
    // 遍历新值和旧值，找到不一样的属性
    for (const attr of attributes) {
        if (attr == "startTime" || attr == "endTime") {
            if (isEqualBeats(inputEvent[attr], oldValues[attr])) {
                continue;
            }
        }
        if (inputEvent[attr] !== oldValues[attr]) {
            // mouseManager.checkMouseUp();
            historyManager.recordModifyEvent(model.value.id, attr, inputEvent[attr], oldValues[attr]);
        }
    }
    // 把旧值更新，以免重复记录
    for (const attr of attributes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (oldValues[attr] as any) = inputEvent[attr];
    }
}
function updateModel<K extends keyof IEvent<number>>(...attrNames: K[]) {
    // const oldValues = attrNames.map(attr => model.value[attr]);
    // const newValues = attrNames.map(attr => inputEvent[attr]);
    // const description = `将事件${model.value.id}的属性${attrNames.join(', ')}${attrNames.length > 1 ? "分别" : ""}从${oldValues.join(', ')}修改为${newValues.join(', ')}`;
    // historyManager.group(description);
    for (const attrName of attrNames) {
        // historyManager.modifyEvent(model.value.id, attrName, (inputEvent as any)[attrName]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (model.value[attrName] as any) = inputEvent[attrName];
    }
    // historyManager.ungroup();
}
onMounted(() => {
    globalEventEmitter.on("SWAP", swap);
});
onBeforeUnmount(() => {
    try {
        createHistory();
    }
    catch (e) {
        console.error(e);
    }
    globalEventEmitter.off("SWAP", swap);
});
function swap() {
    [inputEvent.start, inputEvent.end] = [inputEvent.end, inputEvent.start];
    updateModel("start", "end");
    createHistory();
}
</script>
<style scoped>
.number-event-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
</style>
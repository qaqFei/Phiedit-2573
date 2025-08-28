<template>
    <div class="error-panel right-inner">
        <Teleport :to="props.titleTeleport">
            谱面纠错
        </Teleport>
        <MyButton
            type="primary"
            @click="globalEventEmitter.emit('CHECK_ERRORS', stateManager.cache.error.errorType)"
        >
            刷新纠错信息
        </MyButton>
        <MySelect
            v-model="stateManager.cache.error.errorType"
            :options="errorTypes"
            @change="globalEventEmitter.emit('CHECK_ERRORS', stateManager.cache.error.errorType)"
        />
        <em>
            最多显示100个错误，点击错误信息以跳转到错误位置
        </em>
        <div class="error-list">
            <div
                v-for="(error, i) in errorManager.errors"
                :key="i"
            >
                <ElCard
                    class="error-message"
                    shadow="hover"
                    @click="error.object && catchErrorByMessage(() => goto(error.object!), '跳转')"
                >
                    <em>{{ error.message }}</em>
                </ElCard>
            </div>
            <p v-if="errorManager.errors.length === 0">
                你的谱面没有错误！
            </p>
        </div>
    </div>
</template>
<script setup lang="ts">
import globalEventEmitter from '@/eventEmitter';
import { ColorEvent, NumberEvent, TextEvent } from '@/models/event';
import { Note } from '@/models/note';
import MyButton from '@/myElements/MyButton.vue';
import MySelect from '@/myElements/MySelect.vue';
import store from '@/store';
import { catchErrorByMessage } from '@/tools/catchError';
import { ElCard } from 'element-plus';
import { onMounted } from 'vue';
const props = defineProps<{
    titleTeleport: string
}>()
const stateManager = store.useManager("stateManager");
const selectionManager = store.useManager("selectionManager");
const errorManager = store.useManager("errorManager");
const errorTypes = [
    {
        value: "All",
        label: "筛选错误类型：全部",
        text: "全部"
    },
    {
        value: "ChartReadError",
        label: "筛选错误类型：读取谱面错误",
        text: "读取谱面错误"
    },
    {
        value: "ChartEditError",
        label: "筛选错误类型：写谱错误",
        text: "写谱错误"
    }
];
function goto(object: Note | NumberEvent | ColorEvent | TextEvent) {
    stateManager._state.currentJudgeLineNumber = object.judgeLineNumber;
    if (!(object instanceof Note)) {
        stateManager._state.currentEventLayerId = object.eventLayerId;
    }
    stateManager.gotoBeats(object.startTime);
    selectionManager.unselectAll();
    selectionManager.select(object);
}
onMounted(() => {
    globalEventEmitter.emit('CHECK_ERRORS', stateManager.cache.error.errorType);
})
</script>
<style scoped>
.error-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.error-message {
    cursor: pointer;
}
</style>
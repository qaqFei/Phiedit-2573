import { reactive } from "vue";
import { addBeats, Beats, beatsToSeconds, isGreaterThanBeats, isLessThanBeats, subBeats } from "@/models/beats";
import store from "@/store";
import { Note } from "@/models/note";
import globalEventEmitter from "@/eventEmitter";
import Manager from "./abstract";
import { SelectedElement } from "@/types";
import { createCatchErrorByMessage } from "@/tools/catchError";
export default class CloneManager extends Manager {
    readonly options = reactive({
        targetJudgeLines: new Array<number>(),
        targetEventLayer: 0,
        timeDuration: [8, 0, 1] as Beats,
        timeDelta: [0, 1, 4] as Beats,
    })
    constructor() {
        super();
        globalEventEmitter.on("CLONE", createCatchErrorByMessage(() => {
            this.clone();
        }, "克隆"))
        globalEventEmitter.on("REPEAT", createCatchErrorByMessage(() => {
            this.repeat();
        }, "连续粘贴"))
    }
    clone() {
        const selectionManager = store.useManager("selectionManager");
        const historyManager = store.useManager("historyManager");
        const mouseManager = store.useManager("mouseManager");
        mouseManager.checkMouseUp();
        let beats: Beats = [0, 0, 1];
        let i = 0;
        if (this.options.targetJudgeLines.length == 0) {
            throw new Error("请选择要克隆的目标判定线");
        }
        historyManager.group("克隆");
        while (isLessThanBeats(beats, this.options.timeDuration)) {
            for (const element of selectionManager.selectedElements) {
                if (element instanceof Note) {
                    const noteObject = element.toObject();
                    noteObject.startTime = addBeats(noteObject.startTime, beats);
                    noteObject.endTime = addBeats(noteObject.endTime, beats);
                    const newNote = store.addNote(noteObject, this.options.targetJudgeLines[i]);
                    historyManager.recordAddNote(newNote.id);
                }
                else {
                    const eventObject = element.toObject();
                    eventObject.startTime = addBeats(eventObject.startTime, beats);
                    eventObject.endTime = addBeats(eventObject.endTime, beats);
                    const newEvent = store.addEvent(eventObject, element.type, element.eventLayerId, this.options.targetJudgeLines[i]);
                    historyManager.recordAddEvent(newEvent.id);
                }
            }
            beats = addBeats(beats, this.options.timeDelta);
            i = (i + 1) % this.options.targetJudgeLines.length;
        }
        // 不保留源元素
        selectionManager.deleteSelection();
        historyManager.ungroup();
    }
    repeat() {
        // 把选中的元素复制一遍并粘贴
        const stateManager = store.useManager("stateManager");
        const selectionManager = store.useManager("selectionManager");
        const historyManager = store.useManager("historyManager");
        const chart = store.useChart();
        if (selectionManager.selectedElements.length == 0) {
            throw new Error("请选择元素");
        }
        let minTime: Beats = [Infinity, 0, 1];
        let maxTime: Beats = [-Infinity, 0, 1];
        for (let i = 0; i < selectionManager.selectedElements.length; i++) {
            const element = selectionManager.selectedElements[i];
            if (isLessThanBeats(element.startTime, minTime)) {
                minTime = element.startTime;
            }
            if (isGreaterThanBeats(element.endTime, maxTime)) {
                maxTime = element.endTime;
            }
        }
        const length = subBeats(maxTime, minTime);
        historyManager.group("连续粘贴");
        const elements: SelectedElement[] = [];
        for (const element of selectionManager.selectedElements) {
            if (element instanceof Note) {
                const noteObject = element.toObject();
                noteObject.startTime = addBeats(noteObject.startTime, length);
                noteObject.endTime = addBeats(noteObject.endTime, length);
                const note = store.addNote(noteObject, element.judgeLineNumber);
                historyManager.recordAddNote(note.id);
                elements.push(note);
            }
            else {
                const eventObject = element.toObject();
                eventObject.startTime = addBeats(eventObject.startTime, length);
                eventObject.endTime = addBeats(eventObject.endTime, length);
                const event = store.addEvent(eventObject, element.type, element.eventLayerId, element.judgeLineNumber);
                historyManager.recordAddEvent(event.id);
                elements.push(event);
            }
        }
        historyManager.ungroup();
        selectionManager.unselectAll();
        selectionManager.select(...elements);
        const seconds = beatsToSeconds(chart.BPMList, maxTime);
        if (!stateManager.secondsIsVisible(seconds)) {
            stateManager.gotoSeconds(seconds);
        }
    }
}
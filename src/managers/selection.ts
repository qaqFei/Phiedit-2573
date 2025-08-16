import { SelectedElement } from "@/types";
import { reactive } from "vue";
import globalEventEmitter from "@/eventEmitter";
import { Note } from "@/models/note";
import store from "@/store";
import Manager from "./abstract";
import { BaseEventLayer, baseEventTypes, extendedEventTypes } from "@/models/eventLayer";
import { createCatchErrorByMessage } from "@/tools/catchError";

export default class SelectionManager extends Manager {
    readonly selectedElements: SelectedElement[] = reactive([]);
    constructor() {
        super();
        globalEventEmitter.on("DELETE", createCatchErrorByMessage(() => {
            this.deleteSelection();
        }, "删除"))
        globalEventEmitter.on("SELECT_ALL", () => {
            this.selectAll();
        })
        globalEventEmitter.on("UNSELECT_ALL", () => {
            this.unselectAll();
        })
    }
    select(...elements: SelectedElement[]) {
        this.selectedElements.push(...elements);
        if (this.selectedElements.length > 0)
            globalEventEmitter.emit("SELECTION_UPDATE");
    }
    unselect(...elements: SelectedElement[]) {
        for (const element of elements) {
            const index = this.selectedElements.indexOf(element);
            if (index !== -1) {
                this.selectedElements.splice(index, 1);
            }
            else {
                console.warn("SelectionManager: unselect failed");
            }
        }
        if (this.selectedElements.length === 0)
            globalEventEmitter.emit("SELECTION_UPDATE");
    }
    isSelected(element: SelectedElement) {
        return this.selectedElements.includes(element);
    }
    /** 取消所有选中元素 */
    unselectAll() {
        this.selectedElements.splice(0);
        globalEventEmitter.emit("SELECTION_UPDATE");
    }

    deleteSelection() {
        const historyManager = store.useManager("historyManager");
        const mouseManager = store.useManager("mouseManager");
        mouseManager.checkMouseUp();
        for (const element of this.selectedElements) {
            if (element instanceof Note) {
                store.removeNote(element.id);
                historyManager.recordRemoveNote(element.toObject(), element.judgeLineNumber, element.id);
            }
            else {
                store.removeEvent(element.id);
                historyManager.recordRemoveEvent(element.toObject(), element.type, element.eventLayerId, element.judgeLineNumber, element.id);
            }
        }
        this.selectedElements.splice(0);
        globalEventEmitter.emit("SELECTION_UPDATE");
    }
    /**
     * 全选
     */
    selectAll() {
        const stateManager = store.useManager("stateManager");
        this.unselectAll();
        for (const element of stateManager.currentJudgeLine.notes) {
            this.selectedElements.push(element);
        }
        const eventLayer = stateManager.currentEventLayer;
        if (eventLayer instanceof BaseEventLayer) {
            for(const type of baseEventTypes){
                const events = eventLayer.getEventsByType(type);
                this.selectedElements.push(...events);
            }
        }
        else {
            for(const type of extendedEventTypes){
                const events = eventLayer.getEventsByType(type);
                this.selectedElements.push(...events);
            }
        }
        globalEventEmitter.emit("SELECTION_UPDATE");
    }
}
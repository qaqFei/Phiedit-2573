import { NoteOrEvent } from "@/models/event";
import { reactive } from "vue";
import globalEventEmitter from "@/eventEmitter";
import { Note } from "@/models/note";
import store from "@/store";
import Manager from "./abstract";
import { BaseEventLayer, baseEventTypes, extendedEventTypes } from "@/models/eventLayer";
import { createCatchErrorByMessage } from "@/tools/catchError";

export default class SelectionManager extends Manager {
    /** 被选中的元素。有时也用“selection”来代替“selectedElements”。 */
    readonly selectedElements: NoteOrEvent[] = reactive([]);
    constructor() {
        super();
        globalEventEmitter.on("DELETE", createCatchErrorByMessage(() => {
            this.deleteSelection();
        }, "删除"));
        globalEventEmitter.on("SELECT_ALL", () => {
            this.selectAll();
        });
        globalEventEmitter.on("UNSELECT_ALL", () => {
            this.unselectAll();
        });
    }
    select(...elements: NoteOrEvent[]) {
        let selectionIsChanged = false;
        for (const element of elements) {
            if (!this.selectedElements.includes(element)) {
                this.selectedElements.push(element);
                selectionIsChanged = true;
            }
        }
        if (selectionIsChanged) {
            globalEventEmitter.emit("SELECTION_UPDATE");
        }
    }
    unselect(...elements: NoteOrEvent[]) {
        let selectionIsChanged = false;
        for (const element of elements) {
            const index = this.selectedElements.indexOf(element);
            if (index !== -1) {
                this.selectedElements.splice(index, 1);
                selectionIsChanged = true;
            }
            else {
                console.warn("SelectionManager: unselect failed, element not found");
            }
        }
        if (selectionIsChanged) {
            globalEventEmitter.emit("SELECTION_UPDATE");
        }
    }
    isSelected(element: NoteOrEvent) {
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
        historyManager.group("删除");
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
        historyManager.ungroup();
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
            for (const type of baseEventTypes) {
                const events = eventLayer.getEventsByType(type);
                this.selectedElements.push(...events);
            }
        }
        else {
            for (const type of extendedEventTypes) {
                const events = eventLayer.getEventsByType(type);
                this.selectedElements.push(...events);
            }
        }
        globalEventEmitter.emit("SELECTION_UPDATE");
    }
}
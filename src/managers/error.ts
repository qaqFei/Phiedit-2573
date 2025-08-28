import globalEventEmitter from "@/eventEmitter";
import Manager from "./abstract";
import { reactive } from "vue";
import ChartError from "@/models/error";
import store from "@/store";
import { NoteType } from "@/models/note";
import { isEqualBeats, isGreaterThanBeats, isGreaterThanOrEqualBeats, isLessThanBeats, isLessThanOrEqualBeats } from "@/models/beats";
import { BaseEventLayer, baseEventTypes, extendedEventTypes } from "@/models/eventLayer";

export default class ErrorManager extends Manager {
    errors: ChartError[] = reactive([]);
    constructor() {
        super();
        globalEventEmitter.on("CHECK_ERRORS", (errorType = "All") => {
            this.checkErrors(errorType);
        })
    }
    private checkChartReadErrors() {
        const chart = store.useChart();
        for (let i = 0; i < chart.errors.length; i++) {
            if (i >= 100) {
                return;
            }
            const error = chart.errors[i];
            this.errors.push(error);
        }
    }
    private checkChartEditErrors() {
        const chart = store.useChart();
        const settingsManager = store.useManager("settingsManager");
        for (let i = 0; i < chart.judgeLineList.length; i++) {
            const judgeLine = chart.judgeLineList[i];
            const notes = judgeLine.notes;
            const taps = [], drags = [], holds = [], flicks = [];
            for (let j = 0; j < notes.length; j++) {
                const note = notes[j];
                switch (note.type) {
                    case NoteType.Tap:
                        taps.push(note);
                        break;
                    case NoteType.Drag:
                        drags.push(note);
                        break;
                    case NoteType.Hold:
                        holds.push(note);
                        break;
                    case NoteType.Flick:
                        flicks.push(note);
                        break;
                }
            }
            // 检查Hold有没有结束时间小于等于起始时间的
            for (const hold of holds) {
                if (isLessThanOrEqualBeats(hold.endTime, hold.startTime)) {
                    this.errors.push(new ChartError(
                        `Hold 音符 ${hold.id} 的结束时间小于等于起始时间。`,
                        "ChartEditError",
                        hold
                    ))
                    if (this.errors.length >= 100) {
                        return;
                    }
                }
            }
            // 检查非Hold音符有没有结束时间不等于起始时间的
            for (const note of notes) {
                if (note.type != NoteType.Hold && !isEqualBeats(note.endTime, note.startTime)) {
                    this.errors.push(new ChartError(
                        `${note.typeString} 音符 ${note.id} 的结束时间与起始时间不相等。`,
                        "ChartEditError",
                        note
                    ))
                    if (this.errors.length >= 100) {
                        return;
                    }
                }
            }
            // Check for overlapping Tap notes
            for (let i = 0; i < taps.length; i++) {
                for (let j = i + 1; j < taps.length; j++) {
                    const tap1 = taps[i];
                    const tap2 = taps[j];

                    if (isEqualBeats(tap1.startTime, tap2.startTime) &&
                        !tap1.isFake && !tap2.isFake && tap1.above == tap2.above &&
                        Math.abs(tap1.positionX - tap2.positionX) < settingsManager._settings.noteSize) {
                        this.errors.push(new ChartError(
                            `两个 Tap 音符 ${tap1.id} 和 ${tap2.id} 重叠。`,
                            "ChartEditError",
                            tap1
                        ));
                        if (this.errors.length >= 100) {
                            return;
                        }
                    }
                }
            }

            // Check for overlapping Tap and Hold notes
            for (const tap of taps) {
                for (const hold of holds) {
                    if (isGreaterThanOrEqualBeats(tap.startTime, hold.startTime) &&
                        isLessThanOrEqualBeats(tap.startTime, hold.endTime) &&
                        !tap.isFake && !hold.isFake && tap.above == hold.above &&
                        Math.abs(tap.positionX - hold.positionX) < settingsManager._settings.noteSize) {
                        this.errors.push(new ChartError(
                            `Tap 音符 ${tap.id} 和 Hold 音符 ${hold.id} 重叠。`,
                            "ChartEditError",
                            tap
                        ));
                        if (this.errors.length >= 100) {
                            return;
                        }
                    }
                }
            }

            // Check for overlapping Hold notes
            for (let i = 0; i < holds.length; i++) {
                for (let j = i + 1; j < holds.length; j++) {
                    const hold1 = holds[i];
                    const hold2 = holds[j];

                    if (isGreaterThanOrEqualBeats(hold1.endTime, hold2.startTime) &&
                        isLessThanOrEqualBeats(hold1.startTime, hold2.endTime) &&
                        !hold1.isFake && !hold2.isFake && hold1.above == hold2.above &&
                        Math.abs(hold1.positionX - hold2.positionX) < settingsManager._settings.noteSize) {
                        this.errors.push(new ChartError(
                            `两个 Hold 音符 ${hold1.id} 和 ${hold2.id} 重叠。`,
                            "ChartEditError",
                            isLessThanOrEqualBeats(hold1.startTime, hold2.startTime)
                                ? hold1
                                : hold2
                        ));
                        if (this.errors.length >= 100) {
                            return;
                        }
                    }
                }
            }
            // 遍历事件
            for (const eventLayer of [...judgeLine.eventLayers, judgeLine.extended]) {
                const types = eventLayer instanceof BaseEventLayer ? baseEventTypes : extendedEventTypes;
                for (const type of types) {
                    const events = eventLayer.getEventsByType(type);
                    // 检测是否有两个事件重叠的
                    for (let i = 0; i < events.length; i++) {
                        for (let j = i + 1; j < events.length; j++) {
                            const event1 = events[i];
                            const event2 = events[j];
                            if (isGreaterThanBeats(event1.endTime, event2.startTime) &&
                                isLessThanBeats(event1.startTime, event2.endTime)) {
                                this.errors.push(new ChartError(
                                    `事件 ${event1.id} 和 ${event2.id} 重叠`,
                                    "ChartEditError",
                                    event1
                                ));
                                if (this.errors.length >= 100) {
                                    return;
                                }
                            }
                        }
                    }
                    // 检测是否有结束时间小于等于开始时间的事件
                    for (let i = 0; i < events.length; i++) {
                        const event = events[i];
                        if (isLessThanOrEqualBeats(event.endTime, event.startTime)) {
                            this.errors.push(new ChartError(
                                `事件 ${event.id} 的结束时间小于等于开始时间`,
                                "ChartEditError",
                                event
                            ))
                            if (this.errors.length >= 100) {
                                return;
                            }
                        }
                    }
                }
            }
        }
    }
    checkErrors(errorType: string) {
        this.errors.length = 0;
        switch (errorType) {
            case "ChartReadError":
                this.checkChartReadErrors();
                break;
            case "ChartEditError":
                this.checkChartEditErrors();
                break;
            case "All":
                this.checkChartReadErrors();
                this.checkChartEditErrors();
                break;
        }
    }
}
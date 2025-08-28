import { beatsToSeconds, BPM, validateBeats } from "./beats"
import { isArrayOfNumbers } from "../tools/typeCheck"
import { Beats, getBeatsValue } from "./beats"
import { isObject, isNumber } from "lodash"
import ChartError from "./error"
export enum NoteAbove {
    Above = 1,
    Below = 0,
}
export enum NoteFake {
    Real = 0,
    Fake = 1,
}
export interface INote {
    above: NoteAbove
    alpha: number
    startTime: Beats
    endTime: Beats
    type: NoteType
    isFake: 0 | 1
    positionX: number
    size: number
    speed: number
    yOffset: number
    visibleTime: number
}
export const noteAttributes = [
    "above",
    "alpha",
    "startTime",
    "endTime",
    "type",
    "isFake",
    "positionX",
    "size",
    "speed",
    "yOffset",
    "visibleTime"
] as const;
interface NoteOptions {
    judgeLineNumber: number,
    BPMList: BPM[],
    noteNumber: number
    id?: string
}
export enum NoteType { Tap = 1, Hold, Flick, Drag }
export class Note implements INote {
    static readonly TAP_PERFECT = 0.08
    static readonly TAP_GOOD = 0.16
    static readonly TAP_BAD = 0.18
    static readonly HOLD_PERFECT = 0.08
    static readonly HOLD_GOOD = 0.16
    static readonly HOLD_BAD = 0.18
    static readonly DRAGFLICK_PERFECT = 0.18
    above = NoteAbove.Above
    alpha = 255
    isFake = NoteFake.Real
    positionX = 0
    size = 1
    speed = 1
    yOffset = 0
    visibleTime = 999999
    _startTime: Beats = [0, 0, 1]
    _endTime: Beats = [0, 0, 1]
    type = NoteType.Tap
    cachedStartSeconds: number
    cachedEndSeconds: number
    readonly BPMList: BPM[]
    /** note的唯一标识符，比如 "0-note-0" 表示第0号判定线上的第0号note */
    readonly id: string
    judgeLineNumber: number
    get typeString() {
        switch (this.type) {
            case NoteType.Tap: return 'Tap';
            case NoteType.Drag: return 'Drag';
            case NoteType.Flick: return 'Flick';
            default: return 'Hold';
        }
    }
    highlight = false
    hitSeconds: number | undefined = undefined
    get startTime() {
        return this._startTime;
    }
    get endTime() {
        if (this.type == NoteType.Hold)
            return this._endTime;
        else
            return this._startTime;
    }
    set startTime(beats: Beats) {
        this._startTime = validateBeats(beats);
        this.calculateSeconds();
    }
    set endTime(beats: Beats) {
        this._endTime = validateBeats(beats);
        this.calculateSeconds();
    }
    readonly errors: ChartError[] = [];
    validateTime() {
        if (getBeatsValue(this.startTime) > getBeatsValue(this.endTime)) {
            const a = this.startTime, b = this.endTime;
            this.startTime = b;
            this.endTime = a;
        }
    }
    toObject(): INote {
        return {
            startTime: [...this.startTime],
            endTime: [...this.endTime],
            type: this.type,
            positionX: this.positionX,
            above: this.above,
            alpha: this.alpha,
            speed: this.speed,
            size: this.size,
            isFake: this.isFake,
            visibleTime: this.visibleTime,
            yOffset: this.yOffset
        }
    }
    calculateSeconds() {
        const startSeconds = beatsToSeconds(this.BPMList, this.startTime);
        const endSeconds = beatsToSeconds(this.BPMList, this.endTime);
        this.cachedStartSeconds = startSeconds;
        this.cachedEndSeconds = endSeconds;
    }
    hit(seconds: number) {
        if (this.isFake) {
            // 该音符是假音符，无法被击打
            return false;
        }
        if (this.hitSeconds != undefined) {
            // 该音符已经被击打
            return false;
        }
        this.hitSeconds = seconds;
        if (this.getJudgement() == 'none') {
            // 该音符击打的时间不在判定范围内，击打无效
            this.hitSeconds = undefined;
            return false;
        }
        return true;
    }
    unhit() {
        this.hitSeconds = undefined;
    }
    getJudgement() {
        if (this.hitSeconds == undefined) return 'none';
        const startSeconds = this.cachedStartSeconds;
        const delta = this.hitSeconds - startSeconds;
        const { perfect, good, bad } = (() => {
            switch (this.type) {
                case NoteType.Tap: return {
                    perfect: Note.TAP_PERFECT,
                    good: Note.TAP_GOOD,
                    bad: Note.TAP_BAD
                }
                case NoteType.Hold: return {
                    perfect: Note.HOLD_PERFECT,
                    good: Note.HOLD_GOOD,
                    bad: Note.HOLD_BAD
                }
                default: return {
                    perfect: Note.DRAGFLICK_PERFECT,
                    good: Note.DRAGFLICK_PERFECT,
                    bad: Note.DRAGFLICK_PERFECT
                }
            }
        })();
        if (delta >= -perfect && delta < perfect) return "perfect";
        if (delta >= -good && delta < good) return "good";
        else if (delta >= -bad && delta < bad) return "bad";
        else return "none";
    }
    constructor(note: unknown, options: NoteOptions) {
        this.judgeLineNumber = options.judgeLineNumber;
        this.id = options.id ?? `${options.judgeLineNumber}-note-${options.noteNumber}`;
        if (isObject(note)) {
            // startTime
            if ("startTime" in note) {
                if (isArrayOfNumbers(note.startTime, 3)) {
                    this._startTime = [...note.startTime];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 startTime 属性必须是包含3个数字的数组，但读取到了 ${JSON.stringify(note.startTime)}。将会被替换为默认值 [0, 0, 1]。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 startTime 属性。将会被设为默认值 [0, 0, 1]。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("endTime" in note) {
                if (isArrayOfNumbers(note.endTime, 3)) {
                    this._endTime = [...note.endTime];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 endTime 属性必须是包含3个数字的数组，但读取到了 ${JSON.stringify(note.endTime)}。将会被替换为 startTime 的值。`,
                        "ChartReadError",
                        this
                    ));
                    this._endTime = [...this._startTime];
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 endTime 属性。将会被设为 startTime 的值。`,
                    "ChartReadError",
                    this
                ));
                this._endTime = [...this._startTime];
            }


            if ("positionX" in note) {
                if (isNumber(note.positionX)) {
                    this.positionX = note.positionX;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 positionX 属性必须是数字，但读取到了 ${note.positionX}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 positionX 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("above" in note) {
                if (isNumber(note.above)) {
                    this.above = note.above == 1 ? NoteAbove.Above : NoteAbove.Below;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 above 属性必须是 0 或 1，但读取到了 ${note.above}。将会被替换为数字 1。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 above 属性。将会被设为数字 1。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("alpha" in note) {
                if (isNumber(note.alpha) && note.alpha >= 0 && note.alpha <= 255) {
                    this.alpha = note.alpha;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 alpha 属性必须是 0 到 255 之间的数字，但读取到了 ${note.alpha}。将会被替换为数字 255。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 alpha 属性。将会被设为数字 255。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("type" in note) {
                if (isNumber(note.type) && note.type >= 1 && note.type <= 4 && Number.isInteger(note.type)) {
                    this.type = note.type;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 type 属性必须是 1 到 4 之间的整数，但读取到了 ${note.type}。将会被替换为数字 1。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 type 属性。将会被设为数字 1。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("isFake" in note) {
                if (isNumber(note.isFake)) {
                    this.isFake = note.isFake == 1 ? NoteFake.Fake : NoteFake.Real;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 isFake 属性必须是 0 或 1，但读取到了 ${note.isFake}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 isFake 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("size" in note) {
                if (isNumber(note.size)) {
                    this.size = note.size;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 size 属性必须是数字，但读取到了 ${note.size}。将会被替换为数字 1。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 size 属性。将会被设为数字 1。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("speed" in note) {
                if (isNumber(note.speed)) {
                    this.speed = note.speed;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 speed 属性必须是数字，但读取到了 ${note.speed}。将会被替换为数字 1。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 speed 属性。将会被设为数字 1。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("yOffset" in note) {
                if (isNumber(note.yOffset)) {
                    this.yOffset = note.yOffset;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 yOffset 属性必须是数字，但读取到了 ${note.yOffset}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 yOffset 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this
                ));
            }


            if ("visibleTime" in note) {
                if (isNumber(note.visibleTime)) {
                    this.visibleTime = note.visibleTime;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：音符的 visibleTime 属性必须是数字，但读取到了 ${note.visibleTime}。将会被替换为数字 999999。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：音符缺少 visibleTime 属性。将会被设为数字 999999。`,
                    "ChartReadError",
                    this
                ));
            }
        } else {
            this.errors.push(new ChartError(
                `${this.id}：音符必须是一个对象，但读取到了 ${note}。将会使用默认值。`,
                "ChartReadError",
                this
            ));
        }
        this.BPMList = options.BPMList;
        this.cachedStartSeconds = beatsToSeconds(options.BPMList, this.startTime);
        this.cachedEndSeconds = beatsToSeconds(options.BPMList, this.endTime);
    }
}
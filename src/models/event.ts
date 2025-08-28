import { cubicBezierEase, easingFuncs, EasingType } from "./easing";
import { Beats, getBeatsValue, beatsToSeconds, validateBeats, BPM, addBeats } from "./beats"
import { isArrayOfNumbers } from "../tools/typeCheck";
import { RGBcolor } from "../tools/color";
import { isObject, isNumber, isString } from "lodash";
import { checkAndSort } from "@/tools/algorithm";
import ChartError from "./error";
export type BezierPoints = [number, number, number, number]
export interface IEvent<T> {
    bezier: 0 | 1;
    bezierPoints: BezierPoints;
    easingLeft: number;
    easingRight: number;
    easingType: EasingType;
    start: T;
    end: T;
    startTime: Beats;
    endTime: Beats;
    linkgroup: number;
    isDisabled: boolean;
}
interface EventOptions {
    judgeLineNumber: number;
    eventLayerId: string;
    eventNumber: number;
    BPMList: BPM[];
    type: string;
    id?: string;
}
export const eventTypes = ["moveX", "moveY", "rotate", "alpha", "speed", "scaleX", "scaleY", "color", "paint", "text"] as const;
export const eventAttributes = [
    "bezier",
    "bezierPoints",
    "easingLeft",
    "easingRight",
    "easingType",
    "start",
    "end",
    "startTime",
    "endTime",
    "linkgroup"
] as const;
export abstract class BaseEvent<T = unknown> implements IEvent<T> {
    bezier: 0 | 1 = 0;
    bezierPoints: BezierPoints = [0, 0, 0, 0];
    easingLeft: number = 0;
    easingRight: number = 1;
    easingType: EasingType = EasingType.Linear;
    abstract start: T;
    abstract end: T;
    _startTime: Beats = [0, 0, 1]
    _endTime: Beats = [0, 0, 1]
    cachedStartSeconds: number;
    cachedEndSeconds: number;
    readonly BPMList: BPM[];
    /** 事件的唯一标识符，比如"0-layer0-moveX0" 表示第0号判定线上第0层的0号moveX事件 */
    readonly id: string
    judgeLineNumber: number;
    type: string;
    /** 事件层级号，普通事件的层级号是数字（比如"0"，但仍然是字符串类型），特殊事件的层级号是字符"X" */
    eventLayerId: string;
    isDisabled: boolean = false;
    linkgroup = 0;
    get startTime() {
        return this._startTime;
    }
    get endTime() {
        return this._endTime;
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
        else if (getBeatsValue(this.startTime) == getBeatsValue(this.endTime)) {
            this.endTime = addBeats(this.endTime, [0, 0, 1]); // 确保endTime大于startTime
        }
    }
    get easingLeftRight() {
        return [this.easingLeft, this.easingRight];
    }
    set easingLeftRight(easingLeftRight: [number, number]) {
        [this.easingLeft, this.easingRight] = easingLeftRight;
    }
    get durationBeats() {
        return getBeatsValue(this.endTime) - getBeatsValue(this.startTime);
    }
    calculateSeconds() {
        const startSeconds = beatsToSeconds(this.BPMList, this.startTime);
        const endSeconds = beatsToSeconds(this.BPMList, this.endTime);
        this.cachedStartSeconds = startSeconds;
        this.cachedEndSeconds = endSeconds;
    }
    toObject(): IEvent<T> {
        return {
            bezier: this.bezier,
            bezierPoints: [...this.bezierPoints],
            easingLeft: this.easingLeft,
            easingRight: this.easingRight,
            easingType: this.easingType,
            start: this.start,
            end: this.end,
            startTime: [...this.startTime],
            endTime: [...this.endTime],
            linkgroup: this.linkgroup,
            isDisabled: this.isDisabled,
        }
    }
    constructor(event: unknown, options: EventOptions) {
        this.judgeLineNumber = options.judgeLineNumber;
        this.eventLayerId = options.eventLayerId;
        this.type = options.type;
        this.id = options.id ?? `${options.judgeLineNumber}-${options.eventLayerId}-${options.type}-${options.eventNumber}`;

        if (isObject(event)) {
            // bezier
            if ("bezier" in event) {
                if (isNumber(event.bezier) && (event.bezier === 0 || event.bezier === 1)) {
                    this.bezier = event.bezier;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 bezier 属性必须是 0 或 1，但读取到了 ${event.bezier}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 bezier 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }

            // bezierPoints
            if ("bezierPoints" in event) {
                if (isArrayOfNumbers(event.bezierPoints, 4)) {
                    this.bezierPoints = [...event.bezierPoints];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 bezierPoints 属性必须是包含4个数字的数组，但读取到了 ${JSON.stringify(event.bezierPoints)}。将会被替换为默认值 [0, 0, 0, 0]。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 bezierPoints 属性。将会被设为默认值 [0, 0, 0, 0]。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }

            // easingLeft and easingRight
            if ("easingLeft" in event && "easingRight" in event) {
                if (isNumber(event.easingLeft) && isNumber(event.easingRight)) {
                    if (event.easingLeft >= 0 && event.easingRight <= 1 && event.easingLeft < event.easingRight) {
                        this.easingLeft = event.easingLeft;
                        this.easingRight = event.easingRight;
                    } else {
                        this.errors.push(new ChartError(
                            `${this.id}：事件的 easingLeft 和 easingRight 属性必须满足 0 <= easingLeft < easingRight <= 1，但读取到了 easingLeft=${event.easingLeft}, easingRight=${event.easingRight}。将会被替换为默认值 0 和 1。`,
                            "ChartReadError",
                            this as NumberEvent | ColorEvent | TextEvent
                        ));
                    }
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 easingLeft 和 easingRight 属性必须是数字，但读取到了 easingLeft=${event.easingLeft}, easingRight=${event.easingRight}。将会被替换为默认值 0 和 1。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 easingLeft 或 easingRight 属性。将会被设为默认值 0 和 1。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }

            // easingType
            if ("easingType" in event) {
                if (isNumber(event.easingType) &&
                    event.easingType >= 1 &&
                    event.easingType <= 29 &&
                    Number.isInteger(event.easingType)) {
                    this.easingType = event.easingType as EasingType;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 easingType 属性必须是 1 到 29 之间的整数，但读取到了 ${event.easingType}。将会被替换为默认值 1（线性缓动）。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 easingType 属性。将会被设为默认值 1（线性缓动）。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }

            // startTime
            if ("startTime" in event) {
                if (isArrayOfNumbers(event.startTime, 3)) {
                    this._startTime = [...event.startTime];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 startTime 属性必须是包含3个数字的数组，但读取到了 ${JSON.stringify(event.startTime)}。将会被替换为默认值 [0, 0, 1]。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 startTime 属性。将会被设为默认值 [0, 0, 1]。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }

            // endTime
            if ("endTime" in event) {
                if (isArrayOfNumbers(event.endTime, 3)) {
                    this._endTime = [...event.endTime];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 endTime 属性必须是包含3个数字的数组，但读取到了 ${JSON.stringify(event.endTime)}。将会被替换为 startTime 的值。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                    this._endTime = [...this._startTime];
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 endTime 属性。将会被设为 startTime 的值。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
                this._endTime = [...this._startTime];
            }

            // linkgroup
            if ("linkgroup" in event) {
                if (isNumber(event.linkgroup) && Number.isInteger(event.linkgroup)) {
                    this.linkgroup = event.linkgroup;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 linkgroup 属性必须是整数，但读取到了 ${event.linkgroup}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 linkgroup 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }

            // isDisabled
            if ("isDisabled" in event) {
                if (typeof event.isDisabled === 'boolean') {
                    this.isDisabled = event.isDisabled;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：事件的 isDisabled 属性必须是布尔值，但读取到了 ${event.isDisabled}。将会被替换为 false。`,
                        "ChartReadError",
                        this as NumberEvent | ColorEvent | TextEvent
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：事件缺少 isDisabled 属性。将会被设为 false。`,
                    "ChartReadError",
                    this as NumberEvent | ColorEvent | TextEvent
                ));
            }
        } else {
            this.errors.push(new ChartError(
                `${this.id}：事件必须是一个对象，但读取到了 ${event}。将会使用默认值。`,
                "ChartReadError",
                this as NumberEvent | ColorEvent | TextEvent
            ));
        }

        this.BPMList = options.BPMList;
        this.cachedStartSeconds = beatsToSeconds(options.BPMList, this._startTime);
        this.cachedEndSeconds = beatsToSeconds(options.BPMList, this._endTime);
    }
}
export class NumberEvent extends BaseEvent<number> {
    start: number = 0;
    end: number = 0;
    constructor(event: unknown, options: EventOptions) {
        super(event, options);
        if (isObject(event)) {
            // start
            if ("start" in event) {
                if (isNumber(event.start)) {
                    this.start = event.start;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：${this.type}事件的 start 属性必须是数字，但读取到了 ${event.start}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：${this.type}事件缺少 start 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this
                ));
            }

            // end
            if ("end" in event) {
                if (isNumber(event.end)) {
                    this.end = event.end;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：${this.type}事件的 end 属性必须是数字，但读取到了 ${event.end}。将会被替换为数字 0。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：${this.type}事件缺少 end 属性。将会被设为数字 0。`,
                    "ChartReadError",
                    this
                ));
            }
        } else {
            this.errors.push(new ChartError(
                `${this.id}：${this.type}事件必须是一个对象，但读取到了 ${event}。将会使用默认值。`,
                "ChartReadError",
                this
            ));
        }
    }
}
export class ColorEvent extends BaseEvent<RGBcolor> {
    start: RGBcolor = [255, 255, 255];
    end: RGBcolor = [255, 255, 255];
    toObject() {
        const obj = super.toObject();
        obj.start = [...this.start];
        obj.end = [...this.end];
        return obj;
    }
    constructor(event: unknown, options: EventOptions) {
        super(event, options);
        if (isObject(event)) {
            // start
            if ("start" in event) {
                if (isArrayOfNumbers(event.start, 3)) {
                    this.start = [...event.start];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：${this.type}事件的 start 属性必须是包含3个数字的数组，但读取到了 ${JSON.stringify(event.start)}。将会被替换为默认值 [255, 255, 255]。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：${this.type}事件缺少 start 属性。将会被设为默认值 [255, 255, 255]。`,
                    "ChartReadError",
                    this
                ));
            }

            // end
            if ("end" in event) {
                if (isArrayOfNumbers(event.end, 3)) {
                    this.end = [...event.end];
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：${this.type}事件的 end 属性必须是包含3个数字的数组，但读取到了 ${JSON.stringify(event.end)}。将会被替换为默认值 [255, 255, 255]。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：${this.type}事件缺少 end 属性。将会被设为默认值 [255, 255, 255]。`,
                    "ChartReadError",
                    this
                ));
            }
        } else {
            this.errors.push(new ChartError(
                `${this.id}：${this.type}事件必须是一个对象，但读取到了 ${event}。将会使用默认值。`,
                "ChartReadError",
                this
            ));
        }
    }
}
export class TextEvent extends BaseEvent<string> {
    start: string = "";
    end: string = "";
    constructor(event: unknown, options: EventOptions) {
        super(event, options);

        if (isObject(event)) {
            // start
            if ("start" in event) {
                if (isString(event.start)) {
                    this.start = event.start;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：${this.type}事件的 start 属性必须是字符串，但读取到了 ${event.start}。将会被替换为空字符串。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：${this.type}事件缺少 start 属性。将会被设为空字符串。`,
                    "ChartReadError",
                    this
                ));
            }

            // end
            if ("end" in event) {
                if (isString(event.end)) {
                    this.end = event.end;
                } else {
                    this.errors.push(new ChartError(
                        `${this.id}：${this.type}事件的 end 属性必须是字符串，但读取到了 ${event.end}。将会被替换为空字符串。`,
                        "ChartReadError",
                        this
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `${this.id}：${this.type}事件缺少 end 属性。将会被设为空字符串。`,
                    "ChartReadError",
                    this
                ));
            }
        } else {
            this.errors.push(new ChartError(
                `${this.id}：${this.type}事件必须是一个对象，但读取到了 ${event}。将会使用默认值。`,
                "ChartReadError",
                this
            ));
        }
    }
}
type S = {
    cachedStartSeconds: number,
    cachedEndSeconds: number,
}
export function interpolateNumberEventValue(event: IEvent<number> & S, seconds: number) {
    const startSeconds = event?.cachedStartSeconds;
    const endSeconds = event?.cachedEndSeconds;
    const { bezier, bezierPoints, start, end, easingType, easingLeft, easingRight } = event;
    if (endSeconds <= seconds) {
        return end;
    }
    else {
        const dx = endSeconds - startSeconds;
        const dy = end - start;
        const sx = seconds - startSeconds;
        const easingFunction = bezier ?
            cubicBezierEase(...bezierPoints) :
            (time: number) => {
                const left = easingLeft;
                const right = easingRight;
                const func = easingFuncs[easingType];
                const start = func(left);
                const end = func(right);
                const deltaX = right - left;
                const deltaY = end - start;

                return (func(time * deltaX + left) - start) / deltaY;
            }

        const easingFactor = easingFunction(sx / dx);
        return start + easingFactor * dy;
    }
}
export function interpolateColorEventValue(event: ColorEvent, seconds: number): RGBcolor {
    const endSeconds = event.cachedEndSeconds;
    const { bezier, bezierPoints, start, end, easingType, easingLeft, easingRight, startTime, endTime } = event;
    const _interpolate = (part: 0 | 1 | 2) => {
        const e = {
            bezier,
            bezierPoints: [...bezierPoints] as BezierPoints,
            start: start[part],
            end: end[part],
            easingType,
            easingLeft,
            easingRight,
            startTime,
            endTime,
            cachedStartSeconds: beatsToSeconds(event.BPMList, event.startTime),
            cachedEndSeconds: beatsToSeconds(event.BPMList, event.endTime),
            linkgroup: 0,
            isDisabled: false,
        };
        return interpolateNumberEventValue(e, seconds);
    }
    if (endSeconds <= seconds) {
        return end;
    }
    else {
        return [
            _interpolate(0),
            _interpolate(1),
            _interpolate(2)
        ];
    }
}
export function interpolateTextEventValue(event: TextEvent, seconds: number) {
    const endSeconds = event.cachedEndSeconds;
    const { bezier, bezierPoints, start, end, easingType, easingLeft, easingRight, startTime, endTime } = event;
    if (endSeconds <= seconds) {
        return end;
    }
    else {
        if (start.startsWith(end) || end.startsWith(start)) {
            const lengthStart = start.length;
            const lengthEnd = end.length;
            const e = {
                startTime,
                endTime,
                easingType,
                easingLeft,
                easingRight,
                bezier,
                bezierPoints: [...bezierPoints] as BezierPoints,
                start: lengthStart,
                end: lengthEnd,
                cachedStartSeconds: beatsToSeconds(event.BPMList, event.startTime),
                cachedEndSeconds: beatsToSeconds(event.BPMList, event.endTime),
                linkgroup: 0,
                isDisabled: false,
            };
            const length = Math.round(interpolateNumberEventValue(e, seconds));
            return start.length > end.length ? start.slice(0, length) : end.slice(0, length);
        }
        return start;
    }
}
/**
 * 找到开始时间不大于seconds的最大的事件。若不存在，返回null。
 */
export function findLastEvent<T extends BaseEvent>(events: T[], seconds: number): T | null {

    // // Filter valid events and sort by cachedStartSeconds
    // const validEvents = events.filter(event => 
    //     !event.isDisabled && 
    //     typeof event.cachedStartSeconds === 'number' && 
    //     event.cachedStartSeconds <= seconds
    // );
    const validEvents = events.filter(event => !event.isDisabled);

    if (validEvents.length === 0) {
        return null;
    }

    // Sort by cachedStartSeconds in ascending order
    checkAndSort(validEvents, (a, b) => a.cachedStartSeconds - b.cachedStartSeconds);

    // Binary search for the last event with start time <= seconds
    let left = 0;
    let right = validEvents.length - 1;
    let resultIndex = -1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (validEvents[mid].cachedStartSeconds <= seconds) {
            resultIndex = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return resultIndex !== -1 ? validEvents[resultIndex] : null;
}
import { isObject, isNumber, isString, isArray } from "lodash"
import { EasingType } from "./easing"
import { BaseEventLayer, ExtendedEventLayer, IBaseEventLayer, IExtendedEventLayer } from "./eventLayer"
import { INote, Note } from "./note"
import { BaseEvent, NumberEvent } from "./event"
import { beatsCompare, BPM } from "./beats"
import ChartError from "./error"
interface JudgeLineOptions {
    BPMList: BPM[],
    judgeLineNumber: number
}
export enum JudgeLineCover {
    Uncover = 0,
    Cover = 1
}
export interface IJudgeLine {
    /** 没用属性，可以不用 */
    Group: number
    /** 没用属性，可以不用 */
    Name: string
    /** 判定线贴图，如果有贴图会为贴图的文件名 */
    Texture: string
    /** 基本事件，是分层的，每一层在某个时间点都能通过算法得到一个值，把所有层的值加起来就是最终值 */
    eventLayers: IBaseEventLayer[]
    /** 特殊事件，只有一层，每一层在某个时间点都能通过算法得到一个值，把所有层的值加起来就是最终值 */
    extended: IExtendedEventLayer
    /** 父线线号，会从父线继承X、Y坐标并以父线方向为坐标轴方向叠加上自己的坐标 */
    father: number
    /** 判定线是否遮罩 */
    isCover: JudgeLineCover
    /** 音符的数量 */
    numOfNotes?: number,
    /** 该判定线的所有note */
    notes: INote[]
    /** 显示的层号，越大越靠前 */
    zOrder: number,
    /** bpm的倍率 */
    bpmfactor: number,
    /** 不支持此属性，也不知道啥意思 */
    alphaControl: {
        alpha: number,
        easing: EasingType,
        x: number
    }[]
    /** 不支持此属性，也不知道啥意思 */
    posControl: {
        easing: EasingType,
        pos: number,
        x: number
    }[]
    /** 不支持此属性，也不知道啥意思 */
    sizeControl: {
        easing: EasingType,
        size: number,
        x: number
    }[]
    /** 不支持此属性，也不知道啥意思 */
    skewControl: {
        easing: EasingType,
        skew: number,
        x: number
    }[]
    /** 不支持此属性，也不知道啥意思 */
    yControl: {
        easing: EasingType,
        x: number,
        y: number
    }[]
}
export class JudgeLine implements IJudgeLine {
    Group = 0
    Name = "Unknown"
    Texture = "line.png"
    bpmfactor = 1
    eventLayers: BaseEventLayer[] = []
    readonly extended: ExtendedEventLayer
    father = -1
    isCover = JudgeLineCover.Cover
    notes: Note[] = []
    alphaControl = [{
        easing: EasingType.Linear,
        alpha: 1,
        x: 999999
    }, {
        easing: EasingType.Linear,
        alpha: 1,
        x: 0
    }]
    posControl = [{
        easing: EasingType.Linear,
        pos: 1,
        x: 999999
    }, {
        easing: EasingType.Linear,
        pos: 1,
        x: 0
    }]
    sizeControl = [{
        easing: EasingType.Linear,
        size: 1,
        x: 999999
    }, {
        easing: EasingType.Linear,
        size: 1,
        x: 0
    }]
    skewControl = [{
        easing: EasingType.Linear,
        skew: 1,
        x: 999999
    }, {
        easing: EasingType.Linear,
        skew: 1,
        x: 0
    }]
    yControl = [{
        easing: EasingType.Linear,
        y: 1,
        x: 999999,
    }, {
        easing: EasingType.Linear,
        y: 1,
        x: 0
    }]
    zOrder: number = 0
    attachUI?: "pause" | "combonumber" | "combo" | "score" | "bar" | "name" | "level"
    id: number
    private noteNumber = 0;
    readonly errors: ChartError[] = [];
    getAllEvents() {
        const events: BaseEvent[] = [];
        this.eventLayers.forEach(eventLayer => {
            events.push(
                ...eventLayer.moveXEvents,
                ...eventLayer.moveYEvents,
                ...eventLayer.rotateEvents,
                ...eventLayer.alphaEvents,
                ...eventLayer.speedEvents
            )
        })
        events.push(
            ...this.extended.scaleXEvents,
            ...this.extended.scaleYEvents,
            ...this.extended.colorEvents,
            ...this.extended.paintEvents,
            ...this.extended.textEvents
        )
        return events;
    }

    toObject(): IJudgeLine {
        return {
            Group: this.Group,
            Name: this.Name,
            Texture: this.Texture,
            father: this.father,
            isCover: this.isCover,
            zOrder: this.zOrder,
            alphaControl: this.alphaControl,
            posControl: this.posControl,
            sizeControl: this.sizeControl,
            skewControl: this.skewControl,
            yControl: this.yControl,
            bpmfactor: this.bpmfactor,
            eventLayers: this.eventLayers.map(eventLayer => eventLayer.toObject()),
            extended: this.extended.toObject(),
            notes: this.notes.map(note => note.toObject()),
            numOfNotes: this.notes.length,
        }
    }
    addNote(note: unknown, id?: string) {
        const newNote = new Note(note, {
            judgeLineNumber: this.options.judgeLineNumber,
            BPMList: this.options.BPMList,
            noteNumber: this.noteNumber++,
            id
        });
        this.notes.push(newNote);
        this.errors.push(...newNote.errors);
        return newNote;
    }
    addEventLayer() {
        if (this.eventLayers.length >= 4) {
            throw new Error("最多只能有4个事件层级")
        }
        const newEventLayer = this.createAnInitializedEventLayer(0, 0, 0, 0, 0);
        this.eventLayers.push(newEventLayer);
        return newEventLayer;
    }
    createAnInitializedEventLayer(x = 0, y = 0, angle = 0, alpha = 0, speed = 0) {
        return new BaseEventLayer({
            moveXEvents: [new NumberEvent({
                startTime: [0, 0, 1],
                endTime: [1, 0, 1],
                start: x,
                end: x
            }, { judgeLineNumber: this.options.judgeLineNumber, eventLayerId: '0', eventNumber: 0, type: 'moveX', BPMList: this.options.BPMList })],
            moveYEvents: [new NumberEvent({
                startTime: [0, 0, 1],
                endTime: [1, 0, 1],
                start: y,
                end: y
            }, { judgeLineNumber: this.options.judgeLineNumber, eventLayerId: '0', eventNumber: 0, type: 'moveY', BPMList: this.options.BPMList })],
            rotateEvents: [new NumberEvent({
                startTime: [0, 0, 1],
                endTime: [1, 0, 1],
                start: angle,
                end: angle
            }, { judgeLineNumber: this.options.judgeLineNumber, eventLayerId: '0', eventNumber: 0, type: 'rotate', BPMList: this.options.BPMList })],
            alphaEvents: [new NumberEvent({
                startTime: [0, 0, 1],
                endTime: [1, 0, 1],
                start: alpha,
                end: alpha
            }, { judgeLineNumber: this.options.judgeLineNumber, eventLayerId: '0', eventNumber: 0, type: 'alpha', BPMList: this.options.BPMList })],
            speedEvents: [new NumberEvent({
                startTime: [0, 0, 1],
                endTime: [1, 0, 1],
                start: speed,
                end: speed
            }, { judgeLineNumber: this.options.judgeLineNumber, eventLayerId: '0', eventNumber: 0, type: 'speed', BPMList: this.options.BPMList })]
        }, {
            judgeLineNumber: this.options.judgeLineNumber,
            eventLayerId: '0',
            BPMList: this.options.BPMList
        })
    }
    /**
     * 
     * @param seconds 当前时间，以秒为单位
     * @returns 在当前时间被判定的音符离在第0拍时被判定的音符的距离
     */
    getPositionOfSeconds(seconds: number) {
        let position = 0;
        /**
         * 遍历所有事件层计算累积位移
         * 每个事件层独立计算位移后累加到总位置
         */
        for (const layer of this.eventLayers) {
            let distance = 0;
            let currentSeconds = 0;
            let currentVelocity = 0;

            /**
             * 按开始时间排序速度事件
             * 确保事件处理顺序正确
             */
            const speedEvents = layer.speedEvents.sort((event1, event2) => beatsCompare(event1.startTime, event2.startTime));

            /**
             * 处理每个速度事件的时间段
             * 分段计算不同速度/加速度阶段的位移
             */
            for (const event of speedEvents) {
                const { cachedStartSeconds: startSeconds, cachedEndSeconds: endSeconds, start, end } = event;
                /**
                 * 如果开始时间大于等于结束时间，则跳过该事件
                 * 因为这个事件的时间非法，有可能会出现错误
                 */
                if (startSeconds >= endSeconds) {
                    continue;
                }

                /**
                 * 跳过开始时间在目标时间之后的事件
                 * 后续事件必然在更晚时间发生，直接终止循环
                 */
                if (startSeconds >= seconds) {
                    break;
                }

                /**
                 * 处理事件前的匀速运动阶段
                 * 计算当前时间段内的匀速运动位移
                 */
                if (startSeconds > currentSeconds) {
                    const duration = Math.min(startSeconds - currentSeconds, seconds - currentSeconds);
                    distance += currentVelocity * duration * 120;
                    currentSeconds += duration;

                    if (currentSeconds >= seconds) {
                        break;
                    }
                }

                /**
                 * 处理当前事件时间段内的变速运动
                 * 计算加速度和位移
                 */
                const effectiveEndTime = Math.min(endSeconds, seconds);
                const duration = effectiveEndTime - startSeconds;
                const acceleration = (end - start) / (endSeconds - startSeconds);
                const displacement = (start * duration + 0.5 * acceleration * duration * duration) * 120;

                distance += displacement;
                currentVelocity = start + acceleration * duration;
                currentSeconds = effectiveEndTime;

                if (currentSeconds >= seconds) {
                    break;
                }
            }

            /**
             * 处理最后的恒定速度阶段
             * 所有事件处理完成后剩余时间的匀速运动
             */
            if (currentSeconds < seconds) {
                const duration = seconds - currentSeconds;
                distance += currentVelocity * duration * 120;
            }
            position += distance;
        }
        return position;
    }
    getEventLayerById(id: string) {
        if (id === "X") {
            return this.extended;
        }
        const eventLayerNumber = parseInt(id);
        if (isNaN(eventLayerNumber)) {
            throw new Error(`错误的事件层编号: ${id}`)
        }
        if (eventLayerNumber < 0) {
            throw new Error(`事件层编号不能小于0，但当前为${id}`)
        }
        if (!Number.isInteger(eventLayerNumber)) {
            throw new Error(`事件层编号必须是整数，但当前为${eventLayerNumber}`)
        }
        if (eventLayerNumber >= 10) {
            throw new Error(`试图访问${eventLayerNumber}号事件层，但目前最多支持10个事件层`)
        }
        if (eventLayerNumber >= this.eventLayers.length) {
            throw new Error(`事件层编号超出范围: ${id}`)
        }
        return this.eventLayers[eventLayerNumber];
    }
    constructor(judgeLine: unknown, readonly options: JudgeLineOptions) {
        this.id = options.judgeLineNumber;
        if (isObject(judgeLine)) {
            if ("Group" in judgeLine) {
                if (isNumber(judgeLine.Group)) {
                    this.Group = judgeLine.Group;
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 Group 属性必须是数字，但读取到了 ${judgeLine.Group}。将会被替换为数字 0。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 Group 属性。将会被设为数字 0。`,
                    "ChartReadError"
                ));
            }


            if ("Name" in judgeLine) {
                if (isString(judgeLine.Name)) {
                    this.Name = judgeLine.Name;
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 Name 属性必须是字符串，但读取到了 ${judgeLine.Name}。将会被替换为字符串 "Unknown"。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 Name 属性。将会被设为字符串 "Unknown"。`,
                    "ChartReadError"
                ));
            }


            if ("Texture" in judgeLine) {
                if (isString(judgeLine.Texture)) {
                    this.Texture = judgeLine.Texture;
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 Texture 属性必须是字符串，但读取到了 ${judgeLine.Texture}。将会被替换为字符串 "line.png"。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 Texture 属性。将会被设为字符串 "line.png"。`,
                    "ChartReadError"
                ));
            }


            if ("isCover" in judgeLine) {
                if (isNumber(judgeLine.isCover)) {
                    if (judgeLine.isCover === JudgeLineCover.Cover || judgeLine.isCover === JudgeLineCover.Uncover) {
                        this.isCover = judgeLine.isCover;
                    }
                    else {
                        this.errors.push(new ChartError(
                            `${this.id}号判定线：判定线的 isCover 属性必须是 0 或 1，但读取到了 ${judgeLine.isCover}。将会被替换为数字 1。`,
                            "ChartReadError"
                        ));
                    }
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 isCover 属性必须是数字，但读取到了 ${judgeLine.isCover}。将会被替换为数字 1。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 isCover 属性。将会被设为数字 1。`,
                    "ChartReadError"
                ));
            }


            if ("father" in judgeLine) {
                if (isNumber(judgeLine.father)) {
                    this.father = judgeLine.father;
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 father 属性必须是数字，但读取到了 ${judgeLine.father}。将会被替换为数字 -1。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 father 属性。将会被设为数字 -1。`,
                    "ChartReadError"
                ));
            }


            if ("zOrder" in judgeLine) {
                if (isNumber(judgeLine.zOrder)) {
                    this.zOrder = judgeLine.zOrder;
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 zOrder 属性必须是数字，但读取到了 ${judgeLine.zOrder}。将会被替换为数字 0。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 zOrder 属性。将会被设为数字 0。`,
                    "ChartReadError"
                ));
            }


            if ("eventLayers" in judgeLine) {
                if (isArray(judgeLine.eventLayers)) {
                    for (let i = 0; i < judgeLine.eventLayers.length; i++) {
                        const eventLayer = judgeLine.eventLayers[i];
                        const newEventLayer = new BaseEventLayer(eventLayer, {
                            judgeLineNumber: options.judgeLineNumber,
                            BPMList: options.BPMList,
                            eventLayerId: i.toString()
                        });
                        this.eventLayers.push(newEventLayer);
                        this.errors.push(...newEventLayer.errors);
                    }
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 eventLayers 属性必须是数组，但读取到了 ${judgeLine.eventLayers}。将会被替换为空数组。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 eventLayers 属性。将会被设为空数组。`,
                    "ChartReadError"
                ));
            }


            if ("extended" in judgeLine) {
                const newExtendedEventLayer = new ExtendedEventLayer(judgeLine.extended, {
                    judgeLineNumber: options.judgeLineNumber,
                    BPMList: options.BPMList,
                    eventLayerId: 'X'
                });
                this.extended = newExtendedEventLayer;
                this.errors.push(...newExtendedEventLayer.errors);
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 extended 属性。将会被设为默认值。`,
                    "ChartReadError"
                ));
            }


            if ("notes" in judgeLine) {
                if (isArray(judgeLine.notes)) {
                    for (const note of judgeLine.notes) {
                        this.addNote(note);
                    }
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 notes 属性必须是数组，但读取到了 ${judgeLine.notes}。将会被替换为空数组。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 notes 属性。将会被设为空数组。`,
                    "ChartReadError"
                ));
            }


            if ("bpmfactor" in judgeLine) {
                if (isNumber(judgeLine.bpmfactor)) {
                    this.bpmfactor = judgeLine.bpmfactor;
                }
                else {
                    this.errors.push(new ChartError(
                        `${this.id}号判定线：判定线的 bpmfactor 属性必须是数字，但读取到了 ${judgeLine.bpmfactor}。将会被替换为数字 1。`,
                        "ChartReadError"
                    ));
                }
            }
            else {
                this.errors.push(new ChartError(
                    `${this.id}号判定线：判定线缺少 bpmfactor 属性。将会被设为数字 1。`,
                    "ChartReadError"
                ));
            }
        }
        else {
            this.errors.push(new ChartError(
                `${this.id}号判定线：判定线必须是一个对象，但读取到了 ${judgeLine}。将会使用默认值。`,
                "ChartReadError"
            ));
        }

        // 设置默认的空特殊事件层（如果extended未正确初始化）
        this.extended ??= new ExtendedEventLayer(null, {
            judgeLineNumber: options.judgeLineNumber,
            BPMList: options.BPMList,
            eventLayerId: 'X'
        });

        // 如果普通事件层不足4层，自动补至4层
        while (this.eventLayers.length < 4) {
            this.addEventLayer();
        }
    }
}
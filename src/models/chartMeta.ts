import { isNumber, isObject, isString } from "lodash";
import ChartError from "./error";

export interface IChartMeta {
    /** 谱师 */
    charter: string,
    /** 曲师 */
    composer: string,
    /** 画师 */
    illustration: string,
    /** 难度 */
    level: string,
    /** 曲名 */
    name: string,
    /** 偏移（以毫秒为单位，正数则谱面向后偏移） */
    offset: number,
    /** 编辑器版本，10代表0.1.0版本，100代表1.0.0版本，以此类推 */
    RPEVersion: number,
    /** 是否是由本编辑器编辑的谱面 */
    is2573: true,
    /** 图片文件名称 */
    background?: string,
    /** 音乐文件名称 */
    song?: string,
}
export class ChartMeta implements IChartMeta {
    charter = "unknown";
    composer = "unknown";
    illustration = "unknown";
    level = "SP Lv.?";
    name = "unknown";
    offset = 0;
    RPEVersion = 10;
    readonly is2573 = true;
    readonly errors: ChartError[] = [];
    toObject(): IChartMeta {
        return {
            charter: this.charter,
            composer: this.composer,
            illustration: this.illustration,
            level: this.level,
            name: this.name,
            offset: this.offset,
            RPEVersion: this.RPEVersion,
            is2573: this.is2573
        }
    }
    constructor(meta: unknown) {
        if (isObject(meta)) {
            // name - required field
            if ("name" in meta) {
                if (isString(meta.name)) {
                    this.name = meta.name;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.name 属性必须是字符串，但读取到了 ${meta.name}。将会替换为字符串 "unknown"。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.name 属性。将会替换为字符串 "unknown"。`,
                    "ChartReadError"
                ));
            }

            // level
            if ("level" in meta) {
                if (isString(meta.level)) {
                    this.level = meta.level;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.level 属性必须是字符串，但读取到了 ${meta.level}。将会替换为字符串 "SP Lv.?"。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.level 属性。将会替换为字符串 "SP Lv.?"。`,
                    "ChartReadError"
                ));
            }

            if ("offset" in meta) {
                if (isNumber(meta.offset)) {
                    this.offset = meta.offset;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.offset 属性必须是数字，但读取到了 ${meta.offset}。将会替换为数字 0。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.offset 属性。将会替换为数字 0。`,
                    "ChartReadError"
                ));
            }

            if ("charter" in meta) {
                if (isString(meta.charter)) {
                    this.charter = meta.charter;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.charter 属性必须是字符串，但读取到了 ${meta.charter}。将会替换为字符串 "unknown"。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.charter 属性。将会替换为字符串 "unknown"。`,
                    "ChartReadError"
                ));
            }

            if ("composer" in meta) {
                if (isString(meta.composer)) {
                    this.composer = meta.composer;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.composer 属性必须是字符串，但读取到了 ${meta.composer}。将会替换为字符串 "unknown"。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.composer 属性。将会替换为字符串 "unknown"。`,
                    "ChartReadError"
                ));
            }

            if ("RPEVersion" in meta) {
                if (isNumber(meta.RPEVersion)) {
                    this.RPEVersion = meta.RPEVersion;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.RPEVersion 属性必须是数字，但读取到了 ${meta.RPEVersion}。将会替换为数字 10。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.RPEVersion 属性。将会替换为数字 10。`,
                    "ChartReadError"
                ));
            }

            if ("illustration" in meta) {
                if (isString(meta.illustration)) {
                    this.illustration = meta.illustration;
                } else {
                    this.errors.push(new ChartError(
                        `chart.META.illustration 属性必须是字符串，但读取到了 ${meta.illustration}。将会替换为字符串 "unknown"。`,
                        "ChartReadError"
                    ));
                }
            } else {
                this.errors.push(new ChartError(
                    `未找到 chart.META.illustration 属性。将会替换为字符串 "unknown"。`,
                    "ChartReadError"
                ));
            }
        } else {
            this.errors.push(new ChartError(
                `chart.META 必须是一个对象，但读取到了 ${meta}。将会使用默认值。`,
                "ChartReadError"
            ));
        }
    }
}
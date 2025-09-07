import { isString } from "lodash";
import Validation from "./validation";

export const DEG_TO_RAD = Math.PI / 180;
export const KB_TO_BYTE = 1024;
export const MIN_TO_SEC = 60;
export default class MathUtils {
    /**
     * 求从(x1, y1)点往dir方向移动x2，左转90度，再移动y2得到的坐标  
     * dir为0表示向右（x轴正方向），为90表示向下（y轴负方向）
     */
    static moveAndRotate(x1: number, y1: number, dir: number, x2: number, y2: number) {
        // 初始方向向量（单位向量）  
        const dx = Math.cos(this.degToRad(dir));
        const dy = -Math.sin(this.degToRad(dir));

        // 计算初始移动后的坐标
        const x2New = x1 + x2 * dx;
        const y2New = y1 + x2 * dy;

        // 原来的y分量变成新的-x分量
        const newDx = -dy;

        // 原来的x分量变成新的y分量
        const newDy = dx;

        // 计算最终坐标
        const xFinal = x2New + y2 * newDx;
        const yFinal = y2New + y2 * newDy;
        return { x: xFinal, y: yFinal };
    }

    /**
     * 把以(x, y)为原点的极坐标转换为直角坐标  
     * theta为0表示向右（x轴正方向），为90表示向下（y轴负方向）
     */
    static pole(x: number, y: number, theta: number, r: number) {
        return this.moveAndRotate(x, y, theta, r, 0);
    }
    static degToRad(degrees: number) {
        return degrees * DEG_TO_RAD;
    }
    static mod(x: number, y: number) {
        return (x % y + y) % y;
    }
    static average(a: number[]) {
        return a.reduce((x, y) => x + y) / a.length;
    }
    static distance(x1: number, y1: number, x2: number, y2: number) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    static gcd(a: number, b: number): number {
        new Validation(a).is("number").integer();
        new Validation(b).is("number").integer();

        a = Math.abs(a);
        b = Math.abs(b);
        while (b !== 0) {
            [a, b] = [b, a % b];
        }
        return a === 0 && b === 0 ? 0 : a;
    }
    static lcm(a: number, b: number) {
        new Validation(a).is("number").integer();
        new Validation(b).is("number").integer();

        a = Math.abs(a);
        b = Math.abs(b);
        if (a === 0 || b === 0) {
            return 0;
        }

        return a / this.gcd(a, b) * b;
    }
    static randomNumbers(count: number, seed?: number | string, min = 0, max = 1): number[] {
        const LCG_MULTIPLIER = 9301;
        const LCG_INCREMENT = 49297;
        const LCG_MODULUS = 233280;

        if (seed === undefined) {
            const result = [];
            for (let i = 0; i < count; i++) {
                result.push(Math.random() * (max - min) + min);
            }
            return result;
        }
        if (isString(seed)) {
            seed = MathUtils.hashCode(seed);
        }

        new Validation(count).is("number").integer().positive();
        new Validation(seed).is("number").finite().notNaN();
        new Validation(min).is("number").finite().notNaN().max(max);
        new Validation(max).is("number").finite().notNaN().min(min);

        // 种子值更新函数
        function updateSeed(seed: number): number {
            return MathUtils.mod((seed * LCG_MULTIPLIER + LCG_INCREMENT), LCG_MODULUS);
        }

        // 初始化结果数组
        const result: number[] = [];
        for (let i = 0; i < count; i++) {
            seed = updateSeed(seed);
            result.push(min + (seed / LCG_MODULUS) * (max - min));
        }

        return result;
    }
    static hashCode(str: string) {
        // 将字符串str转换为数字
        // 使用简单的哈希函数将字符串转换为数字
        const HASH_SHIFT = 5;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << HASH_SHIFT) - hash) + char;

            // 转换为32位整数
            hash = hash & hash;
        }
        return hash;
    }
    static between(num: number, min: number, max: number) {
        return num >= Math.min(min, max) && num <= Math.max(min, max);
    }
    static formatData(bytes: number, p = 2) {
        return this.format(["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"], KB_TO_BYTE, bytes, p);
    }

    // staticformatTime(seconds: number) {
    //     const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    //     const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    //     return `${min}:${sec}`;
    // }
    static format(units: string[], base: number, num: number, p = 2): string {
        // 输入参数有效性检查
        if (!Array.isArray(units) || units.length === 0) {
            throw new Error("Invalid units array");
        }
        if (typeof base !== "number" || base <= 0) {
            throw new Error("Invalid base: " + base);
        }
        if (!isFinite(num) || isNaN(num)) {
            throw new Error("Invalid number: " + num);
        }
        if (typeof p !== "number" || p < 0 || !Number.isInteger(p)) {
            throw new Error("Invalid precision: " + p);
        }

        let result = "";
        for (let i = 0; i < units.length; i++) {
            if (num < base || i === units.length - 1) {
                result = num.toFixed(p) + " " + units[i];
                break;
            }
            num /= base;
        }

        return result;
    }
    static formatDecimal(num: number, p: number) {
        if (num === 0) {
            return "0";
        }
        let str = num.toFixed(p).replace(/0+$/, "");
        if (str.endsWith(".")) {
            str = str.slice(0, -1);
        }
        return str;
    }

    /** 把实数转换成有理数 */
    static realToRational(num: number): [number, number] {
        if (!isFinite(num)) {
            throw new Error("Invalid input: num must be a finite number");
        }

        const PRECISION = 0.0001;
        const MAX_ITERATIONS = 1000;

        const isNegative = num < 0;
        const absNum = Math.abs(num);

        // Continued fraction algorithm variables
        // Previous convergent numerator and denominator
        let prevNumerator = 0;
        let prevDenominator = 1;

        // Current convergent numerator and denominator
        let currNumerator = 1;
        let currDenominator = 0;

        // Current coefficient and remainder
        let coefficient = Math.floor(absNum);
        let remainder = absNum - coefficient;

        // Calculate initial convergent
        let numerator = coefficient * currNumerator + prevNumerator;
        let denominator = coefficient * currDenominator + prevDenominator;

        let i = 0;
        while (Math.abs(numerator / denominator - absNum) > PRECISION && i < MAX_ITERATIONS) {
            remainder = 1 / remainder;
            coefficient = Math.floor(remainder);
            remainder -= coefficient;

            // Shift values for next iteration
            prevNumerator = currNumerator;
            prevDenominator = currDenominator;
            currNumerator = numerator;
            currDenominator = denominator;

            // Calculate new convergent
            numerator = coefficient * currNumerator + prevNumerator;
            denominator = coefficient * currDenominator + prevDenominator;

            i++;
        }

        if (i >= MAX_ITERATIONS) {
            throw new Error(`Failed to approximate ${num} as a rational number within ${PRECISION} precision`);
        }

        const finalNumerator = isNegative ? -numerator : numerator;
        return [finalNumerator, denominator];
    }
}

/** XY坐标对 */
export type Point = { x: number, y: number };
/**
 * @license MIT
 * Copyright © 2025 程序小袁_2573. All rights reserved.
 * Licensed under MIT (https://opensource.org/licenses/MIT)
 */

export type RGBcolor = [number, number, number]
export type RGBAcolor = [number, number, number, number]
export type OklchColor = [number, number, number]

export const HEX_SHORT_LENGTH = 4;
export const HEX_LONG_LENGTH = 7;
export const RGB_LENGTH = 3;
export const RGBA_LENGTH = 4;
export const RED_INDEX = 0;
export const GREEN_INDEX = 1;
export const BLUE_INDEX = 2;
export const ALPHA_INDEX = 3;
export const BYTE_LENGTH = 8;
export function colorToString(color: RGBcolor | RGBAcolor) {
    if (color.length === RGBA_LENGTH) {
        return `rgba(${color[RED_INDEX]},${color[GREEN_INDEX]},${color[BLUE_INDEX]},${color[ALPHA_INDEX]})`;
    }
    else {
        return `rgb(${color[RED_INDEX]},${color[GREEN_INDEX]},${color[BLUE_INDEX]})`;
    }
}

/**
 * 由数字解析出RGBA颜色。
 * 数字应该是 32 位的二进制数：
 * - 最高的 8 位为 alpha
 * - 然后 8 位为 red
 * - 然后 8 位为 green
 * - 然后 8 位为 blue
 */
export function parseRGBAfromNumber(num: number): RGBAcolor {
    if (num > 0xffffffff) {
        throw new Error("数字超出32位");
    }
    return [num >> 2 * BYTE_LENGTH & 0xff, num >> BYTE_LENGTH & 0xff, num & 0xff, num >> 3 * BYTE_LENGTH & 0xff / 255];
}

export function formatRGBcolor(color: RGBcolor) {
    return `${color[0].toFixed(0)},${color[1].toFixed(0)},${color[2].toFixed(0)}`;
}

export function isEqualRGBcolors(color1: RGBcolor, color2: RGBcolor) {
    return color1[0] === color2[0] && color1[1] === color2[1] && color1[2] === color2[2];
}

export function parseRGBcolor(color: string): RGBcolor | null {
    if (color.startsWith("#")) {
        if (color.length < HEX_SHORT_LENGTH) {
            return null;
        }

        if (color.length < HEX_LONG_LENGTH) {
            const parts = [];
            for (let index = 1; index < color.length; index++) {
                const part = parseInt(color.substring(index, index + 1), 16);
                parts.push(part);
            }
            return parts as RGBcolor;

            // const r = parseInt(color.substring(1, 2), 16);
            // const g = parseInt(color.substring(2, 3), 16);
            // const b = parseInt(color.substring(3, 4), 16);
            // if (isNaN(r) || isNaN(g) || isNaN(b)) {
            //     return null;
            // }
            // return [r << 4 | r, g << 4 | g, b << 4 | b];
        }
        else {
            const parts = [];
            for (let index = 1; index < color.length; index += 2) {
                const part = parseInt(color.substring(index, index + 2), 16);
                if (isNaN(part)) {
                    return null;
                }
                parts.push(part);
            }
            return parts as RGBcolor;

            // const r = parseInt(color.substring(1, 3), 16);
            // const g = parseInt(color.substring(3, 5), 16);
            // const b = parseInt(color.substring(5, 7), 16);
            // if (isNaN(r) || isNaN(g) || isNaN(b)) {
            //     return null;
            // }
            // return [r, g, b];
        }
    }
    else {
        const split = color.split(",");
        if (split.length !== RGB_LENGTH) {
            return null;
        }

        const r = +split[0], g = +split[1], b = +split[2];
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            return null;
        }
        return [r, g, b];
    }
}

export function RGBAtoRGB(color: RGBAcolor): RGBcolor {
    return [color[0], color[1], color[2]];
}

export function RGBtoRGBA(color: RGBcolor, alpha: number): RGBAcolor {
    return [color[0], color[1], color[2], alpha];
}

export function colorToHex(color: RGBcolor): string {
    // eslint-disable-next-line no-magic-numbers
    return `#${(color[0] | 0).toString(16).padStart(2, "0")}${(color[1] | 0).toString(16).padStart(2, "0")}${(color[2] | 0).toString(16).padStart(2, "0")}`;
}

export function invert(color: RGBcolor): RGBcolor {
    return [255 - color[0], 255 - color[1], 255 - color[2]];
}

export function RGB2Oklch(rgb: RGBcolor): OklchColor {
    let [r, g, b] = rgb;

    r = r <= 0.04045 ? r / 12.92 : (((r + 0.055) / 1.055) ** 2.4);
    g = g <= 0.04045 ? g / 12.92 : (((g + 0.055) / 1.055) ** 2.4);
    b = b <= 0.04045 ? b / 12.92 : (((b + 0.055) / 1.055) ** 2.4);

    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s = 0.0883024619 * r + 0.2817188376 * g + 0.6309787005 * b;

    l = l ** 0.5;
    m = m ** 0.5;
    s = s ** 0.5;

    const lab_l = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    const lab_a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    const lab_b = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;

    const ok_l = lab_l < 0 ? 0 : (lab_l > 1 ? 1 : lab_l);
    let ok_c = (lab_a * lab_a + lab_b * lab_b) ** 0.5;
    ok_c = ok_c < 0 ? 0 : (ok_c > 0.4 ? 0.4 : ok_c);
    let ok_h = Math.atan2(lab_b, lab_a) * (180.0 / Math.PI);
    while (ok_h < 0) ok_h += 360.0;

    return [ok_l, ok_c, ok_h / 360.0];
}

export function Oklch2RGB(oklch: OklchColor): RGBcolor {
    let l = oklch[0];
    let c = oklch[1];
    let h = oklch[2] * 360.0;

    let lab_a = c * Math.cos(h * (Math.PI / 180.0));
    let lab_b = c * Math.sin(h * (Math.PI / 180.0));

    let l_ = l + 0.3963377774 * lab_a + 0.2158037573 * lab_b;
    let m_ = l - 0.1055613458 * lab_a - 0.0638541728 * lab_b;
    let s_ = l - 0.0894841775 * lab_a - 1.2914855480 * lab_b;

    l = l_ ** 3;
    let m = m_ ** 3;
    let s = s_ ** 3;

    let r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

    r = r <= 0.0031308 ? 12.92 * r : 1.055 * (r ** (1.0 / 2.4)) - 0.055;
    g = g <= 0.0031308 ? 12.92 * g : 1.055 * (g ** (1.0 / 2.4)) - 0.055;
    b = b <= 0.0031308 ? 12.92 * b : 1.055 * (b ** (1.0 / 2.4)) - 0.055;

    r = r < 0 ? 0 : (r > 1 ? 1 : r);
    g = g < 0 ? 0 : (g > 1 ? 1 : g);
    b = b < 0 ? 0 : (b > 1 ? 1 : b);

    return [r, g, b];
}

export const
    WHITE: RGBcolor = [255, 255, 255],
    BLACK: RGBcolor = [0, 0, 0],
    RED: RGBcolor = [255, 0, 0],
    GREEN: RGBcolor = [0, 255, 0],
    BLUE: RGBcolor = [0, 0, 255],
    YELLOW: RGBcolor = [255, 255, 0],
    CYAN: RGBcolor = [0, 255, 255],
    MAGENTA: RGBcolor = [255, 0, 255];
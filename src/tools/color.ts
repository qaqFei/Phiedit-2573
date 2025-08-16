export type RGBcolor = [number, number, number]
export type RGBAcolor = [number, number, number, number]
export function colorToString(color: RGBcolor | RGBAcolor) {
    if (color.length == 4) {
        return `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;
    }
    else {
        return `rgb(${color[0]},${color[1]},${color[2]})`;
    }
}

export function color(num: number): RGBAcolor {
    return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff, (num >> 24) & 0xff / 255];
}

export function formatRGBcolor(color: RGBcolor) {
    return `${color[0]},${color[1]},${color[2]}`
}

export function isEqualRGBcolors(color1: RGBcolor, color2: RGBcolor) {
    return color1[0] == color2[0] && color1[1] == color2[1] && color1[2] == color2[2];
}

export function parseRGBcolor(color: string): RGBcolor | null {
    if (color.startsWith("#")) {
        if (color.length < 3) {
            return null;
        }
        if (color.length < 7) {
            const r = parseInt(color.substring(1, 2), 16);
            const g = parseInt(color.substring(2, 3), 16);
            const b = parseInt(color.substring(3, 4), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b)) {
                return null;
            }
            return [r << 4 | r, g << 4 | g, b << 4 | b];
        }
        else {
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);
            if (isNaN(r) || isNaN(g) || isNaN(b)) {
                return null;
            }
            return [r, g, b];
        }
    }
    else {
        const split = color.split(",");
        if (split.length != 3) {
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
    return `#${(color[0] | 0).toString(16).padStart(2, "0")}${(color[1] | 0).toString(16).padStart(2, "0")}${(color[2] | 0).toString(16).padStart(2, "0")}`
}

export function invert(color: RGBcolor): RGBcolor {
    return [255 - color[0], 255 - color[1], 255 - color[2]];
}
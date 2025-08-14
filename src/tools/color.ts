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
import { vec3 } from "../types/vectors";

export default function RGBtoHSV(r: number, g: number, b: number) : vec3 {
    r /= 255, g /= 255, b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number, s: number, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: throw new Error("Error in RGBtoHSV");
        }

        h /= 6;
    }

    return [h, s, l];
}